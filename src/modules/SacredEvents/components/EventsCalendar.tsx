import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  Star,
  Play,
  MessageCircle
} from 'lucide-react';

interface EventsCalendarProps {
  onEventClick: (eventId: string) => void;
}

export const EventsCalendar: React.FC<EventsCalendarProps> = ({ onEventClick }) => {
  const { events } = useSacredCircle();
  const { getChakraColor } = useChakra();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.scheduled_start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Star className="w-3 h-3" />;
      case 'sound-bath': return <Play className="w-3 h-3" />;
      case 'discussion': return <MessageCircle className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'bg-purple-500';
      case 'sound-bath': return 'bg-blue-500';
      case 'discussion': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-700"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <motion.div
          key={day}
          className={`h-24 border border-gray-700 p-1 cursor-pointer transition-all ${
            isToday ? 'bg-purple-900/20 border-purple-500' : 'hover:bg-slate-800/50'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-purple-300' : 'text-gray-300'
          }`}>
            {day}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <motion.div
                key={event.id}
                className={`text-xs p-1 rounded ${getEventTypeColor(event.event_type)} text-white cursor-pointer truncate`}
                onClick={() => onEventClick(event.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={event.title}
              >
                <div className="flex items-center gap-1">
                  {getEventTypeIcon(event.event_type)}
                  <span className="truncate">{event.title}</span>
                </div>
              </motion.div>
            ))}
            
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-400 text-center">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Sacred Events Calendar
        </h3>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="text-xl font-bold text-white min-w-0">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border border-gray-700 rounded-lg overflow-hidden">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-gray-400">Meditation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-400">Sound Bath</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Discussion</span>
        </div>
      </div>
    </div>
  );
};