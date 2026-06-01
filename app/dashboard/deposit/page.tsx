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
