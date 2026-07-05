// SuuqLink App Configuration

// Fallback hardcoded defaults if you wish to configure them directly in code
const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_KEY = '';

export const CONFIG = {
    get supabaseUrl() {
        return localStorage.getItem('https://uiceedlnwrhxbqgyzbaf.supabase.co') || DEFAULT_SUPABASE_URL;
    },
    get supabaseKey() {
        return localStorage.getItem('sb_publishable_irJYVkVSiRxnMbuEp2fthg_M_XE5lop') || DEFAULT_SUPABASE_KEY;
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
