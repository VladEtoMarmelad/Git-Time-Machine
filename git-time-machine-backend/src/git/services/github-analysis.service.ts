import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GithubClientService } from "./github-client.service";
import { exec } from "child_process";
import { promisify } from "util";
import { Mutex, MutexInterface } from "async-mutex";
import { Commit, File, FileStatus, FileTreeMode } from "@sharedTypes/index"
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

async getCommits(repoUrl: string, branch: string, fileTreeMode: FileTreeMode = "full", jobId): Promise<{ commits: Commit[] }> {
  try {
    const { repoPath, commitHash } = await this.ensureRepo(repoUrl, branch);

    const logFormat = "%H%x1F%an%x1F%ad%x1F%s";
    const logCommand = `git --git-dir="${repoPath}" log ${commitHash} --pretty=format:"${logFormat}" --date=iso`;
    const { stdout: logOutput } = await execAsync(logCommand, { maxBuffer: 1024 * 1024 * 30 });

    const commits: Commit[] = logOutput.split("\n").filter(Boolean).map((line) => {
      const [hash, author, date, message] = line.split("\x1F");
      return { hash, author, date, message, files: [] };
    });

    this.logger.log(`Processing ${commits.length} commits (mode: ${fileTreeMode==="full" ? 'full tree' : 'changes only'})...`);

    const concurrencyLimit = 10;
    for (let i = 0; i < commits.length; i += concurrencyLimit) {
      const chunk = commits.slice(i, i + concurrencyLimit);

      await Promise.all(chunk.map(async (commit) => {
        try {
          // 1. Получаем изменения (diff) в любом случае, чтобы знать статусы
          const diffCmd = `git --git-dir="${repoPath}" diff-tree -r --no-commit-id --name-status --root ${commit.hash}`;
          const { stdout: diffOut } = await execAsync(diffCmd);

          const statusMap = new Map<string, FileStatus>();
          diffOut.split("\n").filter(Boolean).forEach(line => {
            const firstTab = line.indexOf('\t');
            if (firstTab === -1) return;

            const statusChar = line.substring(0, firstTab).trim();
            // Обработка путей с кавычками (Git экранирует спецсимволы)
            const filePath = line.substring(firstTab + 1).replace(/^"(.*)"$/, '$1').trim();

            let status: FileStatus = 'unchanged';
            if (statusChar.startsWith('A')) status = 'added';
            else if (statusChar.startsWith('M')) status = 'modified';
            else if (statusChar.startsWith('D')) status = 'deleted';

            statusMap.set(filePath, status);
          });

          if (fileTreeMode==="full") {
            // РЕЖИМ 1: Полное дерево файлов
            const allFilesCmd = `git --git-dir="${repoPath}" ls-tree -r --name-only ${commit.hash}`;
            const { stdout: allFilesOut } = await execAsync(allFilesCmd, { maxBuffer: 1024 * 1024 * 20 });
            
            commit.files = allFilesOut.split("\n").filter(Boolean).map(filePath => {
              const cleanPath = filePath.replace(/^"(.*)"$/, '$1');
              return {
                path: cleanPath,
                status: statusMap.get(cleanPath) || 'unchanged'
              };
            });
          } else {
            // РЕЖИМ 2: Только измененные файлы
            commit.files = Array.from(statusMap.entries()).map(([path, status]) => ({
              path,
              status
            }));
          }

        } catch (e) {
          this.logger.error(`Error processing ${commit.hash}: ${e.message}`);
        }
      }));
    }

    return { commits: commits.reverse() };
  } catch (error) {
    this.logger.error(`Task ${jobId} failed: ${error.message}`);
    throw error;
  }
}
  async getFileContent(repoUrl: string, filePath: string, commitHash: string): Promise<File> {
    // 1. Extract owner and repo from URL (https://github.com/owner/repo)
    const urlParts = repoUrl.replace(/\.git$/, '').split('/');
    const repo = urlParts.pop()!;
    const owner = urlParts.pop()!;

    // Helper to get content via Octokit
    const getOctokitContent = async (ref: string): Promise<string | null> => {
      try {
        const response = await this.client.octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref,
        });

        // Check if it's a file, not a directory
        if ("content" in response.data && !Array.isArray(response.data)) {
          // Decode base64 to utf-8
          return Buffer.from(response.data.content, "base64").toString("utf-8");
        }
        return null;
      } catch (error: any) {
        // 404 means the file didn't exist in this commit
        if (error.status === 404) {
          return null;
        }
        throw error;
      }
    };

    try {
      // 2. Get current content
      const currentContent = await getOctokitContent(commitHash);

      if (currentContent === null) {
        throw new Error("File not found in current commit");
      }

      // 3. Get content from the previous commit
      // GitHub API supports ~1 syntax in the ref parameter
      const previousContent = await getOctokitContent(`${commitHash}~1`);

      return {
        hash: commitHash,
        path: filePath,
        status: "unchanged",
        content: currentContent,
        previousContent: previousContent,
      };

    } catch (error: any) {
      return {
        hash: commitHash,
        path: filePath,
        status: "unchanged",
        content: `Error: ${error.message}`,
        previousContent: `Error: ${error.message}`
      };
    }
  }
}