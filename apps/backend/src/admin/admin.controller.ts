import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService, AdminUser, PlatformStats } from './admin.service';
import { AdminGuard } from './admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getPlatformStats(): Promise<PlatformStats> {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  async getAllUsers(): Promise<AdminUser[]> {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: { role: 'admin' | 'developer' },
  ): Promise<AdminUser> {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.adminService.deleteUser(id);
  }
}
