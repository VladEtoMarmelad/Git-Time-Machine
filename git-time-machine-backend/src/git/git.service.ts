import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os'; 

const execAsync = promisify(exec);

@Injectable()
export class GitService {
  private readonly logger = new Logger("");
  
  async analyzeRepository(repoUrl: string) {
    this.logger.log(`Starting SYNC analysis for ${repoUrl}...`);
    const tempDir = path.join(os.tmpdir(), `gittm-sync-${uuidv4()}`);

    try {
      // 1. Clone the repository
      this.logger.log(`Cloning into ${tempDir}...`);
      // Use double quotes for Windows compatibility
      await execAsync(`git clone --bare "${repoUrl}" "${tempDir}"`);
      
      // 2. Check if the repository is empty (has no commits)
      try {
        // This command will fail if HEAD does not exist (i.e., in an empty repo)
        await execAsync(`git --git-dir="${tempDir}" rev-parse --verify HEAD`);
      } catch (headError) {
        // If it fails, repo is empty. Log it and return a valid empty response.
        this.logger.log(`Repository ${repoUrl} is empty. Returning empty history.`);
        return { commits: [] };
      }

      // 3. If the check above passed, we can safely get the log
      const logCommand = `git --git-dir="${tempDir}" log --pretty=format:"%H|%an|%ad|%s" --date=iso`;
      const { stdout: logOutput } = await execAsync(logCommand);
      const commits: any = logOutput.split('\n').filter(Boolean).map(line => {
        const [hash, author, date, message] = line.split("|");
        return { hash, author, date, message, files: [] };
      });

      this.logger.log(`Found ${commits.length} commits.`);
      
      // 4. Analyze the file tree for each commit (limited for performance)
      for (const commit of commits.slice(0, 50)) { // Analyze only a subset
        const lsTreeCommand = `git --git-dir="${tempDir}" ls-tree -r --long ${commit.hash}`;
        const { stdout: lsTreeOutput } = await execAsync(lsTreeCommand);
        
        const files = lsTreeOutput.split("\n").filter(Boolean).map(line => {
          const parts = line.split(/\s+/);
          return { path: parts[4], size: parseInt(parts[3], 10) };
        });
        commit.files = files;
      }
      
      const processedCommits = commits.slice(0, 50);

      this.logger.log("Sync analysis complete!");
      return { commits: processedCommits };

    } catch (error) {
      this.logger.error(`Failed to analyze repo: ${error.message}`);
      throw new InternalServerErrorException(`Analysis failed: ${error.message}`);
    } finally {
      // 5. Cleanup
      this.logger.log(`Cleaning up directory: ${tempDir}`);
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  async getFileContentFromCommit(repoUrl: string, commitHash: string, filePath: string) {
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

      return {
        hash: commitHash,
        path: filePath,
        content: fileContent,
      };

    } catch (error) {
      // This error happens if the file didn't exist at that commit
      // or if the path is incorrect.
      this.logger.error(`Could not get file content: ${error.message}`);
      throw new InternalServerErrorException(
        `Could not retrieve content for file "${filePath}" at commit "${commitHash}". It might not exist at that point in history.`,
      );
    } finally {
      // Always clean up the temporary clone
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
