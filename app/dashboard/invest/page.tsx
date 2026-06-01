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
