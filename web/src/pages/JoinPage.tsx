import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, PROVINCES, getCategory } from '../data/categories'
import { createProvider, priceStatsSync } from '../lib/api'
import { PRICE_UNIT_OPTIONS, formatPrice, normalisePhone } from '../lib/format'
import type { PriceUnit, Province } from '../types'

interface ServiceDraft {
  key: string
  categoryId: string
  name: string
  price: string
  unit: PriceUnit
}

const STEPS = ['About you', 'Services & prices', 'Service area', 'Confirm']
const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

export default function JoinPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsappSame, setWhatsappSame] = useState(true)
  const [whatsapp, setWhatsapp] = useState('')
  const [years, setYears] = useState('')
  const [bio, setBio] = useState('')

  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [services, setServices] = useState<ServiceDraft[]>([])

  const [province, setProvince] = useState<Province>('Gauteng')
  const [city, setCity] = useState('')
  const [suburbs, setSuburbs] = useState('')
  const [available24h, setAvailable24h] = useState(false)
  const [consent, setConsent] = useState(false)

  const toggleCategory = (id: string) => {
    const next = categoryIds.includes(id) ? categoryIds.filter((c) => c !== id) : [...categoryIds, id]
    setCategoryIds(next)
    setServices((s) => s.filter((svc) => next.includes(svc.categoryId)))
  }

  const addService = () =>
    setServices((s) => [
      ...s,
      { key: crypto.randomUUID(), categoryId: categoryIds[0], name: '', price: '', unit: 'fixed' },
    ])

  const patchService = (key: string, patch: Partial<ServiceDraft>) =>
    setServices((s) => s.map((svc) => (svc.key === key ? { ...svc, ...patch } : svc)))

  function validate(): string {
    if (step === 0) {
      if (name.trim().length < 2) return 'Please enter your name.'
      if (!normalisePhone(phone)) return 'Please enter a valid SA phone number, e.g. 082 123 4567.'
      if (!whatsappSame && whatsapp && !normalisePhone(whatsapp)) return 'WhatsApp number is not valid.'
      if (bio.trim().length < 20) return 'Tell customers a bit about your work (20+ characters).'
    }
    if (step === 1) {
      if (!categoryIds.length) return 'Choose at least one service category.'
      if (!services.length) return 'Add at least one service with a price.'
      if (services.some((s) => !s.name.trim() || s.price === '' || Number(s.price) < 0))
        return 'Every service needs a name and a price.'
    }
    if (step === 2) {
      if (!city.trim()) return 'Please enter your city or town.'
    }
    if (step === 3 && !consent) return 'Please accept the terms to publish your listing.'
    return ''
  }

  async function next() {
    const problem = validate()
    setError(problem)
    if (problem) return
    if (step < STEPS.length - 1) return setStep(step + 1)

    setSaving(true)
    const e164 = normalisePhone(phone)!
    const created = await createProvider({
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      bio: bio.trim(),
      phone: e164,
      whatsapp: whatsappSame ? e164 : normalisePhone(whatsapp) ?? undefined,
      categoryIds,
      services: services.map((s) => ({
        id: s.key,
        categoryId: s.categoryId,
        name: s.name.trim(),
        price: Number(s.price),
        unit: s.unit,
      })),
      location: {
        province,
        city: city.trim(),
        suburbs: suburbs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      yearsExperience: Number(years) || 0,
      available24h,
    })
    navigate(`/providers/${created.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">List your business on Fundi</h1>
      <p className="mt-1 text-slate-600">Free to join. Customers contact you directly by phone or WhatsApp.</p>

      <ol className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="space-y-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
            <p className={`text-xs ${i === step ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{label}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        {step === 0 && (
          <>
            <Field label="Your full name *">
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Business name (optional)">
              <input className={input} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number *">
                <input className={input} type="tel" placeholder="082 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Years of experience">
                <input className={input} type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={whatsappSame} onChange={(e) => setWhatsappSame(e.target.checked)} />
              I use this number for WhatsApp
            </label>
            {!whatsappSame && (
              <Field label="WhatsApp number (optional)">
                <input className={input} type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </Field>
            )}
            <Field label="About your work *">
              <textarea
                className={input}
                rows={4}
                placeholder="Qualifications, registrations (e.g. PIRB, ECSA), what you specialise in…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="What services do you offer? *">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      categoryIds.includes(c.id)
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 hover:border-brand-500'
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </Field>

            {categoryIds.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Your prices *</p>
                <p className="text-xs text-slate-500">
                  Listing clear prices builds trust and wins more work. Include your call-out fee if you charge one.
                </p>
                {services.map((s) => (
                  <div key={s.key} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr]">
                    <select className={input} value={s.categoryId} onChange={(e) => patchService(s.key, { categoryId: e.target.value })}>
                      {categoryIds.map((id) => (
                        <option key={id} value={id}>
                          {getCategory(id)?.name}
                        </option>
                      ))}
                    </select>
                    <input className={input} list={`names-${s.categoryId}`} placeholder="Service, e.g. Call-out fee" value={s.name} onChange={(e) => patchService(s.key, { name: e.target.value })} />
                    <input className={input} type="number" min={0} placeholder="Price in R" value={s.price} onChange={(e) => patchService(s.key, { price: e.target.value })} />
                    <div className="flex gap-2">
                      <select className={input} value={s.unit} onChange={(e) => patchService(s.key, { unit: e.target.value as PriceUnit })}>
                        {PRICE_UNIT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label="Remove service"
                        onClick={() => setServices((all) => all.filter((x) => x.key !== s.key))}
                        className="rounded-lg px-3 text-slate-500 hover:bg-slate-200"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {categoryIds.map((id) => (
                  <datalist key={id} id={`names-${id}`}>
                    {priceStatsSync(id).map((st) => (
                      <option key={st.serviceName} value={st.serviceName} />
                    ))}
                  </datalist>
                ))}
                <button type="button" onClick={addService} className="text-sm font-medium text-brand-700 hover:underline">
                  + Add a service
                </button>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Province *">
                <select className={input} value={province} onChange={(e) => setProvince(e.target.value as Province)}>
                  {PROVINCES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="City / town *">
                <input className={input} placeholder="e.g. Johannesburg" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
            </div>
            <Field label="Suburbs you cover (comma separated)">
              <input className={input} placeholder="Sandton, Randburg, Fourways" value={suburbs} onChange={(e) => setSuburbs(e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={available24h} onChange={(e) => setAvailable24h(e.target.checked)} />
              I take 24/7 emergency call-outs
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-1 text-sm">
              <p className="text-lg font-semibold">{businessName || name}</p>
              <p className="text-slate-600">
                📞 {phone} · 📍 {city}, {province}
              </p>
              <ul className="mt-3 divide-y divide-slate-100">
                {services.map((s) => (
                  <li key={s.key} className="flex justify-between py-2">
                    <span>{s.name}</span>
                    <span className="font-semibold">{formatPrice(Number(s.price), s.unit)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <label className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I consent to Fundi publicly displaying my name, phone number, prices and service area so customers can
                contact me (POPIA), and I confirm the information is accurate.
              </span>
            </label>
          </>
        )}

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => {
              setError('')
              setStep(step - 1)
            }}
            className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:invisible"
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={next}
            className="rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {step === STEPS.length - 1 ? (saving ? 'Publishing…' : 'Publish listing') : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}
