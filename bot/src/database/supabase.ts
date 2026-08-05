import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

export function getSupabaseClient() {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey)
}
