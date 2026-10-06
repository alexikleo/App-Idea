import { ArrowLeft, Check, CircleCheck, Copy, MessageCircle, MessageSquareQuote, Send, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import CategoryIcon from '../components/CategoryIcon'
import { StarRating } from '../components/StarRating'
import { CATEGORIES, PROVINCES, getCategory } from '../data/categories'
import { getProvidersByIds, listProviders } from '../lib/api'
import { whatsappLink } from '../lib/format'
import { type JobTiming, MAX_SHORTLIST, type QuoteRequest, useMyFundis } from '../lib/myFundis'
import { TIMING_LABELS, quoteMessage, smsLink } from '../lib/quoteMessage'
import { useAsync } from '../lib/useAsync'
import type { Provider, Province } from '../types'

export default function RequestQuotesPage() {
  const [params] = useSearchParams()
  const { requests } = useMyFundis()
  const existing = requests.find((r) => r.id === params.get('id'))
  return existing ? <SendStep request={existing} /> : <DetailsStep />
}

/** Step 1: pick fundis (shortlist or suggestions) and describe the job once. */
function DetailsStep() {
  const navigate = useNavigate()
  const { shortlist, addRequest, clearShortlist } = useMyFundis()
  const shortlistKey = shortlist.join(',')
  const { data: shortlisted } = useAsync(() => getProvidersByIds(shortlistKey ? shortlistKey.split(',') : []), [shortlistKey])

  const commonCategory = shortlisted?.length
    ? shortlisted[0].categoryIds.find((c) => shortlisted.every((p) => p.categoryIds.includes(c)))
    : undefined
  const [categoryId, setCategoryId] = useState<string>('')
  const [province, setProvince] = useState<Province | ''>('')
  const category = categoryId || commonCategory || 'plumber'
  const usingShortlist = (shortlisted?.length ?? 0) > 0

  const { data: suggestions } = useAsync(
    () => (usingShortlist ? Promise.resolve([]) : listProviders({ categoryId: category, province: province || undefined, sort: 'rating' })),
    [usingShortlist, category, province],
  )
  const [picked, setPicked] = useState<string[] | null>(null)
  const suggestedIds = (suggestions ?? []).slice(0, MAX_SHORTLIST).map((p) => p.id)
  const chosenIds = usingShortlist ? shortlist : (picked ?? suggestedIds)

  const [description, setDescription] = useState('')
  const [suburb, setSuburb] = useState('')
  const [timing, setTiming] = useState<JobTiming>('this_week')
  const [error, setError] = useState('')

  function submit() {
    if (!chosenIds.length) return setError('Choose at least one fundi to ask.')
    if (description.trim().length < 10) return setError('Describe the job in a sentence or two (10+ characters).')
    if (!suburb.trim()) return setError('Add your suburb so fundis know where the job is.')
    const created = addRequest({ categoryId: category, description: description.trim(), suburb: suburb.trim(), timing, providerIds: chosenIds })
    if (usingShortlist) clearShortlist()
    navigate(`/request?id=${created.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header />

      <section className="card mt-6 space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold">1. Who should quote?</h2>
        {usingShortlist ? (
          <ProviderList providers={shortlisted ?? []} />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <select id="request-category" className="field" value={category} onChange={(e) => { setCategoryId(e.target.value); setPicked(null) }}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select id="request-province" className="field" value={province} onChange={(e) => { setProvince(e.target.value as Province | ''); setPicked(null) }}>
                <option value="">All of SA</option>
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-muted">Top rated picks. Tap to include or leave out (up to {MAX_SHORTLIST}).</p>
            {suggestions && suggestions.length === 0 && <p className="text-sm text-muted">No fundis listed for this yet.</p>}
            <ul className="space-y-2">
              {(suggestions ?? []).slice(0, 6).map((p) => {
                const on = chosenIds.includes(p.id)
                const full = !on && chosenIds.length >= MAX_SHORTLIST
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={full}
                      aria-pressed={on}
                      onClick={() => setPicked(on ? chosenIds.filter((x) => x !== p.id) : [...chosenIds, p.id])}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                        on ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-brand-500'
                      }`}
                    >
                      <Avatar id={p.id} name={p.name} photoUrl={p.photoUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight">{p.businessName ?? p.name}</p>
                        <StarRating value={p.ratingAvg} count={p.ratingCount} />
                        <p className="text-xs text-muted">{p.location.city}</p>
                      </div>
                      <span className={`grid size-6 place-items-center rounded-full border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line'}`}>
                        {on && <Check className="size-4" aria-hidden />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      <section className="card mt-4 space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold">2. Describe the job</h2>
        {usingShortlist && (
          <label className="block space-y-1.5">
            <span className="label">Type of job</span>
            <select id="request-category" className="field" value={category} onChange={(e) => setCategoryId(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block space-y-1.5">
          <span className="label">What needs doing?</span>
          <textarea
            id="request-description"
            className="field"
            rows={3}
            placeholder="e.g. 150L geyser is leaking from the bottom, about 8 years old. Need it replaced."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="label">Your suburb</span>
          <input id="request-suburb" className="field" placeholder="e.g. Bedfordview" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
        </label>
        <div className="space-y-1.5">
          <span className="label">When?</span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="When">
            {(Object.keys(TIMING_LABELS) as JobTiming[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={timing === t}
                onClick={() => setTiming(t)}
                className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
                  timing === t ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line hover:border-brand-500'
                }`}
              >
                {TIMING_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="rounded-xl bg-alert-50 p-3 text-sm text-alert-600">{error}</p>}
        <button onClick={submit} className="btn-accent w-full py-3 text-base">
          <Send className="size-4" aria-hidden /> Write my message{chosenIds.length > 1 ? `s to ${chosenIds.length} fundis` : ''}
        </button>
      </section>
    </div>
  )
}

/** Step 2: one tap per fundi to send the pre-written message. */
function SendStep({ request }: { request: QuoteRequest }) {
  const { markSent } = useMyFundis()
  const key = request.providerIds.join(',')
  const { data: providers } = useAsync(() => getProvidersByIds(key.split(',')), [key])
  const [copied, setCopied] = useState<string | null>(null)
  const done = request.sentTo.length === request.providerIds.length

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/saved" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> My Fundis
      </Link>
      <div className="mt-3">
        <Header />
      </div>

      <div className="card mt-6 flex items-start gap-3 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <CategoryIcon id={request.categoryId} className="size-5" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{getCategory(request.categoryId)?.name} in {request.suburb}</p>
          <p className="text-muted">{request.description}</p>
          <p className="text-xs text-faint">{TIMING_LABELS[request.timing]}</p>
        </div>
      </div>

      <div className={`mt-4 rounded-2xl p-4 text-sm ${done ? 'bg-brand-100 text-brand-700' : 'bg-marigold-100 text-marigold-700'}`}>
        {done ? (
          <p className="flex items-center gap-2 font-semibold">
            <CircleCheck className="size-5" aria-hidden /> Sent to all {request.providerIds.length}. Replies will come to your WhatsApp or SMS.
          </p>
        ) : (
          <p>
            <b>Tap Send for each fundi.</b> Your message is already written; WhatsApp opens with it ready to go.
            ({request.sentTo.length} of {request.providerIds.length} sent)
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {providers?.map((p) => {
          const msg = quoteMessage(request, p)
          const sent = request.sentTo.includes(p.id)
          return (
            <li key={p.id} className="card p-4">
              <div className="flex items-center gap-3">
                <Avatar id={p.id} name={p.name} photoUrl={p.photoUrl} />
                <div className="min-w-0 flex-1">
                  <Link to={`/providers/${p.id}`} className="font-semibold leading-tight hover:underline">
                    {p.businessName ?? p.name}
                  </Link>
                  <StarRating value={p.ratingAvg} count={p.ratingCount} />
                </div>
                {sent && (
                  <span className="chip bg-brand-100 text-brand-700">
                    <Check className="size-3.5" aria-hidden /> Sent
                  </span>
                )}
              </div>
              <details className="mt-3 rounded-xl bg-canvas px-3 py-2 text-sm">
                <summary className="cursor-pointer font-medium text-muted">Preview message</summary>
                <p className="mt-2 whitespace-pre-line">{msg}</p>
              </details>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.whatsapp ? (
                  <a
                    href={whatsappLink(p.whatsapp, msg)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => markSent(request.id, p.id)}
                    className="btn flex-1 bg-[#25D366] text-[#073b1e] hover:brightness-95"
                  >
                    <MessageCircle className="size-4" aria-hidden /> {sent ? 'Send again' : 'Send on WhatsApp'}
                  </a>
                ) : (
                  <a href={smsLink(p.phone, msg)} onClick={() => markSent(request.id, p.id)} className="btn-primary flex-1">
                    <Smartphone className="size-4" aria-hidden /> {sent ? 'Send again' : 'Send SMS'}
                  </a>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(msg)
                      setCopied(p.id)
                      setTimeout(() => setCopied(null), 2000)
                    } catch {
                      // Clipboard blocked: the preview above can be selected manually.
                    }
                  }}
                  className="btn-outline"
                >
                  {copied === p.id ? <Check className="size-4 text-brand-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  {copied === p.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 place-items-center rounded-2xl bg-marigold-400 text-brand-900">
        <MessageSquareQuote className="size-6" aria-hidden />
      </span>
      <div>
        <h1 className="text-3xl font-extrabold">Get quotes</h1>
        <p className="text-muted">Describe the job once and send it to up to {MAX_SHORTLIST} fundis.</p>
      </div>
    </div>
  )
}

function ProviderList({ providers }: { providers: Provider[] }) {
  return (
    <ul className="space-y-2">
      {providers.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-xl bg-canvas p-3">
          <Avatar id={p.id} name={p.name} photoUrl={p.photoUrl} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">{p.businessName ?? p.name}</p>
            <StarRating value={p.ratingAvg} count={p.ratingCount} />
          </div>
          <span className="text-xs text-muted">{p.location.city}</span>
        </li>
      ))}
    </ul>
  )
}
