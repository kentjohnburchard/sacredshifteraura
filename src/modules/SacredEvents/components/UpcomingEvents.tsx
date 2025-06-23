import React from 'react';
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
  UserPlus
} from 'lucide-react';

export const UpcomingEvents: React.FC = () => {
  const { events, joinEvent } = useSacredCircle();
  const { getChakraColor } = useChakra();

  const upcomingEvents = events.filter(event => 
    new Date(event.scheduled_start) > new Date() && 
    event.status === 'scheduled'
  ).slice(0, 5);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Star className="w-4 h-4" />;
      case 'sound-bath': return <Play className="w-4 h-4" />;
      case 'discussion': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'text-purple-400 bg-purple-900/20';
      case 'sound-bath': return 'text-blue-400 bg-blue-900/20';
      case 'discussion': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return 'starting soon';
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Upcoming Sacred Events
        </h3>
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No upcoming events scheduled</p>
          <p className="text-sm mt-1">Create an event to gather your soul tribe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Upcoming Sacred Events
        </h3>
        <span className="text-sm text-purple-300">{upcomingEvents.length} events</span>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <motion.div
            key={event.id}
            className="p-4 bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${getEventTypeColor(event.event_type)}`}>
                    {getEventTypeIcon(event.event_type)}
                  </div>
                  <h4 className="font-semibold text-white">{event.title}</h4>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatEventTime(event.scheduled_start)}</span>
              </div>
              
              {event.duration_minutes && (
                <div className="flex items-center gap-1">
                  <span>{event.duration_minutes} min</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{event.participants.length}{event.max_participants ? `/${event.max_participants}` : ''}</span>
              </div>

              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.chakra_focus && (
              <div className="mb-3 flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getChakraColor(event.chakra_focus as any) }}
                />
                <span className="text-xs text-gray-400 capitalize">
                  {event.chakra_focus} Chakra Focus
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs text-purple-300">
                {event.event_type.replace('-', ' ').toUpperCase()}
              </div>
              
              <motion.button
                onClick={() => joinEvent(event.id)}
                className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-xs flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-3 h-3" />
                Join
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};