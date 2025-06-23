import React from 'react';
import { motion } from 'framer-motion';
import { MarketplaceModule } from '../../services/ModuleMarketplaceService';
import { 
  Download, 
  Star, 
  Check, 
  Trash2, 
  Clock, 
  Tag,
  Shield,
  Zap
} from 'lucide-react';

interface ModuleCardProps {
  module: MarketplaceModule;
  onClick: () => void;
  isInstalled: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  viewMode: 'grid' | 'list';
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  onClick, 
  isInstalled,
  onInstall,
  onUninstall,
  viewMode
}) => {
  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInstall();
  };

  const handleUninstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUninstall();
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

  if (viewMode === 'list') {
    return (
      <motion.div
        className="bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
        onClick={onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="p-4 flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {module.is_verified ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <Zap className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white truncate">{module.name}</h3>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4" />
                <span>{module.average_rating.toFixed(1)}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-2 line-clamp-1">{module.description}</p>
            
            <div className="flex items-center gap-3 text-xs">
              <div className={`px-2 py-1 rounded ${getCategoryColor(module.category)}`}>
                {module.category}
              </div>
              
              <div className="text-gray-400 flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{module.download_count}</span>
              </div>
              
              <div className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(module.published_at || module.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div>
            {isInstalled ? (
              <motion.button
                onClick={handleUninstallClick}
                className="px-3 py-1 bg-red-600/20 text-red-300 rounded border border-red-500/30 hover:bg-red-600/30 transition-colors text-sm flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-3 h-3" />
                Uninstall
              </motion.button>
            ) : (
              <motion.button
                onClick={handleInstallClick}
                className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-sm flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-3 h-3" />
                Install
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden h-full flex flex-col"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Module Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              {module.is_verified ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <Zap className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white truncate max-w-[150px]">{module.name}</h3>
              <div className="text-xs text-gray-400">v{module.version}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4" />
            <span>{module.average_rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      {/* Module Content */}
      <div className="p-4 flex-1">
        <p className="text-sm text-gray-400 mb-4 line-clamp-3">{module.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {module.tags.slice(0, 3).map((tag, index) => (
            <div key={index} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-300 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
            </div>
          ))}
          {module.tags.length > 3 && (
            <div className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-400">
              +{module.tags.length - 3}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{module.download_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(module.published_at || module.created_at)}</span>
          </div>
        </div>
      </div>
      
      {/* Module Footer */}
      <div className="p-4 border-t border-gray-700 flex items-center justify-between">
        <div className={`px-2 py-1 rounded text-xs ${getCategoryColor(module.category)}`}>
          {module.category}
        </div>
        
        {isInstalled ? (
          <motion.button
            onClick={handleUninstallClick}
            className="px-3 py-1 bg-red-600/20 text-red-300 rounded border border-red-500/30 hover:bg-red-600/30 transition-colors text-xs flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-3 h-3" />
            Uninstall
          </motion.button>
        ) : (
          <motion.button
            onClick={handleInstallClick}
            className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-xs flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-3 h-3" />
            Install
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};