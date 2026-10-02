import { CircleCheck, Lightbulb } from 'lucide-react'
import type { StrengthResult } from '../lib/strength'

export default function StrengthMeter({ result }: { result: StrengthResult }) {
  const { score, tips } = result
  const tone = score >= 80 ? 'bg-brand-500' : score >= 50 ? 'bg-marigold-400' : 'bg-alert-500'
  const label = score >= 80 ? 'Strong' : score >= 50 ? 'Good start' : 'Needs work'
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">Listing strength</span>
        <span className="text-sm text-muted">
          <b className="font-display text-xl tabular-nums text-ink">{score}%</b> · {label}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-sunken" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${score}%` }} />
      </div>
      {tips.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-brand-700">
          <CircleCheck className="size-4" aria-hidden /> Your listing has everything customers look for.
        </p>
      ) : (
        <ul className="space-y-1.5 text-sm text-muted">
          {tips.slice(0, 3).map((t) => (
            <li key={t} className="flex gap-2">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-marigold-500" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
