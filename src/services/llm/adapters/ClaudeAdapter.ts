import { BaseLLMAdapter } from '../BaseLLMAdapter';
import { LLMRequest, LLMResponse, LLMCapabilities, FileProcessingResult } from '../types';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text';
    text: string;
  }>;
}

interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

export class ClaudeAdapter extends BaseLLMAdapter {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  
  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_CLAUDE_BASE_URL || '/proxy-claude';
    this.model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-opus-20240229';
    console.log('[ClaudeAdapter] Initialized with:', {
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl,
      model: this.model,
      apiVersion: import.meta.env.VITE_CLAUDE_API_VERSION,
      maxTokens: import.meta.env.VITE_CLAUDE_MAX_TOKENS
    });
  }
  
  getName(): string {
    return 'Claude';
  }
  
  getCapabilities(): LLMCapabilities {
    const maxFiles = parseInt(import.meta.env.VITE_CLAUDE_MAX_FILES || '5');
    const maxFileSizeMB = parseInt(import.meta.env.VITE_CLAUDE_MAX_FILE_SIZE_MB || '10');
    
    return {
      supportsMultipleFiles: true,
      supportsStreaming: true,
      supportsWebSearch: false,
      maxFileSize: maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
      maxFiles: maxFiles,
      supportedFileTypes: ['application/pdf', 'text/plain']
    };
  }
  
  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    try {
      this.validateRequest(request);
      
      // Process files to extract text
      let processedFiles: FileProcessingResult[] = [];
      if (request.files && request.files.length > 0) {
        console.log(`[ClaudeAdapter] Processing ${request.files.length} files`);
        processedFiles = await this.processFiles(request.files);
      }
      
      // Format the request for Claude
      const claudeRequest = await this.prepareClaudeRequest(request, processedFiles);
      
      // Send request to Claude API
      console.log('[ClaudeAdapter] Sending request to Claude API');
      const response = await this.callClaudeAPI(claudeRequest);
      
      return {
        content: response.content,
        metadata: {
          model: this.model,
          provider: 'Claude',
          filesProcessed: processedFiles.length,
          tokensUsed: response.usage?.total_tokens
        }
      };
    } catch (error: any) {
      console.error('[ClaudeAdapter] Error:', error);
      return {
        content: '',
        error: this.createLLMError(
          error.message || 'Failed to process with Claude',
          'CLAUDE_ERROR',
          error?.status >= 500
        )
      };
    }
  }
  
  private async prepareClaudeRequest(
    request: LLMRequest,
    processedFiles: FileProcessingResult[]
  ): Promise<ClaudeRequest> {
    // Build content array
    const contentArray: Array<{type: 'text', text: string}> = [];
    
    // Add user prompt if provided
    if (request.prompt) {
      contentArray.push({
        type: 'text',
        text: request.prompt
      });
    }
    
    // Add each file with clear boundaries
    processedFiles.forEach((file, index) => {
      if (!file.error) {
        contentArray.push({
          type: 'text',
          text: `\n=== FILE ${index + 1}: ${file.fileName} ===\n${file.content}\n=== END OF FILE ${index + 1} ===\n`
        });
      }
    });
    
    // If no content, add a default message
    if (contentArray.length === 0) {
      contentArray.push({
        type: 'text',
        text: 'Please analyze the provided documents.'
      });
    }
    
    // Load system prompt
    let systemPrompt = request.systemPrompt;
    if (!systemPrompt) {
      try {
        const promptResponse = await fetch('/prompt.txt');
        systemPrompt = await promptResponse.text();
      } catch (error) {
        console.warn('[ClaudeAdapter] Could not load default prompt:', error);
        systemPrompt = 'You are a helpful assistant analyzing tax documents.';
      }
    }
    
    return {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: contentArray
        }
      ],
      max_tokens: request.options?.maxTokens || parseInt(import.meta.env.VITE_CLAUDE_MAX_TOKENS || '32000'),
      temperature: request.options?.temperature || parseFloat(import.meta.env.VITE_CLAUDE_TEMPERATURE || '0.7'),
      system: systemPrompt
    };
  }
  
  private async callClaudeAPI(request: ClaudeRequest): Promise<any> {
    const url = `${this.baseUrl}/v1/messages`;
    
    // For development, we need to add the dangerous browser access header
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'anthropic-version': import.meta.env.VITE_CLAUDE_API_VERSION || '2023-06-01'
    };
    
    // Check if we're in development mode and not using a proxy
    if (this.baseUrl.includes('api.anthropic.com')) {
      // Direct API call (not recommended for production)
      headers['x-api-key'] = this.apiKey;
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    } else {
      // Using proxy - API key should be added by proxy
      headers['x-api-key'] = this.apiKey; // Still send it for the proxy to use
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Claude API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract content from Claude's response format
    const content = data.content?.[0]?.text || '';
    
    return {
      content,
      usage: {
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    };
  }
  
  protected async healthCheck(): Promise<boolean> {
    // Check if API key is configured
    return !!this.apiKey;
  }
}