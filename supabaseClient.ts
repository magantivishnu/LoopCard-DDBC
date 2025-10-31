import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = 'https://nzlumvzymlbynjkwxudn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bHVtdnp5bWxieW5qa3d4dWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzAxMDMsImV4cCI6MjA3NzMwNjEwM30.F1zVVzrXVP250h2N5QZiMe7PzIP_U9oKWK1LxFAY0X8';

// This web-compatible client uses localStorage by default.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
