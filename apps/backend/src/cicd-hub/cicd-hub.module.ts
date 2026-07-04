import { Module } from '@nestjs/common';
import { CicdHubController } from './cicd-hub.controller';
import { CicdHubService } from './cicd-hub.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CicdHubController],
  providers: [CicdHubService],
  exports: [CicdHubService],
})
export class CicdHubModule {}
