import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  full_name: string
  balance: number
  referral_code?: string
  referred_by?: string
  referral_earnings?: number
  total_invested: number
  total_withdrawn: number
  created_at: string
  is_admin: boolean
}

export type Transaction = {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return'
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  description: string
  created_at: string
  proof_url?: string
}

export type Investment = {
  id: string
  user_id: string
  plan_name: string
  amount: number
  roi_percent: number
  duration_days: number
  status: 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  returns_earned: number
}

export type Notification = {
  id: string
  user_id: string | null
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'alert'
  is_broadcast: boolean
  read: boolean
  created_at: string
}
