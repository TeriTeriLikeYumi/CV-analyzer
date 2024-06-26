import { Module } from '@nestjs/common';
import { ChatGPT35Module } from './chatgpt35/chatgpt35.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [ChatGPT35Module, GeminiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
