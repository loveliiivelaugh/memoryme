import { createClient } from '@supabase/supabase-js'

const isTest = import.meta.env.MODE === 'test';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (isTest ? 'https://example.supabase.co' : '');
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (isTest ? 'test-anon-key' : '');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
