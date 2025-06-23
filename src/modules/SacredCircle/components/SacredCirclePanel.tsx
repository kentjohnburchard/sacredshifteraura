import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  Music, 
  Sparkles, 
  Users,
  Calendar,
  Plus,
  Heart,
  Settings,
  Smile,
  Paperclip,
  Clock,
  Info,
  ArrowRight,
  Loader,
  AlertTriangle
} from 'lucide-react';

export const SacredCirclePanel: React.FC = () => {
  const { activeCircle, messages, profiles, sendMessage, sendFrequency, startGroupMeditation, getProfile } = useSacredCircle();
  const { getChakraColor } = useChakra();
  const { user } = useAuth();
  
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickFrequencies = [
    { freq: 528, name: 'Love', chakra: 'heart', color: '#22C55E' },
    { freq: 741, name: 'Intuition', chakra: 'third-eye', color: '#6366F1' },
    { freq: 963, name: 'Crown', chakra: 'crown', color: '#9333EA' },
    { freq: 396, name: 'Root', chakra: 'root', color: '#DC2626' }
  ];

  const sacredEmojis = ['🙏', '✨', '💜', '🌟', '🧘‍♀️', '🧘‍♂️', '🕉️', '💎', '🌸', '🦋', '🌙', '☀️'];

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  if (!activeCircle) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">Select a Sacred Circle</h3>
        <p className="text-gray-400">Choose a circle from the list to start connecting with your soul tribe</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
      {/* Circle Header */}
      <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeCircle.image_url ? (
              <img
                src={activeCircle.image_url}
                alt={activeCircle.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {activeCircle.is_direct_message ? (
                  <MessageCircle className="w-5 h-5 text-white" />
                ) : (
                  <Heart className="w-5 h-5 text-white" />
                )}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white">{activeCircle.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {!activeCircle.is_direct_message && (
                  <>
                    <Users className="w-3 h-3" />
                    <span>{activeCircle.member_count || 0} members</span>
                    <span>•</span>
                  </>
                )}
                {activeCircle.is_direct_message ? (
                  <span>Direct Message</span>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{activeCircle.active_now || 0} active</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Circle Information"
            >
              <Info className="w-4 h-4" />
            </button>
            {!activeCircle.is_direct_message && (
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Circle Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesRef}
        className="h-96 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Heart className="w-12 h-12 text-purple-400/30 mb-4" />
            <p className="text-gray-400 text-center">No messages yet. Be the first to share wisdom!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px bg-gray-700 flex-grow"></div>
                  <div className="text-xs text-gray-400 px-2 py-1 bg-slate-800/70 rounded-full">
                    {new Date(date).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="h-px bg-gray-700 flex-grow"></div>
                </div>
                
                <div className="space-y-4">
                  {groupedMessages[date].map(message => {
                    // Check if profile has been loaded
                    const profile = profiles[message.user_id];
                    
                    // For system messages
                    if (message.is_system_message) {
                      return (
                        <motion.div
                          key={message.id}
                          className="flex justify-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="inline-block py-1 px-3 bg-slate-800/70 rounded-lg text-sm text-purple-300">
                            {message.content}
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={message.id}
                        className={`flex gap-3 ${message.user_id === user?.id ? 'justify-end' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {message.user_id !== user?.id && (
                          <div className="flex-shrink-0">
                            {profile?.avatar_url ? (
                              <img 
                                src={profile.avatar_url} 
                                alt={profile.full_name || profile.username || 'User'} 
                                className="w-8 h-8 rounded-full object-cover" 
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {(profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`flex-1 max-w-[75%] flex flex-col ${message.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                          {message.user_id !== user?.id && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">
                                {profile?.full_name || profile?.username || 'Unknown User'}
                              </span>
                              {message.chakra_energy && (
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getChakraColor(message.chakra_energy as any) }}
                                />
                              )}
                              <span className="text-xs text-gray-400">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          
                          <div 
                            className={`bg-slate-800/50 rounded-lg p-3 border ${
                              message.user_id === user?.id 
                                ? 'border-purple-500/20 text-right'
                                : 'border-gray-700'
                            }`}
                          >
                            <p className="text-gray-300">{message.content}</p>
                            
                            {message.message_type && message.message_type !== 'text' && (
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                {message.message_type === 'frequency' && (
                                  <div className="flex items-center gap-1 text-purple-300">
                                    <Music className="w-4 h-4" />
                                    <span>Frequency Shared</span>
                                  </div>
                                )}
                                {message.message_type === 'meditation' && (
                                  <div className="flex items-center gap-1 text-cyan-300">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Meditation Started</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {message.user_id === user?.id && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {message.id.startsWith('temp-') && (
                                <span className="ml-2 italic">Sending...</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator when fetching profiles */}
        {messages.some(m => !profiles[m.user_id] && !m.is_system_message) && (
          <div className="flex justify-center my-2">
            <div className="inline-flex items-center px-3 py-1 bg-slate-800/70 rounded-lg text-xs text-purple-300">
              <Loader className="w-3 h-3 mr-2 animate-spin" />
              Loading user details...
            </div>
          </div>
        )}
      </div>

      {/* Quick Frequency Actions */}
      {!activeCircle.is_direct_message && (
        <div className="p-4 border-t border-purple-500/20 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Quick Frequencies</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickFrequencies.map((freq) => (
              <motion.button
                key={freq.freq}
                onClick={() => sendFrequency(freq.freq, freq.chakra)}
                className="p-2 bg-slate-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-all text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: freq.color }}
                />
                <div className="text-white font-medium">{freq.freq}Hz</div>
                <div className="text-gray-400">{freq.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeCircle.is_direct_message
                  ? "Type your message..."
                  : "Share your sacred message..."
              }
              rows={1}
              className="w-full p-3 pr-20 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none resize-none"
            />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSubmitting}
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              className="mt-2 p-3 bg-slate-800 rounded-lg border border-gray-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-6 gap-2">
                {sacredEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMessageInput(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-2 hover:bg-slate-700 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {!activeCircle.is_direct_message && (
          <div className="mt-3 flex gap-2">
            <motion.button
              onClick={() => startGroupMeditation(15, 'heart')}
              className="flex-1 p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-xs flex items-center justify-center gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-3 h-3" />
              Start Meditation
            </motion.button>
            
            <motion.button
              onClick={() => sendMessage('🙏 Sending love and light to all souls here ✨')}
              className="flex-1 p-2 bg-pink-600/20 text-pink-300 rounded-lg hover:bg-pink-600/30 transition-colors text-xs flex items-center justify-center gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-3 h-3" />
              Send Love
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
