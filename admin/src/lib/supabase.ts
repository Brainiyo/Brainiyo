import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key-here';

if (!isConfigured) {
  console.warn('Supabase credentials missing. Storage might not work.');
}

// Resilient recursive proxy to prevent build-time crashes when env keys are missing
const createDummyProxy = (): any => {
  return new Proxy(() => {}, {
    get(target, prop) {
      if (prop === 'then') return undefined; // Avoid promise resolution issues
      return createDummyProxy();
    },
    apply() {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
  });
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyProxy();
