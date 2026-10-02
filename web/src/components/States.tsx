import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function CardSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card space-y-4 p-4">
          <div className="flex gap-3">
            <div className="skeleton size-12 rounded-2xl" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          </div>
          <div className="skeleton h-14 w-full rounded-xl" />
          <div className="skeleton h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-1/3" />
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children }: { icon?: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center border-dashed px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-sunken text-muted">
          <Icon className="size-6" aria-hidden />
        </div>
      )}
      <p className="font-display text-lg font-bold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  )
}
