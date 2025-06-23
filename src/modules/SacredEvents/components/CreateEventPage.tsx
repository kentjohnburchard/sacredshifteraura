import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Star,
  Play,
  MessageCircle,
  ArrowLeft,
  Plus,
  Settings
} from 'lucide-react';

interface CreateEventPageProps {
  onBack: () => void;
  onEventCreated: (eventId: string) => void;
}

export const CreateEventPage: React.FC<CreateEventPageProps> = ({ onBack, onEventCreated }) => {
  const { createEvent } = useSacredCircle();
  const { getChakraColor } = useChakra();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meditation',
    scheduled_start: '',
    duration_minutes: 30,
    max_participants: 10,
    chakra_focus: 'heart',
    location: 'Sacred Digital Space',
    is_recurring: false,
    recurrence_pattern: '',
    settings: {
      allow_late_join: true,
      send_reminders: true,
      reminder_minutes: [15, 5],
      require_approval: false,
      is_private: false,
      auto_start: false,
      recording_enabled: false,
      broadcast_enabled: false,
      xp_reward: 25
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const eventTypes = [
    { id: 'meditation', name: 'Group Meditation', icon: Star, description: 'Guided meditation session' },
    { id: 'sound-bath', name: 'Sound Bath', icon: Play, description: 'Healing frequency experience' },
    { id: 'discussion', name: 'Sacred Discussion', icon: MessageCircle, description: 'Conscious dialogue circle' },
    { id: 'ceremony', name: 'Sacred Ceremony', icon: Calendar, description: 'Spiritual ritual or ceremony' }
  ];

  const chakraOptions = [
    { id: 'root', name: 'Root Chakra', color: '#DC2626' },
    { id: 'sacral', name: 'Sacral Chakra', color: '#EA580C' },
    { id: 'solar', name: 'Solar Plexus', color: '#FACC15' },
    { id: 'heart', name: 'Heart Chakra', color: '#22C55E' },
    { id: 'throat', name: 'Throat Chakra', color: '#3B82F6' },
    { id: 'third-eye', name: 'Third Eye', color: '#6366F1' },
    { id: 'crown', name: 'Crown Chakra', color: '#9333EA' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventId = await createEvent(formData);
      onEventCreated(eventId);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSettings = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }));
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
        
        <h1 className="text-xl font-bold text-white">Create Sacred Event</h1>
        
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Name your sacred gathering..."
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe the sacred intention and flow of this event..."
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
            />
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Event Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {eventTypes.map((type) => (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => updateFormData('event_type', type.id)}
                className={`p-3 rounded-lg border transition-all ${
                  formData.event_type === type.id
                    ? 'border-purple-400 bg-purple-900/20 text-purple-300'
                    : 'border-gray-600 bg-slate-800/50 text-gray-300 hover:border-purple-500/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <type.icon className="w-5 h-5 mx-auto mb-2" />
                <div className="text-sm font-medium">{type.name}</div>
                <div className="text-xs opacity-70 mt-1">{type.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Schedule & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_start}
              onChange={(e) => updateFormData('scheduled_start', e.target.value)}
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => updateFormData('duration_minutes', parseInt(e.target.value))}
              min="5"
              max="180"
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Participants
            </label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) => updateFormData('max_participants', parseInt(e.target.value))}
              min="2"
              max="100"
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Chakra Focus */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Chakra Focus
          </label>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
            {chakraOptions.map((chakra) => (
              <motion.button
                key={chakra.id}
                type="button"
                onClick={() => updateFormData('chakra_focus', chakra.id)}
                className={`p-3 rounded-lg border transition-all ${
                  formData.chakra_focus === chakra.id
                    ? 'border-purple-400 bg-purple-900/20'
                    : 'border-gray-600 bg-slate-800/50 hover:border-purple-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="w-6 h-6 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: chakra.color }}
                />
                <div className="text-xs text-gray-300">{chakra.name.split(' ')[0]}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="Sacred Digital Space"
            className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Advanced Settings
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              className="transition-transform"
            >
              ▼
            </motion.div>
          </button>

          {showAdvanced && (
            <motion.div
              className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-gray-600 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.allow_late_join}
                    onChange={(e) => updateSettings('allow_late_join', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Allow late joining</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.send_reminders}
                    onChange={(e) => updateSettings('send_reminders', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Send reminders</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.require_approval}
                    onChange={(e) => updateSettings('require_approval', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Require approval</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.is_private}
                    onChange={(e) => updateSettings('is_private', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Private event</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  XP Reward for Participation
                </label>
                <input
                  type="number"
                  value={formData.settings.xp_reward}
                  onChange={(e) => updateSettings('xp_reward', parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4 pt-4">
          <motion.button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Create Sacred Event
          </motion.button>

          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};