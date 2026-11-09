import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      message: 'Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. Add them to .env to enable real Supabase Auth.'
    }
  }

  return {
    configured: true,
    message: 'Supabase Auth is configured and ready.'
  }
}
