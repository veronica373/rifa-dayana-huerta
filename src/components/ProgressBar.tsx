interface ProgressBarProps {
  porcentaje: number
  label: string
  sublabel?: string
}

export default function ProgressBar({ porcentaje, label, sublabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, porcentaje))
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display font-semibold text-rifa-fucsiaDark">{label}</span>
        {sublabel && <span className="text-sm text-neutral-500">{sublabel}</span>}
      </div>
      <div className="h-4 w-full rounded-full bg-rifa-rosaPastel/60 overflow-hidden shadow-inner">
        <div
          className="h-full brand-gradient rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
