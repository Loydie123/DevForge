import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EnvManagerService } from './env-manager.service';
import type { EnvType, SecretType } from '@devforge/env-manager';

interface CreateConfigDto {
  name: string;
  environment: EnvType;
  variables?: Array<{
    key: string;
    value: string;
    type: SecretType;
    masked: boolean;
    description?: string;
  }>;
}

interface AddVariableDto {
  key: string;
  value: string;
  type: SecretType;
  masked: boolean;
  description?: string;
}

interface UpdateVariableDto {
  key?: string;
  value?: string;
  type?: SecretType;
  masked?: boolean;
  description?: string;
}

@Controller('env-manager')
export class EnvManagerController {
  constructor(private readonly envService: EnvManagerService) {}

  @Get('stats')
  getStats() {
    return this.envService.getStats();
  }

  @Get('configs')
  listConfigs() {
    return this.envService.listConfigs();
  }

  @Get('configs/:id')
  getConfig(@Param('id') id: string) {
    return this.envService.getConfig(id);
  }

  @Post('configs')
  createConfig(@Body() body: CreateConfigDto) {
    return this.envService.createConfig(
      body.name,
      body.environment,
      body.variables ?? [],
    );
  }

  @Put('configs/:id')
  updateConfig(
    @Param('id') id: string,
    @Body() body: Partial<Pick<CreateConfigDto, 'name' | 'environment'>>,
  ) {
    return this.envService.updateConfig(id, body);
  }

  @Delete('configs/:id')
  deleteConfig(@Param('id') id: string) {
    return { success: this.envService.deleteConfig(id) };
  }

  @Post('configs/:id/variables')
  addVariable(@Param('id') id: string, @Body() body: AddVariableDto) {
    return this.envService.addVariable(id, body);
  }

  @Put('configs/:configId/variables/:varId')
  updateVariable(
    @Param('configId') configId: string,
    @Param('varId') varId: string,
    @Body() body: UpdateVariableDto,
  ) {
    return this.envService.updateVariable(configId, varId, body);
  }

  @Delete('configs/:configId/variables/:varId')
  deleteVariable(
    @Param('configId') configId: string,
    @Param('varId') varId: string,
  ) {
    return this.envService.deleteVariable(configId, varId);
  }

  @Get('configs/:configId/variables/:varId/reveal')
  revealVariable(
    @Param('configId') configId: string,
    @Param('varId') varId: string,
  ) {
    return { value: this.envService.revealVariable(configId, varId) };
  }

  @Get('configs/:id/export')
  exportDotEnv(@Param('id') id: string) {
    return { content: this.envService.exportDotEnv(id) };
  }

  @Get('configs/:id/versions')
  getVersions(@Param('id') id: string) {
    return this.envService.getVersions(id);
  }

  @Post('configs/:id/versions/:versionId/restore')
  restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.envService.restoreVersion(id, versionId);
  }
}
