import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-sunken text-muted">
        <Compass className="size-7" aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-bold">This page doesn’t exist</h1>
      <Link to="/" className="btn-primary mt-5">
        Go home
      </Link>
    </div>
  )
}
