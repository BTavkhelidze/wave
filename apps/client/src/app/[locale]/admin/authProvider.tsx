import { supabase } from '@/lib/supabaseClient';
import { AuthProvider } from '@refinedev/core';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, redirectTo: '/admin' };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error };
    return { success: true, redirectTo: '/home' };
  },
  check: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return { authenticated: true };
    return { authenticated: false, redirectTo: '/home' };
  },
  getPermissions: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Check your custom user_roles table
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return data?.role || null;
  },
  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true };
    }
    return { error };
  },
};
