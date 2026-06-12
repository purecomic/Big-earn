'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setReferralCode(ref)
  }, [searchParams])
  const router = useRouter()

  async function handleSubmit() {
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await signUp(email, password, name, referralCode)
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/main'), 1500)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f5c842', marginBottom: 8 }}>ACCOUNT CREATED!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
            <span className="gold-text">BIG</span>
            <span style={{ color: '#e8eaf0' }}> EARN</span>
          </div>
        </Link>
      </div>

      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 40px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="card" style={{ padding: '32px 24px' }}>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <UserPlus size={24} color="#f5c842" />
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e8eaf0' }}>CREATE ACCOUNT</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: 8 }}>Join BIG EARN and start investing today</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>FULL NAME</label>
                <input className="input-field" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>EMAIL ADDRESS</label>
                <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 48 }} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' }}>CONFIRM PASSWORD</label>
                <input className="input-field" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
              <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#f5c842', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
