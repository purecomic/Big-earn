'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { User, Lock, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()

  const [name, setName] = useState(user?.full_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  const [email, setEmail] = useState(user?.email ?? '')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [passSuccess, setPassSuccess] = useState(false)
  const [passError, setPassError] = useState('')

  async function updateName() {
    if (!name.trim()) { setNameError('Name cannot be empty'); return }
    setSavingName(true); setNameError('')
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user!.id)
    if (error) { setNameError('Failed to update name'); setSavingName(false); return }
    await refreshUser()
    setSavingName(false); setNameSuccess(true)
    setTimeout(() => setNameSuccess(false), 3000)
  }

  async function updateEmail() {
    if (!email.trim() || !email.includes('@')) { setEmailError('Enter a valid email'); return }
    if (email === user?.email) { setEmailError('This is already your email'); return }
    setSavingEmail(true); setEmailError('')
    const { error } = await supabase.auth.updateUser({ email: email.trim() })
    if (error) { setEmailError(error.message); setSavingEmail(false); return }
    await supabase.from('profiles').update({ email: email.trim() }).eq('id', user!.id)
    setSavingEmail(false); setEmailSuccess(true)
    setTimeout(() => setEmailSuccess(false), 5000)
  }

  async function updatePassword() {
    if (!currentPass) { setPassError('Enter your current password'); return }
    if (!newPass) { setPassError('Enter a new password'); return }
    if (newPass.length < 6) { setPassError('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setPassError('Passwords do not match'); return }
    if (currentPass === newPass) { setPassError('New password must be different from current'); return }
    setSavingPass(true); setPassError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email,
      password: currentPass,
    })
    if (signInError) { setPassError('Current password is incorrect'); setSavingPass(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) { setPassError(error.message); setSavingPass(false); return }

    setSavingPass(false); setPassSuccess(true)
    setCurrentPass(''); setNewPass(''); setConfirmPass('')
    setTimeout(() => setPassSuccess(false), 3000)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <User size={22} color="#f5c842" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#e8eaf0' }}>ACCOUNT SETTINGS</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Manage your profile, email and password</p>
      </div>

      {/* Profile Card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px', background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 14, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #f5c842, #e6b800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#050810', flexShrink: 0 }}>
          {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#e8eaf0', fontSize: '1rem' }}>{user?.full_name}</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{user?.email}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            Member since {new Date(user?.created_at ?? '').toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Update Name */}
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={16} color="#f5c842" /> FULL NAME
        </h3>
        {nameSuccess && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#4ade80', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> Name updated successfully!
          </div>
        )}
        {nameError && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontSize: '0.82rem' }}>{nameError}</div>}
        <input className="input-field" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 12 }} />
        <button className="btn-gold" onClick={updateName} disabled={savingName} style={{ width: '100%', opacity: savingName ? 0.7 : 1, fontSize: '0.9rem' }}>
          {savingName ? 'SAVING...' : 'UPDATE NAME'}
        </button>
      </div>

      {/* Update Email */}
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={16} color="#f5c842" /> EMAIL ADDRESS
        </h3>
        {emailSuccess && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#4ade80', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> Check your new email inbox for a confirmation link!
          </div>
        )}
        {emailError && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontSize: '0.82rem' }}>{emailError}</div>}
        <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 12 }} />
        <button className="btn-gold" onClick={updateEmail} disabled={savingEmail} style={{ width: '100%', opacity: savingEmail ? 0.7 : 1, fontSize: '0.9rem' }}>
          {savingEmail ? 'SAVING...' : 'UPDATE EMAIL'}
        </button>
      </div>

      {/* Update Password */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color="#f5c842" /> CHANGE PASSWORD
        </h3>
        {passSuccess && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#4ade80', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> Password changed successfully!
          </div>
        )}
        {passError && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontSize: '0.82rem' }}>{passError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>CURRENT PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={showCurrent ? 'text' : 'password'} placeholder="Your current password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} style={{ paddingRight: 44 }} />
              <button onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>NEW PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={showNew ? 'text' : 'password'} placeholder="Min. 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ paddingRight: 44 }} />
              <button onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>CONFIRM NEW PASSWORD</label>
            <input className="input-field" type="password" placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && updatePassword()} />
          </div>
        </div>
        <button className="btn-gold" onClick={updatePassword} disabled={savingPass} style={{ width: '100%', marginTop: 16, opacity: savingPass ? 0.7 : 1, fontSize: '0.9rem' }}>
          {savingPass ? 'UPDATING...' : 'CHANGE PASSWORD'}
        </button>
      </div>
    </div>
  )
}
