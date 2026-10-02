import { Heart } from 'lucide-react'
import { useMyFundis } from '../lib/myFundis'

export default function SaveButton({ providerId, withLabel = false }: { providerId: string; withLabel?: boolean }) {
  const { isSaved, toggleSaved } = useMyFundis()
  const saved = isSaved(providerId)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleSaved(providerId)
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from My Fundis' : 'Save to My Fundis'}
      className={withLabel ? 'btn-outline py-2 text-sm' : 'grid size-9 place-items-center rounded-full transition hover:bg-sunken'}
    >
      <Heart
        className={`size-5 transition ${saved ? 'scale-110 fill-alert-500 text-alert-500' : 'text-faint'}`}
        aria-hidden
      />
      {withLabel && (saved ? 'Saved' : 'Save')}
    </button>
  )
}
