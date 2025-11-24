import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkhhxouuavfqzccahihe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraGh4b3V1YXZmcXpjY2FoaWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODA1MzYsImV4cCI6MjA3OTU1NjUzNn0.dJqT8Co_o2rrsdxmmgkQm3NnNQasWlJ2aUc_XCg01TQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
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

export interface Document {
  id: string;
  assessment_id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  created_at: string;
}
