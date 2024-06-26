import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}
