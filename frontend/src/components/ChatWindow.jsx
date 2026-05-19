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
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [modelChoice, setModelChoice] = useState('linear_regression')
  const scrollRef = useRef(null)
  const nextId = useRef(1) // auto-increment ID untuk setiap message

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
    setMessages([])
    nextId.current = 1
  }

  return (
    <div className="h-full flex justify-center overflow-hidden">
      {/* Container utama — mobile: full width, desktop: centered max-w-2xl */}
      <div className="w-full h-full flex flex-col
        md:max-w-2xl md:my-6 md:rounded-2xl md:border md:border-glass-border md:bg-glass md:backdrop-blur-xl md:shadow-2xl md:overflow-hidden">

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

        {/* Area pesan — scrollable */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
          <div className="space-y-3">
            {/* Empty state — tampil kalau belum ada pesan */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-20 md:pt-28 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-base font-semibold text-foreground mb-1">Start a Conversation</h2>
                <p className="text-sm text-muted-foreground max-w-xs md:max-w-sm">
                  Chat tentang kebiasaan gaming Anda untuk mengetahui prediksi risiko kesehatan mental.
                </p>
              </div>
            )}

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
        <div className="px-4 py-3 md:px-5 border-t border-glass-border">
          <ChatInput onSend={handleSend} loading={loading} modelChoice={modelChoice} onModelChange={setModelChoice} />
        </div>
      </div>
    </div>
  )
}
