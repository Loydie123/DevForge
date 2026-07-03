import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AiEngineService } from './ai-engine.service';
import * as AiEngine from '@devforge/ai-engine';

@UseGuards(AuthGuard)
@Controller('ai-engine')
export class AiEngineController {
  constructor(private readonly aiEngineService: AiEngineService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() dto: AiEngine.AiRequestDto,
  ): Promise<AiEngine.AiResponseDto> {
    return this.aiEngineService.chat(dto);
  }
}
