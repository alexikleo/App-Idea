// Demo sign-in for when no Supabase project is connected: any email or SA
// mobile number works with the code 123456. Lets the whole app be tried out.

const KEY = 'fundi:demo-session:v1'
export const DEMO_CODE = '123456'

export interface DemoUser {
  id: string
  email?: string
  phone?: string
  displayName?: string
}

export function readDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as DemoUser) : null
  } catch {
    return null
  }
}

export function writeDemoUser(user: DemoUser | null) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user))
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
}

/** Same address → same demo user, so signing out and back in keeps your listing. */
export function demoUserIdFor(identifier: string): string {
  let h = 0
  for (const c of identifier.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return `demo-${h.toString(16)}`
}
