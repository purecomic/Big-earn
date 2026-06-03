'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
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

export default function DashboardChat() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user) return
    fetchMessages()
    subscribeMessages()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [user?.id])

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      markRead()
    }
  }, [messages, open])

  async function fetchMessages() {
    if (!user) return
    const { data } = await supabase
      .from('chats').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data as Message[])
    const unreadCount = (data as Message[] ?? []).filter(m => m.sender === 'admin' && !m.read).length
    setUnread(unreadCount)
  }

  async function markRead() {
    if (!user) return
    await supabase.from('chats').update({ read: true })
      .eq('user_id', user.id).eq('sender', 'admin').eq('read', false)
    setUnread(0)
  }

  function subscribeMessages() {
    if (!user) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const ch = supabase.channel(`dash-chat-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => [...prev, msg])
          if (msg.sender === 'admin') {
            if (open) markRead()
            else setUnread(n => n + 1)
          }
        })
      .subscribe()
    channelRef.current = ch
  }

  async function sendMessage() {
    if (!input.trim() || !user || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    await supabase.from('chats').insert({ user_id: user.id, message: text, sender: 'user', read: false })
    setSending(false)
  }

  return (
    <>
      {/* Floating chat button — above bottom nav */}
      <div style={{ position: 'fixed', bottom: 82, right: 16, zIndex: 35 }}>
        <button
          onClick={() => { setOpen(!open); if (!open) markRead() }}
          style={{ width: 50, height: 50, borderRadius: '50%', background: open ? '#1a2540' : 'linear-gradient(135deg, #f5c842, #e6b800)', border: open ? '1px solid rgba(245,200,66,0.4)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(245,200,66,0.35)', position: 'relative', transition: 'all 0.2s' }}
        >
          {open ? <X size={20} color="#f5c842" /> : <MessageCircle size={20} color="#050810" />}
          {!open && unread > 0 && (
            <span style={{ position: 'absolute', top: -3, right: -3, width: 17, height: 17, borderRadius: '50%', background: '#f87171', color: '#fff', fontSize: '0.58rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{ position: 'fixed', bottom: 140, right: 10, left: 10, maxWidth: 400, margin: '0 auto', background: '#0a0f1e', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 18, zIndex: 35, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', height: 400 }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #f5c842, #e6b800)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👩🏽‍💼</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#050810', fontWeight: 700 }}>SUPPORT TEAM</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Online 24/7
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14 }}>
                  Hi {user?.full_name?.split(' ')[0]}! Our support team is here 24/7. What can we help you with?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['How do I make a deposit?', 'When will my withdrawal arrive?', 'Which investment plan is best?', 'I have an account issue'].map((q, i) => (
                    <button key={i} onClick={() => setInput(q)} style={{ padding: '8px 12px', background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 9 }}>
                {msg.sender === 'admin' && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,200,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0, marginRight: 6, alignSelf: 'flex-end' }}>👩🏽‍💼</div>
                )}
                <div style={{ maxWidth: '74%', padding: '9px 12px', borderRadius: msg.sender === 'user' ? '13px 13px 3px 13px' : '13px 13px 13px 3px', background: msg.sender === 'user' ? 'linear-gradient(135deg, #f5c842, #e6b800)' : 'rgba(255,255,255,0.07)', color: msg.sender === 'user' ? '#050810' : '#e8eaf0', fontSize: '0.8rem', lineHeight: 1.55 }}>
                  {msg.message}
                  <div style={{ fontSize: '0.58rem', color: msg.sender === 'user' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.28)', marginTop: 3, textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '9px 11px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
            <input className="input-field" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1, padding: '9px 13px', fontSize: '0.8rem' }} />
            <button onClick={sendMessage} disabled={!input.trim() || sending} style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, #f5c842, #e6b800)' : 'rgba(255,255,255,0.07)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
              <Send size={14} color={input.trim() ? '#050810' : 'rgba(255,255,255,0.25)'} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
