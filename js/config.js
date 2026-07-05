// SuuqLink App Configuration

// Fallback hardcoded defaults if you wish to configure them directly in code
const DEFAULT_SUPABASE_URL = 'https://uiceedlnwrhxbqgyzbaf.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_irJYVkVSiRxnMbuEp2fthg_M_XE5lop';

export const CONFIG = {
    get supabaseUrl() {
        return localStorage.getItem('SUUQLINK_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
    },
    get supabaseKey() {
        return localStorage.getItem('SUUQLINK_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY;
    },
    setCredentials(url, key) {
        localStorage.setItem('SUUQLINK_SUPABASE_URL', url.trim());
        localStorage.setItem('SUUQLINK_SUPABASE_KEY', key.trim());
    },
    clearCredentials() {
        localStorage.removeItem('SUUQLINK_SUPABASE_URL');
        localStorage.removeItem('SUUQLINK_SUPABASE_KEY');
    },
    get isConfigured() {
        return !!(this.supabaseUrl && this.supabaseKey);
    }
};
