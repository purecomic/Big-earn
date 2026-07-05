#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
import re

path = 'app/dashboard/admin/page.tsx'
admin = open(path).read()

# 1. Add new state variables after notifSuccess
admin = admin.replace(
    "  const [notifSuccess, setNotifSuccess] = useState(false)",
    """  const [notifSuccess, setNotifSuccess] = useState(false)
  const [sentNotifs, setSentNotifs] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)"""
)

# 2. Add fetchNotifications + deleteNotification before fetchAll
admin = admin.replace(
    "  async function fetchAll() {",
    """  async function fetchNotifications() {
    setLoadingNotifs(true)
    const { data } = await supabase
      .from('notifications')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setSentNotifs(data)
    setLoadingNotifs(false)
  }

  async function deleteNotification(id: string) {
    setDeletingId(id)
    await supabase.from('notifications').delete().eq('id', id)
    setSentNotifs(prev => prev.filter((n: any) => n.id !== id))
    setDeletingId(null)
  }

  async function fetchAll() {""",
    1
)

# 3. Call fetchNotifications in useEffect
admin = admin.replace(
    "fetchAll(); fetchSettings()",
    "fetchAll(); fetchSettings(); fetchNotifications()"
)

# 4. Call fetchNotifications after sending notification
admin = admin.replace(
    "setTimeout(() => setNotifSuccess(false), 3000)",
    "setTimeout(() => setNotifSuccess(false), 3000)\n    fetchNotifications()"
)

# 5. Add sent notifications list after the send button in notify tab
# Find the closing of the notify tab
old_end = """              <button className="btn-gold" onClick={sendNotification} disabled={sending||!notifTitle||!notifMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (sending||!notifTitle||!notifMessage)?0.6:1 }}>
                <Send size={16} /> {sending ? 'SENDING...' : 'SEND NOTIFICATION'}
              </button>
            </div>
          </div>
        )}"""

new_end = """              <button className="btn-gold" onClick={sendNotification} disabled={sending||!notifTitle||!notifMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (sending||!notifTitle||!notifMessage)?0.6:1 }}>
                <Send size={16} /> {sending ? 'SENDING...' : 'SEND NOTIFICATION'}
              </button>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', color: '#e8eaf0', fontSize: '1rem' }}>SENT NOTIFICATIONS</span>
              <button onClick={fetchNotifications} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem' }}>Refresh</button>
            </div>
            {loadingNotifs ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Loading...</div>
            ) : sentNotifs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No notifications sent yet</div>
            ) : sentNotifs.map((n: any, i: number, arr: any[]) => (
              <div key={n.id} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: n.type === 'success' ? 'rgba(74,222,128,0.15)' : n.type === 'warning' ? 'rgba(245,200,66,0.15)' : n.type === 'alert' ? 'rgba(248,113,113,0.15)' : 'rgba(96,165,250,0.15)', color: n.type === 'success' ? '#4ade80' : n.type === 'warning' ? '#f5c842' : n.type === 'alert' ? '#f87171' : '#60a5fa' }}>{n.type}</span>
                    {n.is_broadcast && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: 100 }}>broadcast</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8eaf0', marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 4 }}>{n.message}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>
                    {n.is_broadcast ? '📢 All users' : `👤 ${n.profiles?.full_name ?? 'Unknown'}`} · {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  disabled={deletingId === n.id}
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '7px 12px', cursor: deletingId === n.id ? 'default' : 'pointer', color: '#f87171', fontSize: '0.8rem', flexShrink: 0, opacity: deletingId === n.id ? 0.5 : 1, transition: 'all 0.2s' }}
                >
                  {deletingId === n.id ? '...' : '🗑️ Delete'}
                </button>
              </div>
            ))}
          </div>
        )}"""

admin = admin.replace(old_end, new_end, 1)

open(path, 'w').write(admin)
print("Admin page updated with delete notifications")
PYEOF

git add . && git commit -m "add delete notification feature to admin panel" && git push
echo "Done!"
