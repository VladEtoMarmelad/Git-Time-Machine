import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubClientService {
  public readonly octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({auth: process.env.GITHUB_TOKEN});
  }
}