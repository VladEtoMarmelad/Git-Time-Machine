import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Commit, File, FileTreeMode } from "@sharedTypes/index";
import { GithubRepoService } from "./services/github-repo.service";
import { GithubAnalysisService } from "./services/github-analysis.service";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";

@Processor("git-analysis")
export class GitProcessor {

  // Base folder for storing cached repositories
  private readonly cacheDir = path.join(os.tmpdir(), "gittm-cache");

  // Ensure the cache folder exists
  constructor(
    private readonly githubRepoService: GithubRepoService,
    private readonly githubAnalysisService: GithubAnalysisService
  ) {
    fs.ensureDirSync(this.cacheDir);
  }

  @Process("getCommits")
  async getCommits(job: Job<{ repoUrl: string, branch: string | null, fileTreeMode: FileTreeMode}>) {
    const { repoUrl, branch, fileTreeMode } = job.data;
    return await this.githubAnalysisService.getCommits(repoUrl, branch ?? "main", fileTreeMode)
  }

  @Process("getCommitWithFiles")
  async getCommitWithFiles(job: Job<{ commit: Commit, repoUrl: string, branch: string, fileTreeMode: FileTreeMode}>) {
    const { commit, repoUrl, branch, fileTreeMode } = job.data;
    return await this.githubAnalysisService.getCommitWithFiles(commit, repoUrl, branch ?? "main", fileTreeMode)
  }

  @Process("getFileContentFromCommit")
  async getFileContentFromCommit(job: Job<{ repoUrl: string, commitHash: string, filePath: string }>): Promise<File|null> {
    const { repoUrl, commitHash, filePath } = job.data;
    return await this.githubAnalysisService.getFileContent(repoUrl, filePath, commitHash)
  }

  @Process("getForks")
  async getForks(job: Job<{ repoUrl: string, maxForksAmount: number }>) {
    const { repoUrl, maxForksAmount } = job.data;
    return this.githubRepoService.getForks(repoUrl, maxForksAmount)
  }

  @Process("getRepositoryMetadata")
  async getRepositoryMetadata(job: Job<{ repoUrl: string }>) {
    const { repoUrl } = job.data;
    return this.githubRepoService.getMetadata(repoUrl)
  }
}