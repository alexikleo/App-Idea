import { createContext, useContext } from 'react'
import { FriendlyError } from './api'
import { normalisePhone } from './format'

export interface AppUser {
  id: string
  email?: string
  phone?: string
  displayName?: string
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  method: 'email' | 'phone'
  isDemo: boolean
  /** Sends a 6-digit code to the email address or phone number. */
  sendCode: (target: string) => Promise<void>
  verifyCode: (target: string, code: string) => Promise<void>
  signOut: () => Promise<void>
  setDisplayName: (name: string) => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Checks the address/number and returns it in the form the auth service expects. */
export function normaliseTarget(target: string, method: 'email' | 'phone'): string {
  if (method === 'email') {
    const email = target.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) throw new FriendlyError('Enter a valid email address, e.g. thandi@gmail.com.')
    return email
  }
  const phone = normalisePhone(target)
  if (!phone) throw new FriendlyError('Enter a valid SA cellphone number, e.g. 082 123 4567.')
  return phone
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
