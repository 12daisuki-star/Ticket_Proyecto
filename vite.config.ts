
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5080',
        changeOrigin: true
      },
      '/tickets': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5080',
        changeOrigin: true
      }
    }
  },
  resolve: { alias: { '@': '/src' } }
})
