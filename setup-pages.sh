#!/bin/bash
cd ~/bigearn-app/bigearn
mkdir -p app/dashboard/admin app/dashboard/deposit app/dashboard/invest

# Write admin page
cat > app/dashboard/admin/page.tsx << 'EOF'
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Transaction, User } from '@/lib/supabase'
import { CheckCircle, XCircle, Send, Users, DollarSign, TrendingUp, Bell, RefreshCw, Search, Settings, Save } from 'lucide-react'
type Tab = 'overview' | 'deposits' | 'withdrawals' | 'users' | 'notify' | 'settings'
type Plan = { name: string; roi: number; duration: number; min: number; max: number }
export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState<'info'|'success'|'warning'|'alert'>('info')
  const [notifTarget, setNotifTarget] = useState<string>('all')
  const [sending, setSending] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)
  const [wallets, setWallets] = useState({ btc: '', usdt: '', eth: '' })
  const [plans, setPlans] = useState<{ [key: string]: Plan }>({
    plan_starter: { name: 'STARTER', roi: 5, duration: 7, min: 50, max: 499 },
    plan_growth: { name: 'GROWTH', roi: 12, duration: 14, min: 200, max: 1999 },
    plan_elite: { name: 'ELITE', roi: 25, duration: 30, min: 1000, max: 50000 },
    plan_vip: { name: 'VIP PRO', roi: 40, duration: 60, min: 5000, max: 100000 },
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  useEffect(() => {
    if (!isAdmin) { router.push('/dashboard/main'); return }
    fetchAll(); fetchSettings()
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
  async function fetchSettings() {
    const { data } = await supabase.from('site_settings').select('*')
    if (!data) return
    const map: any = {}
    data.forEach((row: any) => { map[row.key] = row.value })
    setWallets({ btc: map['wallet_btc']??'', usdt: map['wallet_usdt']??'', eth: map['wallet_eth']??'' })
    const newPlans = { ...plans }
    for (const key of ['plan_starter','plan_growth','plan_elite','plan_vip']) {
      if (map[key]) { try { newPlans[key] = JSON.parse(map[key]) } catch {} }
    }
    setPlans(newPlans)
  }
  async function saveSettings() {
    setSavingSettings(true)
    const updates = [
      { key: 'wallet_btc', value: wallets.btc, updated_at: new Date().toISOString() },
      { key: 'wallet_usdt', value: wallets.usdt, updated_at: new Date().toISOString() },
      { key: 'wallet_eth', value: wallets.eth, updated_at: new Date().toISOString() },
      ...Object.entries(plans).map(([key, plan]) => ({ key, value: JSON.stringify(plan), updated_at: new Date().toISOString() })),
    ]
    for (const update of updates) { await supabase.from('site_settings').upsert(update, { onConflict: 'key' }) }
    setSavingSettings(false); setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }
  function updatePlan(key: string, field: keyof Plan, value: string | number) {
    setPlans(prev => ({ ...prev, [key]: { ...prev[key], [field]: typeof value === 'string' ? value : Number(value) } }))
  }
  async function approveTransaction(tx: Transaction) {
    await supabase.from('transactions').update({ status: 'approved' }).eq('id', tx.id)
    if (tx.type === 'deposit') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) await supabase.from('profiles').update({ balance: (profile.balance??0) + tx.amount }).eq('id', tx.user_id)
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Deposit Approved', message: `Your deposit of $${tx.amount} has been approved.`, type: 'success', is_broadcast: false, read: false })
    } else if (tx.type === 'withdrawal') {
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Withdrawal Approved', message: `Your withdrawal of $${tx.amount} is being processed.`, type: 'success', is_broadcast: false, read: false })
    }
    fetchAll()
  }
  async function rejectTransaction(tx: Transaction) {
    await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id)
    if (tx.type === 'withdrawal') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) await supabase.from('profiles').update({ balance: (profile.balance??0) + tx.amount }).eq('id', tx.user_id)
    }
    await supabase.from('notifications').insert({ user_id: tx.user_id, title: '❌ Request Rejected', message: `Your ${tx.type} of $${tx.amount} was rejected.`, type: 'alert', is_broadcast: false, read: false })
    fetchAll()
  }
  async function sendNotification() {
    if (!notifTitle || !notifMessage) return
    setSending(true)
    const isBroadcast = notifTarget === 'all'
    await supabase.from('notifications').insert({ user_id: isBroadcast ? null : notifTarget, title: notifTitle, message: notifMessage, type: notifType, is_broadcast: isBroadcast, read: false })
    setSending(false); setNotifSuccess(true); setNotifTitle(''); setNotifMessage('')
    setTimeout(() => setNotifSuccess(false), 3000)
  }
  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending')
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending')
  const totalBalance = users.reduce((s, u) => s + (u.balance??0), 0)
  const totalInvested = users.reduce((s, u) => s + (u.total_invested??0), 0)
  const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  function getUserName(userId: string) { return users.find(u => u.id === userId)?.full_name ?? 'Unknown' }
  const planColors: any = { plan_starter: '#4ade80', plan_growth: '#f5c842', plan_elite: '#f87171', plan_vip: '#c084fc' }
  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'OVERVIEW' },
    { key: 'deposits', label: 'DEPOSITS', badge: pendingDeposits.length },
    { key: 'withdrawals', label: 'WITHDRAWS', badge: pendingWithdrawals.length },
    { key: 'users', label: 'USERS' },
    { key: 'notify', label: 'NOTIFY' },
    { key: 'settings', label: 'SETTINGS' },
  ]
  return (
    <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#f87171' }}>ADMIN PANEL</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
        </div>
        <button onClick={fetchAll} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', cursor: 'pointer', color: '#e8eaf0' }}><RefreshCw size={16} /></button>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: tab === t.key ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${tab === t.key ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)'}`, color: tab === t.key ? '#f87171' : 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', position: 'relative' }}>
            {t.label}
            {(t.badge??0) > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#f87171', color: '#050810', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>}
          </button>
        ))}
      </div>
      {loading && tab !== 'settings' ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div> : <>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ label: 'TOTAL USERS', value: users.length, color: '#60a5fa' }, { label: 'PENDING OPS', value: pendingDeposits.length + pendingWithdrawals.length, color: '#f5c842' }, { label: 'TOTAL BALANCES', value: `$${totalBalance.toFixed(0)}`, color: '#4ade80' }, { label: 'TOTAL INVESTED', value: `$${totalInvested.toFixed(0)}`, color: '#f87171' }].map((s, i) => (
                <div key={i} className="card" style={{ padding: '16px' }}>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{s.label}</p>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 12 }}>PENDING ACTIONS</h3>
              {pendingDeposits.length === 0 && pendingWithdrawals.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>✅ No pending requests</p> :
                [...pendingDeposits, ...pendingWithdrawals].map(tx => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: tx.type === 'deposit' ? '#4ade80' : '#f87171' }}>{tx.type === 'deposit' ? '+' : '-'} ${tx.amount} {tx.type}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#4ade80', fontSize: '0.78rem' }}>✓</button>
                      <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#f87171', fontSize: '0.78rem' }}>✗</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {tab === 'deposits' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><span style={{ fontFamily: 'var(--font-display)', color: '#e8eaf0' }}>ALL DEPOSITS</span></div>
            {transactions.filter(t => t.type === 'deposit').length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No deposits yet</div> :
              transactions.filter(t => t.type === 'deposit').map((tx, i, arr) => (
                <div key={tx.id} style={{ padding: '14px 16px', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600 }}>${tx.amount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 100, background: tx.status==='approved'?'rgba(74,222,128,0.15)':tx.status==='rejected'?'rgba(248,113,113,0.15)':'rgba(245,200,66,0.15)', color: tx.status==='approved'?'#4ade80':tx.status==='rejected'?'#f87171':'#f5c842', border: `1px solid ${tx.status==='approved'?'rgba(74,222,128,0.3)':tx.status==='rejected'?'rgba(248,113,113,0.3)':'rgba(245,200,66,0.3)'}` }}>{tx.status.toUpperCase()}</span>
                      {tx.status === 'pending' && <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#4ade80', fontSize: '0.72rem' }}>✓ Approve</button>
                        <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#f87171', fontSize: '0.72rem' }}>✗ Reject</button>
                      </div>}
                    </div>
                  </div>
                  {tx.proof_url && <a href={tx.proof_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'block', marginTop: 6 }}>View proof ↗</a>}
                </div>
              ))}
          </div>
        )}
        {tab === 'withdrawals' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}><span style={{ fontFamily: 'var(--font-display)', color: '#e8eaf0' }}>ALL WITHDRAWALS</span></div>
            {transactions.filter(t => t.type === 'withdrawal').length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No withdrawals yet</div> :
              transactions.filter(t => t.type === 'withdrawal').map((tx, i, arr) => (
                <div key={tx.id} style={{ padding: '14px 16px', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>${tx.amount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{getUserName(tx.user_id)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 100, background: tx.status==='approved'?'rgba(74,222,128,0.15)':tx.status==='rejected'?'rgba(248,113,113,0.15)':'rgba(245,200,66,0.15)', color: tx.status==='approved'?'#4ade80':tx.status==='rejected'?'#f87171':'#f5c842', border: `1px solid ${tx.status==='approved'?'rgba(74,222,128,0.3)':tx.status==='rejected'?'rgba(248,113,113,0.3)':'rgba(245,200,66,0.3)'}` }}>{tx.status.toUpperCase()}</span>
                      {tx.status === 'pending' && <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => approveTransaction(tx)} style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#4ade80', fontSize: '0.72rem' }}>✓ Approve</button>
                        <button onClick={() => rejectTransaction(tx)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#f87171', fontSize: '0.72rem' }}>✗ Reject</button>
                      </div>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        {tab === 'users' && (
          <div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input className="input-field" type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: 40 }} />
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {filteredUsers.map((u, i, arr) => (
                <div key={u.id} style={{ padding: '14px 16px', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#e8eaf0', fontWeight: 500 }}>{u.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f5c842', fontWeight: 600 }}>${(u.balance??0).toFixed(2)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>balance</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'notify' && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#e8eaf0', marginBottom: 20 }}>SEND NOTIFICATION</h3>
            {notifSuccess && <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#4ade80', fontSize: '0.85rem', textAlign: 'center' }}>✅ Notification sent!</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>SEND TO</label>
                <select className="input-field" value={notifTarget} onChange={e => setNotifTarget(e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="all">📢 All Users (Broadcast)</option>
                  {users.filter(u => u.email !== 'admin@bigearn.com').map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>TYPE</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['info','success','warning','alert'] as const).map(t => (
                    <button key={t} onClick={() => setNotifType(t)} style={{ flex: 1, padding: '10px 6px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', background: notifType===t?(t==='success'?'rgba(74,222,128,0.2)':t==='warning'?'rgba(245,200,66,0.2)':t==='alert'?'rgba(248,113,113,0.2)':'rgba(96,165,250,0.2)'):'rgba(255,255,255,0.04)', border: `1px solid ${notifType===t?(t==='success'?'rgba(74,222,128,0.5)':t==='warning'?'rgba(245,200,66,0.5)':t==='alert'?'rgba(248,113,113,0.5)':'rgba(96,165,250,0.5)'):'rgba(255,255,255,0.08)'}`, color: notifType===t?(t==='success'?'#4ade80':t==='warning'?'#f5c842':t==='alert'?'#f87171':'#60a5fa'):'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{t}</button>
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
              <button className="btn-gold" onClick={sendNotification} disabled={sending||!notifTitle||!notifMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (sending||!notifTitle||!notifMessage)?0.6:1 }}>
                <Send size={16} /> {sending ? 'SENDING...' : 'SEND NOTIFICATION'}
              </button>
            </div>
          </div>
        )}
        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {settingsSaved && <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px', color: '#4ade80', fontSize: '0.85rem', textAlign: 'center' }}>✅ Settings saved!</div>}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 16 }}>💳 WALLET ADDRESSES</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[{ label: '₿ BITCOIN (BTC)', key: 'btc' as const }, { label: '₮ USDT (TRC20)', key: 'usdt' as const }, { label: 'Ξ ETHEREUM (ETH)', key: 'eth' as const }].map(w => (
                  <div key={w.key}>
                    <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>{w.label}</label>
                    <input className="input-field" type="text" value={wallets[w.key]} onChange={e => setWallets(prev => ({ ...prev, [w.key]: e.target.value }))} placeholder="Paste wallet address" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8eaf0', marginBottom: 16 }}>📈 INVESTMENT PLANS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {Object.entries(plans).map(([key, plan]) => (
                  <div key={key} style={{ padding: '16px', background: `${planColors[key]}10`, border: `1px solid ${planColors[key]}30`, borderRadius: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: planColors[key], marginBottom: 12 }}>{plan.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>ROI (%)</label>
                        <input className="input-field" type="number" value={plan.roi} onChange={e => updatePlan(key, 'roi', e.target.value)} style={{ padding: '10px 12px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>DURATION (days)</label>
                        <input className="input-field" type="number" value={plan.duration} onChange={e => updatePlan(key, 'duration', e.target.value)} style={{ padding: '10px 12px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>MIN ($)</label>
                        <input className="input-field" type="number" value={plan.min} onChange={e => updatePlan(key, 'min', e.target.value)} style={{ padding: '10px 12px', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>MAX ($)</label>
                        <input className="input-field" type="number" value={plan.max} onChange={e => updatePlan(key, 'max', e.target.value)} style={{ padding: '10px 12px', fontSize: '0.9rem' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-gold" onClick={saveSettings} disabled={savingSettings} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: savingSettings?0.7:1, fontSize: '1rem' }}>
              <Save size={18} /> {savingSettings ? 'SAVING...' : 'SAVE ALL SETTINGS'}
            </button>
          </div>
        )}
      </>}
    </div>
  )
}
EOF

echo "✅ Admin page written"

# Write deposit page
cat > app/dashboard/deposit/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowDownCircle, Copy, CheckCircle, Upload, Info } from 'lucide-react'
type Wallet = { name: string; address: string; symbol: string; color: string }
export default function DepositPage() {
  const { user, refreshUser } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([
    { name: 'Bitcoin (BTC)', address: '', symbol: '₿', color: '#f7931a' },
    { name: 'USDT (TRC20)', address: '', symbol: '₮', color: '#26a17b' },
    { name: 'Ethereum (ETH)', address: '', symbol: 'Ξ', color: '#627eea' },
  ])
  const [amount, setAmount] = useState('')
  const [selectedWallet, setSelectedWallet] = useState(0)
  const [copied, setCopied] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [txHash, setTxHash] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    supabase.from('site_settings').select('*').in('key', ['wallet_btc','wallet_usdt','wallet_eth']).then(({ data }) => {
      if (!data) return
      const map: any = {}
      data.forEach((r: any) => { map[r.key] = r.value })
      setWallets([
        { name: 'Bitcoin (BTC)', address: map['wallet_btc']??'', symbol: '₿', color: '#f7931a' },
        { name: 'USDT (TRC20)', address: map['wallet_usdt']??'', symbol: '₮', color: '#26a17b' },
        { name: 'Ethereum (ETH)', address: map['wallet_eth']??'', symbol: 'Ξ', color: '#627eea' },
      ])
    })
  }, [])
  function copyAddress() { navigator.clipboard.writeText(wallets[selectedWallet].address); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  async function handleSubmit() {
    if (!amount || parseFloat(amount) < 10) { setError('Minimum deposit is $10'); return }
    if (!user) return
    setSubmitting(true); setError('')
    let proofUrl = ''
    if (proofFile) {
      const ext = proofFile.name.split('.').pop()
      const filename = `${user.id}/${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('proofs').upload(filename, proofFile)
      if (data) { const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(filename); proofUrl = urlData.publicUrl }
    }
    const { error: txError } = await supabase.from('transactions').insert({ user_id: user.id, type: 'deposit', amount: parseFloat(amount), status: 'pending', description: `Deposit via ${wallets[selectedWallet].name}${txHash ? ` | TX: ${txHash}` : ''}`, proof_url: proofUrl || null })
    if (txError) { setError('Failed to submit. Please try again.'); setSubmitting(false); return }
    await supabase.from('notifications').insert({ user_id: null, title: '💰 New Deposit Request', message: `${user.full_name} requested a deposit of $${amount}`, type: 'info', is_broadcast: false })
    await refreshUser(); setSuccess(true); setSubmitting(false)
  }
  if (success) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle size={36} color="#4ade80" /></div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#4ade80', marginBottom: 10 }}>DEPOSIT SUBMITTED!</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>Your deposit of <strong style={{ color: '#f5c842' }}>${amount}</strong> is under review. Balance updates within 24 hours.</p>
      <button className="btn-gold" onClick={() => { setSuccess(false); setAmount(''); setTxHash(''); setProofFile(null) }}>MAKE ANOTHER DEPOSIT</button>
    </div>
  )
  return (
    <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}><ArrowDownCircle size={22} color="#4ade80" /><h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#e8eaf0' }}>DEPOSIT FUNDS</h1></div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Send crypto to add funds to your account</p>
      </div>
      <div style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
        <Info size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>Send crypto below, then submit the form. Admin verifies and credits your account within 24 hours.</p>
      </div>
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14, letterSpacing: '0.08em' }}>STEP 1 — SELECT NETWORK</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {wallets.map((w, i) => (
            <button key={i} onClick={() => setSelectedWallet(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: selectedWallet===i?`${w.color}15`:'rgba(255,255,255,0.03)', border: `1px solid ${selectedWallet===i?w.color+'60':'rgba(255,255,255,0.08)'}`, borderRadius: 12, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${w.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: w.color }}>{w.symbol}</div>
              <span style={{ color: selectedWallet===i?'#e8eaf0':'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '0.9rem' }}>{w.name}</span>
              {selectedWallet===i && <CheckCircle size={16} color={w.color} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14, letterSpacing: '0.08em' }}>STEP 2 — SEND TO ADDRESS</h3>
        {wallets[selectedWallet].address ? <>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, padding: '14px 16px', wordBreak: 'break-all', fontSize: '0.85rem', color: '#f5c842', lineHeight: 1.6, marginBottom: 12 }}>{wallets[selectedWallet].address}</div>
          <button onClick={copyAddress} className="btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}>
            {copied ? <><CheckCircle size={16} color="#4ade80" /><span style={{ color: '#4ade80' }}>COPIED!</span></> : <><Copy size={16} />COPY ADDRESS</>}
          </button>
        </> : <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Wallet address not set yet. Contact admin.</div>}
      </div>
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14, letterSpacing: '0.08em' }}>STEP 3 — CONFIRM PAYMENT</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>AMOUNT (USD)</label>
            <input className="input-field" type="number" placeholder="e.g. 100" value={amount} onChange={e => setAmount(e.target.value)} min="10" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>TRANSACTION HASH (optional)</label>
            <input className="input-field" type="text" placeholder="Paste TX hash here" value={txHash} onChange={e => setTxHash(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>PAYMENT SCREENSHOT (optional)</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(245,200,66,0.25)', borderRadius: 10, cursor: 'pointer' }}>
              <Upload size={18} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: '0.85rem', color: proofFile?'#f5c842':'rgba(255,255,255,0.35)' }}>{proofFile ? proofFile.name : 'Tap to upload proof'}</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>
        {error && <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: 12, padding: '10px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>{error}</div>}
        <button className="btn-gold" onClick={handleSubmit} disabled={submitting} style={{ width: '100%', marginTop: 20, opacity: submitting?0.7:1 }}>{submitting ? 'SUBMITTING...' : 'SUBMIT DEPOSIT'}</button>
      </div>
    </div>
  )
}
EOF

echo "✅ Deposit page written"

# Write invest page
cat > app/dashboard/invest/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { TrendingUp, CheckCircle, Zap, Clock, Shield } from 'lucide-react'
type Plan = { id: string; name: string; roi: number; duration: number; min: number; max: number; color: string; icon: string; popular?: boolean }
const PLAN_META: any = { plan_starter: { color: '#4ade80', icon: '🌱' }, plan_growth: { color: '#f5c842', icon: '📈', popular: true }, plan_elite: { color: '#f87171', icon: '👑' }, plan_vip: { color: '#c084fc', icon: '💎' } }
export default function InvestPage() {
  const { user, refreshUser } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const balance = user?.balance ?? 0
  useEffect(() => {
    supabase.from('site_settings').select('*').in('key', ['plan_starter','plan_growth','plan_elite','plan_vip']).then(({ data }) => {
      if (!data) return
      const loaded: Plan[] = []
      for (const key of ['plan_starter','plan_growth','plan_elite','plan_vip']) {
        const row = data.find((r: any) => r.key === key)
        if (row) { try { loaded.push({ id: key, ...JSON.parse(row.value), ...PLAN_META[key] }) } catch {} }
      }
      if (loaded.length > 0) setPlans(loaded)
    })
  }, [])
  function calcReturn(amt: number, roi: number) { return (amt * roi / 100) + amt }
  async function handleInvest() {
    if (!selectedPlan) { setError('Select a plan'); return }
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt)) { setError('Enter a valid amount'); return }
    if (amt < selectedPlan.min) { setError(`Minimum for this plan is $${selectedPlan.min}`); return }
    if (amt > selectedPlan.max) { setError(`Maximum for this plan is $${selectedPlan.max.toLocaleString()}`); return }
    if (amt > balance) { setError('Insufficient balance'); return }
    if (!user) return
    setSubmitting(true); setError('')
    const startDate = new Date(); const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + selectedPlan.duration)
    const { error: invError } = await supabase.from('investments').insert({ user_id: user.id, plan_name: selectedPlan.name, amount: amt, roi_percent: selectedPlan.roi, duration_days: selectedPlan.duration, status: 'active', start_date: startDate.toISOString(), end_date: endDate.toISOString(), returns_earned: 0 })
    if (invError) { setError('Failed to invest. Please try again.'); setSubmitting(false); return }
    await supabase.from('profiles').update({ balance: balance - amt, total_invested: (user.total_invested??0) + amt }).eq('id', user.id)
    await supabase.from('transactions').insert({ user_id: user.id, type: 'investment', amount: amt, status: 'approved', description: `${selectedPlan.name} plan investment` })
    await refreshUser(); setSuccess(true); setSubmitting(false)
  }
  if (success) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle size={36} color="#4ade80" /></div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#4ade80', marginBottom: 10 }}>INVESTMENT ACTIVE!</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 8 }}>Your <strong style={{ color: '#f5c842' }}>${amount}</strong> is now in the <strong style={{ color: '#f5c842' }}>{selectedPlan?.name}</strong> plan.</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 24 }}>Expected return: <strong style={{ color: '#4ade80' }}>${calcReturn(parseFloat(amount), selectedPlan?.roi??0).toFixed(2)}</strong> in {selectedPlan?.duration} days</p>
      <button className="btn-gold" onClick={() => { setSuccess(false); setAmount(''); setSelectedPlan(null) }}>INVEST MORE</button>
    </div>
  )
  return (
    <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}><TrendingUp size={22} color="#f5c842" /><h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#e8eaf0' }}>INVEST NOW</h1></div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Choose a plan and grow your crypto</p>
      </div>
      <div style={{ background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 12, padding: '16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>AVAILABLE</p>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#f5c842' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ icon: <Zap size={14} color="#f5c842" />, text: 'Instant' }, { icon: <Shield size={14} color="#4ade80" />, text: 'Secured' }, { icon: <Clock size={14} color="#60a5fa" />, text: '24/7' }].map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>{f.icon}<span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>{f.text}</span></div>
          ))}
        </div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14, letterSpacing: '0.08em' }}>SELECT INVESTMENT PLAN</h3>
      {plans.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>Loading plans...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {plans.map(plan => (
            <button key={plan.id} onClick={() => { setSelectedPlan(plan); setAmount(String(plan.min)) }} style={{ width: '100%', textAlign: 'left', padding: '18px', borderRadius: 14, cursor: 'pointer', background: selectedPlan?.id===plan.id?`${plan.color}12`:'rgba(10,15,30,0.8)', border: `1px solid ${selectedPlan?.id===plan.id?plan.color+'60':'rgba(255,255,255,0.08)'}`, position: 'relative', overflow: 'hidden' }}>
              {plan.popular && <div style={{ position: 'absolute', top: 10, right: 10, background: '#f5c842', color: '#050810', fontSize: '0.65rem', fontFamily: 'var(--font-display)', padding: '3px 10px', borderRadius: 100 }}>POPULAR</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>{plan.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: plan.color }}>{plan.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>${plan.min.toLocaleString()} – ${plan.max.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: plan.color, lineHeight: 1 }}>{plan.roi}%</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>in {plan.duration} days</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {selectedPlan && (
        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16, letterSpacing: '0.08em' }}>INVEST IN {selectedPlan.name}</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>AMOUNT (USD)</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type="number" placeholder={`Min $${selectedPlan.min}`} value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingRight: 80 }} />
              <button onClick={() => setAmount(Math.min(balance, selectedPlan.max).toFixed(2))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', color: '#f5c842', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>MAX</button>
            </div>
          </div>
          {amount && parseFloat(amount) >= selectedPlan.min && (
            <div style={{ background: `${selectedPlan.color}10`, border: `1px solid ${selectedPlan.color}30`, borderRadius: 10, padding: '14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Investment</span><span style={{ fontSize: '0.9rem', color: '#e8eaf0', fontWeight: 600 }}>${parseFloat(amount).toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>ROI ({selectedPlan.roi}%)</span><span style={{ fontSize: '0.9rem', color: selectedPlan.color, fontWeight: 600 }}>+${(parseFloat(amount) * selectedPlan.roi / 100).toFixed(2)}</span></div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Return</span><span style={{ fontSize: '1rem', color: '#4ade80', fontWeight: 700 }}>${calcReturn(parseFloat(amount), selectedPlan.roi).toFixed(2)}</span></div>
              <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Returns after {selectedPlan.duration} days</div>
            </div>
          )}
          {error && <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: 12, padding: '10px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>{error}</div>}
          <button className="btn-gold" onClick={handleInvest} disabled={submitting||!amount} style={{ width: '100%', opacity: (submitting||!amount)?0.7:1 }}>{submitting ? 'PROCESSING...' : `INVEST $${amount||'0'} IN ${selectedPlan.name}`}</button>
        </div>
      )}
    </div>
  )
}
EOF

echo "✅ Invest page written"

git add . && git commit -m "settings tab, live wallets and plans from db" && git push

echo "🚀 All done! Check Vercel for deployment."
