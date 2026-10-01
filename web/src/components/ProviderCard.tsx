import { Link } from 'react-router-dom'
import { getCategory } from '../data/categories'
import { startingPrice } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Provider } from '../types'
import ContactButtons from './ContactButtons'
import { StarRating } from './StarRating'

export default function ProviderCard({ provider, categoryId }: { provider: Provider; categoryId?: string }) {
  const start = startingPrice(provider, categoryId)
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link to={`/providers/${provider.id}`} className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
          {provider.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1 truncate font-semibold text-slate-900">
            {provider.businessName ?? provider.name}
            {provider.verified && (
              <span title="Verified" className="text-brand-600">
                ✔
              </span>
            )}
          </h3>
          {provider.businessName && <p className="truncate text-sm text-slate-500">{provider.name}</p>}
          <StarRating value={provider.ratingAvg} count={provider.ratingCount} />
        </div>
        {start && (
          <div className="text-right">
            <p className="text-xs text-slate-500">{start.name}</p>
            <p className="font-bold text-slate-900">{formatPrice(start.price, start.unit)}</p>
          </div>
        )}
      </Link>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {provider.categoryIds.map((id) => (
          <span key={id} className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {getCategory(id)?.name ?? id}
          </span>
        ))}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">📍 {provider.location.city}</span>
        {provider.available24h && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">24/7</span>
        )}
      </div>

      <ContactButtons provider={provider} compact />
    </article>
  )
}
