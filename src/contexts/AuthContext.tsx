import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js';
import { SupabaseService } from '../services/SupabaseService';
import { 
  clearAuthStorage, 
  isInAuthRefreshLoop, 
  recordAuthFailure, 
  clearAuthFailureTracking,
  forceAuthReset 
} from '../utils/authUtils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  forceCleanSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = SupabaseService.getInstance().client;
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for active session on load
    const getSession = async () => {
      setIsLoading(true);
      try {
        // Check if we're in an auth refresh loop
        if (isInAuthRefreshLoop()) {
          console.warn('[AuthContext] Auth refresh loop detected, forcing reset');
          forceAuthReset();
          return;
        }

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          recordAuthFailure();
          
          // If session retrieval fails, clear any stale session
          await supabase.auth.signOut();
          clearAuthStorage();
          setSession(null);
          setUser(null);
          setError('Session expired. Please sign in again.');
        } else {
          setSession(session);
          setUser(session?.user || null);
          setError(null);
          
          // Clear failure tracking on successful session load
          if (session) {
            clearAuthFailureTracking();
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        recordAuthFailure();
        setError((error as AuthError).message);
        
        // Clear potentially corrupted session
        await supabase.auth.signOut();
        clearAuthStorage();
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes with proper refresh token handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state change:', event, session?.user?.id);
      
      // Handle successful token refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('[AuthContext] Token refreshed successfully');
        setSession(session);
        setUser(session?.user || null);
        setError(null);
        setIsLoading(false);
        clearAuthFailureTracking(); // Clear failure tracking on successful refresh
        return;
      }

      // Handle failed token refresh and other auth failures
      if (event === 'TOKEN_REFRESHED_FAILED' || event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.warn('[AuthContext] Auth failure detected:', event);
        
        // Record the failure
        if (event === 'TOKEN_REFRESHED_FAILED') {
          recordAuthFailure();
        }
        
        // Force clean sign-out to clear broken session
        await supabase.auth.signOut();
        clearAuthStorage();
        
        // Clear state
        setSession(null);
        setUser(null);
        setIsLoading(false);
        
        // Set appropriate error message
        if (event === 'TOKEN_REFRESHED_FAILED') {
          setError('Your session has expired. Please sign in again.');
          
          // If we're in a refresh loop, force a reset
          if (isInAuthRefreshLoop()) {
            console.warn('[AuthContext] Multiple refresh failures detected, forcing reset');
            setTimeout(() => forceAuthReset(), 1000); // Delay to show error message first
          }
        } else if (event === 'USER_DELETED') {
          setError('Your account has been deleted.');
        } else {
          setError(null); // Normal sign out
        }
        
        return;
      }

      // Handle normal auth state changes
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
      
      // Clear error and failure tracking on successful sign in
      if (event === 'SIGNED_IN' && session) {
        setError(null);
        clearAuthFailureTracking();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear any existing session first to prevent conflicts
      await supabase.auth.signOut();
      clearAuthStorage();
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // State will be updated via onAuthStateChange
      console.log('[AuthContext] Sign in successful');
    } catch (error) {
      console.error('Error signing in:', error);
      setError((error as AuthError).message);
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      clearAuthStorage();
      
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw error;
      }
      
      // State will be updated via onAuthStateChange
      console.log('[AuthContext] Sign up successful');
    } catch (error) {
      console.error('Error signing up:', error);
      setError((error as AuthError).message);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      clearAuthStorage();
      clearAuthFailureTracking();
      
      if (error) {
        throw error;
      }
      
      // State will be updated via onAuthStateChange
      console.log('[AuthContext] Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      setError((error as AuthError).message);
      setIsLoading(false);
    }
  };

  const forceCleanSignIn = async () => {
    console.log('[AuthContext] Forcing clean sign in');
    setIsLoading(true);
    setError(null);
    
    try {
      // Force clean everything
      await supabase.auth.signOut();
      clearAuthStorage();
      clearAuthFailureTracking();
      
      // Clear state
      setSession(null);
      setUser(null);
      
      // Show message to user
      setError('Session cleared. Please sign in again.');
    } catch (error) {
      console.error('Error during force clean sign in:', error);
      setError('Failed to clear session. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      error,
      signIn,
      signUp,
      signOut,
      clearError,
      forceCleanSignIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};