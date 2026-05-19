/**
 * PredictionCard — Card hasil prediksi ML yang muncul di dalam bubble AI.
 *
 * PROPS:
 * - data: object dari backend pipeline.predict(), berisi:
 *   - depression_score: 0-10
 *   - risk_level: 'low' | 'moderate' | 'high'
 *   - risk_label: teks status (AMAN / WASPADA / BAHAYA)
 *   - daily_gaming_hours, competitive_rank: input user
 *   - addiction_level: dari user input atau estimasi ML
 *   - addiction_source: 'user_input' | 'predicted'
 *   - model_used: 'linear_regression' | 'random_forest'
 *
 * Untuk customisasi tampilan per risk level, edit `riskStyles`.
 */
const riskStyles = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500/70', bar: 'bg-emerald-500' },
  moderate: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500/70', bar: 'bg-amber-500' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-l-red-500/70', bar: 'bg-red-500' },
}

export default function PredictionCard({ data }) {
  const s = riskStyles[data.risk_level] || riskStyles.low
  const modelName = data.model_used === 'random_forest' ? 'Random Forest' : 'Linear Regression'
  const modelShort = data.model_used === 'random_forest' ? 'RF' : 'LR'

  return (
    <div className={`mt-3 rounded-xl border border-glass-border ${s.border} border-l-4 ${s.bg} backdrop-blur-md p-3 sm:p-4`}>
      {/* Baris atas: ML badge + model name + risk level */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            ML Pipeline
          </span>
          <span className="text-[9px] text-muted-foreground">
            {modelName}
          </span>
        </div>
        <span className={`text-[10px] font-semibold uppercase ${s.color}`}>
          {data.risk_level}
        </span>
      </div>

      {/* Skor depresi besar + progress bar */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${s.color}`}>
          {data.depression_score}
        </span>
        <span className="text-xs text-muted-foreground">/ 10</span>
      </div>

      <div className="h-1.5 rounded-full bg-secondary mb-2">
        <div
          className={`h-1.5 rounded-full ${s.bar}`}
          style={{ width: `${data.depression_score * 10}%` }}
        />
      </div>

      <p className={`text-xs font-medium ${s.color} mb-3`}>{data.risk_label}</p>

      {/* Statistik: jam main, rank, adiksi */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-glass-border pt-3">
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Hours / day</p>
          <p className="text-sm sm:text-base font-semibold">{data.daily_gaming_hours}</p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Rank</p>
          <p className="text-sm sm:text-base font-semibold">{data.competitive_rank}<span className="text-[10px] text-muted-foreground">/100</span></p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Addiction</p>
          <p className="text-sm sm:text-base font-semibold">{data.addiction_level}<span className="text-[10px] text-muted-foreground">/10</span></p>
          <p className="text-[8px] sm:text-[9px] text-muted-foreground">
            {data.addiction_source === 'user_input' ? 'Your input' : 'ML estimated'}
          </p>
        </div>
      </div>
    </div>
  )
}
