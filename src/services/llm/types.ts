// LLM Service Types and Interfaces

export interface LLMRequest {
  files: File[];
  prompt?: string;
  systemPrompt?: string;
  options?: LLMRequestOptions;
}

export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  searchMode?: 'web' | 'none';
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface LLMResponse {
  content: string;
  metadata?: {
    model: string;
    tokensUsed?: number;
    processingTime?: number;
    provider: string;
    filesProcessed?: number;
  };
  error?: LLMError;
}

export interface LLMError {
  code: string;
  message: string;
  retryable: boolean;
  provider?: string;
}

export interface LLMCapabilities {
  supportsMultipleFiles: boolean;
  supportsStreaming: boolean;
  supportsWebSearch: boolean;
  maxFileSize: number; // in bytes
  maxFiles: number;
  supportedFileTypes: string[];
}

export interface FileProcessingResult {
  fileName: string;
  content: string;
  pageCount?: number;
  error?: string;
}

export interface ILLMService {
  processRequest(request: LLMRequest): Promise<LLMResponse>;
  getCapabilities(): LLMCapabilities;
  isAvailable(): Promise<boolean>;
  getName(): string;
}