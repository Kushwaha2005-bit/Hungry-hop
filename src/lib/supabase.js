// src/lib/supabase.js — Supabase client (service role for backend)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

// Service role client — bypasses RLS, use only on backend
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Helper: throw on Supabase errors
export function assertNoError(error, context = '') {
  if (error) {
    console.error(`Supabase error${context ? ' in ' + context : ''}:`, error.message);
    throw new Error(error.message);
  }
}
