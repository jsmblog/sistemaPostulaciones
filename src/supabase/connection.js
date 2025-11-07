
import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_KEY, VITE_SUPABASE_URL } from '../config/config';

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_KEY);