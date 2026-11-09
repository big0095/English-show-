import { supabase } from './supabase'

async function getAuthenticatedUser() {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('Sign in is required')
  return user
}

export async function getMyProfile() {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) throw error
  return data
}

export async function updateMyProfile({ username, fullName }) {
  const user = await getAuthenticatedUser()
  const changes = { updated_at: new Date().toISOString() }
  if (typeof username === 'string') changes.username = username.trim()
  if (typeof fullName === 'string') changes.full_name = fullName.trim()
  const { data, error } = await supabase.from('profiles').update(changes).eq('id', user.id).select().single()
  if (error) throw error
  return data
}

export async function getMyProgress() {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase.from('student_progress').select('*').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return data
}

export async function saveMyProgress({ completedSets, progressPercent }) {
  const user = await getAuthenticatedUser()
  const payload = {
    user_id: user.id,
    completed_sets: Math.max(0, Math.trunc(Number(completedSets) || 0)),
    progress_percent: Math.min(100, Math.max(0, Math.trunc(Number(progressPercent) || 0))),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase.from('student_progress').upsert(payload, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

export async function saveMyExamResult({ examType, score, totalQuestions, answers = [] }) {
  const user = await getAuthenticatedUser()
  const payload = {
    user_id: user.id,
    exam_type: String(examType || 'practice').slice(0, 100),
    score: Math.max(0, Math.trunc(Number(score) || 0)),
    total_questions: Math.max(0, Math.trunc(Number(totalQuestions) || 0)),
    answers: Array.isArray(answers) ? answers : []
  }

  const { data, error } = await supabase.from('exam_history').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function listMyExamHistory({ limit = 50 } = {}) {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase.from('exam_history').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(Math.min(100, Math.max(1, limit)))
  if (error) throw error
  return data
}

export async function saveMyTrainingSession({ activity, state = {} }) {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase.from('training_sessions').insert({
    user_id: user.id,
    activity: String(activity || 'practice').slice(0, 100),
    state
  }).select().single()
  if (error) throw error
  return data
}

export async function listMyInventory() {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase.from('inventory').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMyWallet() {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase.from('wallets').select('coins').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return data?.coins ?? 0
}
