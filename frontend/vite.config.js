/**
 * vite.config.js — Konfigurasi build tool.
 *
 * PLUGINS:
 * - @vitejs/plugin-react: JSX transform + Fast Refresh (hot reload)
 * - @tailwindcss/vite: Tailwind CSS 4 (otomatis scan class di src/)
 *
 * SERVER:
 * - Port 5173
 * - Proxy /api/* → http://localhost:8000 (backend FastAPI)
 *   Jadi frontend bisa call fetch('/api/chat') tanpa CORS issue.
 *
 * PRODUCTION:
 * - `npm run build` → output ke dist/
 * - Serve dist/ via nginx/caddy, proxy /api ke backend
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
