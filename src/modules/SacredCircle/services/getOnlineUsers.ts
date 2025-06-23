import { SupabaseClient } from '@supabase/supabase-js';

interface OnlineUser {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  light_level?: number;
  status: 'online';
  last_seen: string | null;
}

export const getOnlineUsers = async (
  supabase: SupabaseClient,
  withinMinutes = 5
): Promise<OnlineUser[]> => {
  try {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();

    // Step 1: Fetch recent activity logs
    const { data: activityLogs, error: activityError } = await supabase
      .from('user_activity_logs')
      .select('user_id, timestamp')
      .gte('timestamp', since);

    if (activityError) {
      console.error('[getOnlineUsers] Activity log error:', activityError);
      return [];
    }

    if (!activityLogs || activityLogs.length === 0) {
      console.info('[getOnlineUsers] No active users found in the last', withinMinutes, 'minutes');
      return [];
    }

    // Step 2: Build map of latest timestamps per user
    const latestMap = new Map<string, string>();
    for (const log of activityLogs) {
      const current = latestMap.get(log.user_id);
      if (!current || new Date(log.timestamp) > new Date(current)) {
        latestMap.set(log.user_id, log.timestamp);
      }
    }

    const userIds = Array.from(latestMap.keys());
    if (userIds.length === 0) {
      return [];
    }

    // Step 3: Fetch user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, light_level')
      .in('id', userIds);

    if (profileError) {
      console.error('[getOnlineUsers] Profile fetch error:', profileError);
      return [];
    }

    return (profiles || []).map(profile => ({
      ...profile,
      status: 'online',
      last_seen: latestMap.get(profile.id) ?? null,
    }));
  } catch (err) {
    console.error('[getOnlineUsers] Unexpected failure:', err);
    return [];
  }
};
