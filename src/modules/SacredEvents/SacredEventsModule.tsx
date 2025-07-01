import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import { SupabaseService } from '../../services/SupabaseService';
import React, { useState, useEffect } from 'react';
import { EventsPage } from './components/EventsPage';
import { UpcomingEvents } from './components/UpcomingEvents';
import { EventsCalendar } from './components/EventsCalendar';
import { EventDetailPage } from './components/EventDetailPage';
import { CreateEventPage } from './components/CreateEventPage';

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
  private supabase: SupabaseService;
  private isInitialized = false;
  private isActive = false;

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.geh = GlobalEventHorizon.getInstance();
    this.supabase = SupabaseService.getInstance();
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
      payload: { status: 'ready' },
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
        getAllEvents: () => this.getAllEvents(),
        getEvent: (eventId: string) => this.getEvent(eventId),
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
        getAllTemplates: () => this.getAllTemplates(),
        getTemplate: (templateId: string) => this.getTemplate(templateId),
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
      // Expose React components
      Components: {
        EventsPage,
        UpcomingEvents,
        EventsCalendar,
        EventDetailPage,
        CreateEventPage
      },
      Component: () => EventsPage
    };
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

  private async getAllEvents(): Promise<SacredEvent[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .select(`
          *,
          participants:event_participants(*)
        `)
        .order('scheduled_start', { ascending: true });
      
      if (error) throw error;
      
      // Format events with participants
      return (data?.map(event => ({
        ...event,
        participants: event.participants || []
      })) || []);
    } catch (error) {
      console.error('[SacredEventsModule] Error fetching all events:', error);
      return [];
    }
  }

  private async getEvent(eventId: string): Promise<SacredEvent | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .select(`
          *,
          participants:event_participants(*)
        `)
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        participants: data.participants || []
      };
    } catch (error) {
      console.error(`[SacredEventsModule] Error fetching event ${eventId}:`, error);
      return null;
    }
  }

  private async createEvent(eventData: Partial<SacredEvent>): Promise<string> {
    try {
      if (!eventData.creator_id) {
        throw new Error('Creator ID is required');
      }

      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .insert({
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
          creator_id: eventData.creator_id,
          settings: eventData.settings || {
            allow_late_join: true,
            send_reminders: true,
            reminder_minutes: [15, 5],
            require_approval: false,
            is_private: false,
            xp_reward: 25
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('[SacredEventsModule] Created event:', data);
      
      // Add creator as first participant
      await this.supabase.client
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: eventData.creator_id,
          status: 'confirmed'
        });

      // Publish event
      this.geh.publish({
        type: 'events:event:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          eventId: data.id, 
          title: data.title, 
          type: data.event_type 
        },
        metadata: { creator: data.creator_id },
        essenceLabels: ['events:creation', `type:${data.event_type}`, 'sacred:gathering']
      });

      return data.id;
    } catch (error) {
      console.error('[SacredEventsModule] Error creating event:', error);
      throw error;
    }
  }

  private async updateEvent(eventId: string, updates: Partial<SacredEvent>): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .update({
          title: updates.title,
          description: updates.description,
          event_type: updates.event_type,
          scheduled_start: updates.scheduled_start,
          duration_minutes: updates.duration_minutes,
          max_participants: updates.max_participants,
          chakra_focus: updates.chakra_focus,
          location: updates.location,
          is_recurring: updates.is_recurring,
          recurrence_pattern: updates.recurrence_pattern,
          status: updates.status,
          settings: updates.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();
      
      if (error) throw error;

      this.geh.publish({
        type: 'events:event:updated',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { eventId, updates },
        metadata: { title: data.title },
        essenceLabels: ['events:modification', 'sacred:gathering']
      });

      return true;
    } catch (error) {
      console.error(`[SacredEventsModule] Error updating event ${eventId}:`, error);
      return false;
    }
  }

  private async deleteEvent(eventId: string): Promise<boolean> {
    try {
      // Get event details before deletion
      const event = await this.getEvent(eventId);
      if (!event) throw new Error('Event not found');
      
      const { error } = await this.supabase.client
        .from('sacred_events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;

      this.geh.publish({
        type: 'events:event:deleted',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { eventId },
        metadata: { title: event.title },
        essenceLabels: ['events:deletion', 'sacred:gathering']
      });

      return true;
    } catch (error) {
      console.error(`[SacredEventsModule] Error deleting event ${eventId}:`, error);
      return false;
    }
  }

  private async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      // Check if already joined
      const { data: existing, error: checkError } = await this.supabase.client
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId);
      
      if (checkError) throw checkError;
      
      // If already joined, do nothing
      if (existing && existing.length > 0) {
        return true;
      }
      
      // Check max participants
      const event = await this.getEvent(eventId);
      if (!event) throw new Error('Event not found');
      
      if (event.max_participants && event.participants.length >= event.max_participants) {
        throw new Error('Event has reached maximum number of participants');
      }

      const { error } = await this.supabase.client
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          status: event.settings?.require_approval ? 'pending' : 'confirmed'
        });
      
      if (error) throw error;

      this.geh.publish({
        type: 'events:participant:joined',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          eventId, 
          userId,
          participantCount: event.participants.length + 1
        },
        metadata: { eventTitle: event.title },
        essenceLabels: ['events:participation', 'community:growth', 'sacred:gathering']
      });

      return true;
    } catch (error) {
      console.error(`[SacredEventsModule] Error joining event ${eventId}:`, error);
      return false;
    }
  }

  private async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) throw new Error('Event not found');

      const { error } = await this.supabase.client
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
      
      if (error) throw error;

      this.geh.publish({
        type: 'events:participant:left',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          eventId, 
          userId,
          participantCount: event.participants.length - 1
        },
        metadata: { eventTitle: event.title },
        essenceLabels: ['events:participation', 'sacred:gathering']
      });

      return true;
    } catch (error) {
      console.error(`[SacredEventsModule] Error leaving event ${eventId}:`, error);
      return false;
    }
  }

  private async getUpcomingEvents(limit = 10): Promise<SacredEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .select(`
          *,
          participants:event_participants(*)
        `)
        .gt('scheduled_start', now)
        .eq('status', 'scheduled')
        .order('scheduled_start', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      
      return data?.map(event => ({
        ...event,
        participants: event.participants || []
      })) || [];
    } catch (error) {
      console.error('[SacredEventsModule] Error fetching upcoming events:', error);
      return [];
    }
  }

  private async getEventsByDate(date: string): Promise<SacredEvent[]> {
    try {
      // Convert date to start and end of day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .select(`
          *,
          participants:event_participants(*)
        `)
        .gte('scheduled_start', startDate.toISOString())
        .lte('scheduled_start', endDate.toISOString())
        .order('scheduled_start', { ascending: true });
      
      if (error) throw error;
      
      return data?.map(event => ({
        ...event,
        participants: event.participants || []
      })) || [];
    } catch (error) {
      console.error(`[SacredEventsModule] Error fetching events for date ${date}:`, error);
      return [];
    }
  }

  private async getEventsByType(eventType: string): Promise<SacredEvent[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .select(`
          *,
          participants:event_participants(*)
        `)
        .eq('event_type', eventType)
        .order('scheduled_start', { ascending: true });
      
      if (error) throw error;
      
      return data?.map(event => ({
        ...event,
        participants: event.participants || []
      })) || [];
    } catch (error) {
      console.error(`[SacredEventsModule] Error fetching events of type ${eventType}:`, error);
      return [];
    }
  }

  private async getAllTemplates(): Promise<EventTemplate[]> {
    // In a real implementation, fetch from database
    // For now, return mock data
    return [
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
  }

  private async getTemplate(templateId: string): Promise<EventTemplate | null> {
    const templates = await this.getAllTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  private async createTemplate(template: EventTemplate): Promise<void> {
    // In a real implementation, save to database
    console.log('[SacredEventsModule] Creating template:', template);
  }

  private async createEventFromTemplate(templateId: string, customData: any): Promise<string | null> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      console.error(`[SacredEventsModule] Template not found: ${templateId}`);
      return null;
    }

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

  private async scheduleRecurringEvent(eventId: string): Promise<void> {
    // Implementation for recurring events would go here
    console.log(`[SacredEventsModule] Scheduling recurring event: ${eventId}`);
  }

  private async sendEventReminders(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId);
    if (!event || !event.settings?.send_reminders) {
      console.log(`[SacredEventsModule] No event or reminders disabled for ${eventId}`);
      return;
    }

    this.geh.publish({
      type: 'events:reminder:sent',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { 
        eventId, 
        participantCount: event.participants.length 
      },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:reminder', 'notification:sacred']
    });
  }

  private async startEvent(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId);
    if (!event) {
      console.error(`[SacredEventsModule] Event not found: ${eventId}`);
      return;
    }

    await this.updateEvent(eventId, { status: 'active' });

    this.geh.publish({
      type: 'events:event:started',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { eventId },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:active', 'sacred:gathering', 'ceremony:begin']
    });
  }

  private async endEvent(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId);
    if (!event) {
      console.error(`[SacredEventsModule] Event not found: ${eventId}`);
      return;
    }

    await this.updateEvent(eventId, { status: 'completed' });

    this.geh.publish({
      type: 'events:event:ended',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { 
        eventId, 
        participantCount: event.participants.length 
      },
      metadata: { eventTitle: event.title },
      essenceLabels: ['events:completed', 'sacred:gathering', 'ceremony:end']
    });
  }

  private async getEventStatistics() {
    try {
      const events = await this.getAllEvents();
      
      const totalEvents = events.length;
      const activeEvents = events.filter(e => e.status === 'active').length;
      const upcomingEvents = events.filter(e => 
        new Date(e.scheduled_start) > new Date() && e.status === 'scheduled'
      ).length;
      
      return { totalEvents, activeEvents, upcomingEvents };
    } catch (error) {
      console.error('[SacredEventsModule] Error getting event statistics:', error);
      return { totalEvents: 0, activeEvents: 0, upcomingEvents: 0 };
    }
  }

  private async getPopularEventTypes(): Promise<Array<{ type: string; count: number }>> {
    try {
      const events = await this.getAllEvents();
      const typeCounts = new Map<string, number>();
      
      events.forEach(event => {
        typeCounts.set(event.event_type, (typeCounts.get(event.event_type) || 0) + 1);
      });
      
      return Array.from(typeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('[SacredEventsModule] Error getting popular event types:', error);
      return [];
    }
  }

  private async getUserParticipation(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.client
        .from('event_participants')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error(`[SacredEventsModule] Error getting participation for user ${userId}:`, error);
      return 0;
    }
  }

  private startEventScheduler(): void {
    // Check for events that need to start
    setInterval(async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase.client
          .from('sacred_events')
          .select('id, settings')
          .eq('status', 'scheduled')
          .lte('scheduled_start', now);
        
        if (error) throw error;
        
        // Start events that should auto-start
        for (const event of data || []) {
          if (event.settings?.auto_start) {
            await this.startEvent(event.id);
          }
        }
      } catch (error) {
        console.error('[SacredEventsModule] Error in event scheduler:', error);
      }
    }, 60000); // Check every minute
  }
}