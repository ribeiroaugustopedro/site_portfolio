import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Changed for custom domain paribeiro.com
  build: {
    outDir: 'dist',
  }
});
