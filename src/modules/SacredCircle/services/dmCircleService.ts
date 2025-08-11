import { SupabaseClient } from '@supabase/supabase-js';

interface Circle {
  id: string;
  name: string;
  description: string;
  love_level: number;
  creator_id: string;
  image_url?: string;
  ascension_tier: string;
  ascension_points: number;
  created_at: string;
  updated_at: string;
  is_direct_message?: boolean;
  direct_message_participants?: string[];
  circle_type?: string;
  current_members?: number;
}

/**
 * Create or get DM circle between two users
 * Uses .contains filter which works as superset match for both user IDs
 */
export async function getOrCreateDmCircle(
  supabase: SupabaseClient, 
  userA: string, 
  userB: string
): Promise<Circle> {
  // Always sort so [a,b] and [b,a] match same row
  const participants = [userA, userB].sort();
  
  // Try to find existing DM circle
  const { data: existing, error: findErr } = await supabase
    .from('circles')
    .select('*')
    .eq('is_direct_message', true)
    .contains('direct_message_participants', participants) // Replace containsAll
    .maybeSingle();
  
  if (findErr && findErr.code !== 'PGRST116') {
    throw findErr; // Ignore "no rows" error
  }
  
  if (existing) {
    return existing;
  }
  
  // Get other user's profile for naming
  const { data: otherUserProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', userB)
    .single();
  
  if (profileErr) {
    console.warn('Could not fetch other user profile:', profileErr);
  }
  
  // Create new DM circle
  const dmName = otherUserProfile 
    ? `Chat with ${otherUserProfile.full_name || otherUserProfile.username || 'User'}`
    : 'Direct Message';
    
  const { data: created, error: createErr } = await supabase
    .from('circles')
    .insert({
      name: dmName,
      description: 'Private conversation',
      creator_id: userA,
      love_level: 0,
      ascension_tier: 'Seed',
      ascension_points: 0,
      is_direct_message: true,
      direct_message_participants: participants,
      circle_type: 'direct',
      current_members: 2
    })
    .select('*')
    .single();
  
  if (createErr) throw createErr;
  
  // Add both users as members
  const { error: memberErr } = await supabase
    .from('circle_members')
    .insert([
      { circle_id: created.id, user_id: userA, role: 'member' },
      { circle_id: created.id, user_id: userB, role: 'member' }
    ]);
  
  if (memberErr) {
    console.warn('Could not add circle members:', memberErr);
  }
  
  return created;
}

/**
 * Alternative: Find DM circles where either user is a participant
 * Use this if you need "either user" matching instead of "both users"
 */
export async function findDmCirclesForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Circle[]> {
  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .eq('is_direct_message', true)
    .overlaps('direct_message_participants', [userId]); // Any match
  
  if (error) throw error;
  
  return data || [];
}