import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: false,
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (userError) throw userError;

            set({ 
              user: userData,
              session: data.session,
              loading: false
            });
          }
        } catch (error: any) {
          set({ loading: false });
          throw new Error(error.message || 'Failed to sign in');
        }
      },
      signUp: async (email: string, password: string, username: string) => {
        try {
          set({ loading: true });
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username
              }
            }
          });
          
          if (authError) throw authError;
          
          if (authData.user) {
            const { error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  id: authData.user.id,
                  username,
                  email,
                },
              ]);
              
            if (profileError) throw profileError;
            
            set({ 
              user: {
                id: authData.user.id,
                username,
                email,
              },
              session: authData.session,
              loading: false
            });
          }
        } catch (error: any) {
          set({ loading: false });
          throw new Error(error.message || 'Failed to create account');
        }
      },
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          // Clear user store data
          useUserStore.getState().resetStore();
          // Clear auth store data
          set({ user: null, session: null, loading: false });
          // Clear persisted storage
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('user-preferences');
        } catch (error: any) {
          throw new Error(error.message || 'Failed to sign out');
        }
      },
      setSession: (session) => {
        if (session) {
          set({ 
            session,
            user: {
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || session.user.email
            },
            loading: false
          });
        } else {
          set({ session: null, user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);