import { createClient } from '@supabase/supabase-js';

// Cuba ambil dari pelbagai kemungkinan nama (dengan atau tanpa PUBLIC)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key tidak dijumpai. Sila semak fail .env atau Environment Variables di Vercel.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
