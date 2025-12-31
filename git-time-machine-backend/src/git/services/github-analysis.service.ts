import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GithubClientService } from "./github-client.service";
import { Commit } from "@sharedTypes/Commit";
import { exec } from "child_process";
import { promisify } from "util";
import { Mutex, MutexInterface } from "async-mutex";
import { File } from "@sharedTypes/File";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as crypto from "crypto";

const execAsync = promisify(exec);

@Injectable()
export class GithubAnalysisService implements OnModuleInit {
  private readonly logger = new Logger(GithubAnalysisService.name);
  private readonly cacheDir = path.join(os.tmpdir(), "gittm-cache");
  private readonly locks: Map<string, MutexInterface> = new Map();

  constructor(private readonly client: GithubClientService) {}

  async onModuleInit() {
    // Ensure the cache directory exists on startup
    await fs.ensureDir(this.cacheDir);
  }

  private async ensureRepo(repoUrl: string, branchName: string | null): Promise<{ repoPath: string; commitHash: string }> {
    const repoHash = crypto.createHash("md5").update(repoUrl).digest("hex");
    const repoPath = path.join(this.cacheDir, repoHash);
    const targetRef = branchName ? `refs/heads/${branchName}` : "HEAD";

    if (!this.locks.has(repoHash)) {
      this.locks.set(repoHash, new Mutex());
    }

    const release = await this.locks.get(repoHash)!.acquire();

    try {
      this.logger.debug(`Checking remote: ${repoUrl} (${targetRef})`);
      
      // Get the hash of the latest commit on the remote branch
      const { stdout: remoteOutput } = await execAsync(`git ls-remote "${repoUrl}" "${targetRef}"`);
      const remoteCommitHash = remoteOutput.split(/\s+/)[0];

      if (!remoteCommitHash) {
        throw new Error(`Branch "${branchName || "HEAD"}" not found on remote ${repoUrl}`);
      }

      if (await fs.pathExists(repoPath)) {
        try {
          // Check if the specific commit exists locally
          await execAsync(`git --git-dir="${repoPath}" cat-file -e ${remoteCommitHash}^{commit}`);
          this.logger.log(`[CACHE HIT] Repo is up to date. Hash: ${remoteCommitHash}`);
          return { repoPath, commitHash: remoteCommitHash };
        } catch (e) {
          this.logger.log(`[CACHE MISS] New updates detected. Fetching...`);
          await execAsync(`git --git-dir="${repoPath}" fetch origin --prune --force`);
        }
      } else {
        this.logger.log(`[CLONE] Cloning new repo: ${repoUrl}`);
        // Use --bare and --filter to save disk space and time
        await execAsync(`git clone --bare --filter=blob:none "${repoUrl}" "${repoPath}"`);
      }

      return { repoPath, commitHash: remoteCommitHash };
    } finally {
      release();
    }
  }

  async getCommits(repoUrl: string, branch: string, jobId): Promise<{ commits: Commit[] }> {
    try {
      const { repoPath, commitHash } = await this.ensureRepo(repoUrl, branch);

      // 1. Fetch the commit log
      // Use a special separator (ASCII 31) to avoid issues with "|" characters in commit messages
      const logFormat = "%H%x1F%an%x1F%ad%x1F%s";
      const logCommand = `git --git-dir="${repoPath}" log ${commitHash} --pretty=format:"${logFormat}" --date=iso`;
      
      const { stdout: logOutput } = await execAsync(logCommand, { maxBuffer: 1024 * 1024 * 30 });

      const commits: Commit[] = logOutput
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [hash, author, date, message] = line.split("\x1F");
          return { hash, author, date, message, files: [] };
        });

      if (commits.length === 0) {
        this.logger.warn(`No commits found for ${repoUrl}`);
        return { commits: [] };
      }

      this.logger.log(`Processing ${commits.length} commits for job ${jobId}`);

      // 2. Fetch the file structure for each commit (Chunking)
      const concurrencyLimit = 10;
      for (let i = 0; i < commits.length; i += concurrencyLimit) {
        const chunk = commits.slice(i, i + concurrencyLimit);

        await Promise.all(
          chunk.map(async (commit) => {
            try {
              const command = `git --git-dir="${repoPath}" ls-tree -r --name-only ${commit.hash}`;
              const { stdout: filesOutput } = await execAsync(command, {
                maxBuffer: 1024 * 1024 * 50,
              });

              commit.files = filesOutput
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((p) => ({ path: p }));
            } catch (e) {
              this.logger.error(`Error getting tree for ${commit.hash}: ${e.message}`);
              commit.files = [];
            }
          })
        );
      }

      // Return data in the correct order (reversing to match desired sequence)
      return { commits: commits.reverse() };
    } catch (error) {
      this.logger.error(`Task ${jobId} failed: ${error.message}`);
      throw error; // Rethrow error so BullMQ can mark the task as Failed
    }
  }

  async getFileContent(repoUrl: string, filePath: string, hash: string): Promise<File | null> {
    const urlParts = repoUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1]?.replace(".git", "");

    try {
      // 1. Get the content of the current version (by commit hash)
      const { data: currentData } = await this.client.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: hash,
      });

      // Verify that it is a file and not a directory
      if (Array.isArray(currentData) || !("content" in currentData)) {
        return null;
      }

      const content = Buffer.from(currentData.content, "base64").toString("utf-8");

      // 2. Attempt to fetch previous content
      let previousContent: string | null = null;

      try {
        // Search for commits for this file starting from the provided hash.
        // Limit to 2 results to find the commit that existed immediately BEFORE the current one.
        const { data: commits } = await this.client.octokit.repos.listCommits({
          owner,
          repo,
          path: filePath,
          sha: hash,
          per_page: 2, 
        });

        // If at least 2 commits exist, then commits[1] represents the previous version of the file
        if (commits.length >= 2) {
          const prevHash = commits[1].sha;
          const { data: prevData } = await this.client.octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: prevHash,
          });

          if (!Array.isArray(prevData) && "content" in prevData) {
            previousContent = Buffer.from(prevData.content, "base64").toString("utf-8");
          }
        }
      } catch (e) {
        console.error("Could not fetch previous content", e);
        // Do not interrupt execution if history fetching fails
      }

      return {
        path: filePath,
        hash: currentData.sha, // or return the passed hash
        content: content,
        previousContent: previousContent,
      };

    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }
}