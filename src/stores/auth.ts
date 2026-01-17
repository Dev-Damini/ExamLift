import { create } from 'zustand';
import { AuthUser } from '../types';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

async function mapSupabaseUser(user: User): Promise<AuthUser> {
  // Fetch user profile to get admin status and ensure profile exists
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin, username')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    username: profile?.username || user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    isAdmin: profile?.is_admin || false,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: (user) => set({ user, loading: false }),
  logout: () => set({ user: null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

// Initialize auth state
let mounted = true;

supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (!mounted) return;
  
  if (session?.user) {
    const authUser = await mapSupabaseUser(session.user);
    useAuthStore.getState().login(authUser);
  }
  useAuthStore.getState().setLoading(false);
});

const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (!mounted) return;

    if (event === 'SIGNED_IN' && session?.user) {
      const authUser = await mapSupabaseUser(session.user);
      useAuthStore.getState().login(authUser);
      useAuthStore.getState().setLoading(false);
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.getState().logout();
      useAuthStore.getState().setLoading(false);
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      const authUser = await mapSupabaseUser(session.user);
      useAuthStore.getState().login(authUser);
    }
  }
);

export const cleanup = () => {
  mounted = false;
  subscription.unsubscribe();
};
