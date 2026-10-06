// Initials avatar with a stable colour per provider until profile photos exist.
const PALETTES = [
  'bg-brand-100 text-brand-700',
  'bg-marigold-100 text-marigold-700',
  'bg-[#e3ecfb] text-[#264a8a]',
  'bg-[#f6e4ef] text-[#8a2a5f]',
  'bg-[#e9e6fa] text-[#4b3a9a]',
  'bg-[#fde8dc] text-[#9a4316]',
]

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export default function Avatar({
  id,
  name,
  photoUrl,
  size = 'md',
}: {
  id: string
  name: string
  photoUrl?: string
  size?: 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const dims = size === 'lg' ? 'size-20 text-2xl rounded-3xl' : 'size-12 text-base rounded-2xl'
  if (photoUrl) return <img src={photoUrl} alt="" className={`shrink-0 object-cover ${dims}`} loading="lazy" />
  return (
    <div className={`grid shrink-0 place-items-center font-display font-bold ${dims} ${PALETTES[hash(id) % PALETTES.length]}`}>
      {initials}
    </div>
  )
}
