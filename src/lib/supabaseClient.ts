import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkhhxouuavfqzccahihe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraGh4b3V1YXZmcXpjY2FoaWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODA1MzYsImV4cCI6MjA3OTU1NjUzNn0.dJqT8Co_o2rrsdxmmgkQm3NnNQasWlJ2aUc_XCg01TQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
