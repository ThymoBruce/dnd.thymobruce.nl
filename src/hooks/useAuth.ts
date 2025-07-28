import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, resetPassword, getCurrentUser } from '../lib/supabase';

const ensureUserProfile = async (user: User, retryCount = 0) => {
  // Avoid infinite retries
  if (retryCount > 3) {
    console.warn('Max retries reached for user profile creation');
    return;
  }

  try {
    // Check if user profile exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.warn('Error checking user profile, retrying...', fetchError);
      // Retry after a short delay
      setTimeout(() => ensureUserProfile(user, retryCount + 1), 1000);
      return;
    }

    // If user doesn't exist, create profile
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'player'
        }]);

      if (insertError) {
        // If it's a duplicate key error, the user was created by another process
        if (insertError.code === '23505') {
          console.log('User profile already exists (created by another process)');
          return;
        }
        
        console.warn('Error creating user profile, retrying...', insertError);
        // Retry after a short delay
        setTimeout(() => ensureUserProfile(user, retryCount + 1), 1000);
      }
    }
  } catch (error) {
    console.warn('Error ensuring user profile, retrying...', error);
    // Retry after a short delay
    setTimeout(() => ensureUserProfile(user, retryCount + 1), 1000);
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

    // Listen for auth changes first
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        try {
          const currentUser = session?.user ?? null;
          
          if (mounted) {
            setUser(currentUser);
            setLoading(false);
            setInitialized(true);
          }
          
          // Only create profile after successful sign in, not on initial load
          if (currentUser && event === 'SIGNED_IN' && mounted) {
            // Don't await this to avoid blocking the UI
            ensureUserProfile(currentUser);
          }
        } catch (err) {
          if (mounted) {
            console.error('Auth state change error:', err);
            setError(err instanceof Error ? err.message : 'Authentication error');
            setLoading(false);
            setInitialized(true);
          }
        }
      }
    );

    // Get initial session after setting up listener
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
          setError(error.message);
        } else {
          if (mounted) {
            setUser(session?.user ?? null);
            setLoading(false);
            setInitialized(true);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Initialize auth error:', err);
          setError(err instanceof Error ? err.message : 'Authentication error');
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Small delay to ensure Supabase is ready
    setTimeout(getInitialSession, 100);

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
    loading: loading || !initialized,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  };
};