# 5. Netlify Deployment Strategy

## Status
Accepted

## Context
Production deployment needs to handle:
- Correct MIME types for specialized assets
- Static file serving configuration
- Single Page App routing
- API proxy requirements

## Decision
- Explicit netlify.toml configuration:
  - Headers for PDF worker (application/javascript)
  - SVG MIME type (image/svg+xml)
  - SPA redirect rules
- Vite production settings:
  - assetsInlineLimit: 0 (disable inlining)
  - copyPublicDir: true (explicit copy)
- CORS proxy configuration:
  - Local dev proxy via start-cors-proxy.sh
  - Production proxy via Netlify functions

## Consequences
✅ Fixed production asset loading issues
✅ Proper MIME types for all assets
✅ Maintained dev/prod parity
✅ Working API calls in production
❌ More complex deployment configuration
❌ Additional proxy maintenance
