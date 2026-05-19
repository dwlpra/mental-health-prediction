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

export default function MessageBubble({ message }) {
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
