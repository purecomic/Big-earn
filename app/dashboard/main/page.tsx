'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, Transaction, Investment } from '@/lib/supabase'
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function DashboardMain() {
  const { user, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')

    try {
      const [txRes, invRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
      ])

      if (txRes.error) throw txRes.error
      if (invRes.error) throw invRes.error

      setTransactions((txRes.data as Transaction[]) ?? [])
      setInvestments((invRes.data as Investment[]) ?? [])
      await refreshUser()
    } catch (err: any) {
      setError('Failed to load data. Pull down to retry.')
      console.error('Dashboard fetch error:', err?.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchData()
  }, [user?.id])

  const activeInvestmentTotal = investments.reduce((s, i) => s + (i.amount ?? 0), 0)

  function statusIcon(status: string) {
    if (status === 'approved') return <CheckCircle size={14} color="#4ade80" />
    if (status === 'rejected') return <XCircle size={14} color="#f87171" />
    return <Clock size={14} color="#f5c842" />
  }

  function txColor(type: string) {
    return type === 'deposit' || type === 'return' ? '#4ade80' : '#f87171'
  }

  function txSign(type: string) {
    return type === 'deposit' || type === 'return' ? '+' : '-'
  }

  // Show loading spinner only on first load
  if (loading && transactions.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(245,200,66,0.2)', borderTop: '3px solid #f5c842', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>Welcome back,</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e8eaf0', letterSpacing: '0.05em' }}>
          {user?.full_name?.split(' ')[0]?.toUpperCase() ?? 'USER'} 👋
        </h1>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={fetchData} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2540 100%)',
        border: '1px solid rgba(245,200,66,0.3)',
        borderRadius: 20, padding: '28px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, background: 'radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 8, letterSpacing: '0.1em' }}>TOTAL BALANCE</p>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#f5c842', lineHeight: 1, marginBottom: 4 }}>
          ${(user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Available to withdraw or invest</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Link href="/dashboard/deposit" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, color: '#4ade80', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ArrowDownCircle size={15} /> DEPOSIT
            </button>
          </Link>
          <Link href="/dashboard/withdraw" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ArrowUpCircle size={15} /> WITHDRAW
            </button>
          </Link>
          <Link href="/dashboard/invest" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px', background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 10, color: '#f5c842', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <TrendingUp size={15} /> INVEST
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'ACTIVE INVESTED', value: `$${activeInvestmentTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#f5c842', icon: <TrendingUp size={16} color="#f5c842" /> },
          { label: 'TOTAL WITHDRAWN', value: `$${(user?.total_withdrawn ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#4ade80', icon: <ArrowUpCircle size={16} color="#4ade80" /> },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>{s.label}</p>
              {s.icon}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Active Investments */}
      {investments.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#e8eaf0', marginBottom: 12 }}>ACTIVE INVESTMENTS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {investments.map(inv => {
              const end = new Date(inv.end_date)
              const now = new Date()
              const total = new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime()
              const elapsed = now.getTime() - new Date(inv.start_date).getTime()
              const progress = Math.min(100, Math.max(0, (elapsed / total) * 100))
              const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
              return (
                <div key={inv.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e8eaf0', fontSize: '0.9rem' }}>{inv.plan_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{daysLeft} days remaining</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#4ade80', fontWeight: 600 }}>${(inv.amount ?? 0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#f5c842' }}>+{inv.roi_percent}% ROI</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #f5c842, #4ade80)', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' }}>{progress.toFixed(0)}% complete</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      
      {/* Referral Section */}
      <div style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#e8eaf0', marginBottom: 16 }}>🎁 REFERRAL PROGRAM</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 16 }}>
            Share your link and earn <span style={{ color: '#f5c842', fontWeight: 700 }}>5%</span> of every deposit your referrals make!
          </p>
          <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#f5c842', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${user?.referral_code}` : ''}
            </span>
            <button
              onClick={() => {
                const link = `${window.location.origin}/auth/signup?ref=${user?.referral_code}`
                navigator.clipboard.writeText(link)
                alert('Referral link copied!')
              }}
              style={{ marginLeft: 12, background: '#f5c842', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              COPY
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 4 }}>YOUR CODE</p>
              <p style={{ color: '#f5c842', fontWeight: 700, fontSize: '1rem' }}>{user?.referral_code || '...'}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 4 }}>REFERRAL EARNINGS</p>
              <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1rem' }}>${(user?.referral_earnings ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#e8eaf0' }}>RECENT TRANSACTIONS</h2>
          <button onClick={fetchData} disabled={loading} style={{ background: 'none', border: 'none', color: loading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)', cursor: loading ? 'default' : 'pointer' }}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>💰</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No transactions yet</p>
            <Link href="/dashboard/deposit">
              <button className="btn-gold" style={{ marginTop: 16, padding: '10px 24px', fontSize: '0.9rem' }}>MAKE FIRST DEPOSIT</button>
            </Link>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {transactions.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px',
                borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${txColor(tx.type)}18`, border: `1px solid ${txColor(tx.type)}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tx.type === 'deposit' ? <ArrowDownCircle size={16} color="#4ade80" /> :
                     tx.type === 'withdrawal' ? <ArrowUpCircle size={16} color="#f87171" /> :
                     <TrendingUp size={16} color="#f5c842" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e8eaf0', textTransform: 'capitalize' }}>{tx.type}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      {statusIcon(tx.status)} {tx.status}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: txColor(tx.type), fontWeight: 600 }}>{txSign(tx.type)}${(tx.amount ?? 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

