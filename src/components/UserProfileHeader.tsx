import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SupabaseService } from '../services/SupabaseService';
import { useSyncContext } from '../contexts/SyncContext';
import { 
  User, 
  Star, 
  Menu, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Heart,
  Sparkles,
  Cloud,
  CloudOff
} from 'lucide-react';

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  light_points?: number;
  light_level?: number;
  ascension_title?: string;
}

export const UserProfileHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const { syncStatus, forceSync } = useSyncContext();
  const supabase = SupabaseService.getInstance().client;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);
  
  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // First check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'sacred_seeker',
          full_name: 'Sacred Seeker',
          avatar_url: null,
          light_points: 0,
          light_level: 1,
          ascension_title: 'Seeker',
          created_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
        
        setProfile(createdProfile);
      }
    } catch (err) {
      console.error('Profile loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMenu = () => setShowMenu(!showMenu);
  
  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  const handleSyncNow = async () => {
    await forceSync();
  };

  if (!user || isLoading) {
    return (
      <div className="h-10 flex items-center">
        <div className="w-10 h-10 bg-slate-800/80 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name || 'User'} 
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-white">
              {profile?.full_name || user.email?.split('@')[0] || 'Sacred Seeker'}
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-300">
              <Star className="w-3 h-3" />
              {profile?.light_level || 1} • {profile?.ascension_title || 'Seeker'}
            </div>
          </div>
          
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </button>
      
      <motion.div 
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ 
          opacity: showMenu ? 1 : 0, 
          y: showMenu ? 0 : -10,
          height: showMenu ? 'auto' : 0
        }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-full mt-2 w-64 overflow-hidden"
        style={{ display: showMenu ? 'block' : 'none' }}
      >
        <div className="bg-slate-900 shadow-lg rounded-lg border border-purple-500/20 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'User'} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
              )}
              
              <div>
                <div className="font-medium text-white">
                  {profile?.full_name || user.email?.split('@')[0] || 'Sacred Seeker'}
                </div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-purple-900/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1 text-purple-300">
                <Star className="w-4 h-4" />
                <span>Level {profile?.light_level || 1}</span>
              </div>
              <div className="text-xs text-gray-400">{profile?.light_points || 0} XP</div>
            </div>
          </div>
          
          <div>
            <button className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-gray-200">Soul Profile</span>
            </button>
            
            <button 
              onClick={handleSyncNow}
              className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              {syncStatus.isOnline ? (
                <Cloud className="w-5 h-5 text-blue-400" />
              ) : (
                <CloudOff className="w-5 h-5 text-gray-400" />
              )}
              <div className="flex-1">
                <span className="text-gray-200">Sync Data</span>
                {syncStatus.pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-600/30 text-amber-300">
                    {syncStatus.pendingCount}
                  </span>
                )}
              </div>
            </button>
            
            <button className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-400" />
              <span className="text-gray-200">Account Settings</span>
            </button>
            
            <button 
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-5 h-5 text-amber-400" />
              <span className="text-gray-200">Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};