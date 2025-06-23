import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import {
  MessageCircle,
  Search,
  User,
  Plus,
  X,
  Clock
} from 'lucide-react';

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  last_seen?: string;
  light_level?: number;
}

export const DirectMessageList: React.FC = () => {
  const { circles, activeCircle, setActiveCircle, createDirectMessageCircle } = useSacredCircle();
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingDM, setIsCreatingDM] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers();
    } else {
      setUserResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    if (!user || searchQuery.length < 2) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, light_level')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq('id', user.id)
        .limit(5);

      if (error) throw error;

      setUserResults(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartDM = async (profile: UserProfile) => {
    if (!user) return;

    setSelectedUser(profile);
    setIsCreatingDM(true);

    try {
      await createDirectMessageCircle(profile.id);
      setShowUserSearch(false);
      setSearchQuery('');
      setSelectedUser(null);
    } catch (err) {
      console.error('Error creating DM:', err);
    } finally {
      setIsCreatingDM(false);
    }
  };

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const lastSeen = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const directMessageCircles = circles.filter(c => c.is_direct_message);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          Direct Messages
        </h3>
        <button
          onClick={() => setShowUserSearch(!showUserSearch)}
          className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showUserSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Start New Conversation</h4>
              <button
                onClick={() => setShowUserSearch(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-3 text-gray-400 text-sm">Searching...</div>
              ) : (
                userResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={() => handleStartDM(profile)}
                  >
                    <div className="flex items-center gap-3">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || profile.username || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {profile.full_name || profile.username || 'Anonymous User'}
                        </div>
                        {profile.light_level && (
                          <div className="text-xs text-gray-400">
                            Level {profile.light_level}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors text-xs"
                      disabled={isCreatingDM && selectedUser?.id === profile.id}
                    >
                      {isCreatingDM && selectedUser?.id === profile.id ? 'Connecting...' : 'Message'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {directMessageCircles.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No direct messages yet</p>
            <p className="text-xs mt-1">Start a conversation to connect</p>
          </div>
        ) : (
          directMessageCircles.map((circle) => (
            <motion.div
              key={circle.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                activeCircle?.id === circle.id
                  ? 'bg-purple-900/20 border border-purple-400'
                  : 'bg-slate-800/50 border border-gray-700 hover:border-purple-500/50'
              }`}
              onClick={() => setActiveCircle(circle)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                {circle.image_url ? (
                  <img
                    src={circle.image_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{circle.name}</h3>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Last active: 5m ago</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
