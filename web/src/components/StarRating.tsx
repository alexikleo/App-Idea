interface Props {
  value: number
  count?: number
  size?: 'sm' | 'md'
}

export function StarRating({ value, count, size = 'sm' }: Props) {
  const text = size === 'sm' ? 'text-sm' : 'text-lg'
  if (count === 0) return <span className={`${text} text-slate-400`}>No reviews yet</span>
  return (
    <span className={`inline-flex items-center gap-1 ${text}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="text-accent-500">{'★'.repeat(Math.round(value))}</span>
      <span className="text-slate-300">{'★'.repeat(5 - Math.round(value))}</span>
      <span className="font-semibold text-slate-800">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-slate-500">({count})</span>}
    </span>
  )
}

interface InputProps {
  value: number
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void
}

export function StarInput({ value, onChange }: InputProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className={`text-3xl leading-none transition ${n <= value ? 'text-accent-500' : 'text-slate-300 hover:text-accent-400'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
