import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, resetPassword, getCurrentUser } from '../lib/supabase';

// Helper function to ensure user exists in public.users table
const ensureUserExists = async (user: User) => {
  try {
    // Check if user exists in public.users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create them
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'player',
          avatar: user.user_metadata?.avatar_url
        }]);

      if (insertError) {
        console.error('Error creating user record:', insertError);
      }
    }
  } catch (err) {
    console.error('Error ensuring user exists:', err);
  }
};
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    // Set up auth state listener
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        
        // Ensure user exists in public.users table when they sign in
        if (currentUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await ensureUserExists(currentUser);
        }
        
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
          setError(null);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Ensure user exists in public.users table on initial load
          if (session?.user) {
            await ensureUserExists(session.user);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Initialize auth error:', err);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.data?.subscription?.unsubscribe();
      }
    };
  }, []);

  const handleSignUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await signUp(email, password, name);
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return { data, error };
    }
    
    // If signup successful and user is immediately available, ensure they exist in public.users
    if (data.user) {
      await ensureUserExists(data.user);
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