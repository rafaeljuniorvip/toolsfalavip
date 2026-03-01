import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          cropper: ['cropperjs', 'react-cropper'],
          pdflib: ['pdf-lib'],
          icons: ['lucide-react'],
          compression: ['browser-image-compression'],
          qrcode: ['qrcode'],
          pdfjs: ['pdfjs-dist'],
          jszip: ['jszip'],
        },
      },
    },
  },
})
