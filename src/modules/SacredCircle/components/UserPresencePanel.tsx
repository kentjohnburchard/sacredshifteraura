import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { 
  Users, 
  Circle, 
  Crown,
  Heart,
  Sparkles,
  MessageCircle,
  Headphones
} from 'lucide-react';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'meditation' | 'away' | 'in-event';
  chakra_focus?: string;
  current_activity?: string;
  last_seen?: string;
  ascension_tier: string;
  xp_level: number;
}

export const UserPresencePanel: React.FC = () => {
  const { user } = useAuth();
  const { getChakraColor } = useChakra();
  const { createDirectMessageCircle } = useSacredCircle();
  const supabase = SupabaseService.getInstance().client;
  
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch online users
    const fetchOnlineUsers = async () => {
      try {
        // Assuming we have a way to determine online users (we're mocking for now)
        // In a production app, this would query a 'presence' table or use Supabase realtime presence
        const { data: profilesData, error } = await supabase
          .from('profiles')
          .select('*')
          .order('last_level_up', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        // Convert profiles to online users
        const mockUsers: OnlineUser[] = profilesData?.map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.username || 'Anonymous User',
          avatar: profile.avatar_url,
          status: (Math.random() > 0.5) ? 'online' : (Math.random() > 0.5 ? 'meditation' : 'in-event'),
          chakra_focus: ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'][Math.floor(Math.random() * 7)],
          current_activity: Math.random() > 0.5 ? 'Heart Chakra Circle' : 'Sacred Sound Bath',
          ascension_tier: profile.ascension_title || 'Seeker',
          xp_level: profile.light_level || 1
        })) || [];
        
        // Remove current user from the list
        const filteredUsers = mockUsers.filter(u => u.id !== user.id);
        setOnlineUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };
    
    fetchOnlineUsers();
    
    // Set up interval to refresh online users
    const interval = setInterval(fetchOnlineUsers, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'meditation': return <Circle className="w-3 h-3 text-purple-400" />;
      case 'online': return <Circle className="w-3 h-3 text-green-400" />;
      case 'in-event': return <Circle className="w-3 h-3 text-blue-400" />;
      case 'away': return <Circle className="w-3 h-3 text-yellow-400" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'meditation': return 'text-purple-300 bg-purple-900/20';
      case 'online': return 'text-green-300 bg-green-900/20';
      case 'in-event': return 'text-blue-300 bg-blue-900/20';
      case 'away': return 'text-yellow-300 bg-yellow-900/20';
      default: return 'text-gray-300 bg-gray-900/20';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Enlightened': return <Crown className="w-3 h-3 text-amber-400" />;
      case 'Transcendent': return <Sparkles className="w-3 h-3 text-purple-400" />;
      case 'Flowering': return <Heart className="w-3 h-3 text-pink-400" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const handleStartDirectMessage = (userId: string) => {
    if (!user) return;
    
    createDirectMessageCircle(userId);
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Sacred Presence
        </h3>
        <div className="text-sm text-purple-300">
          {onlineUsers.length} souls present
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {onlineUsers.map((onlineUser) => (
            <motion.div
              key={onlineUser.id}
              className="p-3 bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  {onlineUser.avatar ? (
                    <img
                      src={onlineUser.avatar}
                      alt={onlineUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {onlineUser.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusIcon(onlineUser.status)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm truncate">
                      {onlineUser.name}
                    </h4>
                    {getTierIcon(onlineUser.ascension_tier)}
                    <span className="text-xs text-gray-400">Lv.{onlineUser.xp_level}</span>
                  </div>

                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(onlineUser.status)}`}>
                    <span className="capitalize">{onlineUser.status.replace('-', ' ')}</span>
                  </div>

                  {onlineUser.current_activity && (
                    <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {onlineUser.current_activity}
                    </div>
                  )}

                  {onlineUser.chakra_focus && (
                    <div className="mt-1 flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getChakraColor(onlineUser.chakra_focus as any) }}
                      />
                      <span className="text-xs text-gray-400 capitalize">
                        {onlineUser.chakra_focus} chakra
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Direct Message Button */}
                <button 
                  onClick={() => handleStartDirectMessage(onlineUser.id)}
                  className="p-1 rounded-full text-gray-400 hover:text-purple-300 hover:bg-slate-700/50"
                  title="Send direct message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
        <div className="text-xs text-purple-300 mb-2 font-medium">Your Presence</div>
        <div className="flex items-center gap-2 text-sm">
          <Circle className="w-3 h-3 text-green-400" />
          <span className="text-white">Online</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">Sacred Circle</span>
        </div>
      </div>
    </div>
  );
};