import { getCategory } from '../data/categories'
import type { JobTiming, QuoteRequest } from './myFundis'
import type { Provider } from '../types'

export const TIMING_LABELS: Record<JobTiming, string> = {
  asap: 'As soon as possible',
  this_week: 'This week',
  flexible: 'I’m flexible',
}

export function quoteMessage(req: QuoteRequest, provider: Provider): string {
  const job = getCategory(req.categoryId)?.name ?? 'Job'
  return [
    `Hi ${provider.name.split(' ')[0]}, I found you on Fundi. Could you please quote for this job?`,
    '',
    `• Job: ${job}: ${req.description}`,
    `• Area: ${req.suburb}`,
    `• When: ${TIMING_LABELS[req.timing]}`,
    '',
    'Please include your call-out fee and whether materials are included. Thanks!',
  ].join('\n')
}

export function smsLink(e164: string, body: string): string {
  return `sms:${e164}?&body=${encodeURIComponent(body)}`
}
