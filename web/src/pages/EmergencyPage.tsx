import { BadgeCheck, DoorClosed, Droplets, Fence, MapPin, PlugZap, Siren, type LucideIcon } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import ContactButtons from '../components/ContactButtons'
import { StarRating } from '../components/StarRating'
import { EmptyState } from '../components/States'
import { EMERGENCIES, PROVINCES } from '../data/categories'
import { listEmergencyProviders, startingPrice } from '../lib/api'
import { formatPrice } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import type { Province } from '../types'

const ICONS: Record<string, LucideIcon> = {
  'burst-pipe': Droplets,
  'no-power': PlugZap,
  'locked-out': DoorClosed,
  'gate-stuck': Fence,
}

const FIRST_STEPS: Record<string, string> = {
  'burst-pipe': 'Turn off the water at the main stopcock (usually near the meter at the front of the property). For a geyser, also switch it off at the DB board.',
  'no-power': 'If you smell burning or see sparks, switch off the main switch at the DB board and keep away. Check whether the whole street is out (could be load-shedding).',
  'locked-out': 'If a child or pet is locked inside a car or house in danger, call 10111 first.',
  'gate-stuck': 'Most gate motors have a manual release key. Check the battery is charged; a flat battery is the most common cause.',
}

export default function EmergencyPage() {
  const [params, setParams] = useSearchParams()
  const type = EMERGENCIES.find((e) => e.id === params.get('type')) ?? EMERGENCIES[0]
  const province = (params.get('province') ?? '') as Province | ''
  const { data: providers, loading } = useAsync(
    () => listEmergencyProviders(type.categoryId, province || undefined),
    [type.categoryId, province],
  )

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 animate-pulse-ring place-items-center rounded-2xl bg-alert-500 text-white">
          <Siren className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold">Need help right now?</h1>
          <p className="text-muted">Fundis who take emergency call-outs, day or night.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EMERGENCIES.map((e) => {
          const Icon = ICONS[e.id]
          const active = e.id === type.id
          return (
            <button
              key={e.id}
              onClick={() => set('type', e.id)}
              aria-pressed={active}
              className={`card flex flex-col items-start gap-2 p-3.5 text-left transition ${
                active ? 'border-alert-500 bg-alert-50 ring-2 ring-alert-500/20' : 'hover:border-alert-500/50'
              }`}
            >
              <Icon className={`size-6 ${active ? 'text-alert-500' : 'text-muted'}`} aria-hidden />
              <span className="font-bold leading-tight">{e.label}</span>
              <span className="text-xs text-muted">{e.hint}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-marigold-400/50 bg-marigold-100 p-4 text-sm text-marigold-700">
        <p className="font-bold">While you wait</p>
        <p className="mt-0.5">{FIRST_STEPS[type.id]}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Available 24/7</h2>
        <label className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted" aria-hidden />
          <select id="emergency-province" value={province} onChange={(e) => set('province', e.target.value)} className="field w-auto py-2">
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="skeleton h-36 w-full rounded-2xl" />)
        ) : !providers?.length ? (
          <EmptyState icon={Siren} title="No 24/7 fundis listed here yet">
            Try “All provinces”, or browse all{' '}
            <Link to={`/services?category=${type.categoryId}`} className="font-semibold text-brand-600 underline">
              {type.label.toLowerCase()} fundis
            </Link>
            .
          </EmptyState>
        ) : (
          providers.map((p) => {
            const callOut = p.services.find((s) => s.categoryId === type.categoryId && s.unit === 'call_out') ?? startingPrice(p, type.categoryId)
            return (
              <article key={p.id} className="card animate-rise p-4">
                <Link to={`/providers/${p.id}`} className="flex items-start gap-3">
                  <Avatar id={p.id} name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-lg font-bold leading-tight">
                      {p.businessName ?? p.name}
                      {p.verified && <BadgeCheck className="ml-1 inline size-5 fill-brand-600 align-[-4px] text-white" aria-label="Verified" />}
                    </p>
                    <StarRating value={p.ratingAvg} count={p.ratingCount} />
                    <p className="text-sm text-muted">
                      {p.location.city} · {p.location.suburbs.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  {callOut && (
                    <div className="text-right">
                      <p className="text-xs text-muted">{callOut.name}</p>
                      <p className="font-display text-lg font-bold tabular-nums">{formatPrice(callOut.price, callOut.unit)}</p>
                    </div>
                  )}
                </Link>
                <div className="mt-3">
                  <ContactButtons provider={p} compact />
                </div>
              </article>
            )
          })
        )}
      </div>
      <p className="mt-6 text-center text-xs text-faint">
        In a life-threatening emergency call 10111 (police) or 112 from a cellphone.
      </p>
    </div>
  )
}
