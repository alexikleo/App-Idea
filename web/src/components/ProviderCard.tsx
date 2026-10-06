import { BadgeCheck, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { REVIEW_TAGS } from '../data/categories'
import { startingPrice } from '../lib/api'
import { formatPrice } from '../lib/format'
import type { Provider } from '../types'
import Avatar from './Avatar'
import Badges from './Badges'
import ContactButtons from './ContactButtons'
import SaveButton from './SaveButton'
import ShortlistButton from './ShortlistButton'
import { StarRating } from './StarRating'

export default function ProviderCard({ provider, categoryId }: { provider: Provider; categoryId?: string }) {
  const start = startingPrice(provider, categoryId)
  const knownFor = provider.topTags.map((t) => REVIEW_TAGS.find((r) => r.id === t)?.label).filter(Boolean)

  return (
    <article className="card flex min-w-0 animate-rise flex-col gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-900/5">
      <Link to={`/providers/${provider.id}`} className="flex items-start gap-3">
        <Avatar id={provider.id} name={provider.name} photoUrl={provider.photoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-lg font-bold leading-tight">
            {provider.businessName ?? provider.name}
            {provider.verified && <BadgeCheck className="ml-1 inline size-5 fill-brand-600 align-[-4px] text-white" aria-label="Verified" />}
          </h3>
          <div className="mt-0.5">
            <StarRating value={provider.ratingAvg} count={provider.ratingCount} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" aria-hidden />
            {provider.location.city}
            {provider.available24h && (
              <span className="ml-1 inline-flex items-center gap-0.5 font-medium text-marigold-700">
                <Clock className="size-3.5" aria-hidden /> 24/7
              </span>
            )}
          </p>
        </div>
        <SaveButton providerId={provider.id} />
      </Link>

      {(start || knownFor.length > 0) && (
        <div className="flex items-end justify-between gap-3 rounded-xl bg-canvas px-3 py-2.5">
          <div className="min-w-0">
            {knownFor.length > 0 ? (
              <>
                <p className="label">Known for</p>
                <p className="truncate text-sm font-medium">{knownFor.join(' · ')}</p>
              </>
            ) : (
              <p className="text-sm text-muted">{provider.yearsExperience} yrs experience</p>
            )}
          </div>
          {start && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted">{start.name}</p>
              <p className="font-display text-lg font-bold tabular-nums">{formatPrice(start.price, start.unit)}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Badges badges={provider.badges.filter((b) => b.kind !== 'experienced')} compact />
        <span className="ml-auto">
          <ShortlistButton providerId={provider.id} />
        </span>
      </div>

      <ContactButtons provider={provider} compact />
    </article>
  )
}
