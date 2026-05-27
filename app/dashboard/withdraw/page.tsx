'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowUpCircle, CheckCircle, AlertTriangle } from 'lucide-react'

const NETWORKS = [
  { name: 'Bitcoin (BTC)', symbol: '₿', color: '#f7931a' },
  { name: 'USDT (TRC20)', symbol: '₮', color: '#26a17b' },
  { name: 'Ethereum (ETH)', symbol: 'Ξ', color: '#627eea' },
]

export default function WithdrawPage() {
  const { user, refreshUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const balance = user?.balance ?? 0
  const MIN_WITHDRAW = 20

  async function handleSubmit() {
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt)) { setError('Enter a valid amount'); return }
    if (amt < MIN_WITHDRAW) { setError(`Minimum withdrawal is $${MIN_WITHDRAW}`); return }
    if (amt > balance) { setError('Insufficient balance'); return }
    if (!address.trim()) { setError('Enter your wallet address'); return }
    if (!user) return

    setSubmitting(true); setError('')

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: amt,
      status: 'pending',
      description: `Withdrawal to ${NETWORKS[selectedNetwork].name} | Address: ${address}`,
    })

    if (txError) { setError('Failed to submit. Please try again.'); setSubmitting(false); return }

    // Deduct from balance
    await supabase.from('profiles').update({ balance: balance - amt }).eq('id', user.id)

    // Notify admin
    await supabase.from('notifications').insert({
      user_id: null,
      title: '💸 New Withdrawal Request',
      message: `${user.full_name} requested $${amt} withdrawal to ${NETWORKS[selectedNetwork].name}`,
      type: 'warning',
      is_broadcast: false,
    })

    await refreshUser()
    setSuccess(true)
    setSubmitting(false)
  }

  if (success) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle size={36} color="#f5c842" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f5c842', marginBottom: 10 }}>REQUEST SUBMITTED!</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
        Your withdrawal of <strong style={{ color: '#f5c842' }}>${amount}</strong> is being processed. 
        Funds will arrive within 24 hours after admin approval.
      </p>
      <button className="btn-gold" onClick={() => { setSuccess(false); setAmount(''); setAddress('') }}>
        NEW WITHDRAWAL
      </button>
    </div>
  )

  return (
    <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <ArrowUpCircle size={22} color="#f87171" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#e8eaf0' }}>WITHDRAW FUNDS</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Request a withdrawal to your crypto wallet</p>
      </div>

      {/* Balance display */}
      <div style={{ background: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(248,113,113,0.03))', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: '0.1em' }}>AVAILABLE BALANCE</p>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#f5c842' }}>
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Min withdrawal: ${MIN_WITHDRAW}</p>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14, letterSpacing: '0.08em' }}>SELECT NETWORK</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          {NETWORKS.map((n, i) => (
            <button key={i} onClick={() => setSelectedNetwork(i)} style={{
              flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
              background: selectedNetwork === i ? `${n.color}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedNetwork === i ? n.color + '60' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
            }}>
              <span style={{ fontSize: '1.3rem', color: n.color }}>{n.symbol}</span>
              <span style={{ fontSize: '0.65rem', color: selectedNetwork === i ? '#e8eaf0' : 'rgba(255,255,255,0.4)' }}>
                {n.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>AMOUNT (USD)</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingRight: 80 }} />
              <button onClick={() => setAmount(balance.toFixed(2))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', color: '#f5c842', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>
                MAX
              </button>
            </div>
            {amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                You will receive ≈ ${(parseFloat(amount) * 0.98).toFixed(2)} (2% fee)
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, display: 'block' }}>
              YOUR {NETWORKS[selectedNetwork].name.toUpperCase()} ADDRESS
            </label>
            <input className="input-field" type="text" placeholder="Paste your wallet address" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        </div>

        {/* Warning */}
        <div style={{ marginTop: 16, background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, padding: '12px', display: 'flex', gap: 10 }}>
          <AlertTriangle size={16} color="#f5c842" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Double-check your wallet address. Transactions cannot be reversed once processed.
          </p>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: 12, padding: '10px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>{error}</div>}

        <button className="btn-gold" onClick={handleSubmit} disabled={submitting || balance < MIN_WITHDRAW} style={{ width: '100%', marginTop: 20, opacity: (submitting || balance < MIN_WITHDRAW) ? 0.6 : 1 }}>
          {submitting ? 'SUBMITTING...' : balance < MIN_WITHDRAW ? `MIN BALANCE $${MIN_WITHDRAW} REQUIRED` : 'REQUEST WITHDRAWAL'}
        </button>
      </div>
    </div>
  )
}
