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
  const [resetting, setResetting] = useState(false)
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
    setResetting(true)
    try { await resetChat() } catch {}
    await new Promise((r) => setTimeout(r, 600))
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
    setResetting(false)
  }

  return (
    <div className="h-dvh flex justify-center relative overflow-x-hidden">
      {/* Container utama — full viewport, desktop: centered max-w-2xl */}
      <div className="w-full h-full md:max-w-2xl md:border-x md:border-glass-border relative">

        {/* Header — floating sticky di atas */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 md:px-5
          bg-background/80 backdrop-blur-xl border-b border-glass-border">
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

        {/* Area pesan — satu-satunya yang scroll */}
        <div ref={scrollRef} className={`absolute inset-0 overflow-y-auto px-4 pt-16 pb-28 md:px-5 transition-opacity duration-500 ${resetting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

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

        {/* Footer — floating sticky di bawah */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-4 pt-3 pb-6 md:px-5
          bg-background/80 backdrop-blur-xl border-t border-glass-border">
          <ChatInput onSend={handleSend} loading={loading} modelChoice={modelChoice} onModelChange={setModelChoice} />
        </div>

      </div>
    </div>
  )
}
