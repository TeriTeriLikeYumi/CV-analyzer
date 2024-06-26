import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async prompt(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.geminiService.getGeminiResponse(body.prompt, file);
      return { code: 200, data: result, success: true };
    } catch (err) {
      console.log(err);
      return { code: 404, message: err, data: null, success: false };
    }
  }

  @Post('/analyze-cv')
  @UseInterceptors(AnyFilesInterceptor())
  async analyzeCV(@UploadedFiles() files: Array<Express.Multer.File>, @Body('matchingPercentage') matchingPercentage: number) {
    try {
      let result = [];
      const cvFiles = files.filter(file => file.fieldname.includes('cvFiles'));
      const jdFile = files.find(file => file.fieldname.includes('jdFile'));
      
      const jdContent = await this.geminiService.parseOfficeFileToText(jdFile);

      for (const cvFile of cvFiles) {
        const cvContent = await this.geminiService.parseOfficeFileToText(cvFile);
        const prompt = (cv: string, jd: string): string => {
          return `
      You are an AI system that serves as a CV analyzer. Your objective is to help users improve their CVs and achieve better job matching. You should provide a grade-based percentage of the CV based on a provided grading score, along with detailed feedback and suggestions for improvement. In each step of the conversation, please provide the grade percentage, reasons for the grade, and actionable tips for enhancing the CV.
      
      Job Description:
        ${jd}
        
        User CV:
        ${cv}

      User: "Here's my CV for analysis:
      
      Name: John Doe  
      Education: Bachelor of Science in Computer Science, XYZ University, 3.5 GPA  
      Work Experience:  
      - Software Developer at ABC Corp (June 2019 - Present): Developed web applications using JavaScript, React, and Node.js.  
      - Intern at DEF Inc (January 2018 - May 2019): Assisted in developing internal tools and automating processes using Python.
      
      Skills: JavaScript, React, Node.js, Python, SQL, Git  
      Hobbies: Reading, Cycling, Traveling"
      
      Analysis and Feedback:
      
      Grade: 75%
      
      Reasons for the Grade:
      1. Education (20/25): 
         - Your degree and GPA are clearly listed, but mentioning relevant coursework or projects could improve this section.
      2. Work Experience (30/35):
         - Good descriptions of your roles, but adding specific achievements and quantifying your impact (e.g., "resulting in a 20% increase in user engagement") would strengthen this section.
      3. Skills (10/15):
         - A good list of skills, but emphasizing proficiency levels or certifications could enhance it.
      4. Hobbies (5/10):
         - Hobbies are listed but could be linked to skills or qualities relevant to the job.
      5. Overall Presentation (10/15):
         - The CV is clear and concise, but adding a summary at the top and using bullet points consistently would improve readability.
      
      Next Steps:
      - Implement the suggested improvements to enhance your CV.
      - Tailor your CV to match the job description, highlighting the most relevant skills and experiences.
      - Regularly review and update your CV to ensure it remains current and relevant.
      
      By following these tips, you can increase your CV's grade percentage and improve your chances of securing the job you're aiming for.
      `;
      };
      
      const aiExecute = await this.geminiService.getGeminiResponse(prompt(cvContent, jdContent));
      result.push(aiExecute);
      }

      return { code: 200, data: result, success: true };
    } catch (err) {
      console.log(err);
      return { code: 404, message: err, data: null, success: false };
    }
  }

  @Post('/pdf-to-text')
  @UseInterceptors(FileInterceptor('file'))
  async parsePdfFile(@UploadedFile('file') file: Express.Multer.File) {
    try {
      console.log(file);
      const result = await this.geminiService.parseOfficeFileToText(file);
      const prompt = 'get work experience of this content below: + \n' + result + '\n';
      const result2 = await this.geminiService.getGeminiResponse(prompt);
      console.log(result2);
      return { code: 200, data: result2, success: true };
    } catch (err) {
      console.log(err);
      return { code: 404, message: err, data: null, success: false };
    }
  }

}
