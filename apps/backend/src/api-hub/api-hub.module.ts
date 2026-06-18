import { Module } from '@nestjs/common';
import { ApiHubService } from './api-hub.service';
import { ApiHubController } from './api-hub.controller';

@Module({
  controllers: [ApiHubController],
  providers: [ApiHubService],
})
export class ApiHubModule {}
