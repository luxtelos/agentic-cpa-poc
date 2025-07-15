import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
