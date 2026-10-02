import { Star } from 'lucide-react'

interface Props {
  value: number
  count?: number
  size?: 'sm' | 'md'
}

export function Stars({ value, className = 'size-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= Math.round(value) ? 'fill-marigold-400 text-marigold-400' : 'fill-line text-line'}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

export function StarRating({ value, count, size = 'sm' }: Props) {
  const text = size === 'sm' ? 'text-sm' : 'text-base'
  if (count === 0) return <span className={`${text} text-faint`}>New on Fundi</span>
  return (
    <span className={`inline-flex items-center gap-1.5 ${text}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <Stars value={value} className={size === 'sm' ? 'size-3.5' : 'size-4.5'} />
      <span className="font-semibold tabular-nums">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted">({count})</span>}
    </span>
  )
}

interface InputProps {
  value: number
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void
}

const LABELS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent']

export function StarInput({ value, onChange }: InputProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5 transition hover:scale-110"
          >
            <Star
              className={`size-8 ${n <= value ? 'fill-marigold-400 text-marigold-400' : 'fill-transparent text-line'}`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {value > 0 && <span className="text-sm font-medium text-muted">{LABELS[value]}</span>}
    </div>
  )
}
