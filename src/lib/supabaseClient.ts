import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkhhxouuavfqzccahihe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraGh4b3V1YXZmcXpjY2FoaWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODA1MzYsImV4cCI6MjA3OTU1NjUzNn0.dJqT8Co_o2rrsdxmmgkQm3NnNQasWlJ2aUc_XCg01TQ';

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
