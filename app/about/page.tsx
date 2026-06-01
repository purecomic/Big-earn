'use client'

import Link from 'next/link'
import { Shield, TrendingUp, Users, Award, Globe, ArrowRight, CheckCircle, MapPin, Phone, Mail, Clock, Star, FileText, Lock } from 'lucide-react'
import { BANNER_IMG } from '@/lib/banner'

export default function AboutPage() {
  const team = [
    { name: 'James MacAllister', role: 'CEO & Founder', exp: '15 yrs in crypto & hedge funds', emoji: '👨🏻‍💼' },
    { name: 'Sarah Okonkwo', role: 'Chief Investment Officer', exp: 'Ex-Goldman Sachs, 12 years', emoji: '👩🏾‍💻' },
    { name: 'David Chen', role: 'Head of Blockchain Tech', exp: 'Blockchain architect, 10 years', emoji: '👨🏻‍💻' },
    { name: 'Amara Patel', role: 'Customer Success Lead', exp: '8 yrs in wealth management', emoji: '👩🏽‍💼' },
  ]

  const milestones = [
    { year: '2019', event: 'BIG EARN founded in Glasgow, Scotland' },
    { year: '2020', event: 'FCA registration approved. First 1,000 investors onboarded' },
    { year: '2021', event: 'Expanded offices to New York and Singapore' },
    { year: '2022', event: '$1M total payouts milestone reached' },
    { year: '2023', event: '10,000+ active investors. $4.2M paid out' },
    { year: '2024', event: 'Launched VIP PRO plan. ISO 27001 certified' },
  ]

  const certs = [
    { icon: '🏦', title: 'FCA Regulated', sub: 'Reg. No. 987654', color: '#4ade80' },
    { icon: '🔒', title: 'ISO 27001', sub: 'Information Security', color: '#60a5fa' },
    { icon: '🛡️', title: 'SSL Secured', sub: '256-bit Encryption', color: '#f5c842' },
    { icon: '📋', title: 'Companies House', sub: 'SC123456', color: '#c084fc' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#050810' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(245,200,66,0.1)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem' }}>
            <span className="gold-text">BIG</span><span style={{ color: '#e8eaf0' }}> EARN</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>LOGIN</button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-gold" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>START</button>
          </Link>
        </div>
      </nav>

      {/* HERO BANNER — uses the same banner image */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 380 }}>
        <img
          src={BANNER_IMG}
          alt="BIG EARN"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(5,8,16,0.95) 0%, rgba(5,8,16,0.82) 55%, rgba(5,8,16,0.5) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #050810, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '48px 20px 44px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(212,175,55,0.9)', borderRadius: 6, padding: '5px 13px', marginBottom: 18, fontSize: '0.72rem', color: '#000', fontWeight: 800 }}>
            <Award size={10} fill="#000" color="#000" /> EST. 2019 · GLASGOW, SCOTLAND
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 10vw, 4.5rem)', lineHeight: 0.95, marginBottom: 16 }}>
            <span style={{ color: '#ffffff', display: 'block' }}>ABOUT</span>
            <span className="gold-text" style={{ display: 'block' }}>BIG EARN</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.86rem', maxWidth: 340, lineHeight: 1.75, marginBottom: 24 }}>
            A fully FCA-regulated UK crypto investment platform, trusted by over 10,000 investors worldwide to grow their wealth safely and transparently.
          </p>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ v: '$4.2M+', l: 'Paid Out' }, { v: '10K+', l: 'Investors' }, { v: '5 Yrs', l: 'Operating' }, { v: '0', l: 'Defaults' }].map((s, i) => (
              <div key={i} style={{ background: 'rgba(5,8,16,0.75)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 10, padding: '9px 14px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f5c842' }}>{s.v}</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding: '40px 20px' }}>
        <div className="card" style={{ padding: '24px 20px', background: 'linear-gradient(135deg, rgba(245,200,66,0.06), rgba(10,15,30,0.95))' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#f5c842', marginBottom: 13 }}>OUR MISSION</h2>
          <p style={{ color: 'rgba(255,255,255,0.58)', lineHeight: 1.85, fontSize: '0.86rem', marginBottom: 13 }}>
            At BIG EARN, our mission is to democratise access to high-yield crypto investments — opportunities previously reserved for institutional investors and the ultra-wealthy.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.58)', lineHeight: 1.85, fontSize: '0.86rem', marginBottom: 18 }}>
            We believe every person, regardless of financial background, deserves the opportunity to build real wealth through the power of blockchain technology and strategic digital asset management.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              'Fully transparent investment tracking in real-time',
              'Regulated by the UK Financial Conduct Authority',
              '24/7 customer support from our Glasgow HQ',
              'Zero lock-in periods — withdraw anytime',
              'Cold storage & multi-sig wallet protection',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <CheckCircle size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section style={{ padding: '0 20px 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#e8eaf0', marginBottom: 6 }}>
          CERTIFICATIONS &<br /><span className="gold-text">LICENCES</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', marginBottom: 18 }}>Strict UK financial regulation compliance</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 13 }}>
          {certs.map((c, i) => (
            <div key={i} className="card" style={{ padding: '17px', textAlign: 'center', border: `1px solid ${c.color}22` }}>
              <div style={{ fontSize: '1.9rem', marginBottom: 7 }}>{c.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: c.color, marginBottom: 3 }}>{c.title}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* FCA detail */}
        <div className="card" style={{ padding: '17px', marginBottom: 10, display: 'flex', gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={17} color="#4ade80" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#e8eaf0', fontSize: '0.86rem', marginBottom: 5 }}>Financial Conduct Authority Registration</div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>
              BIG EARN LTD is authorised and regulated by the FCA under registration number 987654. We maintain adequate capital resources and comply with strict client money rules.
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '17px', display: 'flex', gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Lock size={17} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#e8eaf0', fontSize: '0.86rem', marginBottom: 5 }}>ISO 27001 Information Security</div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>
              Our platform is ISO 27001 certified. All user data and funds are protected by 256-bit SSL encryption and cold storage wallets with multi-signature authorisation.
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: '0 20px 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#e8eaf0', marginBottom: 6 }}>
          MEET THE <span className="gold-text">TEAM</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', marginBottom: 18 }}>50+ professionals managing your investments</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {team.map((m, i) => (
            <div key={i} className="card" style={{ padding: '17px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 9 }}>{m.emoji}</div>
              <div style={{ fontWeight: 700, color: '#e8eaf0', fontSize: '0.83rem', marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#f5c842', marginBottom: 5 }}>{m.role}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{m.exp}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ padding: '0 20px 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#e8eaf0', marginBottom: 18 }}>
          OUR <span className="gold-text">JOURNEY</span>
        </h2>
        <div className="card" style={{ padding: '20px' }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, paddingBottom: i < milestones.length - 1 ? 16 : 0, marginBottom: i < milestones.length - 1 ? 16 : 0, borderBottom: i < milestones.length - 1 ? '1px solid rgba(255,255,255,0.055)' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,200,66,0.12)', border: '2px solid rgba(245,200,66,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f5c842' }} />
                </div>
                {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(245,200,66,0.13)', marginTop: 3 }} />}
              </div>
              <div style={{ paddingTop: 5 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#f5c842', marginBottom: 3 }}>{m.year}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.55 }}>{m.event}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OFFICES */}
      <section style={{ padding: '0 20px 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#e8eaf0', marginBottom: 18 }}>
          OUR <span className="gold-text">OFFICES</span>
        </h2>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,200,66,0.2)', marginBottom: 13, height: 200 }}>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9152.37!2d-4.2578!3d55.8617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x488846a733234671%3A0x7fedde12562f2044!2sGlasgow%20City%20Centre%2C%20Glasgow!5e0!3m2!1sen!2suk!4v1234567890" width="100%" height="200" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.7)' }} allowFullScreen loading="lazy" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {[
            { flag: '🇬🇧', city: 'Glasgow HQ', addr: '47 St Vincent Street, Suite 12\nGlasgow, G2 5TS, Scotland, UK', phone: '+44 141 555 0199', hours: 'Mon–Fri: 9AM–6PM GMT', primary: true },
            { flag: '🇺🇸', city: 'New York', addr: '350 5th Avenue, Suite 4100\nNew York, NY 10118, USA', phone: '+1 212 555 0100', hours: 'Mon–Fri: 9AM–6PM EST' },
            { flag: '🇸🇬', city: 'Singapore', addr: '88 Market Street, Level 12\nSingapore, 048948', phone: '+65 6123 4567', hours: 'Mon–Fri: 9AM–6PM SGT' },
          ].map((o, i) => (
            <div key={i} className="card" style={{ padding: '16px', border: o.primary ? '1px solid rgba(245,200,66,0.3)' : undefined }}>
              <div style={{ display: 'flex', gap: 11 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>{o.flag}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', color: o.primary ? '#f5c842' : '#e8eaf0', fontSize: '0.95rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {o.city}
                    {o.primary && <span style={{ fontSize: '0.58rem', background: 'rgba(245,200,66,0.2)', border: '1px solid rgba(245,200,66,0.4)', color: '#f5c842', padding: '2px 7px', borderRadius: 100 }}>HQ</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 7 }}>{o.addr}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={10} /> {o.phone}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.33)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={10} /> {o.hours}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: '0 20px 44px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#e8eaf0', marginBottom: 16 }}>
          CONTACT <span className="gold-text">US</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            { icon: <Mail size={16} color="#f5c842" />, label: 'Email Support', value: 'support@bigearn.com', sub: 'Response within 2 hours' },
            { icon: <Phone size={16} color="#4ade80" />, label: 'Glasgow HQ', value: '+44 141 555 0199', sub: 'Mon–Fri 9AM–6PM GMT' },
            { icon: <Globe size={16} color="#60a5fa" />, label: 'Live Chat', value: 'www.bigearn.com', sub: 'Available 24/7' },
            { icon: <Star size={16} color="#c084fc" />, label: 'Social Media', value: '@bigearnofficial', sub: 'Instagram · Telegram · X' },
          ].map((c, i) => (
            <div key={i} className="card" style={{ padding: '15px', display: 'flex', gap: 11, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.33)', marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: '0.86rem', color: '#e8eaf0', fontWeight: 500 }}>{c.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.36)' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 20px 60px' }}>
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
          <img src={BANNER_IMG} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.88)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '32px 22px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 11 }}>
              <span className="gold-text">JOIN BIG EARN</span><br />
              <span style={{ color: '#ffffff' }}>TODAY</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', marginBottom: 20, lineHeight: 1.7 }}>
              Start from just $50. FCA regulated. No experience needed.
            </p>
            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-gold" style={{ width: '100%', maxWidth: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', fontSize: '0.93rem' }}>
                CREATE FREE ACCOUNT <ArrowRight size={15} />
              </button>
            </Link>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.27)', marginTop: 11 }}>🔒 Secured · 🇬🇧 FCA Regulated · No hidden fees</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '22px 20px', borderTop: '1px solid rgba(245,200,66,0.1)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 7 }}>
          <span className="gold-text">BIG EARN</span>
        </div>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.7 }}>
          © 2024 BIG EARN LTD · Registered in Scotland No. SC123456<br />
          47 St Vincent Street, Glasgow, G2 5TS, UK<br />
          Authorised & regulated by the FCA
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 13 }}>
          <Link href="/" style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>Home</Link>
          <Link href="/auth/login" style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>Login</Link>
          <Link href="/auth/signup" style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  )
}
