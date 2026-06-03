'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BANNER_IMG } from '@/lib/banner'
import { useAuth } from '@/lib/auth-context'

type Message = {
  id: string
  user_id: string
  message: string
  sender: 'user' | 'admin'
  read: boolean
  created_at: string
}

const AUTO_REPLIES = [
  "Hi there! 👋 Welcome to BIG EARN. I'm here to help. What would you like to know?",
  "Great question! Our team typically responds within a few minutes. Is there anything specific about our investment plans you'd like to know?",
  "Thank you for reaching out! Our support team is available 24/7. How can we assist you today?",
  "We're glad you're here! BIG EARN has paid out over $4.2M to investors with zero defaults since 2019. What can I help you with?",
]

export default function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const [guestName, setGuestName] = useState('')
  const [guestStarted, setGuestStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!open) return
    if (user) {
      fetchMessages()
      subscribeToMessages()
    }
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [open, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    if (!user) return
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data as Message[])

    // Mark admin messages as read
    await supabase.from('chats').update({ read: true })
      .eq('user_id', user.id).eq('sender', 'admin').eq('read', false)
    setUnread(0)
  }

  function subscribeToMessages() {
    if (!user) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const channel = supabase
      .channel(`chat-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chats',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const msg = payload.new as Message
        setMessages(prev => [...prev, msg])
        if (msg.sender === 'admin' && !open) setUnread(n => n + 1)
      })
      .subscribe()
    channelRef.current = channel
  }

  async function sendMessage() {
    if (!input.trim() || !user) return
    setSending(true)
    const text = input.trim()
    setInput('')

    await supabase.from('chats').insert({
      user_id: user.id,
      message: text,
      sender: 'user',
      read: false,
    })

    // Auto-reply only on first message
    if (messages.length === 0) {
      setTimeout(async () => {
        await supabase.from('chats').insert({
          user_id: user.id,
          message: "Hi! Thanks for reaching out to BIG EARN Support 👋 We're a little busy right now but we'll respond to you as soon as possible. In the meantime, feel free to check our investment plans or visit our FAQ.",
          sender: 'admin',
          read: false,
        })
      }, 1200)
    }

    setSending(false)
  }

  function handleGuestStart() {
    if (!guestName.trim()) return
    setGuestStarted(true)
    setMessages([{
      id: '1', user_id: 'guest', message: AUTO_REPLIES[0],
      sender: 'admin', read: true, created_at: new Date().toISOString()
    }])
  }

  function handleGuestSend() {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    const userMsg: Message = {
      id: Date.now().toString(), user_id: 'guest',
      message: text, sender: 'user', read: true,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])

    // Auto reply after 1.5s
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), user_id: 'guest',
        message: reply, sender: 'admin', read: true,
        created_at: new Date().toISOString()
      }])
    }, 1500)
  }

  return (
    <>
      {/* Floating button */}
      <div style={{ position: 'fixed', bottom: 86, right: 16, zIndex: 100 }}>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f5c842, #e6b800)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(245,200,66,0.5)',
              position: 'relative'
            }}
          >
            <MessageCircle size={22} color="#050810" />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#f87171', color: '#fff',
                fontSize: '0.6rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{unread}</span>
            )}
          </button>
        )}
      </div>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 10, left: 10,
          maxWidth: 380, margin: '0 auto',
          background: '#0a0f1e', border: '1px solid rgba(245,200,66,0.25)',
          borderRadius: 18, zIndex: 100, overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', height: 420
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #f5c842, #e6b800)',
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.2)', flexShrink: 0 }}><img src={BANNER_IMG} alt="Support" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right top' }} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#050810', fontWeight: 700 }}>BIG EARN SUPPORT</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  Online · Typically replies instantly
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#050810', padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Guest name prompt */}
          {!user && !guestStarted ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 14 }}>
              <div style={{ fontSize: '2rem' }}>💬</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: '#e8eaf0', marginBottom: 6 }}>Welcome to Support</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Enter your name to start chatting with our support team</div>
              </div>
              <input
                className="input-field"
                placeholder="Your name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuestStart()}
                style={{ width: '100%' }}
              />
              <button className="btn-gold" onClick={handleGuestStart} style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>
                START CHAT
              </button>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                Or <a href="/auth/login" style={{ color: '#f5c842', textDecoration: 'none' }}>login</a> for full support access
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
                {/* Welcome message */}
                {(user && messages.length === 0) && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>👋</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                      Hi {user.full_name?.split(' ')[0]}! How can we help you today?
                    </div>
                    {/* Quick reply buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 14 }}>
                      {['How do I deposit funds?', 'When will my withdrawal arrive?', 'Which plan is best for me?', 'I need help with my account'].map((q, i) => (
                        <button key={i} onClick={() => setInput(q)} style={{ padding: '8px 12px', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontSize: '0.76rem', cursor: 'pointer', textAlign: 'left' }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                    {msg.sender === 'admin' && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, marginRight: 7, alignSelf: 'flex-end', border: '1px solid rgba(245,200,66,0.3)' }}><img src={BANNER_IMG} alt="Support" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right top' }} /></div>
                    )}
                    <div style={{
                      maxWidth: '72%', padding: '9px 12px', borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #f5c842, #e6b800)' : 'rgba(255,255,255,0.07)',
                      color: msg.sender === 'user' ? '#050810' : '#e8eaf0',
                      fontSize: '0.82rem', lineHeight: 1.55
                    }}>
                      {msg.message}
                      <div style={{ fontSize: '0.6rem', color: msg.sender === 'user' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <input
                  className="input-field"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (user ? sendMessage() : handleGuestSend())}
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.82rem' }}
                />
                <button
                  onClick={user ? sendMessage : handleGuestSend}
                  disabled={!input.trim() || sending}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, #f5c842, #e6b800)' : 'rgba(255,255,255,0.08)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                >
                  <Send size={15} color={input.trim() ? '#050810' : 'rgba(255,255,255,0.3)'} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
