'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

type Message = {
  id: string
  user_id: string
  message: string
  sender: 'user' | 'admin'
  read: boolean
  created_at: string
}

type ChatUser = {
  user_id: string
  full_name: string
  email: string
  last_message: string
  last_time: string
  unread: number
}

export default function AdminChat() {
  const { user } = useAuth()
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  const QUICK_REPLIES = [
    '✅ Your deposit has been approved and credited to your account.',
    '✅ Your withdrawal has been processed and is on its way.',
    '💰 You can deposit by going to Dashboard → Deposit and following the 3 steps.',
    '⏱️ Withdrawals are processed within 24 hours after approval.',
    '📈 We recommend the GROWTH plan for new investors — 12% ROI in 14 days.',
    '🔒 Your account is secure. Please ensure you use a strong password.',
    '📞 For urgent issues, call us at +44 141 555 0199 (Mon–Fri 9AM–6PM GMT).',
    '🎉 Thank you for investing with BIG EARN! We appreciate your trust.',
  ]

  useEffect(() => {
    fetchChatUsers()
    subscribeToAllChats()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id)
    }
  }, [selectedUser?.user_id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchChatUsers() {
    setLoading(true)
    const { data: chats } = await supabase
      .from('chats').select('*').order('created_at', { ascending: false })
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email')

    if (!chats || !profiles) { setLoading(false); return }

    const userMap: { [key: string]: ChatUser } = {}
    chats.forEach((msg: Message) => {
      if (!userMap[msg.user_id]) {
        const profile = profiles.find((p: any) => p.id === msg.user_id)
        userMap[msg.user_id] = {
          user_id: msg.user_id,
          full_name: profile?.full_name ?? 'Unknown',
          email: profile?.email ?? '',
          last_message: msg.message,
          last_time: msg.created_at,
          unread: 0,
        }
      }
      if (msg.sender === 'user' && !msg.read) {
        userMap[msg.user_id].unread += 1
      }
    })
    setChatUsers(Object.values(userMap))
    setLoading(false)
  }

  async function fetchMessages(userId: string) {
    const { data } = await supabase.from('chats').select('*')
      .eq('user_id', userId).order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data as Message[])
    // Mark user messages as read
    await supabase.from('chats').update({ read: true })
      .eq('user_id', userId).eq('sender', 'user').eq('read', false)
    setChatUsers(prev => prev.map(u => u.user_id === userId ? { ...u, unread: 0 } : u))
  }

  function subscribeToAllChats() {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const ch = supabase.channel('admin-chat-all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          const msg = payload.new as Message
          if (selectedUser && msg.user_id === selectedUser.user_id) {
            setMessages(prev => [...prev, msg])
          }
          fetchChatUsers()
        })
      .subscribe()
    channelRef.current = ch
  }

  async function sendReply() {
    if (!input.trim() || !selectedUser || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    await supabase.from('chats').insert({
      user_id: selectedUser.user_id,
      message: text,
      sender: 'admin',
      read: false,
    })
    // Send notification to user
    await supabase.from('notifications').insert({
      user_id: selectedUser.user_id,
      title: '💬 New message from Support',
      message: text.length > 60 ? text.slice(0, 60) + '...' : text,
      type: 'info', is_broadcast: false, read: false,
    })
    setSending(false)
  }

  const totalUnread = chatUsers.reduce((s, u) => s + u.unread, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#e8eaf0' }}>
            LIVE CHAT {totalUnread > 0 && <span style={{ background: '#f87171', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 100, marginLeft: 6 }}>{totalUnread} new</span>}
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{chatUsers.length} conversation{chatUsers.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchChatUsers} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px', cursor: 'pointer', color: '#e8eaf0' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.4)' }}>Loading chats...</div>
      ) : chatUsers.length === 0 ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No conversations yet</p>
        </div>
      ) : (
        <>
          {/* User list */}
          {!selectedUser && (
            <div className="card" style={{ overflow: 'hidden' }}>
              {chatUsers.map((cu, i, arr) => (
                <button key={cu.user_id} onClick={() => setSelectedUser(cu)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#e8eaf0' }}>{cu.full_name}</span>
                      {cu.unread > 0 && <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f87171', color: '#fff', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cu.unread}</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cu.last_message}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chat thread */}
          {selectedUser && (
            <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Thread header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#f5c842', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(245,200,66,0.3)' }}>← Back</button>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#e8eaf0' }}>{selectedUser.full_name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>{selectedUser.email}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ maxHeight: 320, overflowY: 'auto', padding: '12px' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', marginBottom: 9 }}>
                    <div style={{ maxWidth: '76%', padding: '9px 12px', borderRadius: msg.sender === 'admin' ? '13px 13px 3px 13px' : '13px 13px 13px 3px', background: msg.sender === 'admin' ? 'linear-gradient(135deg, #f5c842, #e6b800)' : 'rgba(255,255,255,0.08)', color: msg.sender === 'admin' ? '#050810' : '#e8eaf0', fontSize: '0.8rem', lineHeight: 1.55 }}>
                      {msg.message}
                      <div style={{ fontSize: '0.58rem', color: msg.sender === 'admin' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', marginTop: 3, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender === 'admin' && ' · You'}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>QUICK REPLIES</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {QUICK_REPLIES.map((qr, i) => (
                    <button key={i} onClick={() => setInput(qr)} style={{ fontSize: '0.68rem', padding: '4px 10px', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 100, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {qr.slice(0, 28)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply input */}
              <div style={{ padding: '9px 11px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 7, alignItems: 'center' }}>
                <input className="input-field" placeholder="Type a reply..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} style={{ flex: 1, padding: '9px 13px', fontSize: '0.8rem' }} />
                <button onClick={sendReply} disabled={!input.trim() || sending} style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, #f5c842, #e6b800)' : 'rgba(255,255,255,0.07)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Send size={14} color={input.trim() ? '#050810' : 'rgba(255,255,255,0.25)'} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
