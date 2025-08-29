import { BaseLLMAdapter } from '../BaseLLMAdapter';
import { LLMRequest, LLMResponse, LLMCapabilities } from '../types';
import { getChatCompletion, preparePerplexityApiPayload, extractReportContent } from '@/lib/perplexityApi';

export class PerplexityAdapter extends BaseLLMAdapter {
  getName(): string {
    return 'Perplexity';
  }
  
  getCapabilities(): LLMCapabilities {
    const maxFiles = parseInt(import.meta.env.VITE_PERPLEXITY_MAX_FILES || '1');
    const maxFileSizeMB = parseInt(import.meta.env.VITE_PERPLEXITY_MAX_FILE_SIZE_MB || '5');
    
    return {
      supportsMultipleFiles: false,
      supportsStreaming: false,
      supportsWebSearch: true,
      maxFileSize: maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
      maxFiles: maxFiles,
      supportedFileTypes: ['application/pdf', 'text/plain']
    };
  }
  
  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    try {
      this.validateRequest(request);
      
      let content: string;
      
      // Extract text from file if provided
      if (request.files && request.files.length > 0) {
        const file = request.files[0]; // Perplexity only supports single file
        content = await this.extractTextFromPDF(file);
      } else if (request.prompt) {
        content = request.prompt;
      } else {
        throw new Error('No content or files provided');
      }
      
      // Use existing Perplexity API function
      console.log('[PerplexityAdapter] Processing request with content length:', content.length);
      const response = await getChatCompletion(content);
      
      // Extract the content from the response
      const rawContent = response.choices[0].message.content;
      const reportContent = extractReportContent(rawContent);
      
      return {
        content: reportContent,
        metadata: {
          model: response.model || 'sonar-reasoning-pro',
          provider: 'Perplexity',
          filesProcessed: request.files?.length || 0,
          tokensUsed: response.usage?.total_tokens
        }
      };
    } catch (error: any) {
      console.error('[PerplexityAdapter] Error:', error);
      return {
        content: '',
        error: this.createLLMError(
          error.message || 'Failed to process with Perplexity',
          'PERPLEXITY_ERROR',
          error.status >= 500
        )
      };
    }
  }
  
  protected async healthCheck(): Promise<boolean> {
    // Check if API key is configured
    return !!import.meta.env.VITE_PERPLEXITY_API_KEY;
  }
}