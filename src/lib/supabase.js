import { createClient } from '@supabase/supabase-js'

// Supabase project URLs are public identifiers; API keys remain deployment env vars.
// A deployment can override the default project URL without changing source code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbhhamxwtvvfohgitkjj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isSupabasePartiallyConfigured = Boolean(supabaseUrl && !supabaseAnonKey)

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
      message: 'Set VITE_SUPABASE_ANON_KEY (or the Supabase publishable key) in deployment environment variables. Do not use the service-role key.'
    }
  }

  return {
    configured: true,
    message: 'Supabase client configuration is present.'
  }
}
