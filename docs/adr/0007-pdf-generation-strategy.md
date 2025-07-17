# 7. PDF Generation Strategy

## Status
Accepted

## Context
Need to generate consistent tax optimization reports with:
- Structured content sections
- Proper formatting
- Download capability
- Preview functionality

## Decision
- Use client-side PDF generation with pdf-lib
- Implement custom markdown processor for content structure
- Separate layout utilities for consistent spacing
- HTML preview for quick viewing
- Downloadable PDF for sharing/printing

## Consequences
✅ No server-side processing required  
✅ Consistent output across platforms  
✅ Maintainable content structure  
✅ Fast preview rendering  
❌ Larger client bundle size  
❌ Limited to browser capabilities  
❌ Complex layout calculations
