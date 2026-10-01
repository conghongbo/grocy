import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../public/react', emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'app.js', chunkFileNames: 'chunks/[name]-[hash].js', assetFileNames: 'app.[ext]' } },
  },
  server: { proxy: { '/api': { target: process.env.GROCY_BACKEND_URL || 'http://localhost:8080', changeOrigin: true } } },
})
