import { ListChecks, ListPlus } from 'lucide-react'
import { MAX_SHORTLIST, useMyFundis } from '../lib/myFundis'

/** Adds a fundi to the shortlist used for Compare and Get quotes. */
export default function ShortlistButton({ providerId, size = 'sm' }: { providerId: string; size?: 'sm' | 'md' }) {
  const { isShortlisted, shortlistFull, toggleShortlist } = useMyFundis()
  const on = isShortlisted(providerId)
  const blocked = !on && shortlistFull
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleShortlist(providerId)
      }}
      disabled={blocked}
      aria-pressed={on}
      title={blocked ? `You can shortlist up to ${MAX_SHORTLIST} fundis` : undefined}
      className={`btn border text-sm ${size === 'sm' ? 'px-3 py-1.5' : 'py-2'} ${
        on ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line bg-surface text-ink hover:border-brand-500'
      }`}
    >
      {on ? <ListChecks className="size-4" aria-hidden /> : <ListPlus className="size-4" aria-hidden />}
      {on ? 'Shortlisted' : blocked ? 'Shortlist full' : 'Shortlist'}
    </button>
  )
}
