import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
    exclude: ['@react-pdf/renderer/node'],
  },
  server: {
    host: "::",
    port: 8080,
    proxy: mode === 'development' ? {
      '/proxy-claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy-claude/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Read the API key from the request header or use env variable
            const apiKeyFromHeader = req.headers['x-api-key'];
            const apiKey = apiKeyFromHeader || process.env.VITE_CLAUDE_API_KEY;
            
            console.log('[Vite Proxy] Proxying Claude request:', {
              path: req.url,
              hasApiKey: !!apiKey,
              apiKeyLength: apiKey?.length
            });
            
            if (apiKey) {
              // Remove the header from client and set it properly for Claude
              proxyReq.removeHeader('x-api-key');
              proxyReq.setHeader('x-api-key', apiKey);
              proxyReq.setHeader('anthropic-version', process.env.VITE_CLAUDE_API_VERSION || '2023-06-01');
              // Add the dangerous browser access header for development
              proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
            } else {
              console.error('[Vite Proxy] No API key found for Claude request');
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[Vite Proxy] Claude response:', {
              status: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage
            });
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Claude proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
          });
        }
      }
    } : undefined,
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: mode !== 'production',
    cssMinify: mode === 'production',
    assetsInlineLimit: 0,
    copyPublicDir: true,
    rollupOptions: {
      treeshake: mode === 'production',
      output: {
        manualChunks: mode === 'production' ? {
          vendor: ['react', 'react-dom'],
          pdfjs: ['pdfjs-dist']
        } : undefined
      }
    }
  }
}));
