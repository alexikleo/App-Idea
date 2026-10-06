// Listing form pieces shared by sign-up (as wizard steps) and the dashboard
// (as one editable page).

import { Camera, Plus, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { CATEGORIES, PROVINCES, getCategory } from '../data/categories'
import { getAllPriceStats } from '../lib/api'
import { PRICE_UNIT_OPTIONS } from '../lib/format'
import { resizeImage } from '../lib/images'
import { useAsync } from '../lib/useAsync'
import type { ListingDraft, ServiceDraft } from '../lib/listingDraft'
import type { PriceUnit, Province } from '../types'
import CategoryIcon from './CategoryIcon'

type Draft = ListingDraft


export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="block text-xs text-faint">{hint}</span>}
    </label>
  )
}

export function AboutFields({ draft }: { draft: Draft }) {
  const f = draft.fields
  const [photoError, setPhotoError] = useState('')
  return (
    <>
      <div className="flex items-center gap-4">
        <label className="group relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-3xl border border-dashed border-faint bg-canvas text-muted hover:border-brand-500">
          {f.photoUrl ? (
            <img src={f.photoUrl} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <Camera className="size-6" aria-hidden />
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Profile photo"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                setPhotoError('')
                f.setPhotoUrl(await resizeImage(file, 600, 0.8))
              } catch (err) {
                setPhotoError((err as Error).message)
              }
            }}
          />
        </label>
        <div className="text-sm">
          <p className="font-semibold">Profile photo</p>
          <p className="text-muted">A clear photo of you or your logo. Listings with photos get more calls.</p>
          {f.photoUrl && (
            <button type="button" onClick={() => f.setPhotoUrl('')} className="mt-1 text-xs font-medium text-alert-600">
              Remove photo
            </button>
          )}
          {photoError && <p className="text-xs text-alert-600">{photoError}</p>}
        </div>
      </div>
      <Field label="Your full name *">
        <input id="listing-name" className="field" value={f.name} onChange={(e) => f.setName(e.target.value)} />
      </Field>
      <Field label="Business name (optional)">
        <input id="listing-business" className="field" value={f.businessName} onChange={(e) => f.setBusinessName(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone number *">
          <input id="listing-phone" className="field" type="tel" placeholder="082 123 4567" value={f.phone} onChange={(e) => f.setPhone(e.target.value)} />
        </Field>
        <Field label="Years of experience">
          <input id="listing-years" className="field" type="number" inputMode="numeric" min={0} value={f.years} onChange={(e) => f.setYears(e.target.value)} />
        </Field>
      </div>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!f.noWhatsapp && f.whatsappSame} disabled={f.noWhatsapp} onChange={(e) => f.setWhatsappSame(e.target.checked)} />
          I use this number for WhatsApp
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.noWhatsapp} onChange={(e) => f.setNoWhatsapp(e.target.checked)} />
          I don’t use WhatsApp
        </label>
      </div>
      {!f.noWhatsapp && !f.whatsappSame && (
        <Field label="WhatsApp number">
          <input id="listing-whatsapp" className="field" type="tel" value={f.whatsapp} onChange={(e) => f.setWhatsapp(e.target.value)} />
        </Field>
      )}
      <Field label="About your work *" hint={`${f.bio.trim().length} characters. 80+ makes a strong listing.`}>
        <textarea
          id="listing-bio"
          className="field"
          rows={4}
          maxLength={1000}
          placeholder="Qualifications, registrations (e.g. PIRB, ECSA), what you specialise in…"
          value={f.bio}
          onChange={(e) => f.setBio(e.target.value)}
        />
      </Field>
    </>
  )
}

export function ServicesFields({ draft }: { draft: Draft }) {
  const f = draft.fields
  const { data: stats } = useAsync(getAllPriceStats, [])

  const toggleCategory = (id: string) => {
    const next = f.categoryIds.includes(id) ? f.categoryIds.filter((c) => c !== id) : [...f.categoryIds, id]
    f.setCategoryIds(next)
    f.setServices((s) => s.filter((svc) => next.includes(svc.categoryId)))
  }
  const patch = (key: string, p: Partial<ServiceDraft>) =>
    f.setServices((s) => s.map((svc) => (svc.key === key ? { ...svc, ...p } : svc)))

  return (
    <>
      <div className="space-y-1">
        <span className="text-sm font-semibold">What services do you offer? *</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Services you offer">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              aria-pressed={f.categoryIds.includes(c.id)}
              onClick={() => toggleCategory(c.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                f.categoryIds.includes(c.id) ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-500'
              }`}
            >
              <CategoryIcon id={c.id} className="size-4" />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {f.categoryIds.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Your prices *</p>
          <p className="text-xs text-muted">
            Clear prices build trust and win more work. Include your call-out fee if you charge one. Pick a suggested name where
            it fits so customers can compare.
          </p>
          {f.services.map((s) => {
            const market = stats?.[s.categoryId]?.find((st) => st.serviceName === s.name.trim())
            return (
              <div key={s.key} className="grid gap-2 rounded-2xl bg-canvas p-3 sm:grid-cols-[1fr_1fr]">
                <select className="field" aria-label="Category" value={s.categoryId} onChange={(e) => patch(s.key, { categoryId: e.target.value })}>
                  {f.categoryIds.map((id) => (
                    <option key={id} value={id}>
                      {getCategory(id)?.name}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  aria-label="Service name"
                  list={`names-${s.categoryId}`}
                  placeholder="Service, e.g. Call-out fee"
                  value={s.name}
                  onChange={(e) => patch(s.key, { name: e.target.value })}
                />
                <div>
                  <input
                    className="field"
                    aria-label="Price in rand"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Price in R"
                    value={s.price}
                    onChange={(e) => patch(s.key, { price: e.target.value })}
                  />
                  {market && market.count > 0 && (
                    <p className="mt-1 text-xs text-faint">Fundi average: R {market.avg.toLocaleString('en-ZA')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <select className="field" aria-label="Price type" value={s.unit} onChange={(e) => patch(s.key, { unit: e.target.value as PriceUnit })}>
                    {PRICE_UNIT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label="Remove service"
                    onClick={() => f.setServices((all) => all.filter((x) => x.key !== s.key))}
                    className="btn-ghost px-3"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
          {f.categoryIds.map((id) => (
            <datalist key={id} id={`names-${id}`}>
              {(stats?.[id] ?? []).map((st) => (
                <option key={st.serviceName} value={st.serviceName} />
              ))}
            </datalist>
          ))}
          <button
            type="button"
            onClick={() =>
              f.setServices((s) => [...s, { key: crypto.randomUUID(), categoryId: f.categoryIds[0], name: '', price: '', unit: 'fixed' }])
            }
            className="btn-outline py-2 text-sm"
          >
            <Plus className="size-4" aria-hidden /> Add a service
          </button>
        </div>
      )}
    </>
  )
}

export function AreaFields({ draft }: { draft: Draft }) {
  const f = draft.fields
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Province *">
          <select id="listing-province" className="field" value={f.province} onChange={(e) => f.setProvince(e.target.value as Province)}>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="City / town *">
          <input id="listing-city" className="field" placeholder="e.g. Johannesburg" value={f.city} onChange={(e) => f.setCity(e.target.value)} />
        </Field>
      </div>
      <Field label="Suburbs you cover (comma separated)">
        <input
          id="listing-suburbs"
          className="field"
          placeholder="Sandton, Randburg, Fourways"
          value={f.suburbs}
          onChange={(e) => f.setSuburbs(e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.available24h} onChange={(e) => f.setAvailable24h(e.target.checked)} />
        I take 24/7 emergency call-outs
      </label>
    </>
  )
}
