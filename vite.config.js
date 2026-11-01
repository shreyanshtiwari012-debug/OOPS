import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Use 127.0.0.1 instead of "localhost". On some systems "localhost" resolves to
// IPv6 (::1) while uvicorn listens on IPv4 only, which produces
// "connect ECONNREFUSED" / network errors in the browser during local development.
const API_TARGET = 'http://127.0.0.1:8000'

const proxy = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true,
  },
  '/health': {
    target: API_TARGET,
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy,
  },
  preview: {
    port: 4173,
    proxy,
  },
})
