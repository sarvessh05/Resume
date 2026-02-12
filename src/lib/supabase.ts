/**
 * Supabase Client Configuration
 * Handles database and storage connections
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database type definitions
 * Provides type safety for Supabase queries
 */
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string;
          experience_min: number;
          experience_max: number;
          required_skills: string[];
          optional_skills: string[];
          status: 'active' | 'closed' | 'draft';
          total_resumes: number;
          processed_resumes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
      candidates: {
        Row: {
          id: string;
          job_id: string;
          resume_filename: string;
          resume_url: string;
          parsed_data: any;
          match_score: number;
          skill_match_score: number;
          experience_match_score: number;
          explanation: string;
          strengths: string[];
          gaps: string[];
          recommendation: 'Shortlist' | 'Review' | 'Reject';
          processed_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['candidates']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>;
      };
    };
  };
}
