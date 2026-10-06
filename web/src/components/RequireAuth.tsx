import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Loading } from './States'

/** Sends signed-out visitors to sign in, then back here. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { pathname, search } = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(pathname + search)}`} replace />
  return <>{children}</>
}
