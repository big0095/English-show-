import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

export function getSupabaseConfigStatus() {
  if (!supabaseUrl) {
    return {
      configured: false,
      message: 'Missing VITE_SUPABASE_URL. Set the Supabase Project URL in your local or deployment environment.'
    }
  }

  if (!supabaseAnonKey) {
    return {
      configured: false,
      message: 'Missing VITE_SUPABASE_ANON_KEY. Set the browser-safe publishable/anon key. Never use a secret or service-role key in the frontend.'
    }
  }

  return { configured: true, message: 'Supabase client is configured.' }
}
