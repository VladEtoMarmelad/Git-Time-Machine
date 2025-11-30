import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { GitController } from './git.controller';
import { BullModule } from '@nestjs/bull';
import { GitProcessor } from './git.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'git-analysis',
    }),
  ],
  providers: [GitService, GitProcessor],
  controllers: [GitController],
})
export class GitModule {}
