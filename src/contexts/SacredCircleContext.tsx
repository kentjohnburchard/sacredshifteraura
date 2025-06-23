import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useChakra } from './ChakraContext';
import { useXP } from './XPProvider';
import { SupabaseService } from '../services/SupabaseService';

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
  member_count?: number;
  active_now?: number;
  is_private?: boolean;
}

interface SacredMessage {
  id: string;
  circle_id: string;
  user_id: string;
  content: string;
  message_type?: string;
  chakra_energy?: string;
  vibration_level?: string;
  is_edited?: boolean;
  created_at: string;
  updated_at?: string;
  attachment_url?: string;
  participants?: string[];
  frequency_hz?: number;
  is_system_message?: boolean;
  reactions?: Array<{ userId: string; chakra: string; timestamp: Date }>;
  // Add a temporary client-side ID to help with optimistic updates
  temp_id?: string;
}

interface SacredEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  scheduled_start: string;
  duration_minutes?: number;
  max_participants?: number;
  chakra_focus?: string;
  location?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  status: string;
  creator_id: string;
  participants: Array<{ user_id: string; joined_at: string; status: string }>;
  settings?: {
    allow_late_join?: boolean;
    send_reminders?: boolean;
    reminder_minutes?: number[];
    require_approval?: boolean;
    is_private?: boolean;
    auto_start?: boolean;
    recording_enabled?: boolean;
    broadcast_enabled?: boolean;
    xp_reward?: number;
  };
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  light_level?: number;
  created_at?: string;
}

interface SacredCircleContextType {
  circles: Circle[];
  activeCircle: Circle | null;
  messages: SacredMessage[];
  events: SacredEvent[];
  isLoading: boolean;
  error: string | null;
  profiles: Record<string, UserProfile>;

  setActiveCircle: (circle: Circle | null) => void;
  sendMessage: (content: string, type?: string) => Promise<void>;
  sendFrequency: (frequency: number, chakra: string) => Promise<void>;
  startGroupMeditation: (duration: number, chakra: string) => Promise<void>;
  createEvent: (eventData: Partial<SacredEvent>) => Promise<string>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  createDirectMessageCircle: (userId: string) => Promise<void>;
  createCircle: (name: string, description: string, isPrivate: boolean) => Promise<void>;
  getProfile: (userId: string) => Promise<UserProfile | null>;
  refreshCircles: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const SacredCircleContext = createContext<SacredCircleContextType | undefined>(undefined);

export const useSacredCircle = () => {
  const context = useContext(SacredCircleContext);
  if (!context) {
    throw new Error('useSacredCircle must be used within a SacredCircleProvider');
  }
  return context;
};

export const SacredCircleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeChakra } = useChakra();
  const { addXP } = useXP();
  const supabase = SupabaseService.getInstance().client;

  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [messages, setMessages] = useState<SacredMessage[]>([]);
  const [events, setEvents] = useState<SacredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  // Load circles on init or when user changes
  useEffect(() => {
    if (user) {
      fetchCircles();
      fetchEvents();
    }
  }, [user?.id]);

  // Set up message subscription when active circle changes
  useEffect(() => {
    if (activeCircle) {
      fetchMessages(activeCircle.id);
      subscribeToMessages(activeCircle.id);
    } else {
      setMessages([]);
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
        setRealtimeSubscription(null);
      }
    }

    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
        setRealtimeSubscription(null);
      }
    };
  }, [activeCircle]);

  // Fetch all circles (relying on RLS for filtering)
  const fetchCircles = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[SacredCircleContext] Fetching circles...');

      const { data: fetchedCircles, error: circlesError } = await supabase
        .from('circles')
        .select('*')
        .order('created_at', { ascending: false });

      if (circlesError) throw circlesError;

      console.log('[SacredCircleContext] Fetched circles (RLS applied):', fetchedCircles?.length || 0);

      const processedCircles = await Promise.all((fetchedCircles || []).map(async (circle) => {
        if (circle.is_direct_message && circle.direct_message_participants) {
          const otherUserId = circle.direct_message_participants.find(id => id !== user.id);
          if (otherUserId) {
            const profile = await getProfile(otherUserId);
            if (profile) {
              circle.name = profile.full_name || profile.username || 'Anonymous User';
            }
          }
        } else if (!circle.is_direct_message) {
          try {
            const { count, error: countError } = await supabase
              .from('circle_members')
              .select('*', { count: 'exact', head: true })
              .eq('circle_id', circle.id);

            if (!countError) {
              circle.member_count = count || 0;
              circle.active_now = Math.floor(Math.random() * Math.max(1, count || 0));
            }
          } catch (err) {
            console.warn(`[SacredCircleContext] Could not fetch member count for circle ${circle.id}:`, err);
            circle.member_count = 0;
            circle.active_now = 0;
          }
        }
        return circle;
      }));

      setCircles(processedCircles);

    } catch (err) {
      console.error('[SacredCircleContext] Error fetching circles:', err);
      setError('Failed to load circles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (circleId: string) => {
    if (!user) return;

    try {
      console.log(`[SacredCircleContext] Fetching messages for circle: ${circleId}`);

      const { data, error } = await supabase
        .from('circle_messages')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log(`[SacredCircleContext] Fetched ${data?.length || 0} messages`);
      setMessages(data || []);

      const userIds = new Set<string>();
      data?.forEach(message => userIds.add(message.user_id));

      for (const userId of userIds) {
        if (!profiles[userId]) {
          await getProfile(userId);
        }
      }
    } catch (err) {
      console.error('[SacredCircleContext] Error fetching messages:', err);
    }
  };

  const subscribeToMessages = (circleId: string) => {
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }

    console.log(`[SacredCircleContext] Setting up message subscription for circle: ${circleId}`);

    const channel = supabase
      .channel(`circle_messages_${circleId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
        filter: `circle_id=eq.${circleId}`
      }, (payload) => {
        console.log('[SacredCircleContext] New message received via real-time:', payload);

        const receivedMessage = payload.new as SacredMessage;

        setMessages(prevMessages => {
          // Check if there's an optimistic message that matches
          // We assume content, user_id, and circle_id are sufficient for matching
          // If you have a 'temp_id' field, that would be even better for a precise match.
          const existingIndex = prevMessages.findIndex(
            (msg) =>
              msg.temp_id === receivedMessage.temp_id || // Match by temp_id if available
              (msg.content === receivedMessage.content &&
               msg.user_id === receivedMessage.user_id &&
               msg.circle_id === receivedMessage.circle_id &&
               msg.id.startsWith('temp-')) // Ensure we only replace optimistic messages
          );

          if (existingIndex > -1) {
            // Replace the optimistic message with the real one
            const newMessages = [...prevMessages];
            newMessages[existingIndex] = { ...receivedMessage, temp_id: undefined }; // Remove temp_id after reconciliation
            console.log('[SacredCircleContext] Reconciled optimistic message.');
            return newMessages;
          } else {
            // If no optimistic message was found (e.g., message from another user), just add it
            console.log('[SacredCircleContext] Added new message from real-time.');
            return [...prevMessages, receivedMessage];
          }
        });

        // Fetch profile for message author if needed
        if (!profiles[receivedMessage.user_id]) {
          getProfile(receivedMessage.user_id);
        }
      })
      .subscribe();

    setRealtimeSubscription({ unsubscribe: () => supabase.removeChannel(channel) });
  };

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sacred_events')
        .select(`
          *,
          participants:event_participants(*)
        `)
        .order('scheduled_start', { ascending: true });

      if (error) throw error;

      const formattedEvents = data?.map(event => ({
        ...event,
        participants: event.participants || []
      })) || [];

      console.log('[SacredCircleContext] Fetched events:', formattedEvents.length);
      setEvents(formattedEvents);
    } catch (err) {
      console.error('[SacredCircleContext] Error fetching events:', err);
    }
  };

  const getProfile = async (userId: string): Promise<UserProfile | null> => {
    if (profiles[userId]) {
      return profiles[userId];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, light_level, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfiles(prev => ({
        ...prev,
        [userId]: data
      }));

      return data;
    } catch (err) {
      console.error(`[SacredCircleContext] Error fetching profile for user ${userId}:`, err);
      return null;
    }
  };

  const sendMessage = async (content: string, type = 'text') => {
    if (!activeCircle || !user) return;

    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const newMessage: Partial<SacredMessage> = {
        circle_id: activeCircle.id,
        user_id: user.id,
        content,
        message_type: type,
        is_system_message: false,
        created_at: new Date().toISOString(),
        temp_id: tempMessageId // Add a temporary ID for optimistic update reconciliation
      };

      // Optimistic update: Add message to UI immediately with temp ID
      const optimisticMessage: SacredMessage = {
        ...newMessage,
        id: tempMessageId, // Use temp_id as id for optimistic display
        created_at: new Date().toISOString()
      } as SacredMessage;

      setMessages(prev => [...prev, optimisticMessage]);
      console.log('[SacredCircleContext] Optimistically added message:', optimisticMessage);


      // Actually send message to Supabase.
      // We pass the temp_id here so Supabase can return it in the real-time payload.
      // You might need to add `temp_id` column to your `circle_messages` table in Supabase,
      // or rely solely on content+user_id+circle_id for reconciliation if adding a DB column is not feasible.
      const { data, error } = await supabase
        .from('circle_messages')
        .insert({ ...newMessage, temp_id: tempMessageId }) // Send temp_id to DB if you added the column
        .select();

      if (error) {
        console.error('[SacredCircleContext] Supabase insert error:', error);
        throw error;
      }

      addXP(type === 'text' ? 5 : type === 'frequency' ? 10 : 15);

      console.log('[SacredCircleContext] Message successfully sent to DB:', data[0]);

      // The message will be reconciled by the real-time subscription.
      // We no longer need to manually update state here after a successful DB insert.
    } catch (err) {
      console.error('[SacredCircleContext] Error sending message, rolling back optimistic update:', err);

      // Remove optimistic message on error by filtering by temp_id
      setMessages(prev => prev.filter(m => m.id !== tempMessageId));
      setError('Failed to send message. Please try again.'); // Optionally set a visible error
    }
  };

  const sendFrequency = async (freq: number, chakra: string) => {
    const content = `🎵 Sharing ${freq}Hz ${chakra} Chakra Frequency`;
    await sendMessage(content, 'frequency');
  };

  const startGroupMeditation = async (duration: number, chakra: string) => {
    const content = `🧘‍♀️ Starting ${duration}-minute group meditation focused on ${chakra} chakra`;
    await sendMessage(content, 'meditation');
    addXP(25);
  };

  const createEvent = async (eventData: Partial<SacredEvent>): Promise<string> => {
    if (!user) return '';

    try {
      const newEvent: Partial<SacredEvent> = {
        title: eventData.title || 'Untitled Event',
        description: eventData.description,
        event_type: eventData.event_type || 'meditation',
        scheduled_start: eventData.scheduled_start || new Date().toISOString(),
        duration_minutes: eventData.duration_minutes || 30,
        max_participants: eventData.max_participants,
        chakra_focus: eventData.chakra_focus,
        location: eventData.location || 'Sacred Digital Space',
        is_recurring: eventData.is_recurring || false,
        recurrence_pattern: eventData.recurrence_pattern,
        status: 'scheduled',
        creator_id: user.id,
        settings: eventData.settings || {
          allow_late_join: true,
          send_reminders: true,
          reminder_minutes: [15, 5],
          require_approval: false,
          is_private: false,
          xp_reward: 25
        }
      };

      const { data, error } = await supabase
        .from('sacred_events')
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;

      console.log('[SacredCircleContext] Created event:', data);

      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: user.id,
          status: 'confirmed'
        });

      if (participantError) throw participantError;

      await fetchEvents();

      addXP(50);

      return data.id;
    } catch (err) {
      console.error('[SacredCircleContext] Error creating event:', err);
      return '';
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { data: existing, error: checkError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) return;

      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed'
        })
        .select();

      if (error) throw error;

      console.log('[SacredCircleContext] Joined event:', data);

      await fetchEvents();

      addXP(10);
    } catch (err) {
      console.error('[SacredCircleContext] Error joining event:', err);
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchEvents();
    } catch (err) {
      console.error('[SacredCircleContext] Error leaving event:', err);
    }
  };

  const createDirectMessageCircle = async (userId: string) => {
    if (!user) return;

    try {
      const participantsArray = [user.id, userId].sort();
      const { data: existingDMs, error: checkError } = await supabase
        .from('circles')
        .select('*')
        .eq('is_direct_message', true)
        .contains('direct_message_participants', participantsArray);

      if (checkError) throw checkError;

      if (existingDMs && existingDMs.length > 0) {
        console.log('[SacredCircleContext] DM already exists:', existingDMs[0]);
        setActiveCircle(existingDMs[0]);
        return;
      }

      const otherUserProfile = await getProfile(userId);

      const dmName = `Chat with ${otherUserProfile?.full_name || otherUserProfile?.username || 'User'}`;
      const { data, error } = await supabase
        .from('circles')
        .insert({
          name: dmName,
          description: 'Private conversation',
          creator_id: user.id,
          love_level: 0,
          ascension_tier: 'Seed',
          ascension_points: 0,
          is_direct_message: true,
          direct_message_participants: participantsArray,
          is_private: true,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[SacredCircleContext] Created DM circle:', data);

      await supabase
        .from('circle_messages')
        .insert({
          circle_id: data.id,
          user_id: user.id,
          content: `💜 Direct message conversation started. Messages are private between participants.`,
          is_system_message: true,
          created_at: new Date().toISOString()
        });

      await fetchCircles();
      setActiveCircle(data);
    } catch (err) {
      console.error('[SacredCircleContext] Error creating direct message circle:', err);
      throw err;
    }
  };

  const createCircle = async (name: string, description: string, isPrivate: boolean) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('circles')
        .insert({
          name,
          description,
          creator_id: user.id,
          love_level: 0,
          ascension_tier: 'Seed',
          ascension_points: 0,
          is_direct_message: false,
          is_private: isPrivate,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: data.id,
          user_id: user.id,
          role: 'creator'
        });

      if (memberError) throw memberError;

      await supabase
        .from('circle_messages')
        .insert({
          circle_id: data.id,
          user_id: user.id,
          content: `✨ Welcome to ${name}! This sacred space was just created.`,
          is_system_message: true,
          created_at: new Date().toISOString()
        });

      console.log('[SacredCircleContext] Created new circle:', data);

      await fetchCircles();
      setActiveCircle(data);

      addXP(50);
    } catch (err) {
      console.error('[SacredCircleContext] Error creating circle:', err);
      setError('Failed to create circle. Please try again.');
    }
  };

  const refreshCircles = fetchCircles;
  const refreshMessages = () => activeCircle ? fetchMessages(activeCircle.id) : Promise.resolve();

  return (
    <SacredCircleContext.Provider value={{
      circles,
      activeCircle,
      messages,
      events,
      isLoading,
      error,
      profiles,

      setActiveCircle,
      sendMessage,
      sendFrequency,
      startGroupMeditation,
      createEvent,
      joinEvent,
      leaveEvent,
      createDirectMessageCircle,
      createCircle,
      getProfile,
      refreshCircles,
      refreshMessages
    }}>
      {children}
    </SacredCircleContext.Provider>
  );
};