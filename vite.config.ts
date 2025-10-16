import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Force cache bust with build timestamp
const buildId = Date.now().toString();
console.log('🔨 Build ID:', buildId);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Add build timestamp to force cache invalidation
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(buildId),
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    dedupe: ['react', 'react-dom'],
  },
  // Force new chunk filenames
  build: {
    rollupOptions: {
      output: {
        // Add timestamp to chunk names to force new URLs
        chunkFileNames: `assets/[name]-${buildId}-[hash].js`,
        entryFileNames: `assets/[name]-${buildId}-[hash].js`,
        assetFileNames: `assets/[name]-${buildId}-[hash].[ext]`,
      },
    },
  },
}));
