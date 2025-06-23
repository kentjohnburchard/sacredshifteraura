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
  Headphones,
  RefreshCw,
  User,
  Calendar
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
  const { createDirectMessageCircle, getProfile } = useSacredCircle();
  const supabase = SupabaseService.getInstance().client;
  
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!user) return;
    
    fetchOnlineUsers();
    
    // Set up interval to refresh online users
    const interval = setInterval(fetchOnlineUsers, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Add search effect
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchForUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchOnlineUsers = async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      
      // Get users active in the last 15 minutes
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('user_id, created_at')
        .gt('created_at', fifteenMinutesAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching active users:', error);
        return;
      }
      
      // Get unique users
      const uniqueUserIds = [...new Set(data?.map(item => item.user_id))].filter(id => id !== user.id);
      
      if (!uniqueUserIds.length) {
        setOnlineUsers([]);
        return;
      }
      
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueUserIds);
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        return;
      }

      // Convert to online users format
      const onlineUsersList: OnlineUser[] = (profiles || []).map(profile => {
        // Find latest activity timestamp
        const userActivity = data?.filter(a => a.user_id === profile.id).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        // Randomly assign status for demo purposes
        const statuses: OnlineUser['status'][] = ['online', 'meditation', 'in-event', 'away'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Randomly assign chakra
        const chakras = ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'];
        const randomChakra = chakras[Math.floor(Math.random() * chakras.length)];
        
        return {
          id: profile.id,
          name: profile.full_name || profile.username || 'Anonymous User',
          avatar: profile.avatar_url || undefined,
          status: randomStatus,
          chakra_focus: randomChakra,
          current_activity: randomStatus === 'meditation' ? 'Heart Chakra Meditation' : 
                           randomStatus === 'in-event' ? 'Sacred Sound Bath' : undefined,
          last_seen: userActivity?.created_at,
          ascension_tier: profile.ascension_title || 'Seeker',
          xp_level: profile.light_level || 1
        };
      });
      
      setOnlineUsers(onlineUsersList);
      
    } catch (err) {
      console.error('Error fetching online users:', err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Search for users function
  const searchForUsers = async (query: string) => {
    if (!user || query.length < 2) return;
    
    try {
      // Search for users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10);
      
      if (error) throw error;
      
      // Convert to search results
      const searchResults: OnlineUser[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || profile.username || 'Anonymous User',
        avatar: profile.avatar_url || undefined,
        status: 'online', // Default for search results
        last_seen: profile.updated_at,
        ascension_tier: profile.ascension_title || 'Seeker',
        xp_level: profile.light_level || 1
      }));
      
      setSearchResults(searchResults);
    } catch (err) {
      console.error('Error searching for users:', err);
    }
  };

  const handleStartDirectMessage = async (userId: string) => {
    if (!user) return;
    
    try {
      await createDirectMessageCircle(userId);
    } catch (err) {
      console.error('Error starting direct message:', err);
    }
  };

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

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    
    const lastSeenDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Sacred Presence
        </h3>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchOnlineUsers}
            disabled={isRefreshing}
            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-sm text-purple-300">
            {onlineUsers.length} souls present
          </div>
        </div>
      </div>
      
      {/* User Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for souls..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-gray-700 focus:border-purple-400 focus:outline-none"
          />
          <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
              {searchResults.map(user => (
                <div 
                  key={user.id}
                  className="p-3 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => handleStartDirectMessage(user.id)}
                >
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-400">Level {user.xp_level}</div>
                    </div>
                    <div className="ml-auto">
                      <button className="p-1.5 bg-purple-900/30 rounded-full hover:bg-purple-900/50 transition-colors">
                        <MessageCircle className="w-4 h-4 text-purple-300" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {onlineUsers.map((onlineUser) => (
            <motion.div
              key={onlineUser.id}
              className="p-3 bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all relative"
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
                      {onlineUser.status === 'meditation' ? (
                        <Sparkles className="w-3 h-3" />
                      ) : onlineUser.status === 'in-event' ? (
                        <Calendar className="w-3 h-3" />
                      ) : (
                        <MessageCircle className="w-3 h-3" />
                      )}
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

      {onlineUsers.length === 0 && !isRefreshing && (
        <div className="text-center py-6 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No souls online right now</p>
          <button 
            onClick={fetchOnlineUsers}
            className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
          >
            Refresh
          </button>
        </div>
      )}

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