import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class GitService {
  constructor(@InjectQueue("git-analysis") private readonly analysisQueue: Queue) {}

  async getCommits(repoUrl: string) {
    const job = await this.analysisQueue.add("getCommits", {repoUrl});
    return { jobId: job.id };
  }

  async getFileContentFromCommit(repoUrl: string, commitHash: string, filePath: string) {
    const job = await this.analysisQueue.add("getFileContentFromCommit", {repoUrl, commitHash, filePath});
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
