import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleList } from './CircleList';
import { SacredCircleWelcome } from './SacredCircleWelcome';
import { UserPresencePanel } from './UserPresencePanel';
import { SacredCirclePanel } from './SacredCirclePanel';
import { DirectMessageList } from './DirectMessageList';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { HelpButton } from '../../../components/HelpButton';
import { 
  MessageCircle, 
  Calendar, 
  Users,
  Heart,
  Settings
} from 'lucide-react';

type SacredCircleView = 'welcome' | 'circles' | 'events' | 'community' | 'direct-messages';

export const SacredCircle: React.FC = () => {
  const { activeCircle, isLoading } = useSacredCircle();
  const [currentView, setCurrentView] = useState<SacredCircleView>('welcome');

  // If a circle is selected, automatically switch to circles view
  useEffect(() => {
    if (activeCircle) {
      if (activeCircle.is_direct_message) {
        setCurrentView('direct-messages');
      } else {
        setCurrentView('circles');
      }
    }
  }, [activeCircle]);

  const views = [
    { id: 'circles', label: 'Sacred Circles', icon: MessageCircle },
    { id: 'events', label: 'Sacred Events', icon: Calendar },
    { id: 'community', label: 'Soul Community', icon: Users },
    { id: 'direct-messages', label: 'Direct Messages', icon: Heart }
  ];

  const handleGetStarted = () => {
    setCurrentView('circles');
  };

  const renderNavigation = () => (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Sacred Circle</h2>
            <div className="text-sm text-purple-300">Soul Connections & Wisdom Sharing</div>
          </div>
        </div>
        
        <HelpButton moduleType="sacred-circle" />
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id as SacredCircleView)}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                currentView === view.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{view.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-purple-300">Loading sacred circle data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {currentView === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <SacredCircleWelcome onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {currentView !== 'welcome' && (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderNavigation()}

            {isLoading ? (
              renderLoadingState()
            ) : (
              <>
                {currentView === 'circles' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                      <CircleList />
                      {activeCircle && <SacredCirclePanel />}
                    </div>
                    <div>
                      <UserPresencePanel />
                    </div>
                  </div>
                )}

                {currentView === 'direct-messages' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1 space-y-6">
                      <DirectMessageList />
                    </div>
                    <div className="xl:col-span-2">
                      {activeCircle && <SacredCirclePanel />}
                      {!activeCircle && (
                        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
                          <h3 className="text-lg font-semibold text-white mb-2">Select a Conversation</h3>
                          <p className="text-gray-400">Choose a direct message or start a new conversation</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentView === 'events' && (
                  <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white mb-4">Sacred Events</h2>
                    <p className="text-purple-300 mb-8">
                      Events functionality will be integrated here from the Events module
                    </p>
                  </div>
                )}

                {currentView === 'community' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-400" />
                          Soul Community Hub
                        </h2>
                        <p className="text-purple-300 mb-6">
                          Connect with awakened souls, share wisdom, and grow together in consciousness.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-white mb-2">Soul Connections</h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Find and connect with souls that resonate with your frequency
                            </p>
                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                              Explore Connections →
                            </button>
                          </div>
                          
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-white mb-2">Wisdom Sharing</h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Share insights, experiences, and sacred knowledge
                            </p>
                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                              Share Wisdom →
                            </button>
                          </div>
                          
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-white mb-2">Sacred Mentorship</h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Connect with guides or become a mentor to others
                            </p>
                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                              Find Mentors →
                            </button>
                          </div>
                          
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-white mb-2">Soul Growth Tracking</h3>
                            <p className="text-gray-400 text-sm mb-3">
                              Track your spiritual journey and celebrate milestones
                            </p>
                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                              View Progress →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <UserPresencePanel />
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};