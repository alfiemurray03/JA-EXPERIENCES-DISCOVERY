import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // /public is the committed production bundle, not a Vite source directory.
  // Source-owned static files are copied from /static by sync-vite-output.mjs.
  // Disabling Vite's default publicDir prevents old hashed production assets
  // from being copied back into /dist and accumulating on every deployment.
  publicDir: false,
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      nothing: '/src/fallbacks/missingModule.ts',
      '@/api': path.resolve(rootDir, './src/server/api'),
      '@server': path.resolve(rootDir, './src/server'),
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'react-vendor';
          if (id.includes('/node_modules/react-router')) return 'router-vendor';
          if (id.includes('/node_modules/@radix-ui/')) return 'radix-vendor';
          if (id.includes('/node_modules/lucide-react/')) return 'icons-vendor';
          if (id.includes('/node_modules/motion/')) return 'motion-vendor';
          if ([
            '/node_modules/jspdf/',
            '/node_modules/jspdf-autotable/',
            '/node_modules/canvg/',
            '/node_modules/core-js/',
            '/node_modules/dompurify/',
            '/node_modules/fast-png/',
            '/node_modules/fflate/',
            '/node_modules/html2canvas/',
            '/node_modules/rgbcolor/',
            '/node_modules/svg-pathdata/',
            '/node_modules/stackblur-canvas/',
            '/node_modules/css-line-break/',
            '/node_modules/text-segmentation/',
            '/node_modules/utrie/'
          ].some((dependency) => id.includes(dependency))) return 'pdf-vendor';
          if (id.includes('/node_modules/@lexical/') || id.includes('/node_modules/lexical/')) return 'editor-vendor';
          if (id.includes('/node_modules/')) return 'vendor';
          if (id.includes('/src/lib/builders/') || id.includes('/src/lib/templates/')) return 'document-templates';
        },
      },
    },
  },
});
