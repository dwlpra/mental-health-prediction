const riskStyles = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500/70', bar: 'bg-emerald-500' },
  moderate: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500/70', bar: 'bg-amber-500' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-l-red-500/70', bar: 'bg-red-500' },
}

export default function PredictionCard({ data }) {
  const s = riskStyles[data.risk_level] || riskStyles.low

  return (
    <div className={`mt-3 rounded-xl border border-glass-border ${s.border} border-l-4 ${s.bg} backdrop-blur-md p-3 sm:p-4`}>
      {/* Badge + model name + risk level */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            ML Pipeline
          </span>
          <span className="text-[9px] text-muted-foreground">
            {data.model_used === 'xgboost' ? 'XGBoost' : data.model_used === 'lightgbm' ? 'LightGBM' : 'Linear Regression'}
          </span>
        </div>
        <span className={`text-[10px] font-semibold uppercase ${s.color}`}>
          {data.risk_level}
        </span>
      </div>

      {/* Score + progress bar */}
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

      {/* Stats grid — 6 input features */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-center border-t border-glass-border pt-3">
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Hours / day</p>
          <p className="text-sm sm:text-base font-semibold">{data.daily_gaming_hours}</p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Stress</p>
          <p className="text-sm sm:text-base font-semibold">{data.stress_level}<span className="text-[10px] text-muted-foreground">/10</span></p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Addiction</p>
          <p className="text-sm sm:text-base font-semibold">{data.addiction_level}<span className="text-[10px] text-muted-foreground">/10</span></p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Screen time</p>
          <p className="text-sm sm:text-base font-semibold">{data.screen_time_total}<span className="text-[10px] text-muted-foreground">h</span></p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Anxiety</p>
          <p className="text-sm sm:text-base font-semibold">{data.anxiety_score}<span className="text-[10px] text-muted-foreground">/10</span></p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Loneliness</p>
          <p className="text-sm sm:text-base font-semibold">{data.loneliness_score}<span className="text-[10px] text-muted-foreground">/10</span></p>
        </div>
      </div>
    </div>
  )
}
