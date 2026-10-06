import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * The Supabase client, or null when no project is configured. Without one the
 * app runs in demo mode on sample data (see lib/data/demoSource.ts).
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null

export const isLive = supabase !== null

/** 'email' until an SMS provider is set up in Supabase, then 'phone'. */
export const authMethod: 'email' | 'phone' = import.meta.env.VITE_AUTH_METHOD === 'phone' ? 'phone' : 'email'
