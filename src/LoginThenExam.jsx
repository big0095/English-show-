import { useEffect, useState } from 'react'
import { GraduationCap, LogOut, MailCheck, ShieldCheck, User, XCircle } from 'lucide-react'
import { supabase, getSupabaseConfigStatus } from './lib/supabase'

const initialForm = { email: '', password: '', confirmPassword: '', fullName: '' }

export default function LoginThenExam() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const status = getSupabaseConfigStatus()
  const examUrl = `${import.meta.env.BASE_URL}exam-academy.html`

  useEffect(() => {
    if (!supabase) {
      setReady(true)
      return undefined
    }

    let alive = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (alive) setUser(session?.user ?? null)
    }).catch((sessionError) => {
      console.warn('Unable to load session:', sessionError)
    }).finally(() => {
      if (alive) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      if (!supabase) throw new Error(status.message)

      if (mode === 'register') {
        if (!form.fullName.trim()) throw new Error('กรุณากรอกชื่อ-นามสกุล')
        if (form.password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        if (form.password !== form.confirmPassword) throw new Error('รหัสผ่านยืนยันไม่ตรงกัน')
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
            data: { full_name: form.fullName.trim() }
          }
        })
        if (signUpError) throw signUpError
        if (data.session) setUser(data.user)
        else {
          setMode('login')
          setNotice('สมัครสมาชิกเรียบร้อย กรุณายืนยันอีเมลจากกล่องจดหมายก่อนเข้าสู่ระบบ')
        }
      } else if (mode === 'forgot') {
        if (!form.email.trim()) throw new Error('กรุณากรอกอีเมล')
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
          redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`
        })
        if (resetError) throw resetError
        setMode('login')
        setNotice('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลแล้ว')
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password
        })
        if (loginError) throw loginError
      }
    } catch (submitError) {
      setError(submitError.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    if (!supabase) return
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) setError(logoutError.message)
    else setUser(null)
  }

  if (!ready) return <div className="auth-shell"><div className="auth-card">กำลังตรวจสอบบัญชี...</div></div>

  if (user) {
    return (
      <main className="exam-app-shell">
        <iframe className="exam-app-frame" src={examUrl} title="English Exam Academy — คลังข้อสอบ" />
        <div className="exam-session-control">
          <span><User size={15} />{user.email}</span>
          <button type="button" onClick={handleLogout}><LogOut size={14} /> ออกจากระบบ</button>
        </div>
      </main>
    )
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="brand-row">
          <div className="brand-icon"><GraduationCap size={24} /></div>
          <div><div className="brand-title">English Exam Academy</div><div className="brand-subtitle">เข้าสู่ระบบเพื่อเริ่มเรียน</div></div>
        </div>
        {!status.configured && <div className="config-warning"><ShieldCheck size={16} /><span>{status.message}</span></div>}
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setNotice('') }}>เข้าสู่ระบบ</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setNotice('') }}>สมัครสมาชิก</button>
          <button type="button" className={mode === 'forgot' ? 'active' : ''} onClick={() => { setMode('forgot'); setError(''); setNotice('') }}>ลืมรหัสผ่าน</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && <label><span>ชื่อ-นามสกุล</span><input autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="ชื่อ-นามสกุล" required /></label>}
          <label><span>อีเมล</span><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label>
          {mode !== 'forgot' && <label><span>รหัสผ่าน</span><input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="อย่างน้อย 8 ตัวอักษร" minLength={mode === 'register' ? 8 : undefined} required /> </label>}
          {mode === 'register' && <label><span>ยืนยันรหัสผ่าน</span><input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="กรอกรหัสผ่านอีกครั้ง" required /></label>}
          {error && <div className="form-message error"><XCircle size={16} />{error}</div>}
          {notice && <div className="form-message success"><MailCheck size={16} />{notice}</div>}
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบและไปยังคลังข้อสอบ' : mode === 'register' ? 'สมัครสมาชิก' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}</button>
        </form>
      </section>
    </div>
  )
}
