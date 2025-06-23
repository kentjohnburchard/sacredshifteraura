import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MarketplaceModule, 
  ModuleMarketplaceService, 
  ModuleReview,
  ModuleSetting
} from '../../services/ModuleMarketplaceService';
import { 
  ArrowLeft, 
  Download, 
  Star, 
  Check, 
  Trash2, 
  Clock, 
  Tag,
  Shield,
  Zap,
  User,
  Settings,
  MessageSquare,
  Heart,
  Share2,
  ExternalLink,
  Info,
  AlertCircle
} from 'lucide-react';

interface ModuleDetailsProps {
  module: MarketplaceModule;
  onBack: () => void;
  onInstall: () => Promise<void>;
  onUninstall: () => Promise<void>;
  isInstalled: boolean;
}

export const ModuleDetails: React.FC<ModuleDetailsProps> = ({ 
  module, 
  onBack, 
  onInstall,
  onUninstall,
  isInstalled
}) => {
  const [marketplaceService] = useState(() => ModuleMarketplaceService.getInstance());
  const [reviews, setReviews] = useState<ModuleReview[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'settings'>('overview');
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  useEffect(() => {
    // Load reviews and settings
    const loadData = async () => {
      if (isInstalled) {
        const moduleSettings = await marketplaceService.getModuleSettings(module.module_id);
        setSettings(moduleSettings);
      }
    };
    
    loadData();
  }, [module.id, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      await onInstall();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      clearInterval(interval);
      setInstallProgress(100);
      setTimeout(() => {
        setIsInstalling(false);
      }, 500);
    }
  };

  const handleUninstall = async () => {
    try {
      await onUninstall();
    } catch (error) {
      console.error('Uninstallation failed:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) return;
    
    setIsSubmittingReview(true);
    try {
      await marketplaceService.submitReview(module.id, userRating, userReview);
      // Refresh reviews
      setUserRating(0);
      setUserReview('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSaveSetting = async (key: string, value: any) => {
    try {
      await marketplaceService.saveModuleSetting(module.module_id, key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meditation': return 'bg-purple-500/20 text-purple-300';
      case 'community': return 'bg-pink-500/20 text-pink-300';
      case 'analytics': return 'bg-blue-500/20 text-blue-300';
      case 'tools': return 'bg-green-500/20 text-green-300';
      case 'games': return 'bg-amber-500/20 text-amber-300';
      case 'productivity': return 'bg-cyan-500/20 text-cyan-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl h-48 flex items-center justify-center">
              {module.is_verified ? (
                <Shield className="w-20 h-20 text-white" />
              ) : (
                <Zap className="w-20 h-20 text-white" />
              )}
            </div>
            
            <div className="mt-4 space-y-3">
              {isInstalled ? (
                <motion.button
                  onClick={handleUninstall}
                  className="w-full py-3 bg-red-600/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Uninstall
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isInstalling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Installing {installProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Install Module
                    </>
                  )}
                </motion.button>
              )}
              
              {module.demo_url && (
                <motion.a
                  href={module.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Try Demo
                </motion.a>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Version</div>
                <div className="text-white font-medium">{module.version}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Category</div>
                <div className={`inline-block px-2 py-1 rounded text-sm ${getCategoryColor(module.category)}`}>
                  {module.category}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Downloads</div>
                <div className="text-white font-medium">{module.download_count.toLocaleString()}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Published</div>
                <div className="text-white font-medium">{formatDate(module.published_at || module.created_at)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Developer</div>
                <div className="flex items-center gap-2">
                  {module.developer?.avatar_url ? (
                    <img 
                      src={module.developer.avatar_url} 
                      alt={module.developer.developer_name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                  <span className="text-white font-medium">{module.developer?.developer_name || 'Unknown'}</span>
                  {module.developer?.verified && (
                    <Shield className="w-4 h-4 text-blue-400" title="Verified Developer" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{module.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-medium">{module.average_rating.toFixed(1)}</span>
                    <span className="text-gray-400">({module.rating_count})</span>
                  </div>
                  
                  {module.is_verified && (
                    <div className="flex items-center gap-1 text-blue-400">
                      <Shield className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
              
              {module.price_cents > 0 ? (
                <div className="px-3 py-1 bg-green-600/20 text-green-300 rounded-lg border border-green-500/30">
                  ${(module.price_cents / 100).toFixed(2)}
                </div>
              ) : (
                <div className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30">
                  Free
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'overview'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'reviews'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Reviews
                </button>
                {isInstalled && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'settings'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab Content */}
            <div>
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-6">
                        {module.long_description || module.description}
                      </p>
                      
                      {/* Capabilities */}
                      <h3 className="text-lg font-semibold text-white mb-3">Capabilities</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {module.capabilities.map((capability, index) => (
                          <div key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                            {capability}
                          </div>
                        ))}
                      </div>
                      
                      {/* Tags */}
                      <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {module.tags.map((tag, index) => (
                          <div key={index} className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </div>
                        ))}
                      </div>
                      
                      {/* Essence Labels */}
                      <h3 className="text-lg font-semibold text-white mb-3">Essence Labels</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {module.essence_labels.map((label, index) => (
                          <div key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                            {label}
                          </div>
                        ))}
                      </div>
                      
                      {/* Screenshots */}
                      {module.screenshots && module.screenshots.length > 0 && (
                        <>
                          <h3 className="text-lg font-semibold text-white mb-3">Screenshots</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {module.screenshots.map((screenshot, index) => (
                              <img
                                key={index}
                                src={screenshot}
                                alt={`${module.name} screenshot ${index + 1}`}
                                className="rounded-lg border border-gray-700 w-full h-auto"
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Submit Review */}
                    <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Write a Review</h3>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Rating</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className={`p-1 ${userRating >= star ? 'text-amber-400' : 'text-gray-600'}`}
                            >
                              <Star className="w-6 h-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Review (optional)</div>
                        <textarea
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          placeholder="Share your experience with this module..."
                          className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                        />
                      </div>
                      
                      <button
                        onClick={handleSubmitReview}
                        disabled={userRating === 0 || isSubmittingReview}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            Submit Review
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Reviews List */}
                    <div className="space-y-4">
                      {module.reviews && module.reviews.length > 0 ? (
                        module.reviews.map((review: any, index) => (
                          <div key={index} className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <span className="text-white font-medium">Anonymous User</span>
                              </div>
                              <div className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-600'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {review.review_text && (
                              <p className="text-gray-300">{review.review_text}</p>
                            )}
                            
                            <div className="mt-2 text-xs text-gray-400">
                              {formatDate(review.created_at)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No reviews yet</p>
                          <p className="text-sm mt-2">Be the first to review this module</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'settings' && isInstalled && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-blue-400" />
                        <p className="text-blue-300">
                          Configure settings for this module. Changes will be saved automatically.
                        </p>
                      </div>
                      
                      {/* Mock settings UI - in a real app, these would be dynamic based on module */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Enable Notifications
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications_enabled ?? true}
                              onChange={(e) => handleSaveSetting('notifications_enabled', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-gray-300">Receive notifications from this module</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Theme
                          </label>
                          <select
                            value={settings.theme ?? 'system'}
                            onChange={(e) => handleSaveSetting('theme', e.target.value)}
                            className="w-full p-2 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value="system">System Default</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="cosmic">Cosmic</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Data Sync Frequency
                          </label>
                          <select
                            value={settings.sync_frequency ?? 'realtime'}
                            onChange={(e) => handleSaveSetting('sync_frequency', e.target.value)}
                            className="w-full p-2 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value="realtime">Real-time</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Advanced Settings
                          </label>
                          <div className="p-4 bg-slate-700/50 rounded-lg border border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-300">Debug Mode</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.debug_mode ?? false}
                                  onChange={(e) => handleSaveSetting('debug_mode', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-300">Auto-Update</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.auto_update ?? true}
                                  onChange={(e) => handleSaveSetting('auto_update', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Analytics</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.analytics_enabled ?? true}
                                  onChange={(e) => handleSaveSetting('analytics_enabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/20 rounded-lg border border-amber-500/30 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-amber-300 font-medium mb-1">Advanced Configuration</h4>
                          <p className="text-amber-200/70 text-sm">
                            Some settings may require restarting the application to take effect.
                            Changes are automatically saved to your cloud profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};