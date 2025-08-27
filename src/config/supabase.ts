import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kjvabvlsygwcthxxscos.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdmFidmxzeWd3Y3RoeHhzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAyMDYsImV4cCI6MjA3MTgyNjIwNn0.A1VG4w9j0UaerMkifeJ_gtJ3hJ7j9zuNdn_0GMkxTT8';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  question: string;
  transcript: string;
  score: number;
  analysis: any;
  created_at: string;
}

export interface Progress {
  user_id: string;
  total_sessions: number;
  average_score: number;
  best_score: number;
  streak: number;
  updated_at: string;
}
