import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import { SupabaseService } from '../../services/SupabaseService';
import React from 'react'; // React imported here, but not directly used in this class's logic
import { EventsPage } from './components/EventsPage';
import { UpcomingEvents } from './components/UpcomingEvents';
import { EventsCalendar } from './components/EventsCalendar';
import { EventDetailPage } from './components/EventDetailPage';
import { CreateEventPage } from './components/CreateEventPage';

// --- Type Definitions (Improved) ---

// Define the precise structure of event settings
export interface SacredEventSettings {
  allow_late_join?: boolean;
  send_reminders?: boolean;
  reminder_minutes?: number[];
  require_approval?: boolean;
  is_private?: boolean;
  auto_start?: boolean;
  recording_enabled?: boolean;
  broadcast_enabled?: boolean;
  xp_reward?: number;
}

// Ensure SacredEvent matches database schema and usage
export interface SacredEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string; // Consider making this a union type if types are fixed (e.g., 'meditation' | 'sound-bath')
  scheduled_start: string; // ISO string
  duration_minutes?: number;
  max_participants?: number;
  chakra_focus?: string;
  location?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'pending'; // More specific status types
  creator_id: string;
  participants: Array<{ user_id: string; joined_at: string; status: string }>;
  settings?: SacredEventSettings; // Use the specific settings interface
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

// Ensure EventTemplate uses the specific settings interface
export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  event_type: string;
  default_duration: number;
  chakra_focus?: string;
  default_settings: SacredEventSettings; // Now strongly typed
}

// Define the shape of data when creating an event from a template
export interface CustomEventData {
  title?: string;
  description?: string;
  scheduled_start?: string;
  duration_minutes?: number;
  max_participants?: number;
  chakra_focus?: string;
  location?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  status?: SacredEvent['status'];
  creator_id?: string; // Crucial for new events
  settings?: Partial<SacredEventSettings>; // Can override template settings
  // Add any other properties that can be customized from the template
}

export class SacredEventsModule implements IModule {
  private manifest: ModuleManifest;
  private geh: GlobalEventHorizon;
  private supabase: SupabaseService;
  private isInitialized = false;
  private isActive = false;
  private eventSchedulerInterval: NodeJS.Timeout | null = null; // Store interval ID

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
    this.stopEventScheduler(); // Stop scheduler on deactivate

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
    this.stopEventScheduler(); // Ensure scheduler is stopped

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

  // getExposedItems remains Record<string, any> due to mixed return types,
  // but we ensure the functions themselves have strong types.
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
        createEventFromTemplate: (templateId: string, customData: CustomEventData) => this.createEventFromTemplate(templateId, customData) // customData is typed
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
      const { eventId, userId } = event.payload as { eventId: string; userId: string }; // Cast payload
      this.joinEvent(eventId, userId);
    });

    // Listen for event reminders
    this.geh.subscribe('events:reminder:send', (event: GESemanticEvent) => {
      const { eventId } = event.payload as { eventId: string }; // Cast payload
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

      // Ensure data is treated as SacredEvent array
      return (data || []).map((event: any) => ({
        ...(event as SacredEvent), // Cast the base event to SacredEvent
        participants: (event.participants as Array<{ user_id: string; joined_at: string; status: string }>) || []
      }));
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

      // PGRST116 means "No rows found"
      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return null;
      }

      // Cast to SacredEvent for type safety
      return {
        ...(data as SacredEvent),
        participants: (data.participants as Array<{ user_id: string; joined_at: string; status: string }>) || []
      } as SacredEvent;
    } catch (error) {
      console.error(`[SacredEventsModule] Error fetching event ${eventId}:`, error);
      return null;
    }
  }

  private async createEvent(eventData: Partial<SacredEvent>): Promise<string> {
    try {
      if (!eventData.creator_id) {
        throw new Error('Creator ID is required to create an event.');
      }
      if (!eventData.scheduled_start) {
        console.warn('[SacredEventsModule] No scheduled_start provided, defaulting to now.');
      }
      if (!eventData.event_type) {
        console.warn('[SacredEventsModule] No event_type provided, defaulting to "meditation".');
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
          status: eventData.status || 'scheduled',
          creator_id: eventData.creator_id,
          settings: {
            allow_late_join: true,
            send_reminders: true,
            reminder_minutes: [], // Corrected syntax and default value
            require_approval: false,
            is_private: false,
            xp_reward: 25,
            auto_start: false, // Explicitly set default for safety
            recording_enabled: false,
            broadcast_enabled: false,
            ...(eventData.settings || {}), // Merge provided settings
          } as SacredEventSettings // Cast to ensure type compatibility
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Event creation failed: No data returned after insert.');

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
        sourceId: 'MODULE_REGISTRY',
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
      throw error; // Re-throw to allow callers to handle
    }
  }

  private async updateEvent(eventId: string, updates: Partial<SacredEvent>): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.client
        .from('sacred_events')
        .update({
          ...updates, // Spread updates directly
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      if (!data) { // Check if update actually affected a row
        console.warn(`[SacredEventsModule] No event found with ID ${eventId} to update.`);
        return false;
      }

      this.geh.publish({
        type: 'events:event:updated',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: { eventId, updates },
        metadata: { title: data.title }, // data is guaranteed here
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
      // Get event details before deletion to use in GEH publish
      const eventToDelete = await this.getEvent(eventId);
      if (!eventToDelete) {
        console.warn(`[SacredEventsModule] Attempted to delete non-existent event ${eventId}.`);
        return false;
      }

      const { error } = await this.supabase.client
        .from('sacred_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      this.geh.publish({
        type: 'events:event:deleted',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: { eventId },
        metadata: { title: eventToDelete.title }, // Use title from fetched event
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
      const { data: existingParticipants, error: checkError } = await this.supabase.client
        .from('event_participants')
        .select('id') // Select just ID for existence check
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single(); // Use single to check existence

      if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 means no row found

      // If already joined, do nothing
      if (existingParticipants) { // If data is not null, participant exists
        console.log(`[SacredEventsModule] User ${userId} already a participant of event ${eventId}.`);
        return true;
      }

      // Check max participants and event details
      const event = await this.getEvent(eventId);
      if (!event) throw new Error(`Event with ID ${eventId} not found.`);

      if (event.max_participants && event.participants.length >= event.max_participants) {
        throw new Error('Event has reached maximum number of participants.');
      }

      const { error: insertError } = await this.supabase.client
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          status: event.settings?.require_approval ? 'pending' : 'confirmed'
        });

      if (insertError) throw insertError;

      this.geh.publish({
        type: 'events:participant:joined',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: {
          eventId,
          userId,
          participantCount: event.participants.length + 1 // Reflect new count
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
      if (!event) throw new Error(`Event with ID ${eventId} not found.`);

      const { error } = await this.supabase.client
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      this.geh.publish({
        type: 'events:participant:left',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: {
          eventId,
          userId,
          participantCount: event.participants.length - 1 // Reflect new count
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

      return (data || []).map((event: any) => ({
        ...(event as SacredEvent),
        participants: (event.participants as Array<{ user_id: string; joined_at: string; status: string }>) || []
      }));
    } catch (error) {
      console.error('[SacredEventsModule] Error fetching upcoming events:', error);
      return [];
    }
  }

  private async getEventsByDate(date: string): Promise<SacredEvent[]> {
    try {
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

      return (data || []).map((event: any) => ({
        ...(event as SacredEvent),
        participants: (event.participants as Array<{ user_id: string; joined_at: string; status: string }>) || []
      }));
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

      return (data || []).map((event: any) => ({
        ...(event as SacredEvent),
        participants: (event.participants as Array<{ user_id: string; joined_at: string; status: string }>) || []
      }));
    } catch (error) {
      console.error(`[SacredEventsModule] Error fetching events of type ${eventType}:`, error);
      return [];
    }
  }

  private async getAllTemplates(): Promise<EventTemplate[]> {
    // In a real implementation, fetch from database. For now, return typed mock data.
    return [
      {
        id: 'meditation-template',
        name: 'Group Meditation',
        description: 'Guided meditation session for collective consciousness expansion',
        event_type: 'meditation',
        default_duration: 30,
        chakra_focus: 'crown',
        default_settings: { allow_late_join: false, send_reminders: true, xp_reward: 25, auto_start: true, is_private: false }
      },
      {
        id: 'sound-bath-template',
        name: 'Sacred Sound Bath',
        description: 'Healing frequency experience using sacred instruments',
        event_type: 'sound-bath',
        default_duration: 60,
        chakra_focus: 'heart',
        default_settings: { allow_late_join: true, send_reminders: true, xp_reward: 35, auto_start: false, is_private: false }
      }
    ];
  }

  private async getTemplate(templateId: string): Promise<EventTemplate | null> {
    const templates = await this.getAllTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  private async createTemplate(template: EventTemplate): Promise<void> {
    // In a real implementation, save to database via Supabase.
    // Example: await this.supabase.client.from('event_templates').insert(template);
    console.log('[SacredEventsModule] Creating template (mocked):', template);
    this.geh.publish({
      type: 'events:template:created',
      sourceId: 'MODULE_REGISTRY',
      timestamp: new Date().toISOString(),
      payload: { templateId: template.id, name: template.name },
      essenceLabels: ['events:template:creation']
    });
  }

  private async createEventFromTemplate(templateId: string, customData: CustomEventData): Promise<string | null> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      console.error(`[SacredEventsModule] Template not found: ${templateId}`);
      return null;
    }

    // Combine template defaults with custom overrides
    const newEventData: Partial<SacredEvent> = {
      title: customData.title || template.name,
      description: customData.description || template.description,
      event_type: template.event_type, // Event type usually fixed by template
      duration_minutes: customData.duration_minutes || template.default_duration,
      chakra_focus: customData.chakra_focus || template.chakra_focus,
      // Pass other custom data if provided, or leave as undefined if not (Supabase will handle defaults)
      scheduled_start: customData.scheduled_start,
      max_participants: customData.max_participants,
      location: customData.location,
      is_recurring: customData.is_recurring,
      recurrence_pattern: customData.recurrence_pattern,
      status: customData.status || 'scheduled',
      creator_id: customData.creator_id, // This is critical and must come from customData or context
      settings: { ...template.default_settings, ...(customData.settings || {}) }
    };

    // Essential check: creator_id must be present
    if (!newEventData.creator_id) {
      console.error('[SacredEventsModule] Cannot create event from template: Missing creator_id in customData.');
      return null;
    }

    return this.createEvent(newEventData);
  }

  private async scheduleRecurringEvent(eventId: string): Promise<void> {
    // Placeholder: Implement logic for scheduling recurring events based on recurrence_pattern
    console.log(`[SacredEventsModule] Scheduling recurring event: ${eventId}`);
    this.geh.publish({
      type: 'events:event:recurring:scheduled',
      sourceId: 'MODULE_REGISTRY',
      timestamp: new Date().toISOString(),
      payload: { eventId },
      essenceLabels: ['events:scheduling']
    });
  }

  private async sendEventReminders(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId);
    // Use optional chaining for settings and send_reminders
    if (!event || !event.settings?.send_reminders) {
      console.log(`[SacredEventsModule] No event found or reminders disabled for ${eventId}.`);
      return;
    }

    this.geh.publish({
      type: 'events:reminder:sent',
      sourceId: 'MODULE_REGISTRY',
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
      console.error(`[SacredEventsModule] Event not found for startEvent: ${eventId}`);
      return;
    }
    if (event.status === 'active') {
      console.log(`[SacredEventsModule] Event ${eventId} is already active.`);
      return;
    }

    const success = await this.updateEvent(eventId, { status: 'active' });
    if (success) {
      this.geh.publish({
        type: 'events:event:started',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: { eventId },
        metadata: { eventTitle: event.title },
        essenceLabels: ['events:active', 'sacred:gathering', 'ceremony:begin']
      });
      console.log(`[SacredEventsModule] Event ${eventId} started.`);
    }
  }

  private async endEvent(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId);
    if (!event) {
      console.error(`[SacredEventsModule] Event not found for endEvent: ${eventId}`);
      return;
    }
    if (event.status === 'completed') {
      console.log(`[SacredEventsModule] Event ${eventId} is already completed.`);
      return;
    }

    const success = await this.updateEvent(eventId, { status: 'completed' });
    if (success) {
      this.geh.publish({
        type: 'events:event:ended',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: {
          eventId,
          participantCount: event.participants.length
        },
        metadata: { eventTitle: event.title },
        essenceLabels: ['events:completed', 'sacred:gathering', 'ceremony:end']
      });
      console.log(`[SacredEventsModule] Event ${eventId} ended.`);
    }
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
      const { count, error } = await this.supabase.client
        .from('event_participants')
        .select('id', { count: 'exact', head: true }) // Using head: true for count optimization
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error(`[SacredEventsModule] Error getting participation for user ${userId}:`, error);
      return 0;
    }
  }

  private startEventScheduler(): void {
    if (this.eventSchedulerInterval) {
      // Prevent multiple intervals
      return;
    }

    this.eventSchedulerInterval = setInterval(async () => {
      try {
        // Only run if module is active
        if (!this.isActive) {
          console.log('[SacredEventsModule] Scheduler paused: Module not active.');
          return;
        }

        const now = new Date().toISOString();
        const { data, error } = await this.supabase.client
          .from('sacred_events')
          .select('id, settings')
          .eq('status', 'scheduled')
          .lte('scheduled_start', now);

        if (error) throw error;

        // Explicitly type the fetched data for safety
        const eventsToStart = data as Array<{ id: string; settings: SacredEventSettings | null }>;

        for (const event of eventsToStart || []) {
          if (event.settings?.auto_start) {
            await this.startEvent(event.id);
          }
        }
      } catch (error) {
        console.error('[SacredEventsModule] Error in event scheduler:', error);
      }
    }, 60000); // Check every minute
  }

  private stopEventScheduler(): void {
    if (this.eventSchedulerInterval) {
      clearInterval(this.eventSchedulerInterval);
      this.eventSchedulerInterval = null;
      console.log('[SacredEventsModule] Event scheduler stopped.');
    }
  }
}