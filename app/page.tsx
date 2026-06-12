'use client'

import Link from 'next/link'
import { TrendingUp, Shield, Zap, ChevronRight, Star, ArrowRight, MapPin, Phone, Mail, Globe, Users, Award, Clock, CheckCircle, Quote } from 'lucide-react'
import { BANNER_IMG } from '@/lib/banner'

export default function HomePage() {
  const plans = [
    { name: 'STARTER', roi: '5%', duration: '7 days', min: '$50', color: '#4ade80' },
    { name: 'GROWTH', roi: '12%', duration: '14 days', min: '$200', color: '#f5c842', popular: true },
    { name: 'ELITE', roi: '25%', duration: '30 days', min: '$1,000', color: '#f87171' },
    { name: 'VIP PRO', roi: '40%', duration: '60 days', min: '$5,000', color: '#c084fc' },
  ]

  const reviews = [
    { name: 'Marcus T.', location: 'London, UK', rating: 5, text: 'Withdrew my returns within 24 hours. No issues at all. BIG EARN is the real deal.', avatar: '👨🏾' },
    { name: 'Sophie R.', location: 'Glasgow, UK', rating: 5, text: 'Started with the Starter plan and I\'m now on Elite. The growth is incredible and so consistent.', avatar: '👩🏼' },
    { name: 'Daniel O.', location: 'Lagos, Nigeria', rating: 5, text: 'Best crypto investment platform I\'ve used. Transparent, fast payouts and super helpful team.', avatar: '👨🏿' },
    { name: 'Priya K.', location: 'Singapore', rating: 5, text: 'ROI credited exactly as promised. My balance has grown 3x in just 6 months. Highly recommended!', avatar: '👩🏽' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#050810' }}>

      {/* ANNOUNCEMENT BANNER */}
      <div style={{ background: 'linear-gradient(90deg, #1a0a00, #3d2000, #1a0a00)', borderBottom: '1px solid rgba(245,200,66,0.3)', padding: '9px 16px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(245,200,66,0.07) 50%, transparent 100%)', animation: 'sweep 3s linear infinite' }} />
        <style>{`@keyframes sweep{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
        <p style={{ color: '#f5c842', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', position: 'relative' }}>
          🎉 VIP PRO PLAN: 40% ROI IN 60 DAYS &nbsp;·&nbsp; 🔒 FCA REGULATED UK PLATFORM &nbsp;·&nbsp; ✅ $4.2M+ PAID TO INVESTORS
        </p>
      </div>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(245,200,66,0.1)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(20px)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', letterSpacing: '0.08em' }}>
          <span className="gold-text">BIG</span><span style={{ color: '#e8eaf0' }}> EARN</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/about" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>ABOUT</button>
          </Link>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>LOGIN</button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-gold" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>START</button>
          </Link>
        </div>
      </nav>

      {/* HERO — Banner image with overlay */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 460 }}>
        {/* The actual banner image */}
        <img
          src={BANNER_IMG}
          alt="BIG EARN — Make Your Crypto Work For You"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        {/* Gradient overlay — lighter on right to show the woman, darker on left for text */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(5,8,16,0.92) 0%, rgba(5,8,16,0.75) 50%, rgba(5,8,16,0.35) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, #050810 0%, transparent 100%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '44px 20px 52px' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(212,175,55,0.9)', borderRadius: 6, padding: '6px 14px', marginBottom: 20, fontSize: '0.75rem', color: '#000', fontWeight: 800, letterSpacing: '0.04em' }}>
            <Star size={11} fill="#000" color="#000" /> TRUSTED BY 10,000+ INVESTORS
          </div>

          {/* Headline — matches the image text */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 11vw, 5rem)', lineHeight: 0.95, marginBottom: 16 }}>
            <span style={{ color: '#ffffff', display: 'block' }}>MAKE YOUR CRYPTO</span>
            <span className="gold-text" style={{ display: 'block' }}>WORK FOR YOU</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', maxWidth: 320, lineHeight: 1.75, marginBottom: 28 }}>
            Invest in top crypto strategies and watch your money grow with daily returns, transparent tracking, and instant results with <strong style={{ color: '#f5c842' }}>Big Earn</strong>.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-gold" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                START EARNING <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ fontSize: '0.95rem' }}>LEARN MORE</button>
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(245,200,66,0.3)', background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(14px)', maxWidth: 380 }}>
            {[{ v: '$4.2M+', l: 'Paid Out' }, { v: '10K+', l: 'Investors' }, { v: '99.9%', l: 'Uptime' }].map((s, i) => (
              <div key={i} style={{ padding: '14px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(245,200,66,0.15)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f5c842' }}>{s.v}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
            {['🏦 FCA Regulated', '🔒 SSL Secured', '🇬🇧 UK Licensed', '⚡ Fast Withdrawals'].map((b, i) => (
              <span key={i} style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '3px 10px', backdropFilter: 'blur(8px)' }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '44px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e8eaf0' }}>
            WHY CHOOSE <span className="gold-text">BIG EARN</span>?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 7 }}>Everything you need for confident crypto investing</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {[
            { icon: <TrendingUp size={20} color="#f5c842" />, title: 'Consistent Daily Returns', desc: 'Algorithmic strategies delivering consistent ROI since 2019 across all market conditions.' },
            { icon: <Shield size={20} color="#4ade80" />, title: 'FCA Regulated & Insured', desc: 'Fully licensed by the UK FCA. Funds protected with cold storage and multi-sig wallets.' },
            { icon: <Zap size={20} color="#60a5fa" />, title: 'Instant Withdrawals', desc: 'No lock-ins. Withdraw anytime and receive funds in your crypto wallet within 24 hours.' },
            { icon: <Users size={20} color="#c084fc" />, title: '50+ Expert Traders', desc: 'A dedicated team of crypto analysts and fund managers working 24/7 on your portfolio.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '17px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#e8eaf0', marginBottom: 4, fontSize: '0.88rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.46)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section style={{ padding: '0 20px 44px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e8eaf0' }}>INVESTMENT <span className="gold-text">PLANS</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 7 }}>Flexible plans for every investor level</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {plans.map((plan, i) => (
            <div key={i} className="card" style={{ padding: '20px', border: plan.popular ? `1px solid ${plan.color}55` : undefined, position: 'relative' }}>
              {plan.popular && <div style={{ position: 'absolute', top: -11, right: 16, background: '#f5c842', color: '#050810', fontFamily: 'var(--font-display)', fontSize: '0.68rem', padding: '3px 12px', borderRadius: 100 }}>MOST POPULAR</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: plan.color }}>{plan.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>Min {plan.min} · {plan.duration}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', color: plan.color, lineHeight: 1 }}>{plan.roi}</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.33)' }}>TOTAL ROI</div>
                </div>
              </div>
              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '11px', background: `${plan.color}12`, border: `1px solid ${plan.color}40`, color: plan.color, borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  INVEST NOW <ChevronRight size={15} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section style={{ padding: '0 20px 44px' }}>
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
          {/* Banner as background for about preview */}
          <img src={BANNER_IMG} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(5,8,16,0.97) 0%, rgba(5,8,16,0.88) 60%, rgba(5,8,16,0.6) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '28px 22px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 100, padding: '4px 12px', marginBottom: 14, fontSize: '0.7rem', color: '#f5c842' }}>
              <Award size={11} /> ABOUT BIG EARN
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#e8eaf0', marginBottom: 12, lineHeight: 1.1 }}>
              THE PLATFORM<br /><span className="gold-text">YOU CAN TRUST</span>
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 16 }}>
              Founded in 2019 and headquartered in Glasgow, UK, BIG EARN is a fully FCA-regulated crypto investment platform. We've paid out over $4.2 million to more than 10,000 investors worldwide with zero defaults.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
              {['FCA Registered & Compliant (No. 987654)', 'ISO 27001 Certified Information Security', 'Zero missed payouts since founded in 2019', 'Glasgow HQ open Mon–Fri for in-person visits'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <CheckCircle size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.81rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                READ MORE ABOUT US <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: '0 20px 44px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e8eaf0' }}>
            INVESTOR <span className="gold-text">REVIEWS</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 7 }}>
            <span style={{ color: '#f5c842', fontSize: '0.9rem' }}>★★★★★</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.42)', marginLeft: 5 }}>4.9/5 from 2,400+ reviews</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((r, i) => (
            <div key={i} className="card" style={{ padding: '17px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#e8eaf0' }}>{r.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={9} /> {r.location}
                    </div>
                  </div>
                </div>
                <span style={{ color: '#f5c842', fontSize: '0.7rem' }}>★★★★★</span>
              </div>
              <div style={{ paddingLeft: 14, borderLeft: '2px solid rgba(245,200,66,0.2)' }}>
                <p style={{ fontSize: '0.81rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, fontStyle: 'italic' }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14 }}>
          <CheckCircle size={13} color="#4ade80" />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)' }}>All reviews verified by Trustpilot</span>
        </div>
      </section>

      {/* LOCATION */}
      <section style={{ padding: '0 20px 44px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e8eaf0' }}>
            OUR <span className="gold-text">LOCATION</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 7 }}>Headquartered in Glasgow, operating globally</p>
        </div>

        {/* Map */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,200,66,0.2)', marginBottom: 14, height: 200 }}>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9152.37!2d-4.2578!3d55.8617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x488846a733234671%3A0x7fedde12562f2044!2sGlasgow%20City%20Centre%2C%20Glasgow!5e0!3m2!1sen!2suk!4v1234567890" width="100%" height="200" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.7)' }} allowFullScreen loading="lazy" />
        </div>

        {/* Glasgow HQ */}
        <div className="card" style={{ padding: '18px', marginBottom: 10, background: 'linear-gradient(135deg, rgba(245,200,66,0.06), rgba(10,15,30,0.95))' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem' }}>🇬🇧</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#f5c842', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 7 }}>
                GLASGOW HQ
                <span style={{ fontSize: '0.6rem', background: 'rgba(245,200,66,0.2)', border: '1px solid rgba(245,200,66,0.4)', color: '#f5c842', padding: '2px 8px', borderRadius: 100 }}>MAIN OFFICE</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, marginBottom: 9 }}>
                47 St Vincent Street, Suite 12<br />Glasgow, G2 5TS, Scotland, UK
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[{ icon: <Phone size={11} />, val: '+44 141 555 0199' }, { icon: <Mail size={11} />, val: 'support@bigearn.com' }, { icon: <Clock size={11} />, val: 'Mon–Fri: 9AM–6PM GMT' }].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.76rem', color: 'rgba(255,255,255,0.42)' }}>
                    {c.icon} {c.val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ flag: '🇺🇸', city: 'New York', addr: '350 5th Ave, NY 10118' }, { flag: '🇸🇬', city: 'Singapore', addr: '88 Market St, 048948' }].map((o, i) => (
            <div key={i} className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{o.flag}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: '#f5c842', marginBottom: 4 }}>{o.city}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{o.addr}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: '0 20px 44px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#e8eaf0', marginBottom: 15, textAlign: 'center' }}>
            GET IN <span className="gold-text">TOUCH</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { icon: <Mail size={15} color="#f5c842" />, label: 'Email', value: 'support@bigearn.com' },
              { icon: <Phone size={15} color="#4ade80" />, label: 'Hotline', value: '+44 141 555 0199' },
              { icon: <Globe size={15} color="#60a5fa" />, label: 'Website', value: 'www.bigearn.com' },
              { icon: <Clock size={15} color="#c084fc" />, label: 'Support', value: '24/7 Live Chat' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 33, height: 33, borderRadius: 8, background: 'rgba(245,200,66,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.33)' }}>{c.label}</div>
                  <div style={{ fontSize: '0.85rem', color: '#e8eaf0', fontWeight: 500 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '0 20px 60px' }}>
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
          <img src={BANNER_IMG} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.88)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '36px 22px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', lineHeight: 1, marginBottom: 12 }}>
              <span className="gold-text">START EARNING</span><br />
              <span style={{ color: '#ffffff' }}>TODAY</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.86rem', marginBottom: 22, lineHeight: 1.7 }}>
              Join 10,000+ investors earning daily. No experience needed. Start with just $50.
            </p>
            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-gold" style={{ width: '100%', maxWidth: 300, fontSize: '1rem', margin: '0 auto', display: 'block' }}>CREATE FREE ACCOUNT</button>
            </Link>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', marginTop: 12 }}>🔒 Secured · 🇬🇧 FCA Regulated · No hidden fees</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '26px 20px', borderTop: '1px solid rgba(245,200,66,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>
            <span className="gold-text">BIG EARN</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
            © 2024 BIG EARN LTD. Registered in Scotland No. SC123456<br />
            47 St Vincent Street, Glasgow, G2 5TS, UK<br />
            Authorised & regulated by the Financial Conduct Authority
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14 }}>
          {[{ l: 'About', h: '/about' }, { l: 'Login', h: '/auth/login' }, { l: 'Sign Up', h: '/auth/signup' }].map((l, i) => (
            <Link key={i} href={l.h} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>{l.l}</Link>
          ))}
        </div>
      </footer>
      
    </div>
  )
}
