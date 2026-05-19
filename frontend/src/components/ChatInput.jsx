/**
 * ChatInput — Area input pesan + model picker (seperti Gemini).
 *
 * PROPS:
 * - onSend(text): callback ke ChatWindow saat user kirim pesan
 * - loading: true kalau lagi nunggu response AI
 * - modelChoice: 'linear_regression' | 'random_forest'
 * - onModelChange(id): callback saat user ganti model
 *
 * FITUR:
 * - Model picker popover: klik nama model di atas input → muncul daftar model + deskripsi
 * - Click outside tutup popover
 * - Enter untuk kirim pesan
 *
 * Untuk tambah model baru: tambah entry di array MODELS, pastikan id-nya
 * cocok dengan yang diterima backend (pipeline.py model_choice parameter).
 */
import { useState, useRef, useEffect } from 'react'

const MODELS = [
  {
    id: 'linear_regression',
    name: 'Linear Regression',
    badge: 'Rekomendasi',
    desc: 'Model utama. Mencari hubungan lurus antara kebiasaan gaming dan depresi. Cepat, akurat, dan mudah dijelaskan.',
  },
  {
    id: 'random_forest',
    name: 'Random Forest Tuned',
    badge: 'Alternatif',
    desc: '50 pohon keputusan yang digabung. Akurasinya hampir sama dengan Linear Regression, tapi lebih lambat.',
  },
]

export default function ChatInput({ onSend, loading, modelChoice, onModelChange }) {
  const [text, setText] = useState('')
  const [showModels, setShowModels] = useState(false)
  const pickerRef = useRef(null)

  // Tutup popover kalau klik di luar area picker
  useEffect(() => {
    function handleOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowModels(false)
      }
    }
    if (showModels) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showModels])

  function handleSend() {
    const msg = text.trim()
    if (!msg || loading) return
    onSend(msg)
    setText('')
  }

  const currentModel = MODELS.find((m) => m.id === modelChoice) || MODELS[0]

  return (
    <div>
      {/* Model picker — tombol kecil di atas input */}
      <div className="relative mb-2" ref={pickerRef}>
        <button
          onClick={() => setShowModels(!showModels)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium truncate max-w-[160px] sm:max-w-none">{currentModel.name}</span>
          <span className="text-muted-foreground/60 text-[10px] hidden sm:inline">{currentModel.badge}</span>
          <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showModels ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Popover daftar model — muncul di atas input */}
        {showModels && (
          <div className="absolute bottom-full left-0 mb-2 w-[calc(100vw-2rem)] sm:w-72 max-w-[320px] rounded-xl border border-glass-border bg-card backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onModelChange(m.id); setShowModels(false) }}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  m.id === modelChoice ? 'bg-primary/15' : 'hover:bg-glass-hover'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                  <span className="text-[10px] text-primary font-medium flex-shrink-0">{m.badge}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input field + tombol Send */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          disabled={loading}
          placeholder="Type a message..."
          className="flex-1 min-w-0 rounded-xl border border-glass-border bg-glass backdrop-blur-md px-3 py-2.5 sm:px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 disabled:opacity-40 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="rounded-xl bg-primary/80 backdrop-blur-md px-4 sm:px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary disabled:opacity-40 transition-all flex-shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  )
}
