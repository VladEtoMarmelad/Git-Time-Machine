import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";
import { Commit } from "@sharedTypes/Commit";
import { File } from "@sharedTypes/File";
import { Mutex, MutexInterface } from "async-mutex";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as crypto from "crypto";

const execAsync = promisify(exec);

@Processor("git-analysis")
export class GitProcessor {
  private readonly logger = new Logger(GitProcessor.name);

  // Base folder for storing cached repositories
  private readonly cacheDir = path.join(os.tmpdir(), "gittm-cache");

  // Mutexes for each repository to avoid updating the same repo simultaneously
  private readonly locks: Map<string, MutexInterface> = new Map();

  // Ensure the cache folder exists
  constructor() {
    fs.ensureDirSync(this.cacheDir);
  }

  // Gets the path to the repository folder and ensures it is up to date.
  // Uses locking so threads do not interfere with each other.
  private async ensureRepo(repoUrl: string, branchName: string | null): Promise<{ repoPath: string, commitHash: string }> {
    const repoHash = crypto.createHash("md5").update(repoUrl).digest("hex");
    const repoPath = path.join(this.cacheDir, repoHash);

    // If no branch is passed, git ls-remote HEAD will show the default branch
    const targetRef = branchName ? `refs/heads/${branchName}` : "HEAD";

    if (!this.locks.has(repoHash)) {
      this.locks.set(repoHash, new Mutex());
    }
    const release = await this.locks.get(repoHash)!.acquire();

    try {
      // 1. Get the CURRENT hash from the remote server (without downloading code)
      // Result will be like: "e3a1b2... refs/heads/master"
      this.logger.debug(`Checking remote: ${repoUrl} (${targetRef})`);
      const { stdout: remoteOutput } = await execAsync(`git ls-remote "${repoUrl}" "${targetRef}"`);

      const remoteCommitHash = remoteOutput.split(/\s+/)[0]; // Take only the hash

      if (!remoteCommitHash) {
        throw new Error(`Branch "${branchName || "HEAD"}" not found on remote ${repoUrl}`);
      }

      // 2. Check if the folder exists
      if (await fs.pathExists(repoPath)) {
        // 3. Check if we ALREADY have this commit locally
        // We use 'cat-file -e', which is the most reliable way to check for the existence of an object in the git database
        try {
          await execAsync(`git --git-dir="${repoPath}" cat-file -e ${remoteCommitHash}^{commit}`);

          // IF WE ARE HERE -> the commit is already in the database.
          // We could skip fetch, but we need to ensure refs are updated if that's important.
          // But for 'git log <hash>', refs don't matter, only the object matters.

          this.logger.log(`[CACHE HIT] Repo is up to date. Hash: ${remoteCommitHash}`);
          return { repoPath, commitHash: remoteCommitHash };
        } catch (e) {
          // Error means this hash does not exist locally -> need to update
          this.logger.log(`[CACHE MISS] New updates detected. Remote: ${remoteCommitHash}. Fetching...`);
        }

        // Update only if the hash is missing
        await execAsync(`git --git-dir="${repoPath}" fetch origin --prune --force`);
      } else {
        this.logger.log(`[CLONE] Cloning new repo: ${repoUrl}`);
        await execAsync(`git clone --bare --filter=blob:none "${repoUrl}" "${repoPath}"`);
      }

      return { repoPath, commitHash: remoteCommitHash };
    } finally {
      release();
    }
  }

  @Process("getCommits")
  async getCommits(job: Job<{ repoUrl: string, branch: string | null }>) {
    const { repoUrl, branch } = job.data;

    try {
      const { repoPath, commitHash } = await this.ensureRepo(repoUrl, branch);

      // 1. Get the list of commits
      const logCommand = `git --git-dir="${repoPath}" log ${commitHash} --pretty=format:"%H|%an|%ad|%s" --date=iso`;
      const { stdout: logOutput } = await execAsync(logCommand, { maxBuffer: 1024 * 1024 * 20 }); // 20 MB for log

      const commits: Commit[] = logOutput.split("\n").filter(Boolean).map(line => {
        const [hash, author, date, message] = line.split("|");
        return { hash, author, date, message, files: [] };
      });

      this.logger.log(`Fetching FULL file tree for ${commits.length} commits. This might take a while...`);

      // 2. Get the FULL file structure for each commit
      // Important: ls-tree -r returns the list of ALL files. This is a heavy operation.

      // Chunking configuration
      // If there are many commits, process them in batches of 10 to avoid killing the CPU
      const concurrencyLimit = 10;

      for (let i = 0; i < commits.length; i += concurrencyLimit) {
        const chunk = commits.slice(i, i + concurrencyLimit);

        await Promise.all(chunk.map(async (commit) => {
          try {
            // -r : recursive (all folders)
            // --name-only : paths only, without permissions and blob hashes (saves size)
            const command = `git --git-dir="${repoPath}" ls-tree -r --name-only ${commit.hash}`;

            const { stdout: filesOutput } = await execAsync(command, {
              // IMPORTANT: Increase buffer to 50MB (or more for huge repos)
              // If this is not done, code will fail with buffer error on large repos
              maxBuffer: 1024 * 1024 * 50
            });

            commit.files = filesOutput
              .split("\n")
              .map(s => s.trim()) // Remove \r and spaces
              .filter(Boolean)    // Remove empty lines
              .map(path => ({ path }));

          } catch (e) {
            this.logger.error(`Error getting tree for ${commit.hash}: ${e.message}`);
            // In case of error (e.g., output too large), return empty list or error
            commit.files = [];
          }
        }));
      }

      return { commits: commits.reverse() };
    } catch (error) {
      this.logger.error(`Task ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  @Process("getFileContentFromCommit")
  async getFileContentFromCommit(job: Job<{ repoUrl: string, commitHash: string, filePath: string }>): Promise<File> {
    const { repoUrl, commitHash, filePath } = job.data;

    // Helper to retrieve content
    const gitShow = async (repoPath: string, hash: string, path: string): Promise<string | null> => {
      try {
        const command = `git --git-dir="${repoPath}" show ${hash}:${path}`;
        const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
        return stdout;
      } catch (e) {
        // The file might not have existed in the previous version
        return null;
      }
    };

    try {
      const { repoPath } = await this.ensureRepo(repoUrl, null);

      // 1. Get current content
      const currentContent = await gitShow(repoPath, commitHash, filePath);

      if (currentContent === null) {
        throw new Error("File not found in current commit");
      }

      // 2. Get content of the previous commit
      // The ~1 symbol means "the first parent of this commit"
      const previousContent = await gitShow(repoPath, `${commitHash}~1`, filePath);

      return {
        hash: commitHash,
        path: filePath,
        content: currentContent,
        previousContent: previousContent, // Can be null if the file is new
      };

    } catch (error) {
      return {
        hash: commitHash,
        path: filePath,
        content: `Error: ${error.message}`,
        previousContent: null
      };
    }
  }

  @Process("getBranches")
  async getBranches(job: Job<{ repoUrl: string }>) {
    const { repoUrl } = job.data;

    const getBranchesCommand = `git ls-remote --heads ${repoUrl}`;
    const { stdout: branchesOutput } = await execAsync(getBranchesCommand);

    return branchesOutput.split("\n").map(line => {
      // Look for a match after refs/heads/ and capture everything until the end of the line
      const match = line.match(/refs\/heads\/(.+)/);
      return match ? match[1] : null;
    }).filter((branch): branch is string => branch !== null); // Remove null (empty lines)
  }
}