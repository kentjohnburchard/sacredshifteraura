import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export const usePresenceTracker = (supabase: SupabaseClient, userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    // Track user presence on mount
    const trackPresence = async () => {
      try {
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          activity_type: 'presence',
          created_at: new Date().toISOString(),
        });
        console.log('User presence tracked');
      } catch (err) {
        console.warn('[PresenceTracker] Failed to log initial user activity:', err);
      }
    };
    
    trackPresence();

    // Set up interval for regular presence updates
    const interval = setInterval(async () => {
      try {
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          activity_type: 'presence',
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[PresenceTracker] Failed to log user activity:', err);
      }
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [supabase, userId]);
};