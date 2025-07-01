import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { useXP } from '../../../contexts/XPProvider';

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
  
  const [circles, setCircles] = useState<Circle[]>([
    {
      id: '1',
      name: 'Heart Chakra Healing Circle',
      description: 'A sacred space for heart chakra healing and love frequency sharing',
      love_level: 75,
      creator_id: '1',
      image_url: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=150',
      ascension_tier: 'Flowering',
      ascension_points: 150,
      member_count: 23,
      active_now: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Crystal Consciousness Collective',
      description: 'Explore crystal energies and sacred geometry in community',
      love_level: 88,
      creator_id: '2',
      image_url: 'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=150',
      ascension_tier: 'Transcendent',
      ascension_points: 280,
      member_count: 34,
      active_now: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Awakened Souls Sanctuary',
      description: 'A gathering place for newly awakened souls seeking guidance and community',
      love_level: 92,
      creator_id: '3',
      image_url: 'https://images.pexels.com/photos/355887/pexels-photo-355887.jpeg?auto=compress&cs=tinysrgb&w=150',
      ascension_tier: 'Enlightened',
      ascension_points: 450,
      member_count: 56,
      active_now: 18,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
  
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [messages, setMessages] = useState<SacredMessage[]>([]);
  const [events, setEvents] = useState<SacredEvent[]>([
    {
      id: 'event-1',
      title: 'Heart Chakra Healing Circle',
      description: 'Join us for a powerful heart chakra healing meditation',
      event_type: 'meditation',
      scheduled_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 45,
      max_participants: 12,
      chakra_focus: 'heart',
      location: 'Sacred Digital Space',
      status: 'scheduled',
      creator_id: 'soul-guide-1',
      participants: [
        { user_id: 'seeker-1', joined_at: new Date().toISOString(), status: 'confirmed' },
        { user_id: 'seeker-2', joined_at: new Date().toISOString(), status: 'confirmed' }
      ],
      settings: {
        allow_late_join: false,
        send_reminders: true,
        reminder_minutes: [15, 5],
        require_approval: false,
        is_private: false,
        xp_reward: 30
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'event-2',
      title: '528Hz Love Frequency Sound Bath',
      description: 'Experience the healing power of the love frequency',
      event_type: 'sound-bath',
      scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      max_participants: 20,
      chakra_focus: 'heart',
      location: 'Sacred Digital Space',
      status: 'scheduled',
      creator_id: 'frequency-keeper',
      participants: [
        { user_id: 'seeker-3', joined_at: new Date().toISOString(), status: 'confirmed' }
      ],
      settings: {
        allow_late_join: true,
        send_reminders: true,
        reminder_minutes: [30, 10],
        xp_reward: 40
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeCircle) {
      setMessages([
        {
          id: '1',
          circle_id: activeCircle.id,
          user_id: '2',
          content: 'Welcome to our sacred space, beautiful souls! 🙏✨',
          message_type: 'text',
          chakra_energy: 'heart',
          vibration_level: 'high',
          is_edited: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '2',
          circle_id: activeCircle.id,
          user_id: '3',
          content: 'Sending love and light to all gathered here 💜',
          message_type: 'text',
          chakra_energy: 'crown',
          vibration_level: 'high',
          is_edited: false,
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        }
      ]);
    }
  }, [activeCircle]);

  const sendMessage = async (content: string, type = 'text') => {
    if (!activeCircle || !user) return;

    const newMessage: SacredMessage = {
      id: Date.now().toString(),
      circle_id: activeCircle.id,
      user_id: user.id,
      content,
      message_type: type,
      chakra_energy: activeChakra,
      vibration_level: 'balanced',
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    addXP(type === 'text' ? 5 : 15);
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

    const newEvent: SacredEvent = {
      id: Date.now().toString(),
      title: eventData.title || 'New Event',
      event_type: eventData.event_type || 'meditation',
      scheduled_start: eventData.scheduled_start || new Date().toISOString(),
      status: 'scheduled',
      creator_id: user.id,
      participants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...eventData
    };

    setEvents(prev => [...prev, newEvent]);
    addXP(50);
    return newEvent.id;
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return;
    
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const isAlreadyJoined = event.participants.some(p => p.user_id === user.id);
        if (!isAlreadyJoined) {
          return {
            ...event,
            participants: [...event.participants, {
              user_id: user.id,
              joined_at: new Date().toISOString(),
              status: 'joined'
            }]
          };
        }
      }
      return event;
    }));
    
    addXP(10);
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) return;
    
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          participants: event.participants.filter(p => p.user_id !== user.id)
        };
      }
      return event;
    }));
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
      leaveEvent
    }}>
      {children}
    </SacredCircleContext.Provider>
  );
};