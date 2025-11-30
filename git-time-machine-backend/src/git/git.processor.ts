import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { Commit } from '@sharedTypes/Commit';
import { File } from '@sharedTypes/File';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

@Processor("git-analysis")
export class GitProcessor {
  private readonly logger = new Logger(GitProcessor.name);

  @Process("getCommits")
  async getCommits(job: Job<{ repoUrl: string }>) { 
    const { repoUrl } = job.data;
    
    this.logger.log(`Starting background analysis for ${repoUrl} (Job ID: ${job.id})...`);
    
    const tempDir = path.join(os.tmpdir(), `gittm-sync-${uuidv4()}`);

    try {
      await execAsync(`git clone --bare "${repoUrl}" "${tempDir}"`);
      
      try {
        await execAsync(`git --git-dir="${tempDir}" rev-parse --verify HEAD`);
      } catch (headError) {
        this.logger.log(`Repository ${repoUrl} is empty. Finishing task.`);
        return { commits: [] }; 
      }

      const logCommand = `git --git-dir="${tempDir}" log --pretty=format:"%H|%an|%ad|%s" --date=iso`;
      const { stdout: logOutput } = await execAsync(logCommand);
      const commits: Commit[] = logOutput.split("\n").filter(Boolean).map(line => {
        const [hash, author, date, message] = line.split("|");
        return { hash, author, date, message, files: [] };
      });
      const processedCommits = commits.slice(0, 50);

      for (const commit of processedCommits) {
        const lsTreeCommand = `git --git-dir="${tempDir}" ls-tree -r --name-only ${commit.hash}`;
        const { stdout: lsTreeOutput } = await execAsync(lsTreeCommand);
        
        const files = lsTreeOutput.split("\n").filter(Boolean).map(line => {
          return { path: line };
        });
        commit.files = files;
      }

      this.logger.log(`Analysis for Job ID: ${job.id} completed!`);
      return { commits: processedCommits.reverse() };
    } catch (error) {
      this.logger.error(`Task ${job.id} failed: ${error.message}`);
      throw error; 
    } finally {
      this.logger.log(`Cleaning up directory for Job ID: ${job.id}`);
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  @Process("getFileContentFromCommit")
  async getFileContentFromCommit(job: Job<{repoUrl: string, commitHash: string, filePath: string}>) {
    const { repoUrl, commitHash, filePath } = job.data

    this.logger.log(`Fetching content for ${filePath} at commit ${commitHash}`);
    const tempDir = path.join(os.tmpdir(), `gittm-content-${uuidv4()}`);
  
    try {
      // We still need to clone the repo to access its objects.
      // A bare clone is very efficient.
      await execAsync(`git clone --bare "${repoUrl}" "${tempDir}"`);
  
      // THE CORE COMMAND: git show <commit_hash>:<path_to_file>
      // This command directly accesses the blob object for that file at that specific commit
      // and prints its raw content to stdout.
      const command = `git --git-dir="${tempDir}" show ${commitHash}:${filePath}`;
        
      const { stdout: fileContent } = await execAsync(command, {
        // Increase maxBuffer in case files are large (e.g., >1MB)
        maxBuffer: 1024 * 1024 * 10, // 10 MB
      });
  
      const file: File = {
        hash: commitHash,
        path: filePath,
        content: fileContent,
      };
      return file;
  
    } catch (error) {
      return {
        hash: commitHash,
        path: filePath,
        content: `Could not retrieve content for file "${filePath}" at commit "${commitHash}". It might not exist at that commit yet.`
      }
    } finally {
      // Always clean up the temporary clone
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}