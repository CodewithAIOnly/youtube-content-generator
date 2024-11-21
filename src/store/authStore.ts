import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          set({ 
            user: userData,
            session: data.session,
            loading: false
          });
        }
      },
      signUp: async (email: string, password: string, username: string) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
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
      },
      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, loading: false });
      },
      setSession: (session) => {
        if (session) {
          set({ 
            session,
            user: {
              id: session.user.id,
              email: session.user.email,
              username: session.user.email // Initially set to email, will be updated when user data is fetched
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