import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as express from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectGeneratorService } from './project-generator.service';
import { GeneratorFeatures } from '@devforge/project-generator';

class GenerateProjectDto {
  name!: string;
  framework!: string;
  features!: GeneratorFeatures;
}

@UseGuards(AuthGuard)
@ApiTags('project-generator')
@ApiBearerAuth()
@Controller('project-generator')
export class ProjectGeneratorController {
  constructor(private readonly generatorService: ProjectGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateProject(
    @Body() dto: GenerateProjectDto,
    @Res() res: express.Response,
  ) {
    const zipBuffer = await this.generatorService.generateProject(
      dto.name,
      dto.framework,
      dto.features,
    );

    const filename = `${dto.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': zipBuffer.length,
    });

    res.end(zipBuffer);
  }
}
