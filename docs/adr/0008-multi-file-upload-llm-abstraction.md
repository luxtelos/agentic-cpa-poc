# ADR-0008: Multi-File Upload and LLM Service Abstraction

## Status
Accepted

## Context
The application currently supports single PDF file upload and processing through the Perplexity API. Users have requested the ability to:
1. Upload and process multiple PDF files simultaneously
2. Use alternative LLM providers (specifically Claude) for enhanced capabilities
3. Maintain backward compatibility with existing single-file workflows

## Decision
We will implement a service layer abstraction for LLM providers using the Adapter pattern, enabling:
- Multi-file upload support for compatible providers (Claude)
- Single-file workflow preservation for existing provider (Perplexity)
- Clean separation between UI components and LLM provider implementations
- Progressive enhancement based on provider capabilities

## Architecture

### Service Layer Structure
```
src/services/llm/
├── types.ts                    # Core interfaces and types
├── BaseLLMAdapter.ts           # Abstract base class for adapters
├── LLMServiceFactory.ts        # Factory for provider selection
└── adapters/
    ├── PerplexityAdapter.ts    # Perplexity implementation (single-file)
    └── ClaudeAdapter.ts        # Claude implementation (multi-file)
```

### Key Interfaces
1. **ILLMService**: Standard interface for all LLM providers
2. **LLMCapabilities**: Declares provider capabilities (multi-file, streaming, etc.)
3. **LLMRequest/Response**: Standardized request/response formats

### Provider Capabilities
| Feature | Perplexity | Claude |
|---------|------------|--------|
| Multiple Files | ❌ | ✅ |
| Web Search | ✅ | ❌ |
| Max Files | 1 | 5 |
| Max File Size | 5MB | 10MB |
| Streaming | ❌ | ✅ |

## Implementation Details

### 1. Adapter Pattern
Each LLM provider implements the `ILLMService` interface through an adapter:
- **PerplexityAdapter**: Wraps existing `perplexityApi.ts` functions
- **ClaudeAdapter**: New implementation for Claude API with multi-file support

### 2. Multi-File Processing
Claude API accepts multiple files in a structured format:
```json
{
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "User prompt"},
      {"type": "text", "text": "=== FILE 1: doc1.pdf ===\n[content]"},
      {"type": "text", "text": "=== FILE 2: doc2.pdf ===\n[content]"}
    ]
  }],
  "system": "System prompt"
}
```

### 3. UI Components
- **MultiFileUpload.tsx**: New component supporting drag-and-drop and multiple file selection
- **Provider selection**: Tab-based UI for choosing between Perplexity and Claude
- **Progressive enhancement**: Features enable/disable based on selected provider

### 4. Proxy Configuration
Added Claude API proxy endpoint in Netlify and Vite configurations:
- Route: `/proxy-claude/*`
- Target: `https://api.anthropic.com`
- Headers: API key injection at proxy level for security

## Consequences

### Positive
- **Extensibility**: Easy to add new LLM providers by implementing the adapter interface
- **User Choice**: Users can select the best provider for their needs
- **Enhanced Capabilities**: Multi-file analysis for comprehensive tax document review
- **Clean Architecture**: Separation of concerns between UI and service layers
- **Type Safety**: Full TypeScript support throughout the stack
- **Backward Compatibility**: Existing single-file workflows remain unchanged

### Negative
- **Increased Complexity**: Additional abstraction layer adds complexity
- **API Key Management**: Need to manage multiple provider API keys
- **Cost Implications**: Different providers have different pricing models
- **Feature Parity**: Not all features available across all providers

## Security Considerations
1. API keys stored in environment variables only
2. Proxy endpoints prevent direct client-side API access
3. File size and type validation at multiple levels
4. Rate limiting implementation per provider

## Migration Path
1. **Phase 1**: Service layer implementation (completed)
2. **Phase 2**: UI components with feature flags
3. **Phase 3**: Testing and gradual rollout
4. **Phase 4**: Documentation and user education

## Future Enhancements
- Add more LLM providers (OpenAI, Gemini, etc.)
- Implement provider fallback chains
- Add response caching layer
- Implement cost optimization strategies
- Add file chunking for very large documents

## References
- Claude API Documentation: https://docs.anthropic.com/en/api/messages
- Perplexity API Documentation: Internal documentation
- Adapter Pattern: https://refactoring.guru/design-patterns/adapter

## Date
2024-01-28

## Authors
- Development Team