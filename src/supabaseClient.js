import { createClient } from '@supabase/supabase-js'

// Removemos o '/rest/v1/' do final da URL
const supabaseUrl = 'https://gnkyhclamzgbnwppenpi.supabase.co'
const supabaseKey = 'sb_publishable_BYDLRFOimze9F73ijSJ_6w_D0oH1aXM'

export const supabase = createClient(supabaseUrl, supabaseKey)