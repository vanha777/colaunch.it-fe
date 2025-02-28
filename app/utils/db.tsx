import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project URL and Anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const Db = createClient(supabaseUrl, supabaseAnonKey)
export const Server = process.env.NEXT_METALOOT_SERVER || ""
export const FrontEnd = process.env.NEXT_FRONT_END_URL || "http://localhost:3000"
export const PrivateKey = process.env.NEXT_PRIVATE_KEY || "123123"