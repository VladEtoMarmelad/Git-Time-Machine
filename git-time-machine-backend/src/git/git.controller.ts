import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { GitService } from './git.service';

@Controller("git")
export class GitController {
  constructor(private readonly gitService: GitService) {}
  
  @Post("/getCommits")
  async getCommits(@Body() body: {repoUrl: string; branch: string|null}) {
    const { repoUrl, branch } = body;
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new HttpException("Invalid GitHub repository URL provided.", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getCommits(repoUrl, branch);
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

  @Post("/branches")
  async branches(@Body("repoUrl") repoUrl: string) {
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new HttpException("Invalid GitHub repository URL provided.", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getBranches(repoUrl);
  }

  @Get("/branches/:jobId")
  async getBranches(@Param("jobId") jobId: string) {
    return this.gitService.getJobStatus(jobId);
  }

  @Post("/forks")
  async getForks(@Body() body: {repoUrl: string; maxForksAmount: number}) {
    const { repoUrl, maxForksAmount } = body;
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new HttpException("Invalid GitHub repository URL provided.", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getForks(repoUrl, maxForksAmount);
  }

  @Get("/forks/:jobId")
  async getForksStatus(@Param("jobId") jobId: string) {
    return this.gitService.getJobStatus(jobId);
  }

  @Post("/repositoryMetadata")
    async getRepositoryMetadata(@Body("repoUrl") repoUrl: string) {
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new HttpException("Invalid GitHub repository URL provided.", HttpStatus.BAD_REQUEST);
    }
    return this.gitService.getRepositoryMetadata(repoUrl);
  }

  @Get("/repositoryMetadata/:jobId")
  async getRepositoryMetadataStatus(@Param("jobId") jobId: string) {
    return this.gitService.getJobStatus(jobId);
  }
}
