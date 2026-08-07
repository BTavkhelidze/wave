import { AuthProvider } from '@refinedev/core';
import { supabase } from '@/lib/supabaseClient';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error,
      };
    }

    if (data.user) {
      return {
        success: true,
        redirectTo: '/',
      };
    }

    return {
      success: false,
      error: {
        message: 'Login failed',
        name: 'Invalid credentials',
      },
    };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return {
        success: false,
        error,
      };
    }
    return {
      success: true,
      redirectTo: '/login',
    };
  },
  check: async () => {
    const { data } = await supabase.auth.getSession();
    const { session } = data;

    if (session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },
  getPermissions: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return data.user.role;
    }
    return null;
  },
  getIdentity: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
