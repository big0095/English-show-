import { supabase } from './supabase'

const LEGACY_KEYS = ['eem-completed', 'eem-progress']
const MIGRATION_MARKER = 'eem-legacy-progress-migrated-user'

/**
 * Import the old browser-only progress after the signed-in user explicitly agrees.
 * This intentionally never runs automatically: old localStorage may belong to a
 * different person who used this browser before the current account signed in.
 */
export async function migrateLegacyProgressAfterConsent() {
  if (!supabase) throw new Error('Supabase is not configured')
  if (typeof window === 'undefined') throw new Error('Migration is only available in a browser')

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Sign in before importing local progress')

  if (window.localStorage.getItem(MIGRATION_MARKER) === user.id) {
    return { migrated: false, reason: 'already-migrated' }
  }

  const rawCompleted = window.localStorage.getItem('eem-completed')
  const rawProgress = window.localStorage.getItem('eem-progress')
  if (rawCompleted === null && rawProgress === null) {
    return { migrated: false, reason: 'no-local-progress' }
  }

  // Never overwrite progress already stored for this account.
  const { data: existing, error: readError } = await supabase
    .from('student_progress')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (readError) throw readError
  if (existing) {
    window.localStorage.setItem(MIGRATION_MARKER, user.id)
    return { migrated: false, reason: 'account-already-has-progress' }
  }

  const completedSets = Math.max(0, Math.trunc(Number(rawCompleted) || 0))
  const progressPercent = Math.min(100, Math.max(0, Math.trunc(Number(rawProgress) || 0)))
  const { error: writeError } = await supabase.from('student_progress').insert({
    user_id: user.id,
    completed_sets: completedSets,
    progress_percent: progressPercent,
    legacy_snapshot: { eem_completed: rawCompleted, eem_progress: rawProgress },
    migrated_at: new Date().toISOString()
  })
  if (writeError) throw writeError

  window.localStorage.setItem(MIGRATION_MARKER, user.id)
  return { migrated: true, completedSets, progressPercent }
}
