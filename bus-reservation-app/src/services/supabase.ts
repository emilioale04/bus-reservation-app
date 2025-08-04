import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '__VITE_SUPABASE_URL__'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '__VITE_SUPABASE_ANON_KEY__'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)