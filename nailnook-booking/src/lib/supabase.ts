import { createClient } from '@supabase/supabase-js'

// Use placeholder values so the module doesn't throw at import time
// when env vars aren't set. API routes guard with supabaseConfigured().
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Browser / client-side client (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (uses service role key, bypasses RLS)
// Only import this in API routes — never expose to the browser
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
