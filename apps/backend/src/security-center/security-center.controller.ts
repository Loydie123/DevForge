import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityCenterService } from './security-center.service';
import { AuthGuard } from '../auth/auth.guard';
import type { JwtInspectDto } from '@devforge/security-center';

@UseGuards(AuthGuard)
@ApiTags('security')
@ApiBearerAuth()
@Controller('security')
export class SecurityCenterController {
  constructor(private readonly security: SecurityCenterService) {}

  @Get('stats')
  getStats() {
    return this.security.getStats();
  }

  @Get('audit-log')
  getAuditLog(@Query('limit') limit?: string) {
    return this.security.getAuditLog(limit ? parseInt(limit, 10) : 100);
  }

  @Get('ip-stats')
  getIpStats() {
    return this.security.getIpStats();
  }

  @Post('jwt/inspect')
  inspectJwt(@Body() dto: JwtInspectDto) {
    return this.security.inspectJwt(dto.token, dto.verify);
  }

  @Post('ips/block')
  blockIp(@Body() body: { ip: string; reason?: string }) {
    return this.security.blockIp(body.ip, body.reason);
  }

  @Post('ips/unblock')
  unblockIp(@Body() body: { ip: string }) {
    return this.security.unblockIp(body.ip);
  }
}
