import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UpcomingEvents } from './UpcomingEvents';
import { EventsCalendar } from './EventsCalendar';
import { EventDetailPage } from './EventDetailPage';
import { CreateEventPage } from './CreateEventPage';
import { HelpButton } from '../../../components/HelpButton';
import { 
  Calendar, 
  List, 
  Plus,
  Filter,
  Search,
  Clock,
  Users
} from 'lucide-react';

type EventsView = 'list' | 'calendar' | 'detail' | 'create';

export const EventsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<EventsView>('list');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const eventTypes = [
    { id: 'all', name: 'All Events' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'sound-bath', name: 'Sound Bath' },
    { id: 'discussion', name: 'Discussion' },
    { id: 'ceremony', name: 'Ceremony' }
  ];

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('detail');
  };

  const handleEventCreated = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('detail');
  };

  const renderHeader = () => (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Sacred Events</h1>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <motion.button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentView === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentView === 'calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <HelpButton moduleType="sacred-events" />
          
          {(currentView === 'list' || currentView === 'calendar') && (
            <motion.button
              onClick={() => setCurrentView('create')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Create Event
            </motion.button>
          )}
        </div>
      </div>
      
      <p className="text-purple-300">
        Coordinate and participate in sacred gatherings, ceremonies, and spiritual events
      </p>
    </div>
  );

  const renderFilters = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sacred events..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none px-3 py-2"
        >
          {eventTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderHeader()}
      
      <AnimatePresence mode="wait">
        {currentView === 'list' && (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderFilters()}
            <UpcomingEvents />
          </motion.div>
        )}

        {currentView === 'calendar' && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderFilters()}
            <EventsCalendar onEventClick={handleEventClick} />
          </motion.div>
        )}

        {currentView === 'detail' && (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EventDetailPage 
              eventId={selectedEventId}
              onBack={() => setCurrentView('list')}
            />
          </motion.div>
        )}

        {currentView === 'create' && (
          <motion.div
            key="create-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CreateEventPage 
              onBack={() => setCurrentView('list')}
              onEventCreated={handleEventCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      {(currentView === 'list' || currentView === 'calendar') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-gray-400">This Week</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">247</div>
                <div className="text-sm text-gray-400">Total Participants</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">45</div>
                <div className="text-sm text-gray-400">Hours of Meditation</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};