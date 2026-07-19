import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { assertRateLimit } from '../lib/security';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

type DemoUser = {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; role?: string };
};

type AccessProfile = {
  role: 'user' | 'super_admin';
  is_blocked: boolean;
};

type AuthContextValue = {
  user: User | DemoUser | null;
  loading: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getDemoAccessProfile(demoUser: DemoUser): AccessProfile {
  return {
    role: demoUser.user_metadata?.role === 'super_admin' ? 'super_admin' : 'user',
    is_blocked: false
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [accessProfile, setAccessProfile] = useState<AccessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSupabaseUser(currentUser: User | null) {
      if (cancelled) return;

      setUser(currentUser);
      setAccessProfile(null);

      if (!currentUser || !supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role,is_blocked')
        .eq('id', currentUser.id)
        .single();

      if (cancelled) return;

      setAccessProfile(error ? { role: 'user', is_blocked: false } : data);
      setLoading(false);
    }

    if (!hasSupabaseConfig || !supabase) {
      const demo = localStorage.getItem('hg-demo-user');
      if (demo) {
        const demoUser = JSON.parse(demo) as DemoUser;
        setUser(demoUser);
        setAccessProfile(getDemoAccessProfile(demoUser));
      }
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      loadSupabaseUser(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      loadSupabaseUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: accessProfile?.role === 'super_admin' && !accessProfile.is_blocked,
      isBlocked: accessProfile?.is_blocked === true,
      async signIn(email, password) {
        assertRateLimit(`login-${email}`);
        if (!hasSupabaseConfig || !supabase) {
          const demoUser = {
            id: 'demo-user',
            email,
            user_metadata: {
              full_name: 'Usuario VERTEX',
              role: email.toLowerCase() === 'admin@vertex.com' ? 'super_admin' : 'user'
            }
          };
          localStorage.setItem('hg-demo-user', JSON.stringify(demoUser));
          setUser(demoUser);
          setAccessProfile(getDemoAccessProfile(demoUser));
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(email, password, name) {
        assertRateLimit(`signup-${email}`, 5);
        if (!hasSupabaseConfig || !supabase) {
          const demoUser = { id: 'demo-user', email, user_metadata: { full_name: name, role: 'user' } };
          localStorage.setItem('hg-demo-user', JSON.stringify(demoUser));
          setUser(demoUser);
          setAccessProfile(getDemoAccessProfile(demoUser));
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
      },
      async resetPassword(email) {
        assertRateLimit(`reset-${email}`, 3);
        if (!hasSupabaseConfig || !supabase) return;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/settings`
        });
        if (error) throw error;
      },
      async signOut() {
        if (hasSupabaseConfig && supabase) await supabase.auth.signOut();
        localStorage.removeItem('hg-demo-user');
        setUser(null);
        setAccessProfile(null);
      }
    }),
    [accessProfile, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
