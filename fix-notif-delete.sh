#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/dashboard/admin/page.tsx'
content = open(path).read()

# Check what's there
print("Has sentNotifs:", 'sentNotifs' in content)
print("Has SENT NOTIFICATIONS:", 'SENT NOTIFICATIONS' in content)
print("Has deleteNotification:", 'deleteNotification' in content)

# Step 1: Add state if missing
if 'sentNotifs' not in content:
    content = content.replace(
        "  const [notifSuccess, setNotifSuccess] = useState(false)",
        """  const [notifSuccess, setNotifSuccess] = useState(false)
  const [sentNotifs, setSentNotifs] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)"""
    )
    print("Added state vars")

# Step 2: Add functions if missing
if 'fetchNotifications' not in content:
    content = content.replace(
        "  async function fetchAll() {",
        """  async function fetchNotifications() {
    setLoadingNotifs(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setSentNotifs(data)
    setLoadingNotifs(false)
  }

  async function deleteNotification(id: string) {
    setDeletingId(id)
    await supabase.from('notifications').delete().eq('id', id)
    setSentNotifs((prev: any[]) => prev.filter((n: any) => n.id !== id))
    setDeletingId(null)
  }

  async function fetchAll() {""",
        1
    )
    print("Added functions")

# Step 3: Call fetchNotifications in useEffect
if 'fetchNotifications' in content and 'fetchAll(); fetchSettings(); fetchNotifications()' not in content:
    content = content.replace(
        "fetchAll(); fetchSettings()",
        "fetchAll(); fetchSettings(); fetchNotifications()"
    )
    print("Added fetchNotifications to useEffect")

# Step 4: Call fetchNotifications after send
if 'fetchNotifications()' not in content.split('sendNotification')[1][:500] if 'sendNotification' in content else True:
    content = content.replace(
        "setTimeout(() => setNotifSuccess(false), 3000)",
        "setTimeout(() => setNotifSuccess(false), 3000)\n    fetchNotifications()"
    )
    print("Added fetchNotifications after send")

# Step 5: Add UI if missing - inject before the closing of notify tab
if 'SENT NOTIFICATIONS' not in content:
    sent_ui = """
          {/* Sent notifications list */}
          <div className="card" style={{ overflow: 'hidden', marginTop: 16 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', color: '#e8eaf0', fontSize: '0.95rem' }}>SENT NOTIFICATIONS</span>
              <button onClick={fetchNotifications} style={{ background: 'none', border: 'none', color: '#f5c842', cursor: 'pointer', fontSize: '0.75rem' }}>↺ Refresh</button>
            </div>
            {loadingNotifs ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Loading...</div>
            ) : sentNotifs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No notifications sent yet</div>
            ) : sentNotifs.map((n: any, i: number, arr: any[]) => (
              <div key={n.id} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: n.type === 'success' ? 'rgba(74,222,128,0.15)' : n.type === 'warning' ? 'rgba(245,200,66,0.15)' : n.type === 'alert' ? 'rgba(248,113,113,0.15)' : 'rgba(96,165,250,0.15)', color: n.type === 'success' ? '#4ade80' : n.type === 'warning' ? '#f5c842' : n.type === 'alert' ? '#f87171' : '#60a5fa' }}>{n.type}</span>
                    {n.is_broadcast && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: 100 }}>broadcast</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8eaf0', marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 4 }}>{n.message}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>
                    {n.is_broadcast ? '📢 All users' : '👤 Individual'} · {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  disabled={deletingId === n.id}
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '8px 12px', cursor: deletingId === n.id ? 'default' : 'pointer', color: '#f87171', fontSize: '0.78rem', flexShrink: 0, opacity: deletingId === n.id ? 0.5 : 1 }}
                >
                  {deletingId === n.id ? '...' : '🗑️ Delete'}
                </button>
              </div>
            ))}
          </div>"""

    # Find the end of notify tab and inject before it
    # The notify tab ends with )} followed by the next tab check
    # Look for the pattern after the send button
    target = "          </div>\n        )}\n\n          {/* SETTINGS"
    if target in content:
        content = content.replace(target, sent_ui + "\n        )}\n\n          {/* SETTINGS")
        print("Injected sent notifications UI (method 1)")
    else:
        # Alternative: find notify tab end differently
        # Split on tab sections and rebuild
        lines = content.split('\n')
        notify_end_idx = None
        in_notify = False
        brace_depth = 0
        
        for i, line in enumerate(lines):
            if "tab === 'notify'" in line:
                in_notify = True
            if in_notify and "tab === 'settings'" in line:
                notify_end_idx = i
                break
        
        if notify_end_idx:
            # Insert before the settings tab check
            insert_lines = sent_ui.split('\n')
            lines = lines[:notify_end_idx] + insert_lines + lines[notify_end_idx:]
            content = '\n'.join(lines)
            print(f"Injected sent notifications UI (method 2) at line {notify_end_idx}")
        else:
            print("Could not find injection point!")

open(path, 'w').write(content)
print("Done! SENT NOTIFICATIONS in file:", 'SENT NOTIFICATIONS' in open(path).read())
PYEOF

git add . && git commit -m "fix: add sent notifications list with delete to admin panel" && git push
echo "Done!"
