import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileTreeMode } from '@sharedTypes/FileTreeMode';

@Injectable()
export class GitService {

  constructor(@InjectQueue("git-analysis") private readonly analysisQueue: Queue) {}

  async getCommits(repoUrl: string, branch: string|null, fileTreeMode: FileTreeMode) {
    const job = await this.analysisQueue.add("getCommits", {repoUrl, branch, fileTreeMode});
    return { jobId: job.id };
  }

  async getFileContentFromCommit(repoUrl: string, commitHash: string, filePath: string) {
    const job = await this.analysisQueue.add("getFileContentFromCommit", {repoUrl, commitHash, filePath});
    return { jobId: job.id };
  }

  async getBranches(repoUrl: string) {
    const job = await this.analysisQueue.add("getBranches", {repoUrl});
    return { jobId: job.id };
  }

  async getForks(repoUrl: string, maxForksAmount: number) {
    const job = await this.analysisQueue.add("getForks", { repoUrl, maxForksAmount });
    return { jobId: job.id };
  }

  async getRepositoryMetadata(repoUrl: string) {
    const job = await this.analysisQueue.add("getRepositoryMetadata", { repoUrl });
    return { jobId: job.id };
  }

  async getJobStatus(jobId: string) {
    const job = await this.analysisQueue.getJob(jobId);

    if (!job) return {state: "not_found"};

    const state = await job.getState();
    const result = job.returnvalue; 
    const failedReason = job.failedReason; 

    return { state, result, failedReason };
  }
}
