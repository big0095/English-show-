import { useEffect, useState } from 'react'
import { GraduationCap, LogOut, MailCheck, ShieldCheck, User, XCircle } from 'lucide-react'
import App from './App.jsx'
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from './lib/supabase'

function AppWithAuth() {
  const [user, setUser] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true)
      return
    }

    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.warn('Unable to load Supabase session:', error)
      } finally {
        setSessionReady(true)
      }
    }

    initializeSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') {
        setAuthNotice('เข้าสู่ระบบสำเร็จแล้ว')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    setAuthLoading(true)

    try {
      if (!supabase) {
        setAuthNotice('โหมด Demo: กรุณาเพิ่ม VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY เพื่อเปิดใช้ระบบ Auth จริง')
        return
      }

      if (authMode === 'register') {
        if (!authForm.username.trim()) throw new Error('กรุณากรอกชื่อผู้ใช้')
        if (!authForm.full_name.trim()) throw new Error('กรุณากรอกชื่อ-นามสกุล')
        if (authForm.password.length < 8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        if (authForm.password !== authForm.confirmPassword) throw new Error('รหัสผ่านยืนยันไม่ตรงกัน')

        const { error } = await supabase.auth.signUp({
          email: authForm.email.trim(),
          password: authForm.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: authForm.username.trim(),
              full_name: authForm.full_name.trim()
            }
          }
        })

        if (error) throw error
        setAuthNotice('สมัครสมาชิกสำเร็จแล้ว กรุณายืนยันอีเมลก่อนใช้งานต่อ')
        setAuthMode('login')
        setAuthForm({ ...authForm, password: '', confirmPassword: '' })
      }

      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email.trim(),
          password: authForm.password
        })

        if (error) throw error
        setAuthNotice('เข้าสู่ระบบสำเร็จ')
      }

      if (authMode === 'forgot') {
        if (!authForm.email.trim()) throw new Error('กรุณากรอกอีเมลเพื่อรีเซ็ตรหัสผ่าน')
        const { error } = await supabase.auth.resetPasswordForEmail(authForm.email.trim(), {
          redirectTo: `${window.location.origin}/`
        })

        if (error) throw error
        setAuthNotice('ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว')
        setAuthMode('login')
      }
    } catch (error) {
      setAuthError(error.message || 'เกิดข้อผิดพลาดในการทำงาน')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const status = getSupabaseConfigStatus()

  if (!sessionReady && supabase) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-icon"><GraduationCap size={24} /></div>
            <div>
              <div className="brand-title">English Exam Academy</div>
              <div className="brand-subtitle">กำลังโหลดบัญชี...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user && supabase) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-icon"><GraduationCap size={24} /></div>
            <div>
              <div className="brand-title">English Exam Academy</div>
              <div className="brand-subtitle">Member Access</div>
            </div>
          </div>

          {!status.configured && (
            <div className="config-warning">
              <ShieldCheck size={16} />
              <span>{status.message}</span>
            </div>
          )}

          <div className="auth-tabs">
            <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>เข้าสู่ระบบ</button>
            <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>สมัครสมาชิก</button>
            <button type="button" className={authMode === 'forgot' ? 'active' : ''} onClick={() => setAuthMode('forgot')}>ลืมรหัสผ่าน</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {authMode === 'register' && (
              <>
                <label>
                  <span>ชื่อผู้ใช้</span>
                  <input value={authForm.username} onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })} placeholder="username" />
                </label>
                <label>
                  <span>ชื่อ-นามสกุล</span>
                  <input value={authForm.full_name} onChange={(event) => setAuthForm({ ...authForm, full_name: event.target.value })} placeholder="ชื่อ-นามสกุล" />
                </label>
              </>
            )}

            <label>
              <span>อีเมล</span>
              <input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" />
            </label>

            {authMode !== 'forgot' && (
              <label>
                <span>รหัสผ่าน</span>
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="••••••••" />
              </label>
            )}

            {authMode === 'register' && (
              <label>
                <span>ยืนยันรหัสผ่าน</span>
                <input type="password" value={authForm.confirmPassword} onChange={(event) => setAuthForm({ ...authForm, confirmPassword: event.target.value })} placeholder="ยืนยันรหัสผ่าน" />
              </label>
            )}

            {authError && <div className="form-message error"><XCircle size={16} />{authError}</div>}
            {authNotice && <div className="form-message success"><MailCheck size={16} />{authNotice}</div>}

            <button type="submit" className="primary-btn" disabled={authLoading}>
              {authLoading ? 'กำลังประมวลผล...' : authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'register' ? 'สมัครสมาชิก' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      {user && (
        <div className="session-bar">
          <div className="session-user"><User size={15} />{user.email}</div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={14} />Logout</button>
        </div>
      )}
      <App />
    </>
  )
}

export default AppWithAuth
