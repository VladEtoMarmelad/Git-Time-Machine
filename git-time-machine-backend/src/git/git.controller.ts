import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { GitService } from './git.service';

@Controller("git")
export class GitController {
  constructor(private readonly gitService: GitService) {}
  
  @Post("/getCommits")
  async getCommits(@Body("repoUrl") repoUrl: string) {
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new HttpException("Invalid GitHub repository URL provided.", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getCommits(repoUrl);
  }

  @Get("/getCommits/:jobId")
  async getAnalysisStatus(@Param("jobId") jobId: string) {
    return this.gitService.getJobStatus(jobId);
  }

  @Post("/file")
  async queueFileContent(@Body() body: {repoUrl: string; commitHash: string; filePath: string}) {
    const { repoUrl, commitHash, filePath } = body;
    if (!repoUrl || !commitHash || !filePath) {
      throw new HttpException("Missing required body parameters: repoUrl, commitHash, filePath", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getFileContentFromCommit(repoUrl, commitHash, filePath);
  }

  @Get("/file/:jobId")
  async getFileContentJobStatus(@Param("jobId") jobId: string) {
    return this.gitService.getJobStatus(jobId);
  }
}
