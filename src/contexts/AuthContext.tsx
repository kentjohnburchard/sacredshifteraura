// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js';
import { SupabaseService } from '../services/SupabaseService';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the designated admin email here
const adminEmail = 'kentburchard@sacredshifter.com'; // Admin email for access control

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = SupabaseService.getInstance().client;
  const geh = GlobalEventHorizon.getInstance();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // State to hold admin status

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(session);
        setUser(session?.user || null);
        // Calculate isAdmin based on the user's email matching the admin email
        setIsAdmin(session?.user?.email?.toLowerCase() === adminEmail.toLowerCase());

        if (session?.user) {
          geh.publish({
            type: 'auth:user:signedIn',
            sourceId: 'AUTH_PROVIDER',
            timestamp: new Date().toISOString(),
            payload: {
              user: {
                id: session.user.id,
                email: session.user.email,
              },
              session: {
                expires_at: session.expires_at
              }
            },
            metadata: { provider: 'supabase' },
            essenceLabels: ['auth:signin', 'user:authenticated', 'session:started']
          });
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setError((error as AuthError).message);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
      // Calculate isAdmin on auth state change
      setIsAdmin(session?.user?.email?.toLowerCase() === adminEmail.toLowerCase());

      if (session?.user) {
        geh.publish({
          type: 'auth:user:stateChanged',
          sourceId: 'AUTH_PROVIDER',
          timestamp: new Date().toISOString(),
          payload: { userId: session.user.id, state: 'authenticated' },
          metadata: { email: session.user.email },
          essenceLabels: ['auth:state', 'user:active', 'session:valid']
        });
      } else {
        geh.publish({
          type: 'auth:user:stateChanged',
          sourceId: 'AUTH_PROVIDER',
          timestamp: new Date().toISOString(),
          payload: { state: 'unauthenticated' },
          metadata: {},
          essenceLabels: ['auth:state', 'user:inactive', 'session:none']
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, geh]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      // Calculate isAdmin on sign in
      setIsAdmin(data.user?.email?.toLowerCase() === adminEmail.toLowerCase());

      geh.publish({
        type: 'auth:user:signedIn',
        sourceId: 'AUTH_PROVIDER',
        timestamp: new Date().toISOString(),
        payload: {
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          method: 'password'
        },
        metadata: { provider: 'supabase' },
        essenceLabels: ['auth:signin', 'user:authenticated', 'session:started']
      });
    } catch (error) {
      console.error('Error signing in:', error);
      setError((error as AuthError).message);

      geh.publish({
        type: 'auth:user:signInFailed',
        sourceId: 'AUTH_PROVIDER',
        timestamp: new Date().toISOString(),
        payload: { error: (error as AuthError).message },
        metadata: { email },
        essenceLabels: ['auth:error', 'signin:failed', 'security:alert']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const options = {
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      };

      const { data, error } = await supabase.auth.signUp(options);

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      // Calculate isAdmin on sign up
      setIsAdmin(data.user?.email?.toLowerCase() === adminEmail.toLowerCase());

      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .update({
              username: username || email.split('@')[0],
              email: email,
              light_level: 1,
              light_points: 0,
              ascension_title: 'Seeker',
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
        } catch (profileError) {
          console.error('Error updating initial profile:', profileError);
        }
      }

      geh.publish({
        type: 'auth:user:signedUp',
        sourceId: 'AUTH_PROVIDER',
        timestamp: new Date().toISOString(),
        payload: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
          }
        },
        metadata: { provider: 'supabase' },
        essenceLabels: ['auth:signup', 'user:created', 'journey:started']
      });
    } catch (error) {
      console.error('Error signing up:', error);
      setError((error as AuthError).message);

      geh.publish({
        type: 'auth:user:signUpFailed',
        sourceId: 'AUTH_PROVIDER',
        timestamp: new Date().toISOString(),
        payload: { error: (error as AuthError).message },
        metadata: { email },
        essenceLabels: ['auth:error', 'signup:failed', 'security:alert']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSession(null);
      setUser(null);
      setIsAdmin(false); // Reset isAdmin on sign out

      geh.publish({
        type: 'auth:user:signedOut',
        sourceId: 'AUTH_PROVIDER',
        timestamp: new Date().toISOString(),
        payload: {},
        metadata: {},
        essenceLabels: ['auth:signout', 'user:unauthenticated', 'session:ended']
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setError((error as AuthError).message);

      geh.publish({
        type: 'auth:user:signOutFailed',
        sourceId: 'AUTH_PROVIDER',
        timestamp: new Date().toISOString(),
        payload: { error: (error as AuthError).message },
        metadata: {},
        essenceLabels: ['auth:error', 'signout:failed']
      });
    } finally {
      setIsLoading(false);
    }
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
      isAdmin // Expose isAdmin in the context
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