import { createClient } from '@supabase/supabase-js';

// Support semua format nama environment variable
const supabaseUrl = 
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug log - akan kelihatan di Console (F12)
console.log('[Supabase] URL found:', !!supabaseUrl);
console.log('[Supabase] Key found:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] RALAT: Kunci tidak dijumpai! Sila semak .env atau Vercel Environment Variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
