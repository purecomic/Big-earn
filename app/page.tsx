'use client'

import Link from 'next/link'
import { TrendingUp, Shield, Zap, ChevronRight, Star, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const plans = [
    { name: 'STARTER', roi: '5%', duration: '7 days', min: '$50', color: '#4ade80' },
    { name: 'GROWTH', roi: '12%', duration: '14 days', min: '$200', color: '#f5c842', popular: true },
    { name: 'ELITE', roi: '25%', duration: '30 days', min: '$1000', color: '#f87171' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#050810' }}>
      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(245,200,66,0.1)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(20px)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.1em' }}>
          <span className="gold-text">BIG</span>
          <span style={{ color: '#e8eaf0' }}> EARN</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login">
            <button className="btn-ghost" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>LOGIN</button>
          </Link>
          <Link href="/auth/signup">
            <button className="btn-gold" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>GET STARTED</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '60px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)',
          borderRadius: '100px', padding: '6px 16px', marginBottom: 24,
          fontSize: '0.8rem', color: '#f5c842', fontWeight: 500
        }}>
          <Star size={12} fill="#f5c842" /> TRUSTED BY 10,000+ INVESTORS
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 10vw, 5.5rem)', lineHeight: 0.95, marginBottom: 24 }}>
          <span className="gold-text">MAKE YOUR</span>
          <br />
          <span style={{ color: '#e8eaf0' }}>CRYPTO</span>
          <br />
          <span className="gold-text">WORK FOR YOU</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: 380, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Invest in top crypto strategies and watch your money grow with daily returns, 
          transparent tracking, and instant withdrawals.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup">
            <button className="btn-gold" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              START INVESTING <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="btn-ghost" style={{ fontSize: '1rem' }}>VIEW DASHBOARD</button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, marginTop: 60,
          background: 'rgba(245,200,66,0.1)', borderRadius: 16,
          border: '1px solid rgba(245,200,66,0.15)', overflow: 'hidden'
        }}>
          {[
            { label: 'Total Paid Out', value: '$4.2M+' },
            { label: 'Active Investors', value: '10,000+' },
            { label: 'Avg. ROI', value: '18.5%' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '24px 16px', background: 'rgba(10,15,30,0.8)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#f5c842' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '40px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', textAlign: 'center', marginBottom: 32, color: '#e8eaf0' }}>
          WHY <span className="gold-text">BIG EARN</span>?
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: <TrendingUp size={22} color="#f5c842" />, title: 'Daily Returns', desc: 'Watch your balance grow every single day with our proven crypto strategies.' },
            { icon: <Shield size={22} color="#f5c842" />, title: 'Secure & Transparent', desc: 'Full transaction history, real-time balance updates, and military-grade security.' },
            { icon: <Zap size={22} color="#f5c842" />, title: 'Instant Withdrawals', desc: 'Request a withdrawal anytime. Funds processed within 24 hours, always.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#e8eaf0', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section style={{ padding: '40px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', textAlign: 'center', marginBottom: 8, color: '#e8eaf0' }}>
          INVESTMENT <span className="gold-text">PLANS</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 28 }}>
          Choose a plan that matches your goals
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {plans.map((plan, i) => (
            <div key={i} className="card" style={{
              padding: '24px',
              border: plan.popular ? '1px solid rgba(245,200,66,0.5)' : undefined,
              position: 'relative'
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, right: 20,
                  background: '#f5c842', color: '#050810',
                  fontFamily: 'var(--font-display)', fontSize: '0.75rem',
                  padding: '4px 12px', borderRadius: 100
                }}>POPULAR</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: plan.color }}>{plan.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    Min: {plan.min} · {plan.duration}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: plan.color }}>{plan.roi}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>TOTAL ROI</div>
                </div>
              </div>
              <Link href="/auth/signup">
                <button style={{
                  width: '100%', marginTop: 16, padding: '12px',
                  background: `${plan.color}18`, border: `1px solid ${plan.color}44`,
                  color: plan.color, borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  INVEST NOW <ChevronRight size={16} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '40px 24px 60px' }}>
        <div className="card" style={{
          padding: '36px 24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(245,200,66,0.03))'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1, marginBottom: 16 }}>
            <span className="gold-text">READY TO</span>
            <br />
            <span style={{ color: '#e8eaf0' }}>EARN BIG?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
            Join thousands of investors already earning daily returns on their crypto.
          </p>
          <Link href="/auth/signup">
            <button className="btn-gold" style={{ width: '100%', maxWidth: 300, fontSize: '1.1rem' }}>
              CREATE FREE ACCOUNT
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', borderTop: '1px solid rgba(245,200,66,0.1)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8 }}>
          <span className="gold-text">BIG EARN</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          © 2024 BIG EARN. All rights reserved. Invest responsibly.
        </p>
      </footer>
    </div>
  )
}
