import { ArrowRight, BadgeCheck, Calculator, CircleAlert, CircleCheck, Info, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import CategoryIcon from '../components/CategoryIcon'
import { StarRating } from '../components/StarRating'
import { CATEGORIES, getCategory } from '../data/categories'
import { type QuoteCheck, type QuoteVerdict, checkQuote, priceStatsSync } from '../lib/api'
import { formatPrice, formatRand } from '../lib/format'

const VERDICTS: Record<QuoteVerdict, { title: string; text: string; tone: string; icon: typeof CircleCheck }> = {
  below_market: {
    title: 'Lower than anyone on Fundi',
    text: 'Could be a great deal. Check exactly what’s included (materials, call-out, guarantee) before you agree.',
    tone: 'bg-marigold-100 text-marigold-700',
    icon: Info,
  },
  good: {
    title: 'Good price',
    text: 'This quote is below what most fundis on Fundi charge for this job.',
    tone: 'bg-brand-100 text-brand-700',
    icon: CircleCheck,
  },
  fair: {
    title: 'Fair price',
    text: 'This quote is in line with what other fundis charge for this job.',
    tone: 'bg-brand-100 text-brand-700',
    icon: CircleCheck,
  },
  high: {
    title: 'A bit high',
    text: 'Above the going rate. Ask what’s included, or compare with a couple of other fundis.',
    tone: 'bg-marigold-100 text-marigold-700',
    icon: TrendingUp,
  },
  very_high: {
    title: 'Well above average',
    text: 'This is a lot more than other fundis charge. Get at least one more quote before you go ahead.',
    tone: 'bg-alert-50 text-alert-600',
    icon: CircleAlert,
  },
}

/** Price range bar with the market average and the customer's quote marked on it. */
function QuoteGauge({ check }: { check: QuoteCheck }) {
  const lo = Math.min(check.stat.min, check.amount) * 0.9
  const hi = Math.max(check.stat.max, check.amount) * 1.1
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100
  return (
    <div className="pb-2 pt-9">
      <div className="relative h-3 rounded-full bg-sunken">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand-500 via-marigold-400 to-alert-500"
          style={{ left: `${pos(check.stat.min)}%`, right: `${100 - pos(check.stat.max)}%` }}
        />
        <div className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded-full bg-ink/60" style={{ left: `${pos(check.stat.avg)}%` }} />
        <div className="absolute -top-9 -translate-x-1/2 text-center" style={{ left: `${pos(check.amount)}%` }}>
          <span className="whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-bold text-white">You: {formatRand(check.amount)}</span>
          <span className="mx-auto mt-0.5 block size-0 border-x-4 border-t-4 border-x-transparent border-t-ink" />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 text-xs text-muted">
        <span>
          Lowest <b className="block text-sm tabular-nums text-ink">{formatRand(check.stat.min)}</b>
        </span>
        <span className="text-center">
          Average <b className="block text-sm tabular-nums text-ink">{formatRand(check.stat.avg)}</b>
        </span>
        <span className="text-right">
          Highest <b className="block text-sm tabular-nums text-ink">{formatRand(check.stat.max)}</b>
        </span>
      </div>
    </div>
  )
}

export default function CheckQuotePage() {
  const [params] = useSearchParams()
  const [categoryId, setCategoryId] = useState(params.get('category') ?? 'plumber')
  const services = priceStatsSync(categoryId)
  const [serviceName, setServiceName] = useState(params.get('service') ?? services[0]?.serviceName ?? '')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<QuoteCheck | null | undefined>(undefined)
  const [checking, setChecking] = useState(false)

  const pickCategory = (id: string) => {
    setCategoryId(id)
    setServiceName(priceStatsSync(id)[0]?.serviceName ?? '')
    setResult(undefined)
  }

  const verdict = result ? VERDICTS[result.verdict] : null
  const diffRand = result ? Math.abs(result.amount - result.stat.avg) : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-marigold-400 text-ink">
          <Calculator className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold">Is my quote fair?</h1>
          <p className="text-muted">Compare a quote with what fundis on Fundi actually charge.</p>
        </div>
      </div>

      <form
        className="card mt-6 space-y-5 p-5 sm:p-6"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!serviceName || !Number(amount)) return
          setChecking(true)
          setResult(await checkQuote(categoryId, serviceName, Number(amount)))
          setChecking(false)
        }}
      >
        <div className="space-y-2">
          <span className="label">1. What kind of job?</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => priceStatsSync(c.id).length > 0).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCategory(c.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  c.id === categoryId ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-500'
                }`}
              >
                <CategoryIcon id={c.id} className="size-4" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="label">2. Which service?</span>
            <select
              id="quote-service"
              className="field"
              value={serviceName}
              onChange={(e) => {
                setServiceName(e.target.value)
                setResult(undefined)
              }}
            >
              {services.map((s) => (
                <option key={s.serviceName}>{s.serviceName}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="label">3. Price you were quoted</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-muted">R</span>
              <input
                id="quote-amount"
                className="field pl-8 font-semibold tabular-nums"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="e.g. 8500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </label>
        </div>
        <button className="btn-accent w-full py-3 text-base" disabled={checking || !Number(amount)}>
          {checking ? 'Checking…' : 'Check my quote'}
        </button>
      </form>

      {result === null && (
        <p className="card mt-4 p-4 text-sm text-muted">We don’t have enough prices for that service yet. Try another one.</p>
      )}

      {result && verdict && (
        <section className="mt-5 animate-rise space-y-4" aria-live="polite">
          <div className="card overflow-hidden">
            <div className={`flex items-start gap-3 p-5 ${verdict.tone}`}>
              <verdict.icon className="mt-0.5 size-7 shrink-0" aria-hidden />
              <div>
                <p className="font-display text-2xl font-extrabold">{verdict.title}</p>
                <p className="mt-0.5 text-sm">{verdict.text}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted">
                {serviceName} · {getCategory(categoryId)?.name} · based on {result.stat.count}{' '}
                fundi price{result.stat.count === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-lg">
                Your quote is{' '}
                <b className="tabular-nums">
                  {Math.abs(result.diff) < 0.02
                    ? 'right on the average'
                    : `${formatRand(diffRand)} (${Math.round(Math.abs(result.diff) * 100)}%) ${result.diff > 0 ? 'above' : 'below'} average`}
                </b>
                .
              </p>
              <QuoteGauge check={result} />
            </div>
          </div>

          {result.cheaper.length > 0 && (
            <div className="card p-5">
              <h2 className="text-xl font-bold">Fundis who charge less</h2>
              <ul className="mt-3 divide-y divide-line">
                {result.cheaper.slice(0, 5).map(({ provider, service }) => (
                  <li key={provider.id}>
                    <Link to={`/providers/${provider.id}`} className="flex items-center gap-3 py-3 transition hover:opacity-80">
                      <Avatar id={provider.id} name={provider.name} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-semibold leading-tight">
                          {provider.businessName ?? provider.name}
                          {provider.verified && <BadgeCheck className="ml-1 inline size-4 fill-brand-600 align-[-3px] text-white" aria-hidden />}
                        </p>
                        <StarRating value={provider.ratingAvg} count={provider.ratingCount} />
                        <p className="text-xs text-muted">{provider.location.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold tabular-nums">{formatPrice(service.price, service.unit)}</p>
                        <p className="text-xs font-semibold text-brand-600">Save {formatRand(result.amount - service.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-5">
            <h2 className="text-lg font-bold">Before you say yes, ask:</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {[
                'Does the price include materials and parts?',
                'Is the call-out fee included or extra?',
                'Is VAT included?',
                'Is there a guarantee on the work, and for how long?',
                'Will I get a certificate (e.g. COC or plumbing certificate) if needed?',
              ].map((q) => (
                <li key={q} className="flex gap-2">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {q}
                </li>
              ))}
            </ul>
            <Link
              to={`/services?category=${categoryId}&sort=price_low`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              See all {getCategory(categoryId)?.name.toLowerCase()}s, cheapest first <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
