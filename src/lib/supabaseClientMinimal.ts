import { createClient } from '@supabase/supabase-js';

// Variables d'environnement Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Init MINIMAL');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variables Supabase manquantes!');
}

// ✅ Configuration ULTRA-MINIMAL (aucune option auth)
export const supabaseMinimal = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client created (minimal)');
