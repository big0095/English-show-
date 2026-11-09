import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbhhamxwtvvfohgitkjj.supabase.co'
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
  if (!supabaseAnonKey) {
    return {
      configured: false,
      message: 'Missing VITE_SUPABASE_ANON_KEY. Add the browser-safe anon key from your Supabase project. Do not use the service-role key in the frontend.'
    }
  }

  return {
    configured: true,
    message: 'Supabase is configured and ready.'
  }
}
