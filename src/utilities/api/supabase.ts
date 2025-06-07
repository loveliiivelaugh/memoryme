import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseLocal = createClient(
    import.meta.env.VITE_SUPABASE_LOCAL_URL,
    import.meta.env.VITE_SUPABASE_LOCAL_PUBLIC_KEY,
    {
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
)

export { supabase, supabaseLocal };