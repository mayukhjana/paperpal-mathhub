
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gpzoytysrrormkmytmyk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwem95dHlzcnJvcm1rbXl0bXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTU0NTgsImV4cCI6MjA1OTUzMTQ1OH0.8H6jkUG_HkwqZfx6PlQIw9VTetifpYv7OYRJ2KM9W4g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    },
    db: {
      schema: 'public',
    }
  }
);

// Check if we can connect to Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('exams').select('id').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection test exception:', err);
    return false;
  }
};
