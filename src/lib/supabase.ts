import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl) {
  console.warn('Supabase Client Error: VITE_SUPABASE_URL is missing. Please check your .env file.');
}
if (!supabaseAnonKey) {
  console.warn('Supabase Client Error: VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
