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
}

interface SacredMessage {
  id: string;
  circle_id: string;
  user_id: string;
  content: string;
  message_type: string;
  chakra_energy: string;
  vibration_level: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  attachment_url?: string;
  participants?: string[];
  frequency_hz?: number;
  is_system_message?: boolean;
  reactions?: Array<{ userId: string; chakra: string; timestamp: Date }>;
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

interface SacredCircleContextType {
  circles: Circle[];
  activeCircle: Circle | null;
  messages: SacredMessage[];
  events: SacredEvent[];
  isLoading: boolean;
  setActiveCircle: (circle: Circle | null) => void;
  sendMessage: (content: string, type?: string) => Promise<void>;
  sendFrequency: (frequency: number, chakra: string) => Promise<void>;
  startGroupMeditation: (duration: number, chakra: string) => Promise<void>;
  createEvent: (eventData: Partial<SacredEvent>) => Promise<string>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  createDirectMessageCircle: (userId: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCircles();
      fetchEvents();
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeCircle) {
      fetchMessages(activeCircle.id);
    } else {
      setMessages([]);
    }
  }, [activeCircle]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!activeCircle) return;
    
    const channel = supabase
      .channel(`circle_${activeCircle.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
        filter: `circle_id=eq.${activeCircle.id}`
      }, (payload) => {
        // Add new message to state
        const newMessage = payload.new as SacredMessage;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCircle]);

  const fetchCircles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get circles the user is a member of
      const { data: memberCircles, error: memberError } = await supabase
        .from('circle_members')
        .select(`
          circle_id,
          circle:circles(*)
        `)
        .eq('user_id', user.id);
      
      if (memberError) throw memberError;
      
      // Get direct message circles
      const { data: dmCircles, error: dmError } = await supabase
        .from('circles')
        .select('*')
        .eq('is_direct_message', true)
        .contains('direct_message_participants', [user.id]);
      
      if (dmError) throw dmError;
      
      // Combine and format circles
      const formattedCircles: Circle[] = [
        // Extract circles from member relationships
        ...(memberCircles?.map(mc => ({
          ...mc.circle,
          member_count: 0, // Will be populated later
          active_now: 0 // Will be populated later
        })) || []),
        // Add DM circles
        ...(dmCircles || [])
      ];
      
      // Remove duplicates
      const uniqueCircles = formattedCircles.filter((c, index, self) => 
        index === self.findIndex(t => t.id === c.id)
      );
      
      console.log('Fetched circles:', uniqueCircles);
      setCircles(uniqueCircles);
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (circleId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('circle_messages')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
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
      
      // Format events with participants
      const formattedEvents = data?.map(event => ({
        ...event,
        participants: event.participants || []
      })) || [];
      
      console.log('Fetched events:', formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const sendMessage = async (content: string, type = 'text') => {
    if (!activeCircle || !user) return;

    try {
      const newMessage = {
        circle_id: activeCircle.id,
        user_id: user.id,
        content,
        message_type: type,
        chakra_energy: activeChakra,
        vibration_level: 'balanced',
        is_edited: false
      };

      const { data, error } = await supabase
        .from('circle_messages')
        .insert(newMessage)
        .select();
      
      if (error) throw error;

      addXP(type === 'text' ? 5 : 15);
      console.log('Message sent:', data[0]);
      // The message will be added to state via the real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
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
      // Prepare event data
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

      // Insert event
      const { data, error } = await supabase
        .from('sacred_events')
        .insert(newEvent)
        .select()
        .single();
      
      if (error) throw error;

      console.log('Created event:', data);
      
      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: user.id,
          status: 'confirmed'
        });
      
      if (participantError) throw participantError;

      // Update events list
      await fetchEvents();
      
      // Award XP
      addXP(50);
      
      return data.id;
    } catch (error) {
      console.error('Error creating event:', error);
      return '';
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      // Check if already joined
      const { data: existing, error: checkError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      
      if (checkError) throw checkError;
      
      // If already joined, do nothing
      if (existing && existing.length > 0) return;
      
      // Join event
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed'
        })
        .select();
      
      if (error) throw error;
      
      console.log('Joined event:', data);
      
      // Update events list
      await fetchEvents();
      
      // Award XP
      addXP(10);
    } catch (error) {
      console.error('Error joining event:', error);
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
      
      // Update events list
      await fetchEvents();
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };

  const createDirectMessageCircle = async (userId: string) => {
    if (!user) return;
    
    try {
      // Check if DM already exists
      const { data: existingDMs, error: checkError } = await supabase
        .from('circles')
        .select('*')
        .eq('is_direct_message', true)
        .containsAll('direct_message_participants', [user.id, userId]);
      
      if (checkError) throw checkError;
      
      // If DM already exists, set it as active
      if (existingDMs && existingDMs.length > 0) {
        setActiveCircle(existingDMs[0]);
        return;
      }
      
      // Get the other user's profile to get their name
      const { data: otherUser, error: userError } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      // Create new DM circle
      const dmName = `Chat with ${otherUser.full_name || otherUser.username || 'User'}`;
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
          direct_message_participants: [user.id, userId]
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Created DM circle:', data);
      
      // Add users as members
      await supabase
        .from('circle_members')
        .insert([
          { circle_id: data.id, user_id: user.id, role: 'member' },
          { circle_id: data.id, user_id: userId, role: 'member' }
        ]);
      
      // Update circles list and set as active
      await fetchCircles();
      setActiveCircle(data);
    } catch (error) {
      console.error('Error creating direct message circle:', error);
    }
  };

  return (
    <SacredCircleContext.Provider value={{
      circles,
      activeCircle,
      messages,
      events,
      isLoading,
      setActiveCircle,
      sendMessage,
      sendFrequency,
      startGroupMeditation,
      createEvent,
      joinEvent,
      leaveEvent,
      createDirectMessageCircle
    }}>
      {children}
    </SacredCircleContext.Provider>
  );
};