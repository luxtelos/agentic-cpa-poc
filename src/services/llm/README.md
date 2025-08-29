# LLM Service Layer

This directory contains the abstraction layer for integrating multiple Large Language Model (LLM) providers into the application.

## Architecture Overview

The service layer uses the Adapter pattern to provide a uniform interface for different LLM providers while allowing each to maintain their unique capabilities.

## Directory Structure

```
llm/
├── types.ts                 # Core interfaces and type definitions
├── BaseLLMAdapter.ts        # Abstract base class for all adapters
├── LLMServiceFactory.ts     # Factory for provider selection and management
├── adapters/
│   ├── PerplexityAdapter.ts # Perplexity API implementation
│   └── ClaudeAdapter.ts     # Claude API implementation
└── README.md               # This file
```

## Usage

### Basic Usage

```typescript
import { LLMServiceFactory } from '@/services/llm/LLMServiceFactory';

// Get a specific provider
const service = LLMServiceFactory.getProvider('claude');

// Process files
const response = await service.processRequest({
  files: [file1, file2],
  prompt: 'Analyze these documents'
});
```

### Automatic Provider Selection

```typescript
// Let the factory choose the best provider
const service = LLMServiceFactory.getProvider('auto');
```

### Check Provider Availability

```typescript
const providers = LLMServiceFactory.getAvailableProviders();
// Returns: ['perplexity', 'claude']

const availability = await LLMServiceFactory.checkProviderAvailability();
// Returns: Map { 'perplexity' => true, 'claude' => false }
```

## Adding a New Provider

To add a new LLM provider:

1. Create a new adapter in `adapters/`:

```typescript
// adapters/OpenAIAdapter.ts
import { BaseLLMAdapter } from '../BaseLLMAdapter';

export class OpenAIAdapter extends BaseLLMAdapter {
  getName(): string {
    return 'OpenAI';
  }
  
  getCapabilities(): LLMCapabilities {
    return {
      supportsMultipleFiles: true,
      supportsStreaming: true,
      supportsWebSearch: false,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxFiles: 10,
      supportedFileTypes: ['application/pdf', 'text/plain']
    };
  }
  
  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    // Implementation
  }
  
  protected async healthCheck(): Promise<boolean> {
    return !!process.env.VITE_OPENAI_API_KEY;
  }
}
```

2. Register in the factory (`LLMServiceFactory.ts`):

```typescript
if (import.meta.env.VITE_OPENAI_API_KEY) {
  this.providers.set('openai', new OpenAIAdapter());
}
```

3. Add environment variables:

```bash
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4
```

## Provider Capabilities

| Provider | Multi-File | Web Search | Max Files | Max Size | Streaming |
|----------|------------|------------|-----------|----------|-----------|
| Perplexity | ❌ | ✅ | 1 | 5MB | ❌ |
| Claude | ✅ | ❌ | 5 | 10MB | ✅ |

## Environment Variables

### Perplexity
- `VITE_PERPLEXITY_API_KEY`: API key for Perplexity
- `VITE_PERPLEXITY_MODEL`: Model to use (default: sonar-reasoning-pro)

### Claude
- `VITE_CLAUDE_API_KEY`: API key for Claude
- `VITE_CLAUDE_MODEL`: Model to use (default: claude-3-opus-20240229)
- `VITE_CLAUDE_BASE_URL`: Base URL for API calls (default: /proxy-claude)
- `VITE_CLAUDE_API_VERSION`: API version (default: 2023-06-01)
- `VITE_CLAUDE_MAX_TOKENS`: Maximum tokens (default: 4096)
- `VITE_CLAUDE_TEMPERATURE`: Temperature setting (default: 0.7)

## Error Handling

All adapters return errors in a standardized format:

```typescript
interface LLMError {
  code: string;           // Error code (e.g., 'RATE_LIMIT', 'AUTH_ERROR')
  message: string;        // Human-readable error message
  retryable: boolean;     // Whether the request can be retried
  provider?: string;      // Which provider generated the error
}
```

## Testing

Test individual adapters:

```typescript
// Test file processing
const adapter = new ClaudeAdapter();
const result = await adapter.processRequest({
  files: [testFile],
  prompt: 'Test prompt'
});

// Test capabilities
const capabilities = adapter.getCapabilities();
expect(capabilities.supportsMultipleFiles).toBe(true);

// Test availability
const isAvailable = await adapter.isAvailable();
expect(isAvailable).toBe(true);
```

## Best Practices

1. **Always check capabilities** before using provider-specific features
2. **Handle errors gracefully** - providers may be temporarily unavailable
3. **Use factory methods** instead of instantiating adapters directly
4. **Monitor usage** - different providers have different rate limits
5. **Cache responses** when appropriate to reduce API calls

## Security

- API keys are never exposed to the client
- All API calls go through proxy endpoints
- File content is validated before processing
- Rate limiting is implemented per provider

## Future Enhancements

- [ ] Add response caching layer
- [ ] Implement provider fallback chains
- [ ] Add cost tracking per provider
- [ ] Implement streaming responses
- [ ] Add batch processing for large file sets
- [ ] Add provider-specific optimizations