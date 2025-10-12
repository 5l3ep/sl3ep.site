import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://xccojtpfymqzkowepvob.supabase.co'; // プロジェクトURL
const SUPABASE_KEY = 'sb_publishable_e_N05sOgSvMO42LT3-avqQ_oYHt_7pf';          // anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);