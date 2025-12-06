import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// API backend URL - configurable via environment variable
// In E2E docker: VITE_PROXY_TARGET=http://backend-e2e:8081
// In local dev: defaults to http://localhost:8082 (8080 conflicts with Rancher Desktop)
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8082'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@main': path.resolve(__dirname, './src/main'),
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/health': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
