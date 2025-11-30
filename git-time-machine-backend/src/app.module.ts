import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitModule } from './git/git.module';

@Module({
  imports: [
    GitModule,
    BullModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
