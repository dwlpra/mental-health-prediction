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
const API_BASE = '/api'

// Kirim pesan chat ke AI. model_choice: 'linear_regression' | 'random_forest'
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
