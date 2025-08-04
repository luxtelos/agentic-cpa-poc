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
- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **PDF Processing**:
  - pdfjs-dist (viewing)
  - pdf-lib (generation)
- **State Management**: React Query
- **Build**: Vite
- **Testing**: Vitest

## Prerequisites

- **Node.js**: >= 18.0.0 (recommended: 20.x LTS)
- **npm**: >= 9.0.0 or **yarn**: >= 1.22.0
- **Git**: Latest version

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd tax-corporate-smart
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
# Required - Perplexity AI Configuration
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here
VITE_PERPLEXITY_MODEL=sonar-reasoning-pro

# Required - API Proxy Configuration
VITE_PROXY_BASE=https://api.perplexity.ai
VITE_PROXY_URL_FORMAT=/chat/completions

# Optional - PDF Service (if using external PDF generation)
VITE_PDF_API_URL=https://your-pdf-service.com/generate

# Environment
VITE_APP_ENV=development
VITE_APP_TITLE=Tax Corporate Smart
```

### 4. Development Server
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173`

## Build Process

### Local Build
```bash
npm run build
# or
yarn build
```

### Build Verification
```bash
npm run preview
# or
yarn preview
```

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### General Deployment Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Verify build output** in `dist/` directory

3. **Configure environment variables** on your hosting platform

4. **Set up proper redirects** for SPA routing

5. **Deploy the `dist/` folder**

### Netlify Deployment

#### Option 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize site**:
   ```bash
   netlify init
   ```

4. **Deploy**:
   ```bash
   # Deploy to preview
   netlify deploy

   # Deploy to production
   netlify deploy --prod
   ```

#### Option 2: Git Integration

1. **Connect Repository** to Netlify dashboard
2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (in netlify.toml or environment)

3. **Set Environment Variables** in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add all `VITE_*` variables from your `.env` file

#### Option 3: Manual Deploy

1. Build locally: `npm run build`
2. Drag and drop `dist/` folder to Netlify dashboard

### Configuration Files

#### `netlify.toml`

Create in project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "max-age=31536000"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "max-age=31536000"

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### `public/_redirects` (Alternative to netlify.toml redirects)

```
/*    /index.html   200
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to Netlify

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test

    - name: Build project
      run: npm run build
      env:
        VITE_PERPLEXITY_API_KEY: ${{ secrets.VITE_PERPLEXITY_API_KEY }}
        VITE_PERPLEXITY_MODEL: ${{ secrets.VITE_PERPLEXITY_MODEL }}
        VITE_PROXY_BASE: ${{ secrets.VITE_PROXY_BASE }}
        VITE_PROXY_URL_FORMAT: ${{ secrets.VITE_PROXY_URL_FORMAT }}
        VITE_APP_ENV: production

    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Required GitHub Secrets

Add these secrets in GitHub repository settings:

- `NETLIFY_AUTH_TOKEN`: Personal access token from Netlify
- `NETLIFY_SITE_ID`: Site ID from Netlify dashboard
- `VITE_PERPLEXITY_API_KEY`: Your Perplexity API key
- `VITE_PERPLEXITY_MODEL`: Model name (e.g., sonar-reasoning-pro)
- `VITE_PROXY_BASE`: API base URL
- `VITE_PROXY_URL_FORMAT`: API endpoint format

## Architecture Decisions
See [docs/adr/](docs/adr/) for detailed architecture decision records.

## API Configuration

### Perplexity AI Setup

1. **Get API Key**: Sign up at [Perplexity AI](https://www.perplexity.ai/)
2. **Set Environment Variables**:
   ```bash
   VITE_PERPLEXITY_API_KEY=pplx-your-api-key
   VITE_PERPLEXITY_MODEL=sonar-reasoning-pro
   ```
3. **Configure Proxy** (if needed for CORS):
   ```bash
   VITE_PROXY_BASE=https://api.perplexity.ai
   VITE_PROXY_URL_FORMAT=/chat/completions
   ```

### Custom Prompts

- Navigate to `/admin/prompt` to customize AI prompts
- Prompts are stored in localStorage (development)
- For production, implement server-side prompt management

## Performance Optimization

### Build Optimization

The project uses Vite's built-in optimizations:
- **Tree shaking**: Removes unused code
- **Code splitting**: Automatic route-based splitting
- **Asset optimization**: Images, fonts, etc.
- **Gzip compression**: Enabled by default

### PDF Processing

- **Client-side processing**: Uses pdf-lib for generation
- **Memory management**: Automatic cleanup of PDF objects
- **Progressive loading**: Large PDFs are processed incrementally

## Troubleshooting

### Common Build Issues

1. **Node version mismatch**:
   ```bash
   node --version  # Should be >= 18
   ```

2. **Environment variables not loaded**:
   - Ensure variables start with `VITE_`
   - Check .env file is in project root
   - Restart dev server after changes

3. **PDF generation fails**:
   - Check browser console for errors
   - Verify PDF file size (< 5MB limit)
   - Test with different PDF files

### Netlify-Specific Issues

1. **Build fails**:
   - Check Node.js version in build logs
   - Verify environment variables are set
   - Review build command and publish directory

2. **404 on refresh**:
   - Ensure `_redirects` file or netlify.toml redirects are configured
   - Check SPA routing configuration

3. **API calls fail**:
   - Verify CORS configuration
   - Check API key environment variables
   - Review network tab in browser dev tools

### Getting Help

1. **Check build logs** in Netlify dashboard
2. **Review browser console** for client-side errors
3. **Test locally** with production build (`npm run preview`)
4. **Check environment variables** are properly set

## Development Workflow

### Branch Strategy
- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `hotfix/*`: Hotfix branches

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and write tests
3. Run `npm run test` and `npm run build`
4. Create PR to `develop`
5. After review, merge to `develop`
6. Deploy `develop` to staging
7. Create PR from `develop` to `main` for production

## Monitoring and Analytics

### Build Monitoring
- **Netlify Analytics**: Available in dashboard
- **Build notifications**: Configure in Netlify settings
- **Performance monitoring**: Lighthouse CI integration

### Error Tracking
Consider integrating:
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Google Analytics**: For usage analytics

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use different API keys for staging/production
- Rotate API keys regularly

### Content Security Policy
Consider adding CSP headers in netlify.toml:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
```


## Architecture Decisions (Historic / Archival)

See [docs/adr/](docs/adr/) for detailed architecture decision records.

---

## Support

For deployment issues or questions:
1. Check this README
2. Review Netlify documentation
3. Check GitHub issues
4. Contact the development team
