// Sign-in with a one-time code (email now, SMS once an SMS provider is set up
// in Supabase). In demo mode any email or number works with code 123456.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { type AppUser, AuthContext, type AuthState, normaliseTarget } from './authContext'
import { FriendlyError, invalidateCache } from './api'
import { DEMO_CODE, type DemoUser, demoUserIdFor, readDemoUser, writeDemoUser } from './demoAuth'
import { authMethod, supabase } from './supabase'

const DEMO_NAMES_KEY = 'fundi:demo-names:v1'

function demoNames(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DEMO_NAMES_KEY) ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function authError(error: { message?: string; status?: number; code?: string }): never {
  const msg = error.message ?? ''
  if (error.status === 429 || /rate limit/i.test(msg))
    throw new FriendlyError('Too many codes requested. Wait a minute, then try again.')
  if (/expired|invalid/i.test(msg) || error.code === 'otp_expired')
    throw new FriendlyError('That code is wrong or has expired. Check it, or send a new one.')
  console.error(error)
  throw new FriendlyError('Something went wrong signing you in. Try again.')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => (supabase ? null : readDemoUser()))
  const [loading, setLoading] = useState(() => supabase !== null)

  const loadSupabaseUser = useCallback(async (id: string, email?: string, phone?: string) => {
    const { data } = await supabase!.from('profiles').select('display_name').eq('id', id).maybeSingle()
    setUser({ id, email, phone: phone ? `+${phone.replace(/^\+/, '')}` : undefined, displayName: data?.display_name ?? undefined })
  }, [])

  useEffect(() => {
    if (!supabase) return
    let lastId: string | undefined
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (u?.id !== lastId) {
        lastId = u?.id
        invalidateCache()
      }
      // Defer: Supabase recommends not awaiting other calls inside this callback.
      setTimeout(async () => {
        if (u) await loadSupabaseUser(u.id, u.email ?? undefined, u.phone ?? undefined)
        else setUser(null)
        setLoading(false)
      }, 0)
    })
    return () => data.subscription.unsubscribe()
  }, [loadSupabaseUser])

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      method: authMethod,
      isDemo: !supabase,

      async sendCode(target) {
        const t = normaliseTarget(target, authMethod)
        if (!supabase) return
        const { error } = await supabase.auth.signInWithOtp(
          authMethod === 'email' ? { email: t, options: { shouldCreateUser: true } } : { phone: t, options: { shouldCreateUser: true } },
        )
        if (error) authError(error)
      },

      async verifyCode(target, code) {
        const t = normaliseTarget(target, authMethod)
        const token = code.replace(/\D/g, '')
        if (token.length !== 6) throw new FriendlyError('Enter the 6-digit code.')
        if (!supabase) {
          if (token !== DEMO_CODE) throw new FriendlyError(`That code is wrong. In demo mode the code is always ${DEMO_CODE}.`)
          const id = demoUserIdFor(t)
          const demo: DemoUser = { id, [authMethod]: t, displayName: demoNames()[id] }
          writeDemoUser(demo)
          invalidateCache()
          setUser(demo)
          return
        }
        const { error } = await supabase.auth.verifyOtp(
          authMethod === 'email' ? { email: t, token, type: 'email' } : { phone: t, token, type: 'sms' },
        )
        if (error) authError(error)
      },

      async signOut() {
        if (supabase) await supabase.auth.signOut()
        else writeDemoUser(null)
        invalidateCache()
        setUser(null)
      },

      async setDisplayName(name) {
        const clean = name.trim().slice(0, 60)
        if (!user) return
        if (!supabase) {
          const names = demoNames()
          names[user.id] = clean
          try {
            localStorage.setItem(DEMO_NAMES_KEY, JSON.stringify(names))
          } catch {
            // Storage blocked: name lasts for this visit only.
          }
          const next = { ...user, displayName: clean }
          writeDemoUser(next)
          setUser(next)
          return
        }
        const { error } = await supabase.from('profiles').update({ display_name: clean || null }).eq('id', user.id)
        if (error) throw new FriendlyError('Your name couldn’t be saved. Try again.')
        setUser({ ...user, displayName: clean })
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
