import { useCallback, useEffect, useRef, useState } from 'react'
import { GraduationCap, LogOut, MailCheck, ShieldCheck, User, XCircle } from 'lucide-react'
import App from './App.jsx'
import { supabase, isSupabaseConfigured } from './lib/supabase'

const LEGACY_KEYS = ['eem-completed', 'eem-progress']
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
      if (event === 'SIGNED_OUT') { setAccountReady(false); setMigrationNeeded(false) }
      if (event === 'PASSWORD_RECOVERY') setAuthMode('update-password')
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const prepareAccount = useCallback(async (activeUser) => {
    if (!supabase || !activeUser) return
    setAccountReady(false)
    setError('')
    const metadata = activeUser.user_metadata || {}
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: activeUser.id,
      email: activeUser.email,
      username: metadata.username || activeUser.email?.split('@')[0] || 'learner',
      full_name: metadata.full_name || ''
    }, { onConflict: 'id' })
    if (profileError) throw profileError

    const { data, error: progressError } = await supabase.from('student_progress')
      .select('completed_sets, progress_percent').eq('user_id', activeUser.id).maybeSingle()
    if (progressError) throw progressError

    if (data) {
      try {
        localStorage.setItem('eem-completed', String(data.completed_sets || 0))
        localStorage.setItem('eem-progress', String(data.progress_percent || 0))
      } catch { /* Cloud remains the source of truth. */ }
      lastSynced.current = JSON.stringify({ completed: data.completed_sets || 0, progress: data.progress_percent || 0 })
      setMigrationNeeded(false)
    } else {
      const legacy = readLegacy()
      const hasLegacyData = Object.keys(legacy).length > 0
      setLegacySnapshot(legacy)
      setMigrationNeeded(hasLegacyData)
      if (!hasLegacyData) {
        const initial = { user_id: activeUser.id, completed_sets: 0, progress_percent: 0 }
        const { error: insertError } = await supabase.from('student_progress').upsert(initial, { onConflict: 'user_id' })
        if (insertError) throw insertError
        lastSynced.current = JSON.stringify({ completed: 0, progress: 0 })
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

  // Keep the existing app's legacy progress keys working while syncing those two fields
  // to the signed-in user's row. RLS is still enforced on every database request.
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
      if (!writeError) lastSynced.current = serialized
      else console.error('Progress sync failed:', writeError.message)
    }
    const timer = window.setInterval(sync, 2000)
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
      // Do not delete the original browser data: it remains a recoverable backup.
      lastSynced.current = JSON.stringify({ completed, progress })
      try {
        localStorage.setItem('eem-completed', String(completed))
        localStorage.setItem('eem-progress', String(progress))
      } catch { /* Ignore unavailable local storage. */ }
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
      }
    } catch (submitError) { setError(submitError.message || 'ดำเนินการไม่สำเร็จ') }
    finally { setLoading(false) }
  }

  const logout = async () => { if (supabase) await supabase.auth.signOut(); setUser(null) }

  if (!isSupabaseConfigured) return <App />
  if (!sessionReady || (user && !accountReady && !error)) return <div className="auth-shell"><div className="auth-card"><div className="brand-row"><div className="brand-icon"><GraduationCap /></div><div><b>English Exam Academy</b><div>กำลังตรวจสอบบัญชีและข้อมูล…</div></div></div></div></div>

  if (!user) return (
    <div className="auth-shell"><section className="auth-card">
      <div className="brand-row"><div className="brand-icon"><GraduationCap /></div><div><b>English Exam Academy</b><div>เรียนต่อได้ทุกที่ ทุกเวลา</div></div></div>
      <div className="auth-heading"><span>MEMBER PORTAL</span><h1>{authMode === 'register' ? 'สร้างบัญชีผู้เรียน' : authMode === 'forgot' ? 'ตั้งรหัสผ่านใหม่' : 'ยินดีต้อนรับกลับ'}</h1><p>เข้าสู่ระบบเพื่อบันทึกความก้าวหน้าและเรียนต่อจากเดิม</p></div>
      <div className="auth-tabs"><button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => {setAuthMode('login');setError('')}}>เข้าสู่ระบบ</button><button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => {setAuthMode('register');setError('')}}>สมัครสมาชิก</button></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {authMode === 'register' && <><label>ชื่อผู้ใช้<input autoComplete="username" required value={form.username} onChange={(e) => setForm({...form, username:e.target.value})} /></label><label>ชื่อ-นามสกุล<input autoComplete="name" required value={form.fullName} onChange={(e) => setForm({...form, fullName:e.target.value})} /></label></>}
        <label>อีเมล<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} /></label>
        {authMode !== 'forgot' && <label>รหัสผ่าน<input type="password" autoComplete={authMode === 'register' ? 'new-password':'current-password'} required minLength={8} value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} /></label>}
        {(authMode === 'register' || authMode === 'update-password') && <label>ยืนยันรหัสผ่าน<input type="password" autoComplete="new-password" required minLength={8} value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword:e.target.value})} /></label>}
        {error && <div role="alert" className="form-message error"><XCircle size={17}/>{error}</div>}{notice && <div role="status" className="form-message success"><MailCheck size={17}/>{notice}</div>}
        <button className="auth-submit" disabled={loading}>{loading ? 'กำลังดำเนินการ…' : authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'register' ? 'สมัครสมาชิก' : authMode === 'forgot' ? 'ส่งลิงก์รีเซ็ต' : 'บันทึกรหัสผ่านใหม่'}</button>
      </form>
      {authMode === 'login' && <button className="text-button" onClick={() => {setAuthMode('forgot');setError('');setNotice('')}}>ลืมรหัสผ่าน?</button>}
      {authMode === 'update-password' && <p className="auth-note">เปิดลิงก์จากอีเมลแล้ว กรุณากำหนดรหัสผ่านใหม่</p>}
      <div className="auth-security"><ShieldCheck size={16}/> ยืนยันตัวตนและจัดการรหัสผ่านด้วย Supabase Auth</div>
    </section></div>
  )

  if (migrationNeeded) return <div className="auth-shell"><section className="auth-card migration-card"><div className="brand-row"><div className="brand-icon"><ShieldCheck /></div><div><b>พบข้อมูลเดิมในอุปกรณ์นี้</b><div>บัญชี: {user.email}</div></div></div><p>เลือกว่าจะนำจำนวนชุดฝึกและความก้าวหน้าจาก Local Storage ไปยังบัญชีนี้หรือไม่ ข้อมูลต้นฉบับจะยังคงอยู่ในอุปกรณ์เป็นข้อมูลสำรอง</p>{error && <div className="form-message error"><XCircle size={17}/>{error}</div>}<button className="auth-submit" disabled={loading} onClick={() => finishMigration(true)}>ย้ายข้อมูลเข้า account นี้</button><button className="text-button" disabled={loading} onClick={() => finishMigration(false)}>ข้ามการย้ายข้อมูล</button></section></div>

  return <><div className="member-bar"><span><User size={15}/>{user.email}</span><button onClick={logout}><LogOut size={15}/>ออกจากระบบ</button></div><App /></>
}

export default AppWithAuth
