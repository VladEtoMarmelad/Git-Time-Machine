import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Commit } from '@sharedTypes/Commit';
import { File } from '@sharedTypes/File';
import { Mutex, MutexInterface } from 'async-mutex'; 
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra'; 
import * as crypto from 'crypto';

const execAsync = promisify(exec);

@Processor("git-analysis")
export class GitProcessor {
  private readonly logger = new Logger(GitProcessor.name);

  // Base folder for storing cached repositories
  private readonly cacheDir = path.join(os.tmpdir(), "gittm-cache");

  // Mutexes for each repository to avoid updating the same repo simultaneously
  private readonly locks: Map<string, MutexInterface> = new Map();

  // Ensure the cache folder exists
  constructor() {fs.ensureDirSync(this.cacheDir)};
  
  // Gets the path to the repository folder and ensures it is up to date.
  // Uses locking so threads do not interfere with each other.
  private async ensureRepo(repoUrl: string): Promise<string> {
    // Generate a unique folder name based on the URL (md5 hash)
    const repoHash = crypto.createHash("md5").update(repoUrl).digest("hex");
    const repoPath = path.join(this.cacheDir, repoHash);

    if (!this.locks.has(repoHash)) {
      this.locks.set(repoHash, new Mutex());
    }

    const release = await this.locks.get(repoHash)!.acquire();
    
    try {
      if (await fs.pathExists(repoPath)) {
        // Repository already exists, fetch to update
        this.logger.log(`Updating cached repo: ${repoUrl}`);
        // This command is more robust than fetching a specific branch like 'master'
        await execAsync(`git --git-dir="${repoPath}" fetch origin --prune --force`); 
        // Note: for bare repositories, fetch updates references
      } else {
        // Repository does not exist, clone it
        this.logger.log(`Cloning new repo: ${repoUrl}`);
        // --bare: does not create a working directory (only .git), saves space
        // --filter=blob:none: DOES NOT download file contents immediately (huge traffic saving)
        await execAsync(`git clone --bare --filter=blob:none "${repoUrl}" "${repoPath}"`);
      }
      return repoPath;
    } finally {
      release();
    }
  }

  @Process("getCommits")
  async getCommits(job: Job<{ repoUrl: string }>) { 
    const { repoUrl } = job.data;
    
    try {
      const repoPath = await this.ensureRepo(repoUrl);

      // Check for emptiness (optional, bare repo always has HEAD unless completely empty)
      try {
        await execAsync(`git --git-dir="${repoPath}" rev-parse --verify HEAD`);
      } catch (e) {
        return { commits: [] };
      }

      const logCommand = `git --git-dir="${repoPath}" log --pretty=format:"%H|%an|%ad|%s" --date=iso`;
      
      const { stdout: logOutput } = await execAsync(logCommand);
      
      const commits: Commit[] = logOutput.split("\n").filter(Boolean).map(line => {
        const [hash, author, date, message] = line.split("|");
        return { hash, author, date, message, files: [] };
      });

      // Collecting files for commits
      for (const commit of commits) {
        // --name-only significantly reduces output size compared to full ls-tree
        const lsTreeCommand = `git --git-dir="${repoPath}" ls-tree -r --name-only ${commit.hash}`;
        
        const { stdout: lsTreeOutput } = await execAsync(lsTreeCommand, { maxBuffer: 1024 * 1024 * 50 });
        
        commit.files = lsTreeOutput.split("\n").filter(Boolean).map(path => ({ path }));
      }

      return { commits: commits.reverse() }; // They are already in the correct order from git log
    } catch (error) {
      this.logger.error(`Task ${job.id} failed: ${error.message}`);
      throw error; 
    }
  }

  @Process("getFileContentFromCommit")
  async getFileContentFromCommit(job: Job<{repoUrl: string, commitHash: string, filePath: string}>): Promise<File> {
    const { repoUrl, commitHash, filePath } = job.data

    try {
      // Use the same cache! It is instant if getCommits has already run
      const repoPath = await this.ensureRepo(repoUrl);
  
      // git show will automatically download the blob from the server (due to --filter=blob:none) if it is not local
      const command = `git --git-dir="${repoPath}" show ${commitHash}:${filePath}`;
        
      const { stdout: fileContent } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10 MB
      });
  
      return {
        hash: commitHash,
        path: filePath,
        content: fileContent,
      };
  
    } catch (error) {
      return {
        hash: commitHash,
        path: filePath,
        content: `Could not retrieve content for file "${filePath}" at commit "${commitHash}". It might not exist at that commit yet.`
      }
    }
  }
}