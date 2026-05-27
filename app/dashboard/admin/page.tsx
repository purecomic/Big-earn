'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Transaction, User } from '@/lib/supabase'
import { CheckCircle, XCircle, Send, Users, DollarSign, TrendingUp, Bell, RefreshCw, Search } from 'lucide-react'

type Tab = 'overview' | 'deposits' | 'withdrawals' | 'users' | 'notify'

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Notification form
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'alert'>('info')
  const [notifTarget, setNotifTarget] = useState<'all' | string>('all')
  const [sending, setSending] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)

  useEffect(() => {
    if (!isAdmin) { router.push('/dashboard/main'); return }
    fetchAll()
  }, [isAdmin])

  async function fetchAll() {
    setLoading(true)
    const [txRes, usersRes] = await Promise.all([
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ])
    if (txRes.data) setTransactions(txRes.data as Transaction[])
    if (usersRes.data) setUsers(usersRes.data as User[])
    setLoading(false)
  }

  async function approveTransaction(tx: Transaction) {
    await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id)

    if (tx.type === 'deposit') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) {
        await supabase.from('profiles').update({ balance: (profile.balance ?? 0) + tx.amount }).eq('id', tx.user_id)
      }
      await supabase.from('notifications').insert({
        user_id: tx.user_id, title: '✅ Deposit Approved',
        message: `Your deposit of $${tx.amount} has been approved and added to your balance.`,
        type: 'success', is_broadcast: false, read: false,
      })
    } else if (tx.type === 'withdrawal') {
      await supabase.from('notifications').insert({
        user_id: tx.user_id, title: '✅ Withdrawal Approved',
        message: `Your withdrawal of $${tx.amount} has been approved and is being processed.`,
        type: 'success', is_broadcast: false, read: false,
      })
    }
    fetchAll()
  }

  async function rejectTransaction(tx: Transaction) {
    await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id)

    if (tx.type === 'withdrawal') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) {
        await supabase.from('profiles').update({ balance: (profile.balance ?? 0) + tx.amount }).eq('id', tx.user_id)
      }
    }

    await supabase.from('notifications').insert({
      user_id: tx.user_id, title: '❌ Request Rejected',
      message: `Your ${tx.type} request of $${tx.amount} was rejected. Contact support for details.`,
      type: 'alert', is_broadcast: false, read: false,
    })
    fetchAll()
  }

  async function sendNotification() {
    if (!notifTitle || !notifMessage) return
    setSending(true)
    const isBroadcast = notifTarget === 'all'
    await supabase.from('notifications').insert({
      user_id: isBroadcast ? null : notifTarget,
      title: notifTitle, message: notifMessage,
      type: notifType, is_broadcast: isBroadcast, read: false,
    })
    setSending(false)
    setNotifSuccess(true)
    setNotifTitle(''); setNotifMessage('')
    setTimeout(() => setNotifSuccess(false), 3000)
  }

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending')
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending')
  const totalBalance = users.reduce((s, u) => s + (u.balance ?? 0), 0)
  const totalInvested = users.reduce((s, u) => s + (u.total_invested ?? 0), 0)

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'OVERVIEW' },
    { key: 'deposits', label: 'DEPOSITS', badge: pendingDeposits.length },
    { key: 'withdrawals', label: 'WITHDRAWALS', badge: pendingWithdrawals.length },
    { key: 'users', label: 'USERS' },
    { key: 'notify', label: 'NOTIFY' },
  ]

  function getUserName(userId: string) {
    return users.find(u => u.id === userId)?.full_name ?? 'Unknown'
  }

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#f87171' }}>ADMIN PANEL</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Logged in as {user?.email}</p>
        </div>
        <button onClick={fetchAll} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', cursor: 'pointer', color: '#e8eaf0' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 14px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            background: tab === t.key ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${tab === t.key ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: tab === t.key ? '#f87171' : 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-display)', fontSize: '0.85rem', position: 'relative'
          }}>
            {t.label}
            {(t.badge ?? 0) > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#f87171', color: '#050810', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading data...</div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'TOTAL USERS', value: users.length, icon: <Users size={18} color="#60a5fa" />, color: '#60a5fa' },
                  { label: 'PENDING OPS', value: pendingDeposits.length + pendingWithdrawals.length, icon: <Bell size={18} color="#f5c842" />, color: '#f5c842' },
                  { label: 'TOTAL BALANCES', value: `$${totalBalance.toFixed(0)}`, icon: <DollarSign size={18} color="#4ade80" />, color: '#4ade80' },
                  { label: 'TOTAL INVESTED', value: `$${totalInvested.toFixed(0)}`, icon: <TrendingUp size={18} color="#f87171" />, color: '#f87171' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>{s.label}</span>
                      {s.icon}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 12 }}>PENDING ACTIONS</h3>
                {pendingDeposits.length === 0 && pendingWithdrawals.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>✅ All clear! No pending requests.</p>
                ) : (
                  <>
                    {pendingDeposits.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#4ade80' }}>+ Deposit ${tx.amount}</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingWithdrawals.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#f87171' }}>- Withdrawal ${tx.amount}</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* DEPOSITS */}
          {tab === 'deposits' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: 'var(--font-display)', color: '#e8eaf0' }}>ALL DEPOSITS</span>
              </div>
              {transactions.filter(t => t.type === 'deposit').length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No deposits yet</div>
              ) : transactions.filter(t => t.type === 'deposit').map((tx, i, arr) => (
                <div key={tx.id} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600 }}>${tx.amount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '3px 10px', borderRadius: 100,
                        background: tx.status === 'approved' ? 'rgba(74,222,128,0.15)' : tx.status === 'rejected' ? 'rgba(248,113,113,0.15)' : 'rgba(245,200,66,0.15)',
                        color: tx.status === 'approved' ? '#4ade80' : tx.status === 'rejected' ? '#f87171' : '#f5c842',
                        border: `1px solid ${tx.status === 'approved' ? 'rgba(74,222,128,0.3)' : tx.status === 'rejected' ? 'rgba(248,113,113,0.3)' : 'rgba(245,200,66,0.3)'}`,
                      }}>{tx.status.toUpperCase()}</span>
                      {tx.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#4ade80', fontSize: '0.72rem' }}>✓ Approve</button>
                          <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#f87171', fontSize: '0.72rem' }}>✗ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {tx.proof_url && (
                    <a href={tx.proof_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'block', marginTop: 6 }}>View payment proof ↗</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* WITHDRAWALS */}
          {tab === 'withdrawals' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: 'var(--font-display)', color: '#e8eaf0' }}>ALL WITHDRAWALS</span>
              </div>
              {transactions.filter(t => t.type === 'withdrawal').length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No withdrawals yet</div>
              ) : transactions.filter(t => t.type === 'withdrawal').map((tx, i, arr) => (
                <div key={tx.id} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>${tx.amount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{tx.description?.split('|')[1] ?? ''}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '3px 10px', borderRadius: 100,
                        background: tx.status === 'approved' ? 'rgba(74,222,128,0.15)' : tx.status === 'rejected' ? 'rgba(248,113,113,0.15)' : 'rgba(245,200,66,0.15)',
                        color: tx.status === 'approved' ? '#4ade80' : tx.status === 'rejected' ? '#f87171' : '#f5c842',
                        border: `1px solid ${tx.status === 'approved' ? 'rgba(74,222,128,0.3)' : tx.status === 'rejected' ? 'rgba(248,113,113,0.3)' : 'rgba(245,200,66,0.3)'}`,
                      }}>{tx.status.toUpperCase()}</span>
                      {tx.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#4ade80', fontSize: '0.72rem' }}>✓ Approve</button>
                          <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#f87171', fontSize: '0.72rem' }}>✗ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input className="input-field" type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: 40 }} />
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                {filteredUsers.map((u, i, arr) => (
                  <div key={u.id} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#e8eaf0', fontWeight: 500 }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{u.email}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Joined {new Date(u.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>${(u.balance ?? 0).toFixed(2)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>balance</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFY */}
          {tab === 'notify' && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#e8eaf0', marginBottom: 20 }}>SEND NOTIFICATION</h3>

              {notifSuccess && (
                <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#4ade80', fontSize: '0.85rem', textAlign: 'center' }}>
                  ✅ Notification sent successfully!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>SEND TO</label>
                  <select className="input-field" value={notifTarget} onChange={e => setNotifTarget(e.target.value)} style={{ cursor: 'pointer' }}>
                    <option value="all">📢 All Users (Broadcast)</option>
                    {users.filter(u => u.email !== 'admin@bigearn.com').map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>TYPE</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['info', 'success', 'warning', 'alert'] as const).map(t => (
                      <button key={t} onClick={() => setNotifType(t)} style={{
                        flex: 1, padding: '10px 6px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                        background: notifType === t ? (t === 'success' ? 'rgba(74,222,128,0.2)' : t === 'warning' ? 'rgba(245,200,66,0.2)' : t === 'alert' ? 'rgba(248,113,113,0.2)' : 'rgba(96,165,250,0.2)') : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${notifType === t ? (t === 'success' ? 'rgba(74,222,128,0.5)' : t === 'warning' ? 'rgba(245,200,66,0.5)' : t === 'alert' ? 'rgba(248,113,113,0.5)' : 'rgba(96,165,250,0.5)') : 'rgba(255,255,255,0.08)'}`,
                        color: notifType === t ? (t === 'success' ? '#4ade80' : t === 'warning' ? '#f5c842' : t === 'alert' ? '#f87171' : '#60a5fa') : 'rgba(255,255,255,0.5)',
                        textTransform: 'capitalize'
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>TITLE</label>
                  <input className="input-field" type="text" placeholder="Notification title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>MESSAGE</label>
                  <textarea className="input-field" placeholder="Write your message..." value={notifMessage} onChange={e => setNotifMessage(e.target.value)} rows={4} style={{ resize: 'none' }} />
                </div>

                <button className="btn-gold" onClick={sendNotification} disabled={sending || !notifTitle || !notifMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (sending || !notifTitle || !notifMessage) ? 0.6 : 1 }}>
                  <Send size={16} /> {sending ? 'SENDING...' : 'SEND NOTIFICATION'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
