# Tax Corporate Smart

AI-powered tax optimization platform for corporate tax analysis and recommendations.

## Features
- PDF tax document upload and text extraction
- AI-powered tax optimization recommendations
- Secure API integration with Perplexity AI
- Responsive UI with dark/light mode

## Tech Stack
- Frontend: React + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS
- PDF Processing: pdfjs-dist
- State Management: React Query
- Build: Vite

## Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Create `.env` file (see `.env.example`)
4. Run dev server: `npm run dev`

## Configuration
- Environment variables:
  - `VITE_PERPLEXITY_API_KEY`: Perplexity AI API key
  - `VITE_APP_ENV`: Environment (development/production)

## Architecture Decisions
See [docs/adr/](docs/adr/) for detailed architecture decision records.
