import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  currentRole: 'user' | 'host';
  signUp: (
    email: string,
    password: string,
    userData?: Partial<Profile>
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithApple: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  devBypass: (role: 'user' | 'host') => Promise<void>;
  switchRole: (role: 'user' | 'host') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<'user' | 'host'>('user');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<Profile>();

      if (!error && data) {
        setProfile(data);
        // Set initial role based on profile
        setCurrentRole(data.is_host ? 'host' : 'user');
      }
    } catch (error: unknown) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile after user is set
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setCurrentRole('user');
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData?: Partial<Profile>
  ): Promise<{ error: AuthError | null }> => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData,
      },
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We sent you a confirmation link",
      });
    }

    return { error };
  };

  const switchRole = (role: 'user' | 'host') => {
    if (!profile?.is_host && role === 'host') {
      toast({
        title: "Access Denied",
        description: "You need to be registered as a host to access host features.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentRole(role);
    toast({
      title: "Role Switched",
      description: `Switched to ${role === 'user' ? 'Guest' : 'Host'} view`
    });
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signInWithApple = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Apple sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully"
      });
    }
  };

  const devBypass = import.meta.env.MODE === 'development'
    ? async (role: 'user' | 'host') => {
        const password = 'dev123456';
        const email = `dev-${role}@lilo.local`;

        try {
          // Dev users are pre-created with fixed credentials via migration
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          toast({
            title: "Dev bypass activated",
            description: `Signed in as development ${role}`
          });
        } catch (error: unknown) {
          toast({
            title: "Dev bypass failed",
            description: error instanceof Error ? error.message : String(error),
            variant: "destructive"
          });
        }
      }
    : async () => {
        throw new Error('Dev bypass is only available in development');
      };

  const value = useMemo(() => ({
    user,
    session,
    loading,
    profile,
    currentRole,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    devBypass,
    switchRole
  }), [user, session, loading, profile, currentRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};