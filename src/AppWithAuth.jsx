import { useCallback, useEffect, useRef, useState } from 'react'
import { GraduationCap, LogOut, MailCheck, ShieldCheck, User, XCircle } from 'lucide-react'
import App from './App.jsx'
import { supabase, isSupabaseConfigured } from './lib/supabase'

const LEGACY_KEYS = ['eem-completed', 'eem-progress']
const OWNER_KEY = 'eem-cloud-owner'
const readLegacy = () => {
  const snapshot = {}
  try {
    for (const key of LEGACY_KEYS) {
      const value = localStorage.getItem(key)
      if (value !== null) snapshot[key] = value
    }
  } catch { /* Storage may be disabled; cloud account remains usable. */ }
  return snapshot
}
const writeLocalProgress = (userId, completed, progress) => {
  try {
    localStorage.setItem('eem-completed', String(completed))
    localStorage.setItem('eem-progress', String(progress))
    localStorage.setItem(OWNER_KEY, userId)
  } catch { /* Cloud remains the source of truth. */ }
}
const asNonNegativeInt = (value) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function AppWithAuth() {
  const [user, setUser] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [accountReady, setAccountReady] = useState(false)
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const [legacySnapshot, setLegacySnapshot] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const lastSynced = useRef('')

  useEffect(() => {
    if (!supabase) { setSessionReady(true); return }
    let mounted = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return
      if (sessionError) setError(sessionError.message)
      setUser(data.session?.user ?? null)
      setSessionReady(true)
    }).catch((sessionError) => {
      if (mounted) { setError(sessionError.message || 'โหลดสถานะบัญชีไม่สำเร็จ'); setSessionReady(true) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') { setAccountReady(false); setMigrationNeeded(false); setAuthMode('login') }
      if (event === 'PASSWORD_RECOVERY') setAuthMode('update-password')
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const prepareAccount = useCallback(async (activeUser) => {
    if (!supabase || !activeUser) return
    setAccountReady(false)
    setError('')
    const metadata = activeUser.user_metadata || {}

    const { data: existingProfile, error: profileReadError } = await supabase.from('profiles')
      .select('id').eq('id', activeUser.id).maybeSingle()
    if (profileReadError) throw profileReadError
    if (!existingProfile) {
      const { error: profileInsertError } = await supabase.from('profiles').insert({
        id: activeUser.id,
        email: activeUser.email,
        username: metadata.username || activeUser.email?.split('@')[0] || 'learner',
        full_name: metadata.full_name || ''
      })
      if (profileInsertError) throw profileInsertError
    }

    const { data, error: progressError } = await supabase.from('student_progress')
      .select('completed_sets, progress_percent').eq('user_id', activeUser.id).maybeSingle()
    if (progressError) throw progressError

    if (data) {
      writeLocalProgress(activeUser.id, data.completed_sets || 0, data.progress_percent || 0)
      lastSynced.current = JSON.stringify({ completed: data.completed_sets || 0, progress: data.progress_percent || 0 })
      setMigrationNeeded(false)
    } else {
      const legacy = readLegacy()
      let previousOwner = null
      try { previousOwner = localStorage.getItem(OWNER_KEY) } catch { /* Ignore storage errors. */ }
      // Never offer another account's browser cache for import. Clear that cache before
      // mounting the legacy app so its periodic cloud sync cannot copy another user's data.
      const canImportLegacy = !previousOwner || previousOwner === activeUser.id
      const candidate = canImportLegacy ? legacy : {}
      const hasLegacyData = Object.keys(candidate).length > 0
      setLegacySnapshot(candidate)
      setMigrationNeeded(hasLegacyData)
      if (!hasLegacyData) {
        const initial = { user_id: activeUser.id, completed_sets: 0, progress_percent: 0 }
        const { error: insertError } = await supabase.from('student_progress').upsert(initial, { onConflict: 'user_id' })
        if (insertError) throw insertError
        lastSynced.current = JSON.stringify({ completed: 0, progress: 0 })
        writeLocalProgress(activeUser.id, 0, 0)
      }
    }
    setAccountReady(true)
  }, [])

  useEffect(() => {
    if (!user || !supabase) { setAccountReady(false); return }
    let alive = true
    prepareAccount(user).catch((prepareError) => {
      if (alive) { setError(`เตรียมข้อมูลบัญชีไม่สำเร็จ: ${prepareError.message}`); setAccountReady(false) }
    })
    return () => { alive = false }
  }, [user, prepareAccount])

  // The legacy app writes these two keys itself. Syncing them preserves the current app
  // without rewriting its learning flows; all cloud writes are still checked by RLS.
  useEffect(() => {
    if (!user || !supabase || !accountReady || migrationNeeded) return
    const sync = async () => {
      const values = {
        completed: asNonNegativeInt(localStorage.getItem('eem-completed') || '0'),
        progress: Math.min(100, asNonNegativeInt(localStorage.getItem('eem-progress') || '0'))
      }
      const serialized = JSON.stringify(values)
      if (serialized === lastSynced.current) return
      const { error: writeError } = await supabase.from('student_progress').upsert({
        user_id: user.id,
        completed_sets: values.completed,
        progress_percent: values.progress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      if (!writeError) {
        lastSynced.current = serialized
        try { localStorage.setItem(OWNER_KEY, user.id) } catch { /* Ignore storage errors. */ }
      } else console.error('Progress sync failed:', writeError.message)
    }
    const timer = window.setInterval(sync, 1500)
    return () => window.clearInterval(timer)
  }, [user, accountReady, migrationNeeded])

  const finishMigration = async (shouldImport) => {
    setLoading(true); setError('')
    try {
      if (!supabase || !user) return
      const values = shouldImport ? legacySnapshot || {} : {}
      const completed = asNonNegativeInt(values['eem-completed'] || '0')
      const progress = Math.min(100, asNonNegativeInt(values['eem-progress'] || '0'))
      const { error: writeError } = await supabase.from('student_progress').upsert({
        user_id: user.id,
        completed_sets: completed,
        progress_percent: progress,
        legacy_snapshot: shouldImport ? values : {},
        migrated_at: shouldImport ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      if (writeError) throw writeError
      // Retain original browser values as a recoverable backup.
      lastSynced.current = JSON.stringify({ completed, progress })
      writeLocalProgress(user.id, completed, progress)
      setMigrationNeeded(false)
    } catch (migrationError) {
      setError(`ย้ายข้อมูลไม่สำเร็จ: ${migrationError.message}`)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setLoading(true)
    try {
      if (!supabase) throw new Error('ยังไม่ได้ตั้งค่า Supabase')
      if (authMode === 'register') {
        if (!form.username.trim() || !form.fullName.trim()) throw new Error('กรุณากรอกชื่อผู้ใช้และชื่อ-นามสกุล')
        if (form.password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        if (form.password !== form.confirmPassword) throw new Error('รหัสผ่านยืนยันไม่ตรงกัน')
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(), password: form.password,
          options: { emailRedirectTo: window.location.origin, data: { username: form.username.trim(), full_name: form.fullName.trim() } }
        })
        if (signUpError) throw signUpError
        setNotice('สมัครสมาชิกแล้ว กรุณาตรวจสอบอีเมลและยืนยันบัญชีก่อนเข้าสู่ระบบ')
        setAuthMode('login')
        setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
      } else if (authMode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
        if (signInError) throw signInError
      } else if (authMode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: window.location.origin })
        if (resetError) throw resetError
        setNotice('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลแล้ว')
      } else if (authMode === 'update-password') {
        if (form.password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        if (form.password !== form.confirmPassword) throw new Error('รหัสผ่านยืนยันไม่ตรงกัน')
        const { error: updateError } = await supabase.auth.updateUser({ password: form.password })
        if (updateError) throw updateError
        setNotice('เปลี่ยนรหัสผ่านสำเร็จ')
        setAuthMode('login')
        await supabase.auth.signOut()
      }
    } catch (submitError) { setError(submitError.message || 'ดำเนินการไม่สำเร็จ') }
    finally { setLoading(false) }
  }

  const logout = async () => { if (supabase) await supabase.auth.signOut(); setUser(null) }
  const retryAccount = () => { if (user) prepareAccount(user).catch((e) => setError(`เตรียมข้อมูลบัญชีไม่สำเร็จ: ${e.message}`)) }

  if (!isSupabaseConfigured) return <App />
  if (!sessionReady || (user && !accountReady && !error)) return <div className="auth-shell"><div className="auth-card"><div className="brand-row"><div className="brand-icon"><GraduationCap /></div><div><b>English Exam Academy</b><div>กำลังตรวจสอบบัญชีและข้อมูล…</div></div></div></div></div>

  if (user && error && !accountReady) return <div className="auth-shell"><section className="auth-card"><div className="brand-row"><div className="brand-icon"><ShieldCheck /></div><div><b>เชื่อมต่อข้อมูลบัญชีไม่สำเร็จ</b><div>กรุณาตรวจสอบการตั้งค่า Supabase และ RLS</div></div></div><div role="alert" className="form-message error"><XCircle size={17}/>{error}</div><button className="auth-submit" onClick={retryAccount}>ลองอีกครั้ง</button><button className="text-button" onClick={logout}>ออกจากระบบ</button></section></div>

  if (user && authMode === 'update-password') return <div className="auth-shell"><section className="auth-card"><div className="brand-row"><div className="brand-icon"><GraduationCap /></div><div><b>ตั้งรหัสผ่านใหม่</b><div>กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</div></div></div><form className="auth-form recovery-form" onSubmit={handleSubmit}><label>รหัสผ่านใหม่<input type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={(e) => setForm({...form,password:e.target.value})}/></label><label>ยืนยันรหัสผ่าน<input type="password" autoComplete="new-password" required minLength={8} value={form.confirmPassword} onChange={(e) => setForm({...form,confirmPassword:e.target.value})}/></label>{error && <div role="alert" className="form-message error"><XCircle size={17}/>{error}</div>}{notice && <div role="status" className="form-message success"><MailCheck size={17}/>{notice}</div>}<button className="auth-submit" disabled={loading}>{loading ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่านใหม่'}</button></form></section></div>

  if (!user) return (
    <div className="auth-shell"><section className="auth-card">
      <div className="brand-row"><div className="brand-icon"><GraduationCap /></div><div><b>English Exam Academy</b><div>เรียนต่อได้ทุกที่ ทุกเวลา</div></div></div>
      <div className="auth-heading"><span>MEMBER PORTAL</span><h1>{authMode === 'register' ? 'สร้างบัญชีผู้เรียน' : authMode === 'forgot' ? 'ตั้งรหัสผ่านใหม่' : 'ยินดีต้อนรับกลับ'}</h1><p>เข้าสู่ระบบเพื่อบันทึกความก้าวหน้าและเรียนต่อจากเดิม</p></div>
      <div className="auth-tabs"><button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => {setAuthMode('login');setError('')}}>เข้าสู่ระบบ</button><button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => {setAuthMode('register');setError('')}}>สมัครสมาชิก</button></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {authMode === 'register' && <><label>ชื่อผู้ใช้<input autoComplete="username" required value={form.username} onChange={(e) => setForm({...form, username:e.target.value})} /></label><label>ชื่อ-นามสกุล<input autoComplete="name" required value={form.fullName} onChange={(e) => setForm({...form, fullName:e.target.value})} /></label></>}
        <label>อีเมล<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} /></label>
        {authMode !== 'forgot' && <label>รหัสผ่าน<input type="password" autoComplete={authMode === 'register' ? 'new-password':'current-password'} required minLength={8} value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} /></label>}
        {authMode === 'register' && <label>ยืนยันรหัสผ่าน<input type="password" autoComplete="new-password" required minLength={8} value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword:e.target.value})} /></label>}
        {error && <div role="alert" className="form-message error"><XCircle size={17}/>{error}</div>}{notice && <div role="status" className="form-message success"><MailCheck size={17}/>{notice}</div>}
        <button className="auth-submit" disabled={loading}>{loading ? 'กำลังดำเนินการ…' : authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'register' ? 'สมัครสมาชิก' : 'ส่งลิงก์รีเซ็ต'}</button>
      </form>
      {authMode === 'login' && <button className="text-button" onClick={() => {setAuthMode('forgot');setError('');setNotice('')}}>ลืมรหัสผ่าน?</button>}
      <div className="auth-security"><ShieldCheck size={16}/> ยืนยันตัวตนและจัดการรหัสผ่านด้วย Supabase Auth</div>
    </section></div>
  )

  if (migrationNeeded) return <div className="auth-shell"><section className="auth-card migration-card"><div className="brand-row"><div className="brand-icon"><ShieldCheck /></div><div><b>พบข้อมูลเดิมในอุปกรณ์นี้</b><div>บัญชี: {user.email}</div></div></div><p>เลือกว่าจะนำจำนวนชุดฝึกและความก้าวหน้าจาก Local Storage ไปยังบัญชีนี้หรือไม่ ข้อมูลต้นฉบับจะยังคงอยู่ในอุปกรณ์เป็นข้อมูลสำรอง</p>{error && <div className="form-message error"><XCircle size={17}/>{error}</div>}<button className="auth-submit" disabled={loading} onClick={() => finishMigration(true)}>ย้ายข้อมูลเข้า account นี้</button><button className="text-button" disabled={loading} onClick={() => finishMigration(false)}>ข้ามการย้ายข้อมูล</button></section></div>

  return <><div className="member-bar"><span><User size={15}/>{user.email}</span><button onClick={logout}><LogOut size={15}/>ออกจากระบบ</button></div><App /></>
}

export default AppWithAuth
