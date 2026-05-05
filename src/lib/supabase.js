import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjxzdryhcrpqxmrdfzmg.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Em4XEECEnpLAtOhF2pRQDw_3NIIT-E3'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)