import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { GitService } from './git.service';

@Controller("git")
export class GitController {
  constructor(private readonly gitService: GitService) {}
  
  @Get("/commits")
  async startAnalysis(@Query("repoUrl") repoUrl: string) {
    console.log(repoUrl)
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new HttpException("Invalid GitHub repository URL provided.", HttpStatus.BAD_REQUEST);
    }
    // The entire analysis runs here before the response is sent.
    // The user's request will hang until this is 100% complete.
    return this.gitService.analyzeRepository(repoUrl);
  }
  
 @Get("/file")
  async getFileContent(@Query("repoUrl") repoUrl: string, @Query("hash") commitHash: string, @Query("path") filePath: string) {
    if (!repoUrl || !commitHash || !filePath) {
      throw new HttpException("Missing required query parameters: repoUrl, hash, path", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getFileContentFromCommit(repoUrl, commitHash, filePath);
  }
}
