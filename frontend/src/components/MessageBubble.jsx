/**
 * MessageBubble — Menampilkan satu bubble pesan (user / AI / system error).
 *
 * PROPS:
 * - message.role: 'user' → bubble ungu di kanan, 'assistant' → bubble glass di kiri, 'system' → error banner
 * - message.text: isi pesan
 * - message.prediction: jika ada, render PredictionCard di dalam bubble AI
 *
 * Untuk tambah tipe message baru (misal 'typing-indicator'), tambah kondisi di sini.
 */
import PredictionCard from './PredictionCard'

const SUGGESTIONS = [
  'Saya bermain game 6 jam sehari',
  'Saya rank top 20% dan main 4 jam/hari',
  'Saya merasa cukup adiktif, nilai 8 dari 10',
]

export default function MessageBubble({ message }) {
  // Welcome card — tampil saat pertama kali buka chat
  if (message.welcome) {
    return (
      <div className="flex flex-col items-center pt-8 md:pt-16 pb-4 px-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl mb-4">
          🧠
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1 text-center">
          Mental Health Gaming Predictor
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
          Prediksi risiko kesehatan mental berdasarkan kebiasaan bermain game Anda.
          Ceritakan kebiasaan gaming Anda dan saya akan memberikan analisis prediksi.
        </p>

        <div className="w-full max-w-sm space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium text-center mb-3">
            Coba katakan sesuatu seperti
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => window.__sendSuggestion?.(s)}
              className="w-full text-left text-sm text-muted-foreground hover:text-foreground
                bg-glass border border-glass-border hover:bg-glass-hover
                rounded-xl px-4 py-2.5 transition-all"
            >
              "{s}"
            </button>
          ))}
        </div>
      </div>
    )
  }

  // System message — error banner merah
  if (message.role === 'system') {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive backdrop-blur-sm">
        {message.text}
      </div>
    )
  }

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[80%] backdrop-blur-md ${
        isUser
          ? 'bg-primary/80 text-primary-foreground'   // User: ungu semi-transparan
          : 'bg-glass border border-glass-border text-foreground'  // AI: glass effect
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
        {/* PredictionCard hanya muncul di bubble AI yang punya prediksi */}
        {message.prediction && <PredictionCard data={message.prediction} />}
      </div>
    </div>
  )
}
