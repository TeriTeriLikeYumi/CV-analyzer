import { Injectable } from '@nestjs/common';
// import axios, { AxiosRequestConfig } from 'axios';

import { Constants } from '../helpers/constants';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: Constants.CHATGPT_API_KEY });

@Injectable()
export class ChatGPT35Service {
  apiKey = Constants.CHATGPT_API_KEY;
  constructor() {}

  // Function to send a request to the ChatGPT API
  async getChatGPTResponse(prompt: string): Promise<any> {
    // try {
    //   const requestData: AxiosRequestConfig = {
    //     method: 'post',
    //     url: 'https://api.openai.com/v1/completions',
    //     data: {
    //       model: 'text-davinci-002', // You can choose a different model if needed
    //       prompt: prompt,
    //       max_tokens: 150, // Maximum number of tokens in the response
    //       temperature: 0.7, // Controls the randomness of the response
    //       n: 1, // Number of completions to generate
    //     },
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${this.apiKey}`, // Use your API key here
    //     },
    //   };

    //   const response = await axios(requestData);
    //   return response.data.choices[0].text.trim();
    // } catch (error) {
    //   console.error('Error fetching response from ChatGPT:', error);
    //   // throw error;
    // }

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo-125',
    });

    return completion.choices[0];
  }
}
