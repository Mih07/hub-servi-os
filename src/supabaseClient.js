import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'COLE_AQUI_A_SUA_PROJECT_URL'
const supabaseKey = 'COLE_AQUI_A_SUA_API_KEY_ANON_PUBLIC'

export const supabase = createClient(supabaseUrl, supabaseKey)