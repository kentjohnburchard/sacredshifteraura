import { SupabaseService } from './SupabaseService';
import { GlobalEventHorizon } from './GlobalEventHorizon';

export interface MarketplaceModule {
  id: string;
  module_id: string;
  developer_id: string;
  name: string;
  description: string;
  long_description?: string;
  version: string;
  category: string;
  tags: string[];
  capabilities: string[];
  essence_labels: string[];
  price_cents: number;
  is_featured: boolean;
  is_verified: boolean;
  status: 'draft' | 'published' | 'suspended';
  package_url?: string;
  manifest_data: any;
  screenshots: string[];
  demo_url?: string;
  download_count: number;
  rating_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  developer?: DeveloperProfile;
}

export interface DeveloperProfile {
  id: string;
  user_id: string;
  developer_name: string;
  bio?: string;
  website_url?: string;
  avatar_url?: string;
  verified: boolean;
  total_downloads: number;
  total_modules: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleReview {
  id: string;
  module_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleUpdate {
  id: string;
  module_id: string;
  version: string;
  previous_version?: string;
  update_type: 'major' | 'minor' | 'patch' | 'hotfix';
  changelog?: string;
  release_notes?: string;
  is_critical: boolean;
  is_auto_installable: boolean;
  package_url: string;
  created_at: string;
}

export interface ModuleSetting {
  id: string;
  user_id: string;
  module_id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'user' | 'system' | 'theme';
  created_at: string;
  updated_at: string;
}

/**
 * ModuleMarketplaceService - The Sacred Module Ecosystem
 * Manages the entire lifecycle of module discovery, installation, and updates
 */
export class ModuleMarketplaceService {
  private static instance: ModuleMarketplaceService;
  private supabase: SupabaseService;
  private geh: GlobalEventHorizon;
  private installedModules: Set<string> = new Set();

  private constructor() {
    this.supabase = SupabaseService.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.loadInstalledModules();
  }

  public static getInstance(): ModuleMarketplaceService {
    if (!ModuleMarketplaceService.instance) {
      ModuleMarketplaceService.instance = new ModuleMarketplaceService();
    }
    return ModuleMarketplaceService.instance;
  }

  /**
   * Browse marketplace modules with filtering and pagination
   */
  public async browseModules(options: {
    category?: string;
    search?: string;
    tags?: string[];
    sort?: 'popular' | 'rating' | 'recent' | 'name';
    featured?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ modules: MarketplaceModule[]; total: number; page: number }> {
    try {
      const {
        category,
        search,
        tags = [],
        sort = 'popular',
        featured,
        page = 1,
        limit = 20
      } = options;

      let query = this.supabase.client
        .from('marketplace_modules')
        .select(`
          *,
          developer:developer_profiles(*)
        `)
        .eq('status', 'published');

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }

      if (featured) {
        query = query.eq('is_featured', true);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
      }

      if (tags.length > 0) {
        query = query.contains('tags', tags);
      }

      // Apply sorting
      switch (sort) {
        case 'popular':
          query = query.order('download_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'recent':
          query = query.order('published_at', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      this.geh.publish({
        type: 'marketplace:browse:success',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          resultCount: data?.length || 0,
          totalCount: count || 0,
          filters: options 
        },
        metadata: { page, limit },
        essenceLabels: ['marketplace:browse', 'modules:discovery']
      });

      return {
        modules: data || [],
        total: count || 0,
        page
      };
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to browse modules:', error);
      
      this.geh.publish({
        type: 'marketplace:browse:error',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { error: (error as Error).message },
        metadata: { filters: options },
        essenceLabels: ['marketplace:error', 'modules:discovery']
      });

      throw error;
    }
  }

  /**
   * Get detailed module information
   */
  public async getModuleDetails(moduleId: string): Promise<MarketplaceModule | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('marketplace_modules')
        .select(`
          *,
          developer:developer_profiles(*),
          reviews:module_reviews(
            rating,
            review_text,
            helpful_count,
            created_at
          )
        `)
        .eq('id', moduleId)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Track module view
      await this.trackAnalytics(moduleId, 'module_viewed', {
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to get module details:', error);
      return null;
    }
  }

  /**
   * Install a module from the marketplace
   */
  public async installModule(moduleId: string): Promise<boolean> {
    try {
      // Get module details
      const module = await this.getModuleDetails(moduleId);
      if (!module) throw new Error('Module not found');

      // Check if already installed
      if (this.installedModules.has(module.module_id)) {
        console.log('[ModuleMarketplaceService] Module already installed:', module.name);
        return true;
      }

      // Track download
      await this.trackDownload(moduleId, module.version);

      // Simulate installation process (in real implementation, would download and install)
      await this.simulateInstallation(module);

      // Mark as installed
      this.installedModules.add(module.module_id);
      this.saveInstalledModules();

      this.geh.publish({
        type: 'marketplace:module:installed',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId: module.module_id,
          moduleName: module.name,
          version: module.version 
        },
        metadata: { installationMethod: 'marketplace' },
        essenceLabels: ['marketplace:install', 'module:new', 'system:expansion']
      });

      return true;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to install module:', error);
      
      this.geh.publish({
        type: 'marketplace:module:installFailed',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId,
          error: (error as Error).message 
        },
        metadata: {},
        essenceLabels: ['marketplace:error', 'module:install', 'system:failure']
      });

      return false;
    }
  }

  /**
   * Uninstall a module
   */
  public async uninstallModule(moduleId: string): Promise<boolean> {
    try {
      if (!this.installedModules.has(moduleId)) {
        console.log('[ModuleMarketplaceService] Module not installed:', moduleId);
        return true;
      }

      // Remove from installed modules
      this.installedModules.delete(moduleId);
      this.saveInstalledModules();

      this.geh.publish({
        type: 'marketplace:module:uninstalled',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { moduleId },
        metadata: {},
        essenceLabels: ['marketplace:uninstall', 'module:removed', 'system:cleanup']
      });

      return true;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to uninstall module:', error);
      return false;
    }
  }

  /**
   * Check for module updates
   */
  public async checkForUpdates(): Promise<ModuleUpdate[]> {
    try {
      const installedModuleIds = Array.from(this.installedModules);
      if (installedModuleIds.length === 0) return [];

      const { data, error } = await this.supabase.client
        .from('module_updates')
        .select(`
          *,
          module:marketplace_modules(name, version)
        `)
        .in('module_id', installedModuleIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.geh.publish({
        type: 'marketplace:updates:checked',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          availableUpdates: data?.length || 0,
          checkedModules: installedModuleIds.length 
        },
        metadata: {},
        essenceLabels: ['marketplace:updates', 'system:maintenance']
      });

      return data || [];
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to check for updates:', error);
      return [];
    }
  }

  /**
   * Update a module to latest version
   */
  public async updateModule(moduleId: string, targetVersion?: string): Promise<boolean> {
    try {
      const updates = await this.checkForUpdates();
      const moduleUpdate = updates.find(u => u.module_id === moduleId);
      
      if (!moduleUpdate) {
        console.log('[ModuleMarketplaceService] No updates available for module:', moduleId);
        return false;
      }

      // Simulate update process
      await this.simulateUpdate(moduleUpdate);

      this.geh.publish({
        type: 'marketplace:module:updated',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId,
          fromVersion: moduleUpdate.previous_version,
          toVersion: moduleUpdate.version,
          updateType: moduleUpdate.update_type 
        },
        metadata: { isCritical: moduleUpdate.is_critical },
        essenceLabels: ['marketplace:update', 'module:enhanced', 'system:improved']
      });

      return true;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to update module:', error);
      return false;
    }
  }

  /**
   * Submit a review for a module
   */
  public async submitReview(moduleId: string, rating: number, reviewText?: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase.client
        .from('module_reviews')
        .upsert({
          module_id: moduleId,
          user_id: user.id,
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      this.geh.publish({
        type: 'marketplace:review:submitted',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, rating, hasText: !!reviewText },
        metadata: { userId: user.id },
        essenceLabels: ['marketplace:feedback', 'community:engagement']
      });

      return true;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to submit review:', error);
      return false;
    }
  }

  /**
   * Get module settings for current user
   */
  public async getModuleSettings(moduleId: string): Promise<Record<string, any>> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return {};

      const { data, error } = await this.supabase.client
        .from('module_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      if (error) throw error;

      const settings: Record<string, any> = {};
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return settings;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to get module settings:', error);
      return {};
    }
  }

  /**
   * Save module setting
   */
  public async saveModuleSetting(
    moduleId: string, 
    key: string, 
    value: any, 
    type: 'user' | 'system' | 'theme' = 'user'
  ): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase.client
        .from('module_settings')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          setting_key: key,
          setting_value: value,
          setting_type: type,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      this.geh.publish({
        type: 'marketplace:setting:saved',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, settingKey: key, settingType: type },
        metadata: { userId: user.id },
        essenceLabels: ['marketplace:configuration', 'user:personalization']
      });

      return true;
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to save module setting:', error);
      return false;
    }
  }

  /**
   * Get analytics for modules (for developers)
   */
  public async getModuleAnalytics(moduleId?: string, timeRange?: { start: Date; end: Date }): Promise<any[]> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = this.supabase.client
        .from('marketplace_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      if (timeRange) {
        query = query
          .gte('created_at', timeRange.start.toISOString())
          .lte('created_at', timeRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to get module analytics:', error);
      return [];
    }
  }

  /**
   * Check if module is installed
   */
  public isModuleInstalled(moduleId: string): boolean {
    return this.installedModules.has(moduleId);
  }

  /**
   * Get list of installed modules
   */
  public getInstalledModules(): string[] {
    return Array.from(this.installedModules);
  }

  // Private helper methods
  private async trackDownload(moduleId: string, version: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      
      await this.supabase.client
        .from('module_downloads')
        .insert({
          module_id: moduleId,
          user_id: user?.id,
          version,
          download_source: 'marketplace',
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.warn('[ModuleMarketplaceService] Failed to track download (non-critical):', error);
    }
  }

  private async trackAnalytics(moduleId: string, eventType: string, eventData: Record<string, any> = {}): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return;

      await this.supabase.client
        .from('marketplace_analytics')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          event_type: eventType,
          event_data: eventData,
          page_url: window.location.href,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.warn('[ModuleMarketplaceService] Failed to track analytics (non-critical):', error);
    }
  }

  private async simulateInstallation(module: MarketplaceModule): Promise<void> {
    // Simulate download and installation process
    return new Promise(resolve => {
      this.geh.publish({
        type: 'marketplace:module:installing',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId: module.module_id,
          moduleName: module.name,
          progress: 0 
        },
        metadata: {},
        essenceLabels: ['marketplace:install', 'module:progress']
      });

      // Simulate download progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        
        this.geh.publish({
          type: 'marketplace:module:installing',
          sourceId: 'MARKETPLACE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { 
            moduleId: module.module_id,
            moduleName: module.name,
            progress 
          },
          metadata: {},
          essenceLabels: ['marketplace:install', 'module:progress']
        });

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  }

  private async simulateUpdate(update: ModuleUpdate): Promise<void> {
    // Simulate update process
    return new Promise(resolve => {
      this.geh.publish({
        type: 'marketplace:module:updating',
        sourceId: 'MARKETPLACE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId: update.module_id,
          fromVersion: update.previous_version,
          toVersion: update.version,
          progress: 0 
        },
        metadata: {},
        essenceLabels: ['marketplace:update', 'module:progress']
      });

      // Simulate update progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        
        this.geh.publish({
          type: 'marketplace:module:updating',
          sourceId: 'MARKETPLACE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { 
            moduleId: update.module_id,
            fromVersion: update.previous_version,
            toVersion: update.version,
            progress 
          },
          metadata: {},
          essenceLabels: ['marketplace:update', 'module:progress']
        });

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 400);
    });
  }

  private loadInstalledModules(): void {
    try {
      const stored = localStorage.getItem('sacred-shifter-installed-modules');
      if (stored) {
        const modules = JSON.parse(stored);
        this.installedModules = new Set(modules);
      }
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to load installed modules:', error);
    }
  }

  private saveInstalledModules(): void {
    try {
      localStorage.setItem(
        'sacred-shifter-installed-modules',
        JSON.stringify(Array.from(this.installedModules))
      );
    } catch (error) {
      console.error('[ModuleMarketplaceService] Failed to save installed modules:', error);
    }
  }
}