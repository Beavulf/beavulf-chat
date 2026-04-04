import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// работа только через серверные компоненты (service_role key)
export const supabaseServer = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})