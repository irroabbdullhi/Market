import { getSupabase } from './supabaseClient.js';

export const authService = {
    // Register user with email, password and metadata (which triggers profile and role creation)
    async register(email, password, fullName, phone, role = 'customer') {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    role: role // Handled by trigger public.handle_new_user()
                }
            }
        });

        if (error) throw error;
        return data;
    },

    // Login with email and password
    async login(email, password) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    // Sign in with Google
    async loginWithGoogle() {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) throw error;
        return data;
    },

    // Forgot password - Send link
    async forgotPassword(email) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/pages/login.html?tab=reset'
        });

        if (error) throw error;
        return data;
    },

    // Reset password (authenticated or with recovery flow session)
    async resetPassword(newPassword) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return data;
    },

    // Sign out user
    async logout() {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Clear locally stored session details
        localStorage.removeItem('suuqlink_user_role');
        localStorage.removeItem('suuqlink_user_profile');
    },

    // Get current user session
    async getSession() {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) return null;
        return session;
    },

    // Get current logged in user details
    async getCurrentUser() {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        return user;
    },

    // Get active user's roles
    async getUserRole(userId) {
        const supabase = getSupabase();
        if (!supabase) return null;

        // Check local cache first
        const cachedRole = localStorage.getItem('suuqlink_user_role');
        if (cachedRole) return cachedRole;

        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

        if (error || !data) return null;

        localStorage.setItem('suuqlink_user_role', data.role);
        return data.role;
    },

    // Get user profile details
    async getUserProfile(userId) {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) return null;
        return data;
    },

    // Update user profile info
    async updateProfile(userId, updates) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured.');

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name: updates.fullName,
                phone: updates.phone,
                billing_address: updates.billingAddress,
                shipping_address: updates.shippingAddress,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Listen to changes in auth state (e.g. login/logout)
    onAuthChange(callback) {
        const supabase = getSupabase();
        if (!supabase) return () => {};

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const role = await this.getUserRole(session.user.id);
                callback(event, session, role);
            } else {
                localStorage.removeItem('suuqlink_user_role');
                localStorage.removeItem('suuqlink_user_profile');
                callback(event, null, null);
            }
        });

        return () => subscription.unsubscribe();
    }
};
