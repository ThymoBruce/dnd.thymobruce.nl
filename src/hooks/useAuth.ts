import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, resetPassword } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting initial session:', error);
            setError(error.message);
          } else {
            setUser(session?.user ?? null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Initialize auth error:', err);
          setError(err instanceof Error ? err.message : 'Authentication error');
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await signUp(email, password, name);
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
    return { data, error };
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
    return { data, error };
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
    return { error };
  };

  const handleResetPassword = async (email: string) => {
    setError(null);
    const { data, error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    }
    
    return { data, error };
  };

  return {
    user,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  };
};