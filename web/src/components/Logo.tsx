export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-brand-700" />
      <path d="M14 31 32 16l18 15" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 48V36h16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="44" cy="46" r="5" className="fill-marigold-400" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-2xl font-extrabold tracking-tight text-brand-700">fundi</span>
    </span>
  )
}
