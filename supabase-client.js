import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';


const SUPABASE_URL = 'https://jusoackqpxxnrgviixib.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_wPvaQq2O2L9HFTLdLsupjw_YrbqxbK5'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);