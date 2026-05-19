/**
 * ChatWindow — Komponen utama yang mengelola seluruh state chat.
 *
 * FLOW:
 * 1. User ketik pesan di ChatInput → handleSend() dipanggil
 * 2. handleSend() POST ke /api/chat via api.js
 * 3. Backend: Groq AI memproses → jika data cukup, panggil ML pipeline → kembali { reply, prediction }
 * 4. Response ditambahkan ke state `messages` sebagai bubble baru
 * 5. Jika ada `prediction`, PredictionCard dirender di dalam bubble AI
 *
 * STATE:
 * - messages: array of { id, role, text, prediction }
 *   - role: 'user' | 'assistant' | 'system'
 *   - prediction: null atau object dari ML pipeline (depression_score, risk_level, dll)
 * - modelChoice: 'linear_regression' | 'random_forest' — dikirim ke backend
 */
import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import { sendMessage, resetChat } from '../lib/api'

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      text: '',
      prediction: null,
      welcome: true,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [modelChoice, setModelChoice] = useState('linear_regression')
  const scrollRef = useRef(null)
  const nextId = useRef(1) // auto-increment ID untuk setiap message

  // Hubungkan suggestion buttons di welcome card ke handleSend
  useEffect(() => {
    window.__sendSuggestion = (text) => handleSend(text)
    return () => delete window.__sendSuggestion
  })

  // Auto-scroll ke bawah setiap ada message baru atau loading selesai
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  // Helper: tambah message ke state
  function add(role, text, prediction = null) {
    setMessages((prev) => [...prev, { id: nextId.current++, role, text, prediction }])
  }

  // Dipanggil oleh ChatInput saat user kirim pesan
  async function handleSend(text) {
    add('user', text)
    setLoading(true)
    try {
      // Kirim pesan + model pilihan ke backend
      const data = await sendMessage(text, modelChoice)
      // data = { reply: "teks AI...", prediction: { depression_score, risk_level, ... } | null }
      add('assistant', data.reply, data.prediction || null)
    } catch {
      add('system', 'Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // Reset semua message + reset session AI di backend
  async function handleReset() {
    try { await resetChat() } catch {}
    nextId.current = 1
    setMessages([
      {
        id: 0,
        role: 'assistant',
        text: '',
        prediction: null,
        welcome: true,
      },
    ])
  }

  return (
    <div className="h-dvh flex justify-center">
      {/* Container utama — full viewport height, desktop: centered max-w-2xl */}
      <div className="w-full h-full flex flex-col
        md:max-w-2xl md:border-x md:border-glass-border">

        {/* Header — judul + tombol reset */}
        <div className="flex items-center justify-between px-4 py-3 md:px-5 border-b border-glass-border">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">🧠 Mental Health Predictor</h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">ML Pipeline + Groq AI</p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground border border-glass-border rounded-lg px-3 py-1.5 backdrop-blur-sm bg-glass hover:bg-glass-hover transition-all flex-shrink-0 ml-2"
          >
            New Chat
          </button>
        </div>

        {/* Area pesan — scrollable, min-h-0 agar flex child bisa shrink */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 md:px-5">
          <div className="space-y-3">
            {/* Render setiap message bubble */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Loading indicator — 3 titik animasi */}
            {loading && (
              <div className="flex justify-center py-4">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area — model picker + text input */}
        <div className="px-4 py-3 pb-safe md:px-5 border-t border-glass-border">
          <ChatInput onSend={handleSend} loading={loading} modelChoice={modelChoice} onModelChange={setModelChoice} />
        </div>
      </div>
    </div>
  )
}
