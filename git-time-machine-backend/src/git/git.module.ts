import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { GitController } from './git.controller';
import { BullModule } from '@nestjs/bull';
import { GitProcessor } from './git.processor';
import { GithubClientService } from './services/github-client.service';
import { GithubRepoService } from './services/github-repo.service';
import { GithubAnalysisService } from './services/github-analysis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'git-analysis',
    }),
  ],
  providers: [
    GitService, 
    GitProcessor, 
    GithubClientService, 
    GithubRepoService,
    GithubAnalysisService
  ],
  controllers: [GitController],
})
export class GitModule {}
