import { createClient } from '@supabase/supabase-js';

// Variables d'environnement Supabase (configurées dans Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Variables d\'environnement manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export interface Assessment {
  id: string;
  client_id: string;
  consultant_id?: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  coaching_style?: 'collaborative' | 'analytical' | 'creative';
  cv_analysis?: any;
  questionnaire_data?: any;
  summary_data?: any;
  consultant_notes?: any[];
  package_name?: string;
  package_duration?: number;
  package_price?: number;
  duration_hours?: number;
  start_date?: string;
  end_date?: string;
  consent_data?: any;
  answers?: any[];
  summary?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ChatSession {
  id: string;
  assessment_id: string;
  session_type: 'text' | 'voice';
  messages: any[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'client' | 'consultant' | 'admin';
  organization_id?: string;
  created_at: string;
  updated_at: string;
}
