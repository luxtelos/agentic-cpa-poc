# Tax Corporate Smart

AI-powered tax optimization platform for corporate tax analysis and recommendations.

## Features
- PDF tax document upload and text extraction
- AI-powered tax optimization recommendations
- Report generation with:
  - PDF download
  - HTML preview
  - Consistent formatting
- Secure API integration with Perplexity AI
- Responsive UI with dark/light mode

## Tech Stack
- Frontend: React + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS
- PDF Processing: 
  - pdfjs-dist (viewing)
  - pdf-lib (generation)
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

## PDF Generation Flow
1. Content is processed through custom markdown parser (`src/lib/markdownProcessor.ts`)
2. Layout engine calculates spacing and breaks (`src/lib/pdfLayoutUtils.ts`)
3. PDF is generated client-side using pdf-lib
4. Two output options:
   - HTML preview (styled with Tailwind)
   - Downloadable PDF

Key Components:
- `PdfTestPage.tsx`: Test interface
- `PdfRenderer.tsx`: Core generation logic
- `markdownProcessor.ts`: Content structuring
- `pdfLayoutUtils.ts`: Spacing calculations

## Architecture Decisions
See [docs/adr/](docs/adr/) for detailed architecture decision records.
