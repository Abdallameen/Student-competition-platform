import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvmuaolidigamnnlijox.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4JpE51qL_gEMsm3xBPJcaQ_n3YzNCyH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
