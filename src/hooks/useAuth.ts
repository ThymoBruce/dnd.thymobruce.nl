import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, resetPassword, getCurrentUser } from '../lib/supabase';

// Global state to track profile creation
let globalProfileCreationInProgress = false;
const profileCreationCache = new Map<string, boolean>();

const ensureUserProfile = async (user: User, retryCount = 0) => {
  // Check cache first
  if (profileCreationCache.has(user.id)) {
    return;
  }

  // Prevent multiple simultaneous attempts
  if (globalProfileCreationInProgress) {
    return;
  }

  // Avoid infinite retries
  if (retryCount > 2) {
    console.warn('Max retries reached for user profile creation');
    return;
  }

  globalProfileCreationInProgress = true;

  try {
    // Check if user profile exists by ID
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.warn('Error checking user profile:', fetchError);
      globalProfileCreationInProgress = false;
      return;
    }

    // If user exists, cache it and return
    if (existingUser) {
      profileCreationCache.set(user.id, true);
      globalProfileCreationInProgress = false;
      return;
    }

    // Try to create new user profile
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'player'
        }]);

      if (!insertError) {
        profileCreationCache.set(user.id, true);
      } else if (insertError.code === '23505') {
        // Duplicate key - profile already exists
        profileCreationCache.set(user.id, true);
      } else {
        console.warn('Error creating user profile:', insertError);
        // Retry once after a delay
        if (retryCount < 2) {
          globalProfileCreationInProgress = false;
          setTimeout(() => ensureUserProfile(user, retryCount + 1), 2000);
          return;
        }
      }
    } catch (createError) {
      console.warn('Exception creating user profile:', createError);
    }
  } catch (error) {
    console.warn('Error ensuring user profile:', error);
  } finally {
    globalProfileCreationInProgress = false;
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
    let hasProcessedInitialSession = false;
    let profileCreationInProgress = false;

    // Set up auth state listener
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        const currentUser = session?.user ?? null;
        
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
          setError(null);
        }
        
        // Only create profile on explicit sign in
        if (currentUser && event === 'SIGNED_IN' && mounted) {
          ensureUserProfile(currentUser);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      if (hasProcessedInitialSession) return;
      hasProcessedInitialSession = true;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
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
      profileCreationInProgress = false;
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
    setProfileCreated(false);
    // Clear profile cache on sign out
    profileCreationCache.clear();
    globalProfileCreationInProgress = false;
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