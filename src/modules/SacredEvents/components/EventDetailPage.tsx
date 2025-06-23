import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Star,
  Play,
  UserPlus,
  UserMinus,
  Settings,
  Share2,
  Heart,
  MessageCircle,
  ArrowLeft,
  Trash,
  Edit,
  Bell,
  X,
  AlertTriangle,
  Save
} from 'lucide-react';
import { SupabaseService } from '../../../services/SupabaseService';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventId, onBack }) => {
  const { events, joinEvent, leaveEvent } = useSacredCircle();
  const { getChakraColor } = useChakra();
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Event Not Found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isParticipant = event.participants.some(p => p.user_id === user?.id);
  const isCreator = event.creator_id === user?.id;

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Star className="w-6 h-6" />;
      case 'sound-bath': return <Play className="w-6 h-6" />;
      case 'discussion': return <MessageCircle className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'sound-bath': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'discussion': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const handleDeleteEvent = async () => {
    if (!isCreator) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('sacred_events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Go back to events list
      onBack();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditEvent = () => {
    setEditFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      scheduled_start: new Date(event.scheduled_start).toISOString().slice(0, 16),
      duration_minutes: event.duration_minutes || 30,
      max_participants: event.max_participants || 20,
      chakra_focus: event.chakra_focus || 'heart',
      location: event.location || 'Sacred Digital Space'
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!isCreator || !editFormData) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('sacred_events')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          event_type: editFormData.event_type,
          scheduled_start: editFormData.scheduled_start,
          duration_minutes: parseInt(editFormData.duration_minutes),
          max_participants: parseInt(editFormData.max_participants),
          chakra_focus: editFormData.chakra_focus,
          location: editFormData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Refresh event data by forcing a reload
      window.location.reload();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setIsUpdating(false);
      setShowEditModal(false);
    }
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
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          {isCreator && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Event Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl border ${getEventTypeColor(event.event_type)}`}>
            {getEventTypeIcon(event.event_type)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
            <div className="text-sm text-purple-300 uppercase tracking-wide font-medium">
              {event.event_type.replace('-', ' ')}
            </div>
          </div>
        </div>

        {event.description && (
          <p className="text-gray-300 leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <div className="font-medium">
                {new Date(event.scheduled_start).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(event.scheduled_start).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {event.duration_minutes && (
            <div className="flex items-center gap-3 text-gray-300">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-medium">{event.duration_minutes} minutes</div>
                <div className="text-sm text-gray-400">Duration</div>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-medium">{event.location}</div>
                <div className="text-sm text-gray-400">Location</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-300">
            <Users className="w-5 h-5 text-purple-400" />
            <div>
              <div className="font-medium">
                {event.participants.length}
                {event.max_participants && ` / ${event.max_participants}`} participants
              </div>
              <div className="text-sm text-gray-400">Souls joining</div>
            </div>
          </div>

          {event.chakra_focus && (
            <div className="flex items-center gap-3 text-gray-300">
              <div 
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: getChakraColor(event.chakra_focus as any) }}
              />
              <div>
                <div className="font-medium capitalize">{event.chakra_focus} Chakra</div>
                <div className="text-sm text-gray-400">Energy focus</div>
              </div>
            </div>
          )}

          {event.settings?.xp_reward && (
            <div className="flex items-center gap-3 text-gray-300">
              <Star className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-medium">{event.settings.xp_reward} XP</div>
                <div className="text-sm text-gray-400">Participation reward</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Sacred Participants</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {event.participants.map((participant, index) => (
            <motion.div
              key={participant.user_id}
              className="p-3 bg-slate-800/50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {participant.user_id.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Soul {participant.user_id.slice(0, 4)}</div>
                  <div className="text-xs text-gray-400">
                    Joined {new Date(participant.joined_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {isParticipant ? (
          <motion.button
            onClick={() => leaveEvent(event.id)}
            className="px-6 py-3 bg-red-600/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-600/30 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserMinus className="w-4 h-4" />
            Leave Event
          </motion.button>
        ) : (
          <motion.button
            onClick={() => joinEvent(event.id)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="w-4 h-4" />
            Join Sacred Event
          </motion.button>
        )}

        <button className="px-6 py-3 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Add to Favorites
        </button>
      </div>

      {/* Event Settings (for creators) */}
      <AnimatePresence>
        {showSettings && isCreator && (
          <motion.div
            className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-white font-medium mb-3">Event Management</h4>
            <div className="space-y-3">
              <button 
                onClick={handleEditEvent} 
                className="w-full p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4 text-blue-400" />
                Edit Event Details
              </button>
              <button 
                className="w-full p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-green-400" />
                Manage Participants
              </button>
              <button 
                className="w-full p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                Send Notifications
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full p-2 text-left text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Cancel Event
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Event Modal */}
      <AnimatePresence>
        {showEditModal && editFormData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Edit Event</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event Type
                    </label>
                    <select
                      value={editFormData.event_type}
                      onChange={(e) => setEditFormData({...editFormData, event_type: e.target.value})}
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="meditation">Meditation</option>
                      <option value="sound-bath">Sound Bath</option>
                      <option value="discussion">Discussion</option>
                      <option value="ceremony">Ceremony</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Chakra Focus
                    </label>
                    <select
                      value={editFormData.chakra_focus}
                      onChange={(e) => setEditFormData({...editFormData, chakra_focus: e.target.value})}
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="root">Root Chakra</option>
                      <option value="sacral">Sacral Chakra</option>
                      <option value="solar">Solar Plexus</option>
                      <option value="heart">Heart Chakra</option>
                      <option value="throat">Throat Chakra</option>
                      <option value="third-eye">Third Eye</option>
                      <option value="crown">Crown Chakra</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scheduled Start
                    </label>
                    <input
                      type="datetime-local"
                      value={editFormData.scheduled_start}
                      onChange={(e) => setEditFormData({...editFormData, scheduled_start: e.target.value})}
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={editFormData.duration_minutes}
                      onChange={(e) => setEditFormData({...editFormData, duration_minutes: e.target.value})}
                      min="5"
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={editFormData.max_participants}
                      onChange={(e) => setEditFormData({...editFormData, max_participants: e.target.value})}
                      min="1"
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleUpdateEvent}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Cancel Event</h3>
                  <p className="text-gray-300 mb-4">
                    Are you sure you want to cancel this event? This action cannot be undone and all participants will be notified.
                  </p>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
                    >
                      Keep Event
                    </button>
                    
                    <button
                      onClick={handleDeleteEvent}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Trash className="w-4 h-4" />
                          Cancel Event
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};