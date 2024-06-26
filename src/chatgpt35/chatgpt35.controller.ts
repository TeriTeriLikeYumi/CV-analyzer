import { Body, Controller, Post } from '@nestjs/common';
import { ChatGPT35Service } from './chatgpt35.service';

@Controller('chatgpt35')
export class ChatGPT35Controller {
  constructor(private readonly chatGPT35Service: ChatGPT35Service) {}

  @Post()
  async prompt(@Body() body: any) {
    try {
      const result = await this.chatGPT35Service.getChatGPTResponse(body.prompt);
      return { code: 200, data: result, success: true };
    } catch (err) {
      return { code: 404, message: err.message, data: null, success: false };
    }
  }
}
