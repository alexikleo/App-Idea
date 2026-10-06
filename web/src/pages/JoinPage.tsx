import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AboutFields, AreaFields, ServicesFields } from '../components/ListingForm'
import { type Section, useListingDraft } from '../lib/listingDraft'
import { Loading } from '../components/States'
import StrengthMeter from '../components/StrengthMeter'
import { getMyListing, saveMyListing } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { formatPhone, formatPrice } from '../lib/format'
import { listingStrength } from '../lib/strength'
import { useAsync } from '../lib/useAsync'

const STEPS: { label: string; section?: Section }[] = [
  { label: 'About you', section: 'about' },
  { label: 'Services & prices', section: 'services' },
  { label: 'Service area', section: 'area' },
  { label: 'Confirm' },
]

export default function JoinPage() {
  const { user } = useAuth()
  const { data: existing, loading } = useAsync(getMyListing, [user?.id])
  if (loading) return <Loading />
  // One listing per account: send existing fundis to their dashboard.
  if (existing) return <Navigate to="/dashboard" replace />
  return <JoinWizard />
}

function JoinWizard() {
  const navigate = useNavigate()
  const draft = useListingDraft()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [consent, setConsent] = useState(false)
  const f = draft.fields

  async function next() {
    const section = STEPS[step].section
    const problem = section ? draft.validate(section) : consent ? '' : 'Please accept the terms to publish your listing.'
    setError(problem)
    if (problem) return
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      window.scrollTo(0, 0)
      return
    }
    setSaving(true)
    try {
      const id = await saveMyListing(draft.toInput())
      navigate(`/providers/${id}?welcome=1`)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">List your business on Fundi</h1>
      <p className="mt-1 text-muted">Free to join. Customers contact you directly by phone or WhatsApp.</p>

      <ol className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map(({ label }, i) => (
          <li key={label} className="space-y-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-line'}`} />
            <p className={`text-xs ${i === step ? 'font-semibold text-ink' : 'text-faint'}`}>{label}</p>
          </li>
        ))}
      </ol>

      <div className="card mt-6 space-y-4 p-5 sm:p-6">
        {step === 0 && <AboutFields draft={draft} />}
        {step === 1 && <ServicesFields draft={draft} />}
        {step === 2 && <AreaFields draft={draft} />}
        {step === 3 && (
          <>
            <div className="space-y-1 text-sm">
              <p className="text-lg font-semibold">{f.businessName || f.name}</p>
              <p className="text-muted">
                {formatPhone(draft.toInput().phone)} · {f.city}, {f.province}
              </p>
              <ul className="mt-3 divide-y divide-line">
                {f.services.map((s) => (
                  <li key={s.key} className="flex justify-between py-2">
                    <span>{s.name}</span>
                    <span className="font-semibold">{formatPrice(Number(s.price), s.unit)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line p-4">
              <StrengthMeter result={listingStrength(draft.strengthInput)} />
              <p className="mt-3 text-xs text-faint">Use Back to add anything missing, or improve it later from your dashboard.</p>
            </div>
            <label className="flex items-start gap-2 rounded-xl bg-canvas p-3 text-sm">
              <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I consent to Fundi publicly displaying my name, phone number, prices and service area so customers can contact me
                (POPIA), and I confirm the information is accurate.
              </span>
            </label>
          </>
        )}

        {error && <p className="rounded-xl bg-alert-50 p-3 text-sm text-alert-600">{error}</p>}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => {
              setError('')
              setStep(step - 1)
            }}
            className="btn-ghost disabled:invisible"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back
          </button>
          <button type="button" disabled={saving} onClick={next} className="btn-primary">
            {step === STEPS.length - 1 ? (
              saving ? 'Publishing…' : 'Publish listing'
            ) : (
              <>
                Continue <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
