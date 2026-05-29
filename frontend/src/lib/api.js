/**
 * api.js — Helper untuk komunikasi dengan backend FastAPI.
 *
 * Semua request di-proxy via Vite dev server (lihat vite.config.js proxy config).
 * Di production, frontend di-serve langsung oleh backend atau reverse proxy.
 *
 * ENDPOINT BACKEND:
 * - POST /api/chat       → { message, model_choice } → { reply, prediction? }
 * - POST /api/chat/reset  → clear session AI
 * - GET  /api/health      → { status, models_loaded }
 */
// Dev: Vite proxy handles /api → localhost:8000
// Prod: VITE_API_URL di-set di Cloudflare Pages env (misal "https://vps.domain.com")
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

// Kirim pesan chat ke AI
export async function sendMessage(message, modelChoice) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model_choice: modelChoice }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Reset session chat (hapus history AI di backend)
export async function resetChat() {
  await fetch(`${API_BASE}/chat/reset`, { method: 'POST' })
}
