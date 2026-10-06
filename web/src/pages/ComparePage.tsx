import { BadgeCheck, Columns3, MessageSquareQuote, Trophy, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Badges from '../components/Badges'
import ContactButtons from '../components/ContactButtons'
import { StarRating } from '../components/StarRating'
import { EmptyState } from '../components/States'
import { REVIEW_TAGS } from '../data/categories'
import { getProvidersByIds } from '../lib/api'
import { formatPrice } from '../lib/format'
import { useMyFundis } from '../lib/myFundis'
import { useAsync } from '../lib/useAsync'
import type { Provider } from '../types'

function Best({ children, best }: { children: ReactNode; best: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 ${best ? 'font-bold text-brand-700' : ''}`}>
      {children}
      {best && <Trophy className="size-3.5 text-marigold-500" aria-label="Best" />}
    </span>
  )
}

function Row({
  label,
  providers,
  render,
  service = false,
}: {
  label: string
  providers: Provider[]
  render: (p: Provider) => ReactNode
  service?: boolean
}) {
  return (
    <tr className="border-t border-line align-top">
      <th
        scope="row"
        className={`sticky left-0 z-10 bg-surface py-3 pr-3 text-left ${
          service ? 'text-sm font-medium' : 'text-xs font-semibold uppercase tracking-wider text-muted'
        }`}
      >
        {label}
      </th>
      {providers.map((p) => (
        <td key={p.id} className="px-3 py-3 text-sm">
          {render(p)}
        </td>
      ))}
    </tr>
  )
}

export default function ComparePage() {
  const { shortlist, toggleShortlist } = useMyFundis()
  const key = shortlist.join(',')
  const { data: providers, loading } = useAsync(() => getProvidersByIds(key ? key.split(',') : []), [key])

  if (!loading && (providers?.length ?? 0) < 2)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">Compare fundis</h1>
        <div className="mt-6">
          <EmptyState icon={Columns3} title="Shortlist at least 2 fundis to compare">
            Tap <b>Shortlist</b> on up to 3 fundis, then come back here to see them side by side.{' '}
            <Link to="/services" className="font-semibold text-brand-600 underline">
              Find fundis
            </Link>
          </EmptyState>
        </div>
      </div>
    )

  const list = providers ?? []
  const bestRating = Math.max(...list.map((p) => p.ratingAvg))
  const mostYears = Math.max(...list.map((p) => p.yearsExperience))

  // Every service any of them lists, most widely offered first.
  const serviceNames = [...new Set(list.flatMap((p) => p.services.map((s) => s.name)))].sort(
    (a, b) =>
      list.filter((p) => p.services.some((s) => s.name === b)).length -
      list.filter((p) => p.services.some((s) => s.name === a)).length,
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Compare fundis</h1>
          <p className="text-muted">
            <Trophy className="mr-1 inline size-4 text-marigold-500" aria-hidden />
            marks the best in each row.
          </p>
        </div>
        <Link to="/request" className="btn-accent">
          <MessageSquareQuote className="size-4" aria-hidden /> Get quotes from all {list.length}
        </Link>
      </div>

      {loading ? (
        <div className="skeleton mt-6 h-96 w-full rounded-2xl" />
      ) : (
        <div className="card mt-6 overflow-x-auto p-4">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr>
                <td className="sticky left-0 z-10 w-32 bg-surface sm:w-44" />
                {list.map((p) => (
                  <th key={p.id} scope="col" className="w-1/3 px-3 pb-3 text-left align-top font-normal">
                    <div className="flex items-start justify-between gap-2">
                      <Avatar id={p.id} name={p.name} photoUrl={p.photoUrl} />
                      <button
                        onClick={() => toggleShortlist(p.id)}
                        className="rounded-full p-1 text-faint hover:bg-sunken hover:text-ink"
                        aria-label={`Remove ${p.businessName ?? p.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <Link to={`/providers/${p.id}`} className="mt-2 block font-display text-lg font-bold leading-tight hover:underline">
                      {p.businessName ?? p.name}
                      {p.verified && <BadgeCheck className="ml-1 inline size-4.5 fill-brand-600 align-[-3px] text-white" aria-label="Verified" />}
                    </Link>
                    <p className="text-sm text-muted">{p.location.city}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row
                label="Rating"
                providers={list}
                render={(p) => (
                  <Best best={p.ratingCount > 0 && p.ratingAvg === bestRating}>
                    <StarRating value={p.ratingAvg} count={p.ratingCount} />
                  </Best>
                )}
              />
              <Row label="Badges" providers={list} render={(p) => (p.badges.length ? <Badges badges={p.badges} compact /> : <span className="text-faint">—</span>)} />
              <Row
                label="Experience"
                providers={list}
                render={(p) => <Best best={p.yearsExperience === mostYears}>{p.yearsExperience} yrs</Best>}
              />
              <Row label="Verified" providers={list} render={(p) => (p.verified ? 'Yes' : 'Not yet')} />
              <Row label="24/7" providers={list} render={(p) => (p.available24h ? 'Yes' : 'No')} />
              <Row
                label="Known for"
                providers={list}
                render={(p) => p.topTags.map((t) => REVIEW_TAGS.find((r) => r.id === t)?.label).join(', ') || '—'}
              />
              <Row label="Areas" providers={list} render={(p) => p.location.suburbs.join(', ') || p.location.city} />
              <tr>
                <td colSpan={list.length + 1} className="pb-1 pt-5 font-display text-lg font-bold">
                  Prices
                </td>
              </tr>
              {serviceNames.map((name) => {
                const prices = list.map((p) => p.services.find((s) => s.name === name))
                const listed = prices.filter((s) => s && s.price > 0).map((s) => s!.price)
                const cheapest = listed.length > 1 ? Math.min(...listed) : null
                return (
                  <Row
                    key={name}
                    label={name}
                    service
                    providers={list}
                    render={(p) => {
                      const s = p.services.find((x) => x.name === name)
                      if (!s) return <span className="text-faint">—</span>
                      return (
                        <Best best={s.price === cheapest}>
                          <span className="tabular-nums">{formatPrice(s.price, s.unit)}</span>
                        </Best>
                      )
                    }}
                  />
                )
              })}
              <tr className="border-t border-line">
                <td className="sticky left-0 z-10 bg-surface" />
                {list.map((p) => (
                  <td key={p.id} className="px-3 pt-4">
                    <ContactButtons provider={p} compact />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
