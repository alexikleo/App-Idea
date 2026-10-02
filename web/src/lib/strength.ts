// "Listing strength": nudges providers towards listings that win more work.

export interface StrengthInput {
  businessName?: string
  bio: string
  whatsapp?: string
  yearsExperience: number
  suburbs: string[]
  services: { name: string; unit: string; price: number }[]
}

export interface StrengthResult {
  score: number
  tips: string[]
}

const CHECKS: { points: number; ok: (l: StrengthInput) => boolean; tip: string }[] = [
  { points: 20, ok: (l) => l.services.some((s) => s.unit === 'call_out'), tip: 'List your call-out fee: it’s the first thing customers compare.' },
  { points: 20, ok: (l) => l.services.length >= 3, tip: 'Add at least 3 services with prices so you show up in more searches.' },
  { points: 15, ok: (l) => l.bio.trim().length >= 80, tip: 'Write a fuller bio (80+ characters): qualifications, registrations, what you specialise in.' },
  { points: 15, ok: (l) => !!l.whatsapp, tip: 'Add WhatsApp. Most customers prefer to message first.' },
  { points: 10, ok: (l) => l.suburbs.length >= 3, tip: 'List 3 or more suburbs you cover so nearby customers find you.' },
  { points: 10, ok: (l) => l.yearsExperience > 0, tip: 'Add your years of experience.' },
  { points: 10, ok: (l) => !!l.businessName?.trim(), tip: 'Add a business name. It looks more established.' },
]

export function listingStrength(listing: StrengthInput): StrengthResult {
  let score = 0
  const tips: string[] = []
  for (const c of CHECKS) {
    if (c.ok(listing)) score += c.points
    else tips.push(c.tip)
  }
  return { score, tips }
}
