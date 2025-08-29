import { ILLMService, LLMRequest, LLMResponse, LLMCapabilities, LLMError, FileProcessingResult } from './types';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export abstract class BaseLLMAdapter implements ILLMService {
  protected config: any;
  
  constructor(config?: any) {
    this.config = config || {};
  }
  
  abstract processRequest(request: LLMRequest): Promise<LLMResponse>;
  abstract getCapabilities(): LLMCapabilities;
  abstract getName(): string;
  
  async isAvailable(): Promise<boolean> {
    try {
      return await this.healthCheck();
    } catch {
      return false;
    }
  }
  
  protected abstract healthCheck(): Promise<boolean>;
  
  protected validateRequest(request: LLMRequest): void {
    const capabilities = this.getCapabilities();
    
    if (request.files && request.files.length > 0) {
      if (!capabilities.supportsMultipleFiles && request.files.length > 1) {
        throw new Error(`${this.getName()} provider does not support multiple files`);
      }
      
      if (request.files.length > capabilities.maxFiles) {
        throw new Error(`Maximum ${capabilities.maxFiles} files allowed for ${this.getName()}`);
      }
      
      // Validate file types and sizes
      request.files.forEach(file => {
        if (!capabilities.supportedFileTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not supported by ${this.getName()}`);
        }
        if (file.size > capabilities.maxFileSize) {
          throw new Error(`File ${file.name} exceeds size limit of ${capabilities.maxFileSize / (1024 * 1024)}MB`);
        }
      });
    }
  }
  
  protected async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error);
      throw new Error(`Failed to extract text from ${file.name}`);
    }
  }
  
  protected async processFiles(files: File[]): Promise<FileProcessingResult[]> {
    const results: FileProcessingResult[] = [];
    
    for (const file of files) {
      try {
        const content = await this.extractTextFromPDF(file);
        results.push({
          fileName: file.name,
          content,
          pageCount: -1 // Could be calculated if needed
        });
      } catch (error: any) {
        results.push({
          fileName: file.name,
          content: '',
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  protected createLLMError(message: string, code: string = 'UNKNOWN', retryable: boolean = false): LLMError {
    return {
      message,
      code,
      retryable,
      provider: this.getName()
    };
  }
}