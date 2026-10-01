import type { PriceUnit } from '../types'

const rand = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

export function formatRand(amount: number): string {
  return amount === 0 ? 'Free' : rand.format(amount)
}

const UNIT_LABELS: Record<PriceUnit, string> = {
  fixed: '',
  per_hour: '/hr',
  call_out: ' call-out',
  per_m2: '/m²',
  from: '',
}

export function formatPrice(amount: number, unit: PriceUnit): string {
  if (amount === 0) return 'Free'
  const prefix = unit === 'from' ? 'from ' : ''
  return `${prefix}${formatRand(amount)}${UNIT_LABELS[unit]}`
}

export const PRICE_UNIT_OPTIONS: { value: PriceUnit; label: string }[] = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'from', label: 'From (starting price)' },
  { value: 'per_hour', label: 'Per hour' },
  { value: 'call_out', label: 'Call-out fee' },
  { value: 'per_m2', label: 'Per m²' },
]

/** +27821234567 -> 082 123 4567 */
export function formatPhone(e164: string): string {
  const local = e164.replace(/^\+27/, '0')
  return local.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3')
}

/** Accepts 0821234567, 082 123 4567, +27 82 123 4567 etc. Returns E.164 or null. */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '')
  const match = digits.match(/^(?:\+27|27|0)([1-9]\d{8})$/)
  return match ? `+27${match[1]}` : null
}

export function whatsappLink(e164: string, message: string): string {
  return `https://wa.me/${e164.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}
