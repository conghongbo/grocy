import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: false,
  build: { outDir: '../public/react', emptyOutDir: true, manifest: true,
    rollupOptions: { input: 'src/main.tsx' } },
})
