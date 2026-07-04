import { CONFIG } from '../config.js';

let supabaseInstance = null;

export function getSupabase() {
    if (supabaseInstance) return supabaseInstance;
    
    const url = CONFIG.supabaseUrl;
    const key = CONFIG.supabaseKey;
    
    if (!url || !key) {
        console.warn('Supabase credentials are not configured.');
        return null;
    }
    
    if (!window.supabase) {
        console.error('Supabase library (supabase-js) is not loaded in the window object.');
        return null;
    }
    
    try {
        supabaseInstance = window.supabase.createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });
        return supabaseInstance;
    } catch (error) {
        console.error('Failed to create Supabase client:', error);
        return null;
    }
}

// Reset instance when credentials change
export function resetSupabaseInstance() {
    supabaseInstance = null;
}
