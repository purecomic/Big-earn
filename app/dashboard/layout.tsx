'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase, Notification } from '@/lib/supabase'
import {
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle, TrendingUp,
  ShieldCheck, Bell, LogOut, Menu, X, ChevronRight, User
} from 'lucide-react'

const navItems = [
  { href: '/dashboard/main', label: 'DASHBOARD', icon: LayoutDashboard },
  { href: '/dashboard/deposit', label: 'DEPOSIT', icon: ArrowDownCircle },
  { href: '/dashboard/withdraw', label: 'WITHDRAW', icon: ArrowUpCircle },
  { href: '/dashboard/invest', label: 'INVEST', icon: TrendingUp },
]

const ADMIN_PASSWORD = 'masa234'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [adminUnlock, setAdminUnlock] = useState(false)
  const [adminPassInput, setAdminPassInput] = useState('')
  const [adminPassError, setAdminPassError] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'is_broadcast=eq.true',
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function fetchNotifications() {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data as Notification[])
  }

  async function markAllRead() {
    if (!user) return
    await supabase.from('notifications').update({ read: true })
      .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function handleAdminAccess() {
    if (!isAdmin) {
      alert('Access denied. Admin account required.')
      return
    }
    if (adminPassInput === ADMIN_PASSWORD) {
      setAdminUnlock(false)
      setAdminPassInput('')
      router.push('/dashboard/admin')
      setSidebarOpen(false)
    } else {
      setAdminPassError(true)
      setTimeout(() => setAdminPassError(false), 2000)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f5c842', marginBottom: 8 }}>BIG EARN</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading...</div>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 60,
        background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(245,200,66,0.1)',
        position: 'sticky', top: 0, zIndex: 40
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#e8eaf0', cursor: 'pointer', padding: 8 }}>
          <Menu size={22} />
        </button>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
          <span className="gold-text">BIG</span>
          <span style={{ color: '#e8eaf0' }}> EARN</span>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* Notifications */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ position: 'relative', background: 'none', border: 'none', color: '#e8eaf0', cursor: 'pointer', padding: 8 }}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#f5c842', color: '#050810',
                fontSize: '0.6rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* NOTIFICATIONS PANEL */}
      {notifOpen && (
        <div style={{
          position: 'fixed', top: 60, right: 0, width: '100%', maxWidth: 380,
          background: '#0a0f1e', border: '1px solid rgba(245,200,66,0.15)',
          borderRadius: '0 0 16px 16px', zIndex: 50, maxHeight: '70vh', overflow: 'auto'
        }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245,200,66,0.1)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#e8eaf0' }}>NOTIFICATIONS</span>
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#f5c842', fontSize: '0.75rem', cursor: 'pointer' }}>
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              No notifications yet
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={{
              padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: n.read ? 'transparent' : 'rgba(245,200,66,0.04)'
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: n.type === 'success' ? '#4ade80' : n.type === 'warning' ? '#f5c842' : n.type === 'alert' ? '#f87171' : '#60a5fa'
                }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8eaf0', marginBottom: 4 }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
            background: '#0a0f1e', borderRight: '1px solid rgba(245,200,66,0.15)',
            display: 'flex', flexDirection: 'column', overflow: 'auto'
          }}>
            {/* Sidebar header */}
            <div style={{ padding: '20px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245,200,66,0.1)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>
                <span className="gold-text">BIG</span>
                <span style={{ color: '#e8eaf0' }}> EARN</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#e8eaf0', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* User profile */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(245,200,66,0.08)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#f5c842" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e8eaf0' }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, padding: '12px 0' }}>
              {navItems.map(item => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 20px',
                      background: active ? 'rgba(245,200,66,0.08)' : 'transparent',
                      borderLeft: active ? '3px solid #f5c842' : '3px solid transparent',
                      color: active ? '#f5c842' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.2s'
                    }}>
                      <Icon size={18} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em' }}>{item.label}</span>
                    </div>
                  </Link>
                )
              })}

              {/* Admin Panel */}
              <div>
                <button
                  onClick={() => {
                    if (!isAdmin) { alert('Admin account required.'); return }
                    setAdminUnlock(true)
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px', background: 'none', border: 'none',
                    color: isAdmin ? 'rgba(248,113,113,0.8)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em' }}>ADMIN PANEL</span>
                  {isAdmin && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', padding: '2px 8px', borderRadius: 100 }}>ADMIN</span>}
                </button>

                {/* Admin password prompt */}
                {adminUnlock && isAdmin && (
                  <div style={{ margin: '0 16px 12px', padding: '14px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Enter admin password:</div>
                    <input
                      className="input-field"
                      type="password"
                      placeholder="Password"
                      value={adminPassInput}
                      onChange={e => setAdminPassInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdminAccess()}
                      style={{ marginBottom: 10, fontSize: '0.9rem', padding: '10px 14px', borderColor: adminPassError ? 'rgba(248,113,113,0.6)' : undefined }}
                    />
                    {adminPassError && <div style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: 8 }}>Wrong password</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleAdminAccess} className="btn-gold" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>ENTER</button>
                      <button onClick={() => { setAdminUnlock(false); setAdminPassInput('') }} className="btn-ghost" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Sign out */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(245,200,66,0.08)' }}>
              <button
                onClick={() => { signOut(); router.push('/') }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <main style={{ flex: 1, paddingBottom: 80 }} onClick={() => notifOpen && setNotifOpen(false)}>
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(245,200,66,0.12)',
        display: 'flex', height: 70,
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 30
      }}>
        {navItems.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 4,
                color: active ? '#f5c842' : 'rgba(255,255,255,0.35)',
                position: 'relative'
              }}>
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 32, height: 2, background: '#f5c842', borderRadius: '0 0 2px 2px'
                  }} />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 400, letterSpacing: '0.05em' }}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
