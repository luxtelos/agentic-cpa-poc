import { ILLMService, LLMRequest } from './types';
import { PerplexityAdapter } from './adapters/PerplexityAdapter';
import { ClaudeAdapter } from './adapters/ClaudeAdapter';

export type LLMProvider = 'perplexity' | 'claude' | 'auto';

export class LLMServiceFactory {
  private static providers: Map<string, ILLMService> = new Map();
  private static initialized = false;
  
  private static initialize() {
    if (this.initialized) return;
    
    // Register Perplexity adapter
    if (import.meta.env.VITE_PERPLEXITY_API_KEY) {
      this.providers.set('perplexity', new PerplexityAdapter());
    }
    
    // Register Claude adapter
    if (import.meta.env.VITE_CLAUDE_API_KEY) {
      this.providers.set('claude', new ClaudeAdapter());
    }
    
    this.initialized = true;
  }
  
  static getProvider(name: LLMProvider): ILLMService {
    this.initialize();
    
    if (name === 'auto') {
      return this.selectOptimalProvider();
    }
    
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found or not configured`);
    }
    
    return provider;
  }
  
  static selectOptimalProvider(request?: LLMRequest): ILLMService {
    this.initialize();
    
    // If request has multiple files, use Claude if available
    if (request && request.files && request.files.length > 1) {
      const claude = this.providers.get('claude');
      if (claude) return claude;
    }
    
    // Default to Perplexity if available
    const perplexity = this.providers.get('perplexity');
    if (perplexity) return perplexity;
    
    // Return first available provider
    const firstProvider = this.providers.values().next().value;
    if (!firstProvider) {
      throw new Error('No LLM providers configured');
    }
    
    return firstProvider;
  }
  
  static getAvailableProviders(): LLMProvider[] {
    this.initialize();
    return Array.from(this.providers.keys()) as LLMProvider[];
  }
  
  static async checkProviderAvailability(): Promise<Map<string, boolean>> {
    this.initialize();
    const availability = new Map<string, boolean>();
    
    for (const [name, provider] of this.providers) {
      availability.set(name, await provider.isAvailable());
    }
    
    return availability;
  }
}