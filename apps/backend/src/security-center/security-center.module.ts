import { Module } from '@nestjs/common';
import { SecurityCenterController } from './security-center.controller';
import { SecurityCenterService } from './security-center.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SecurityCenterController],
  providers: [SecurityCenterService],
  exports: [SecurityCenterService],
})
export class SecurityCenterModule {}
