import { IModule, ModuleManifest, GESemanticEvent } from '../types';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import React, { useState, useEffect } from 'react';

export interface SacredEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  scheduled_start: string;
  duration_minutes?: number;
  max_participants?: number;
  chakra_focus?: string;
  location?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  status: string;
  creator_id: string;
  participants: Array<{ user_id: string; joined_at: string; status: string }>;
  settings?: {
    allow_late_join?: boolean;
    send_reminders?: boolean;
    reminder_minutes?: number[];
    require_approval?: boolean;
    is_private?: boolean;
    auto_start?: boolean;
    recording_enabled?: boolean;
    broadcast_enabled?: boolean;
    xp_reward?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  event_type: string;
  default_duration: number;
  chakra_focus?: string;
  default_settings: any;
}

export class SacredEventsModule implements IModule {
  private manifest: ModuleManifest;
  private geh: GlobalEventHorizon;
  private isInitialized = false;
  private isActive = false;
  private events: Map<string, SacredEvent> = new Map();
  private eventTemplates: Map<string, EventTemplate> = new Map();
  private eventCounters: Map<string, number> = new Map();

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.geh = GlobalEventHorizon.getInstance();
    this.initializeMockData();
  }

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.geh.publish({
      type: 'module:sacred-events:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', 'events:preparation']
    });

    this.setupEventListeners();
    this.startEventScheduler();
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:sacred-events:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready', eventCount: this.events.size },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', 'events:available']
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:sacred-events:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'active', features: ['event-creation', 'event-management', 'scheduling', 'templates'] },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', 'events:live', 'sacred:ceremony']
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:sacred-events:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', 'events:paused']
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;
    this.events.clear();
    this.eventTemplates.clear();
    this.eventCounters.clear();

    this.geh.publish({
      type: 'module:sacred-events:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', 'events:closed']
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      EventService: {
        getAllEvents: () => Array.from(this.events.values()),
        getEvent: (eventId: string) => this.events.get(eventId),
        createEvent: (eventData: Partial<SacredEvent>) => this.createEvent(eventData),
        updateEvent: (eventId: string, updates: Partial<SacredEvent>) => this.updateEvent(eventId, updates),
        deleteEvent: (eventId: string) => this.deleteEvent(eventId),
        joinEvent: (eventId: string, userId: string) => this.joinEvent(eventId, userId),
        leaveEvent: (eventId: string, userId: string) => this.leaveEvent(eventId, userId),
        getUpcomingEvents: (limit?: number) => this.getUpcomingEvents(limit),
        getEventsByDate: (date: string) => this.getEventsByDate(date),
        getEventsByType: (eventType: string) => this.getEventsByType(eventType)
      },
      EventTemplateService: {
        getAllTemplates: () => Array.from(this.eventTemplates.values()),
        getTemplate: (templateId: string) => this.eventTemplates.get(templateId),
        createTemplate: (template: EventTemplate) => this.createTemplate(template),
        createEventFromTemplate: (templateId: string, customData: any) => this.createEventFromTemplate(templateId, customData)
      },
      EventScheduler: {
        scheduleRecurringEvent: (eventId: string) => this.scheduleRecurringEvent(eventId),
        sendEventReminders: (eventId: string) => this.sendEventReminders(eventId),
        startEvent: (eventId: string) => this.startEvent(eventId),
        endEvent: (eventId: string) => this.endEvent(eventId)
      },
      EventAnalytics: {
        getEventStatistics: () => this.getEventStatistics(),
        getPopularEventTypes: () => this.getPopularEventTypes(),
        getUserParticipation: (userId: string) => this.getUserParticipation(userId)
      },
      // Expose React component
      Component: () => {
        const SacredEventsComponent = () => {
          const [events, setEvents] = useState<SacredEvent[]>([]);
          const [selectedEvent, setSelectedEvent] = useState<SacredEvent | null>(null);
          const [showCreateForm, setShowCreateForm] = useState(false);

          useEffect(() => {
            setEvents(Array.from(this.events.values()));
          }, []);

          const handleCreateEvent = (eventData: any) => {
            const eventId = this.createEvent(eventData);
            setEvents(Array.from(this.events.values()));
            setShowCreateForm(false);
            return eventId;
          };

          const handleJoinEvent = (eventId: string) => {
            this.joinEvent(eventId, 'current-user');
            setEvents(Array.from(this.events.values()));
          };

          return React.createElement('div', {
            className: 'space-y-6'
          }, [
            // Header
            React.createElement('div', {
              key: 'header',
              className: 'bg-slate-900/50 rounded-xl border border-purple-500/20 p-6'
            }, [
              React.createElement('h2', {
                key: 'title',
                className: 'text-2xl font-bold text-white mb-4'
              }, '🗓️ Sacred Events'),
              React.createElement('p', {
                key: 'desc',
                className: 'text-purple-300'
              }, 'Spiritual gatherings, meditations, and conscious community events.')
            ]),

            // Create Event Button
            React.createElement('div', {
              key: 'actions',
              className: 'flex justify-between items-center'
            }, [
              React.createElement('h3', {
                key: 'events-title',
                className: 'text-xl font-semibold text-white'
              }, 'Upcoming Events'),
              React.createElement('button', {
                key: 'create-btn',
                onClick: () => setShowCreateForm(!showCreateForm),
                className: 'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
              }, showCreateForm ? 'Cancel' : 'Create Event')
            ]),

            // Create Event Form
            showCreateForm && React.createElement('div', {
              key: 'create-form',
              className: 'bg-slate-900/50 rounded-xl border border-purple-500/20 p-6'
            }, [
              React.createElement('h4', {
                key: 'form-title',
                className: 'text-lg font-medium text-white mb-4'
              }, 'Create New Sacred Event'),
              React.createElement('div', {
                key: 'form-content',
                className: 'space-y-4'
              }, [
                React.createElement('input', {
                  key: 'title-input',
                  type: 'text',
                  placeholder: 'Event title...',
                  className: 'w-full p-3 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none'
                }),
                React.createElement('textarea', {
                  key: 'desc-input',
                  placeholder: 'Event description...',
                  className: 'w-full p-3 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none h-20'
                }),
                React.createElement('div', {
                  key: 'form-actions',
                  className: 'flex gap-2'
                }, [
                  React.createElement('button', {
                    key: 'submit',
                    onClick: () => handleCreateEvent({
                      title: 'New Sacred Event',
                      event_type: 'meditation',
                      scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                      duration_minutes: 30
                    }),
                    className: 'px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
                  }, 'Create Event'),
                  React.createElement('button', {
                    key: 'cancel',
                    onClick: () => setShowCreateForm(false),
                    className: 'px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
                  }, 'Cancel')
                ])
              ])
            ]),

            // Events List
            React.createElement('div', {
              key: 'events-list',
              className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            }, events.filter(event => new Date(event.scheduled_start) > new Date()).slice(0, 6).map(event => 
              React.createElement('div', {
                key: event.id,
                className: 'p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 cursor-pointer transition-all hover:border-purple-400',
                onClick: () => setSelectedEvent(event)
              }, [
                React.createElement('h5', {
                  key: 'event-title',
                  className: 'font-bold text-white mb-2'
                }, event.title),
                React.createElement('p', {
                  key: 'event-type',
                  className: 'text-sm text-purple-300 mb-2'
                }, event.event_type.replace('-', ' ').toUpperCase()),
                React.createElement('p', {
                  key: 'event-time',
                  className: 'text-sm text-gray-400 mb-2'
                }, new Date(event.scheduled_start).toLocaleDateString()),
                React.createElement('div', {
                  key: 'event-actions',
                  className: 'flex justify-between items-center'
                }, [
                  React.createElement('span', {
                    key: 'participants',
                    className: 'text-xs text-gray-400'
                  }, `${event.participants.length} participants`),
                  React.createElement('button', {
                    key: 'join-btn',
                    onClick: (e: any) => {
                      e.stopPropagation();
                      handleJoinEvent(event.id);
                    },
                    className: 'px-3 py-1 bg-purple-600/20 text-purple-300 rounded text-xs hover:bg-purple-600/30 transition-colors'
                  }, 'Join')
                ])
              ])
            )),

            // Selected Event Details
            selectedEvent && React.createElement('div', {
              key: 'event-details',
              className: 'bg-slate-900/50 rounded-xl border border-purple-500/20 p-6'
            }, [
              React.createElement('div', {
                key: 'detail-header',
                className: 'flex justify-between items-start mb-4'
              }, [
                React.createElement('h4', {
                  key: 'detail-title',
                  className: 'text-xl font-bold text-white'
                }, selectedEvent.title),
                React.createElement('button', {
                  key: 'close-btn',
                  onClick: () => setSelectedEvent(null),
                  className: 'text-gray-400 hover:text-white'
                }, '✕')
              ]),
              React.createElement('p', {
                key: 'detail-desc',
                className: 'text-gray-300 mb-4'
              }, selectedEvent.description || 'No description available'),
              React.createElement('div', {
                key: 'detail-info',
                className: 'grid grid-cols-2 gap-4 text-sm'
              }, [
                React.createElement('div', {
                  key: 'info-1'
                }, [
                  React.createElement('span', {
                    key: 'label-1',
                    className: 'text-gray-400'
                  }, 'Type: '),
                  React.createElement('span', {
                    key: 'value-1',
                    className: 'text-white'
                  }, selectedEvent.event_type)
                ]),
                React.createElement('div', {
                  key: 'info-2'
                }, [
                  React.createElement('span', {
                    key: 'label-2',
                    className: 'text-gray-400'
                  }, 'Duration: '),
                  React.createElement('span', {
                    key: 'value-2',
                    className: 'text-white'
                  }, `${selectedEvent.duration_minutes || 30} minutes`)
                ])
              ])
            ])
          ]);
        };

        return SacredEventsComponent;
      }
    };
  }

  private initializeMockData(): void {
    // Create event templates
    const templates: EventTemplate[] = [
      {
        id: 'meditation-template',
        name: 'Group Meditation',
        description: 'Guided meditation session for collective consciousness expansion',
        event_type: 'meditation',
        default_duration: 30,
        chakra_focus: 'crown',
        default_settings: { allow_late_join: false, send_reminders: true, xp_reward: 25 }
      },
      {
        id: 'sound-bath-template',
        name: 'Sacred Sound Bath',
        description: 'Healing frequency experience using sacred instruments',
        event_type: 'sound-bath',
        default_duration: 60,
        chakra_focus: 'heart',
        default_settings: { allow_late_join: true, send_reminders: true, xp_reward: 35 }
      }
    ];

    templates.forEach(template => this.eventTemplates.set(template.id, template));

    // Create sample events
    const now = new Date();
    const sampleEvents: SacredEvent[] = [
      {
        id: 'event-1',
        title: 'Heart Chakra Healing Circle',
        description: 'Join us for a powerful heart chakra healing meditation',
        event_type: 'meditation',
        scheduled_start: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        duration_minutes: 45,
        max_participants: 12,
        chakra_focus: 'heart',
        location: 'Sacred Digital Space',
        status: 'scheduled',
        creator_id: 'soul-guide-1',
        participants: [
          { user_id: 'seeker-1', joined_at: new Date().toISOString(), status: 'confirmed' },
          { user_id: 'seeker-2', joined_at: new Date().toISOString(), status: 'confirmed' }
        ],
        settings: {
          allow_late_join: false,
          send_reminders: true,
          reminder_minutes: [15, 5],
          require_approval: false,
          is_private: false,
          xp_reward: 30
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'event-2',
        title: '528Hz Love Frequency Sound Bath',
        description: 'Experience the healing power of the love frequency',
        event_type: 'sound-bath',
        scheduled_start: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration_minutes: 60,
        max_participants: 20,
        chakra_focus: 'heart',
        location: 'Sacred Digital Space',
        status: 'scheduled',
        creator_id: 'frequency-keeper',
        participants: [
          { user_id: 'seeker-3', joined_at: new Date().toISOString(), status: 'confirmed' }
        ],
        settings: {
          allow_late_join: true,
          send_reminders: true,
          reminder_minutes: [30, 10],
          xp_reward: 40
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    sampleEvents.forEach(event => this.events.set(event.id, event));
  }

  private setupEventListeners(): void {
    // Listen for user joining events
    this.geh.subscribe('events:user:joined', (event: GESemanticEvent) => {
      const { eventId, userId } = event.payload;
      this.joinEvent(eventId, userId);
    });

    // Listen for event reminders
    this.geh.subscribe('events:reminder:send', (event: GESemanticEvent) => {
      const { eventId } = event.payload;
      this.sendEventReminders(eventId);
    });
  }

  private createEvent(eventData: Partial<SacredEvent>): string {
    const eventId = `event-${Date.now()}`;
    
    const newEvent: SacredEvent = {
      id: eventId,
      title: eventData.title || 'Untitled Event',
      description: eventData.description,
      event_type: eventData.event_type || 'meditation',
      scheduled_start: eventData.scheduled_start || new Date().toISOString(),
      duration_minutes: eventData.duration_minutes || 30,
      max_participants: eventData.max_participants,
      chakra_focus: eventData.chakra_focus,
      location: eventData.location || 'Sacred Digital Space',
      is_recurring: eventData.is_recurring || false,
      recurrence_pattern: eventData.recurrence_pattern,
      status: 'scheduled',
      creator_id: eventData.creator_id || 'system',
      participants: [],
      settings: eventData.settings || {
        allow_late_join: true,
        send_reminders: true,
        reminder_minutes: [15, 5],
        require_approval: false,
        is_private: false,
        xp_reward: 25
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.events.set(eventId, newEvent);

    this.geh.publish({
      type: 'events:event:created',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId, title: newEvent.title, type: newEvent.event_type },
      metadata: { creator: newEvent.creator_id },
      essenceLabels: ['events:creation', `type:${newEvent.event_type}`, 'sacred:gathering']
    });

    return eventId;
  }

  private updateEvent(eventId: string, updates: Partial<SacredEvent>): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    const updatedEvent = { ...event, ...updates, updated_at: new Date().toISOString() };
    this.events.set(eventId, updatedEvent);

    this.geh.publish({
      type: 'events:event:updated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId, updates },
      metadata: { title: updatedEvent.title },
      essenceLabels: ['events:modification', 'sacred:gathering']
    });

    return true;
  }

  private deleteEvent(eventId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    this.events.delete(eventId);

    this.geh.publish({
      type: 'events:event:deleted',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId },
      metadata: { title: event.title },
      essenceLabels: ['events:deletion', 'sacred:gathering']
    });

    return true;
  }

  private joinEvent(eventId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    // Check if user already joined
    const alreadyJoined = event.participants.some(p => p.user_id === userId);
    if (alreadyJoined) return false;

    // Check max participants
    if (event.max_participants && event.participants.length >= event.max_participants) {
      return false;
    }

    event.participants.push({
      user_id: userId,
      joined_at: new Date().toISOString(),
      status: event.settings?.require_approval ? 'pending' : 'confirmed'
    });

    this.geh.publish({
      type: 'events:participant:joined',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId, userId, participantCount: event.participants.length },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:participation', 'community:growth', 'sacred:gathering']
    });

    return true;
  }

  private leaveEvent(eventId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    const initialLength = event.participants.length;
    event.participants = event.participants.filter(p => p.user_id !== userId);

    if (event.participants.length < initialLength) {
      this.geh.publish({
        type: 'events:participant:left',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { eventId, userId, participantCount: event.participants.length },
        metadata: { eventTitle: event.title },
        essenceLabels: ['events:participation', 'sacred:gathering']
      });
      return true;
    }

    return false;
  }

  private getUpcomingEvents(limit = 10): SacredEvent[] {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => new Date(event.scheduled_start) > now && event.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
      .slice(0, limit);
  }

  private getEventsByDate(date: string): SacredEvent[] {
    const targetDate = new Date(date).toDateString();
    return Array.from(this.events.values())
      .filter(event => new Date(event.scheduled_start).toDateString() === targetDate);
  }

  private getEventsByType(eventType: string): SacredEvent[] {
    return Array.from(this.events.values())
      .filter(event => event.event_type === eventType);
  }

  private createTemplate(template: EventTemplate): void {
    this.eventTemplates.set(template.id, template);
  }

  private createEventFromTemplate(templateId: string, customData: any): string | null {
    const template = this.eventTemplates.get(templateId);
    if (!template) return null;

    const eventData = {
      title: customData.title || template.name,
      description: customData.description || template.description,
      event_type: template.event_type,
      duration_minutes: customData.duration_minutes || template.default_duration,
      chakra_focus: customData.chakra_focus || template.chakra_focus,
      settings: { ...template.default_settings, ...customData.settings },
      ...customData
    };

    return this.createEvent(eventData);
  }

  private scheduleRecurringEvent(eventId: string): void {
    // Implementation for recurring events
  }

  private sendEventReminders(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event || !event.settings?.send_reminders) return;

    this.geh.publish({
      type: 'events:reminder:sent',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId, participantCount: event.participants.length },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:reminder', 'notification:sacred']
    });
  }

  private startEvent(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) return;

    event.status = 'active';
    this.geh.publish({
      type: 'events:event:started',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:active', 'sacred:gathering', 'ceremony:begin']
    });
  }

  private endEvent(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) return;

    event.status = 'completed';
    this.geh.publish({
      type: 'events:event:ended',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId, participantCount: event.participants.length },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:completed', 'sacred:gathering', 'ceremony:end']
    });
  }

  private getEventStatistics() {
    const totalEvents = this.events.size;
    const activeEvents = Array.from(this.events.values()).filter(e => e.status === 'active').length;
    const upcomingEvents = Array.from(this.events.values()).filter(e => 
      new Date(e.scheduled_start) > new Date() && e.status === 'scheduled'
    ).length;

    return { totalEvents, activeEvents, upcomingEvents };
  }

  private getPopularEventTypes(): Array<{ type: string; count: number }> {
    const typeCounts = new Map<string, number>();
    
    Array.from(this.events.values()).forEach(event => {
      typeCounts.set(event.event_type, (typeCounts.get(event.event_type) || 0) + 1);
    });

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getUserParticipation(userId: string): number {
    return Array.from(this.events.values())
      .filter(event => event.participants.some(p => p.user_id === userId))
      .length;
  }

  private startEventScheduler(): void {
    // Check for events that need to start
    setInterval(() => {
      const now = new Date();
      Array.from(this.events.values()).forEach(event => {
        if (event.status === 'scheduled' && 
            new Date(event.scheduled_start) <= now &&
            event.settings?.auto_start) {
          this.startEvent(event.id);
        }
      });
    }, 60000); // Check every minute
  }
}