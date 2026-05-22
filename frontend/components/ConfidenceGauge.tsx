interface ConfidenceGaugeProps {
  value: number;
}

export function ConfidenceGauge({ value }: ConfidenceGaugeProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} stroke="#1e1e1e" strokeWidth="10" fill="transparent" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#6366f1"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <text
          x="70"
          y="75"
          textAnchor="middle"
          className="fill-slate-100 font-semibold"
          transform="rotate(90 70 70)"
        >
          {safeValue}%
        </text>
      </svg>
    </div>
  );
}
