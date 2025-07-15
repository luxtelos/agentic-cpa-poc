# 1. Environment Configuration Strategy

## Status
Accepted

## Context
Need secure, flexible environment configuration for:
- API keys
- Environment-specific settings
- Build optimizations

## Decision
- Use Vite's built-in env variables (prefixed with VITE_)
- Single .env file for simplicity
- Different build optimizations based on VITE_APP_ENV
- Git ignore .env file for security

## Consequences
- ✅ Simple configuration
- ✅ Secure API key handling
- ✅ Different optimizations per environment
- ❌ Manual env setup required for new deployments
