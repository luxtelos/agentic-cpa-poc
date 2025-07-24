# 8. Markdown Processing Strategy

## Status
Accepted

## Context
Need to process markdown input from:
- Perplexity API responses
- Direct user input in /pdf-test  
- Sample documentation files

Requirements:
- Consistent parsing across input sources
- Support for tax report structures
- Conversion to standardized JSON schema
- Integration with existing PDF generation

## Decision
Implement a dedicated markdown processor that:
1. Uses unified/remark ecosystem for parsing
2. Converts to intermediate AST
3. Maps to our tax report schema
4. Handles edge cases via:
   - Custom remark plugins
   - Schema validation
   - Fallback behaviors

## Consequences
✅ Single processing pipeline for all markdown  
✅ Maintainable with clear separation of concerns  
✅ Reusable across application routes  
❌ Additional bundle size from remark  
❌ Complex AST transformations required
