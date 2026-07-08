#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/dashboard/admin/page.tsx'
content = open(path).read()

# Add editingUser and joinDate state
if 'editingUser' not in content:
    content = content.replace(
        "  const [searchQuery, setSearchQuery] = useState('')",
        """  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editJoinDate, setEditJoinDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [dateSaved, setDateSaved] = useState(false)"""
    )
    print("Added state vars")

# Add updateJoinDate function before fetchAll
if 'updateJoinDate' not in content:
    content = content.replace(
        "  async function fetchAll() {",
        """  async function updateJoinDate(userId: string) {
    if (!editJoinDate) return
    setSavingDate(true)
    await supabase.from('profiles').update({ created_at: new Date(editJoinDate).toISOString() }).eq('id', userId)
    setSavingDate(false)
    setDateSaved(true)
    setEditingUser(null)
    setTimeout(() => setDateSaved(false), 2000)
    fetchAll()
  }

  async function fetchAll() {""",
        1
    )
    print("Added updateJoinDate function")

# Replace the users tab content to add edit date button
old_user_row = """                  <div key={u.id} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#e8eaf0', fontWeight: 500 }}>{u.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f5c842', fontWeight: 600 }}>${(u.balance??0).toFixed(2)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>balance</div>
                  </div>
                </div>"""

new_user_row = """                  <div key={u.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#e8eaf0', fontWeight: 500 }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{u.email}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                        Joined: {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ color: '#f5c842', fontWeight: 600 }}>${(u.balance??0).toFixed(2)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>balance</div>
                      <button
                        onClick={() => { setEditingUser(editingUser === u.id ? null : u.id); setEditJoinDate(u.created_at?.slice(0,10) ?? '') }}
                        style={{ fontSize: '0.68rem', padding: '3px 10px', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 6, color: '#f5c842', cursor: 'pointer' }}
                      >
                        ✏️ Edit Date
                      </button>
                    </div>
                  </div>
                  {editingUser === u.id && (
                    <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>JOINING DATE</label>
                        <input
                          type="date"
                          className="input-field"
                          value={editJoinDate}
                          onChange={e => setEditJoinDate(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '9px 12px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 6, paddingTop: 20 }}>
                        <button
                          onClick={() => updateJoinDate(u.id)}
                          disabled={savingDate}
                          style={{ padding: '9px 14px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, color: '#4ade80', cursor: 'pointer', fontSize: '0.78rem', opacity: savingDate ? 0.6 : 1 }}
                        >
                          {savingDate ? '...' : '✓ Save'}
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          style={{ padding: '9px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.78rem' }}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  )}
                </div>"""

if old_user_row in content:
    content = content.replace(old_user_row, new_user_row)
    print("Updated user row with edit date")
else:
    print("Could not find user row to replace")

# Add dateSaved banner at top of users tab
if 'dateSaved' not in content:
    content = content.replace(
        "          {tab === 'users' && (\n            <div>",
        """          {tab === 'users' && (
            <div>
              {dateSaved && <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#4ade80', fontSize: '0.82rem', textAlign: 'center' }}>✅ Joining date updated!</div>}"""
    )
    print("Added dateSaved banner")

open(path, 'w').write(content)
print("Done!")
PYEOF

git add . && git commit -m "admin: edit user joining date from users tab" && git push
echo "Done!"
