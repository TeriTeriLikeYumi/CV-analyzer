import { Injectable } from "@nestjs/common";
import { Constants } from "../helpers/constants";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { parseOfficeAsync } from "officeparser";
import { readFileSync, writeFileSync } from "fs";

import { pdf } from "pdf-to-img";
import { Readable } from "stream";

const genAI = new GoogleGenerativeAI(Constants.GEMINI_API_KEY);

@Injectable()
export class GeminiService {
  constructor() {}

  // Function to send a request to the ChatGPT API
  async getGeminiResponse(prompt: string, file?: Express.Multer.File, mimeType?: string): Promise<any> {
    let response;
    if (file) {
      const image = {
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: mimeType || file.mimetype,
        },
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision", safetySettings });
      const result = await model.generateContent([prompt, image]);
      response = await result.response;
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      response = await result.response;
    }

    const text = response.text();
    return text;
  }

  async parseOfficeFileToText(file: Express.Multer.File) {
    const fileBuffers = file.buffer;
    try {
      let data = await parseOfficeAsync(fileBuffers);
      if (this.isBlank(data)) {
        // cannot convert pdf to text, try to convert pdf to image
        data = await this.getTextFromImageByAI(file);
      }
      return data
    } catch (err) {
        // cannot convert pdf to text, try to convert pdf to image
      return await this.getTextFromImageByAI(file);
    }
  }

  async convertPdfToImage(file: Express.Multer.File) {
    let counter = 1;
    const document = await pdf(file.buffer, { scale: 1 });
    for await (const image of document) {
      await writeFileSync(`./files/page${counter}.png`, image);
      counter++;
    }
  }

  async getTextFromImageByAI(file: Express.Multer.File) {
    await this.convertPdfToImage(file);
    const newImgFile: Express.Multer.File = {
      buffer: await readFileSync('./files/page1.png'), mimetype: 'image/png',
      fieldname: "",
      originalname: "",
      encoding: "",
      size: 0,
      stream: new Readable,
      destination: "",
      filename: "",
      path: ""
    };
    const data = await this.getGeminiResponse('get text from this file', newImgFile);
    return data;
  }

  isBlank(str) {
    return !str || /^\s*$/.test(str);
  }
}
