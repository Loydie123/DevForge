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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import * as Permissions from '@devforge/permissions';

@UseGuards(AdminGuard)
@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getPlatformStats(): Promise<Permissions.PlatformStats> {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  async getAllUsers(): Promise<Permissions.AdminUser[]> {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: Permissions.UpdateUserRoleDto,
  ): Promise<Permissions.AdminUser> {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.adminService.deleteUser(id);
  }
}
