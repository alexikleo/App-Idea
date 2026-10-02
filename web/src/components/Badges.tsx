import { Award, BadgePercent, Hammer } from 'lucide-react'
import { getCategory } from '../data/categories'
import type { Badge } from '../types'

function describe(b: Badge) {
  switch (b.kind) {
    case 'top_rated': {
      const name = getCategory(b.categoryId)?.name ?? 'fundi'
      return { icon: Award, label: `Top rated ${name.toLowerCase()} in ${b.city}`, short: 'Top rated', tone: 'bg-marigold-100 text-marigold-700' }
    }
    case 'best_value':
      return { icon: BadgePercent, label: `Best value · ${b.percentBelow}% below avg`, short: 'Best value', tone: 'bg-brand-100 text-brand-700' }
    case 'experienced':
      return { icon: Hammer, label: `${b.years} years experience`, short: `${b.years}+ yrs`, tone: 'bg-sunken text-muted' }
  }
}

export default function Badges({ badges, compact = false }: { badges: Badge[]; compact?: boolean }) {
  if (!badges.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => {
        const d = describe(b)
        return (
          <span key={b.kind} className={`chip ${d.tone}`} title={d.label}>
            <d.icon className="size-3.5" aria-hidden />
            {compact ? d.short : d.label}
          </span>
        )
      })}
    </div>
  )
}
