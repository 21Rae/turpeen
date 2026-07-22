import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy client initialization for safety when keys aren't set yet
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : undefined);
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : undefined);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
    );
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Server-side admin client using service role key
export function getSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
