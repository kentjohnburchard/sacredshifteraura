import React, { useState, useEffect, useRef } from 'react';
import { GESemanticEvent } from '../types';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import { Activity, Zap, Brain, Target, Shield, Database } from 'lucide-react';

interface EventStreamProps {
  className?: string;
}

const EventStream: React.FC<EventStreamProps> = ({ className = '' }) => {
  const [events, setEvents] = useState<GESemanticEvent[]>([]);
  const [isStreamActive, setIsStreamActive] = useState(true);
  const streamRef = useRef<HTMLDivElement>(null);
  const geh = GlobalEventHorizon.getInstance();

  useEffect(() => {
    const unsubscribe = geh.subscribe('*', (event) => {
      if (isStreamActive) {
        setEvents(prev => [...prev.slice(-19), event]); // Keep last 20 events
      }
    });

    return unsubscribe;
  }, [isStreamActive]);

  useEffect(() => {
    // Auto-scroll to bottom when new events arrive
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [events]);

  const getEventIcon = (type: string) => {
    if (type.includes('module')) return <Activity className="w-4 h-4" />;
    if (type.includes('telos')) return <Target className="w-4 h-4" />;
    if (type.includes('user')) return <Brain className="w-4 h-4" />;
    if (type.includes('security') || type.includes('integrity')) return <Shield className="w-4 h-4" />;
    if (type.includes('data')) return <Database className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getEventColor = (type: string) => {
    if (type.includes('error') || type.includes('failed')) return 'text-red-400 bg-red-900/20';
    if (type.includes('loaded') || type.includes('activated')) return 'text-green-400 bg-green-900/20';
    if (type.includes('telos')) return 'text-purple-400 bg-purple-900/20';
    if (type.includes('user')) return 'text-blue-400 bg-blue-900/20';
    return 'text-amber-400 bg-amber-900/20';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLabelColors = (labels: string[]) => {
    const colors = [
      'bg-cyan-500/20 text-cyan-300',
      'bg-purple-500/20 text-purple-300',
      'bg-green-500/20 text-green-300',
      'bg-orange-500/20 text-orange-300',
      'bg-pink-500/20 text-pink-300',
      'bg-indigo-500/20 text-indigo-300'
    ];
    
    return labels.map((label, index) => colors[index % colors.length]);
  };

  return (
    <div className={`bg-slate-900/50 rounded-xl border border-purple-500/20 ${className}`}>
      <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Global Event Horizon</h3>
          <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
            Unified Information Field
          </div>
        </div>
        <button
          onClick={() => setIsStreamActive(!isStreamActive)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            isStreamActive 
              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
              : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
          }`}
        >
          {isStreamActive ? 'Live' : 'Paused'}
        </button>
      </div>

      <div 
        ref={streamRef}
        className="h-96 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-purple-500/30"
      >
        {events.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Awaiting info-cognitions...</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              className={`p-3 rounded-lg border transition-all duration-300 ${getEventColor(event.type)} border-current/20`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getEventIcon(event.type)}
                  <span className="font-mono text-xs truncate">
                    {event.type}
                  </span>
                </div>
                <span className="text-xs opacity-70 whitespace-nowrap">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>

              <div className="text-xs opacity-80 mb-2">
                <span className="font-medium">Source:</span> {event.sourceId}
              </div>

              {event.essenceLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {event.essenceLabels.map((label, labelIndex) => {
                    const colorClass = getLabelColors(event.essenceLabels)[labelIndex];
                    return (
                      <span
                        key={label}
                        className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="text-xs opacity-60">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventStream;