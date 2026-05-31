'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, User } from './supabase'
import { Session } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'admin@bigearn.com'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.email === ADMIN_EMAIL || session?.user?.email === ADMIN_EMAIL

  async function fetchOrCreateProfile(authUser: { id: string; email?: string }) {
    // Try to fetch existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (data) {
      setUser(data as User)
      return
    }

    // Profile doesn't exist — create it automatically
    const email = authUser.email ?? ''
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        email,
        full_name: email.split('@')[0],
        balance: 0,
        total_invested: 0,
        total_withdrawn: 0,
        is_admin: email === ADMIN_EMAIL,
      })
      .select()
      .single()

    if (newProfile) {
      setUser(newProfile as User)
    } else {
      // Fallback: set a minimal user so login still works
      setUser({
        id: authUser.id,
        email,
        full_name: email.split('@')[0],
        balance: 0,
        total_invested: 0,
        total_withdrawn: 0,
        is_admin: email === ADMIN_EMAIL,
        created_at: new Date().toISOString(),
      } as User)
    }
  }

  async function refreshUser() {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    if (currentSession?.user) {
      await fetchOrCreateProfile(currentSession.user)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchOrCreateProfile(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchOrCreateProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'Invalid email or password. Please check your details.' }
    if (data.user) {
      await fetchOrCreateProfile(data.user)
    }
    return { error: null }
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) return { error: error.message }

    const userId = data.user?.id
    if (userId) {
      // Upsert so it works even if the row somehow already exists
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: name,
        balance: 0,
        total_invested: 0,
        total_withdrawn: 0,
        is_admin: email === ADMIN_EMAIL,
      })
      await fetchOrCreateProfile({ id: userId, email })
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}