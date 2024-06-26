import { Module } from '@nestjs/common';

import { ChatGPT35Controller } from './chatgpt35.controller';
import { ChatGPT35Service } from './chatgpt35.service';

@Module({
  imports: [],
  controllers: [ChatGPT35Controller],
  providers: [ChatGPT35Service],
})
export class ChatGPT35Module {}
