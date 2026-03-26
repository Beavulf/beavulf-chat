import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

// работа только через серверные компоненты (service_role key)
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})