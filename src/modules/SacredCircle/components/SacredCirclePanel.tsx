import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useChakra } from '../../../contexts/ChakraContext';
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
  Paperclip
} from 'lucide-react';

export const SacredCirclePanel: React.FC = () => {
  const { 
    activeCircle, 
    messages, 
    events,
    sendMessage, 
    sendFrequency,
    startGroupMeditation,
    createEvent 
  } = useSacredCircle();
  
  const { getChakraColor } = useChakra();
  const [messageInput, setMessageInput] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      await sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleCreateEvent = async () => {
    if (eventTitle.trim()) {
      await createEvent({
        title: eventTitle,
        event_type: 'meditation',
        duration_minutes: 30,
        chakra_focus: 'heart'
      });
      setEventTitle('');
      setShowEventForm(false);
    }
  };

  const quickFrequencies = [
    { freq: 528, name: 'Love', chakra: 'heart', color: '#22C55E' },
    { freq: 741, name: 'Intuition', chakra: 'third-eye', color: '#6366F1' },
    { freq: 963, name: 'Crown', chakra: 'crown', color: '#9333EA' },
    { freq: 396, name: 'Root', chakra: 'root', color: '#DC2626' }
  ];

  const sacredEmojis = ['🙏', '✨', '💜', '🌟', '🧘‍♀️', '🧘‍♂️', '🕉️', '💎', '🌸', '🦋', '🌙', '☀️'];

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
                <Heart className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-white">{activeCircle.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users className="w-3 h-3" />
                <span>{activeCircle.member_count} members</span>
                <span>•</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{activeCircle.active_now} active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Event Creation Form */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            className="p-4 bg-slate-800/50 border-b border-purple-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Create Sacred Event
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title..."
                className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Event
                </button>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <motion.div
            key={message.id}
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {message.user_id.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">Soul {message.user_id}</span>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getChakraColor(message.chakra_energy as any) }}
                />
                <span className="text-xs text-gray-400">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
                {message.message_type !== 'text' && (
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                    {message.message_type}
                  </span>
                )}
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-300">{message.content}</p>
                
                {message.frequency_hz && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-purple-300">
                    <Music className="w-4 h-4" />
                    <span>{message.frequency_hz}Hz</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Frequency Actions */}
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

      {/* Message Input */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your sacred message..."
              className="w-full p-3 pr-20 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
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
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
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
      </div>
    </div>
  );
};