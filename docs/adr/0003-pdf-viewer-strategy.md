# 3. PDF Viewer Implementation Strategy

## Status
Accepted

## Context
Need to display uploaded tax documents with:
- Native browser rendering
- Download capability
- No text preview fallback
- Robust error handling

## Decision
- Use native browser PDF viewer via `<iframe>` with blob URLs
- Remove all canvas/text-based PDF rendering
- Implement strict PDF validation:
  - Check PDF header magic number (%PDF)
  - Validate minimum file size (100 bytes)
- Add comprehensive error states
- Maintain download functionality
- Use PDF-lib for server-side generation

## Consequences
- ✅ Native browser controls (zoom, search, print)
- ✅ Consistent cross-browser experience
- ✅ Better performance than canvas rendering
- ✅ Proper PDF validation prevents blank previews
- ❌ Less control over styling
- ❌ Mobile browsers may handle differently
- ❌ Requires modern browser support
