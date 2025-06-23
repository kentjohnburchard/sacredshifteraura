import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MarketplaceModule } from '../../services/ModuleMarketplaceService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Download,
  Star,
  Shield
} from 'lucide-react';

interface FeaturedModulesProps {
  modules: MarketplaceModule[];
  onModuleClick: (module: MarketplaceModule) => void;
  isInstalled: (moduleId: string) => boolean;
  onInstall: (moduleId: string) => void;
}

export const FeaturedModules: React.FC<FeaturedModulesProps> = ({ 
  modules, 
  onModuleClick,
  isInstalled,
  onInstall
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-advance carousel
    const interval = setInterval(() => {
      if (!isAnimating && modules.length > 1) {
        handleNext();
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [currentIndex, modules.length, isAnimating]);

  const handlePrev = () => {
    if (isAnimating || modules.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev === 0 ? modules.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating || modules.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev === modules.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDotClick = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleInstallClick = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    onInstall(moduleId);
  };

  if (modules.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Featured Modules</h3>
        </div>
        
        {modules.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              disabled={isAnimating}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              disabled={isAnimating}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden" ref={carouselRef}>
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {modules.map((module, index) => (
            <div 
              key={module.id}
              className="w-full flex-shrink-0"
              style={{ display: index === currentIndex ? 'block' : 'none' }}
            >
              <div 
                className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-6 cursor-pointer"
                onClick={() => onModuleClick(module)}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl h-48 flex items-center justify-center">
                      {module.is_verified ? (
                        <Shield className="w-20 h-20 text-white" />
                      ) : (
                        <Sparkles className="w-20 h-20 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-white">{module.name}</h2>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-5 h-5" />
                        <span className="font-medium">{module.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {module.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.tags.slice(0, 5).map((tag, i) => (
                        <div key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          {tag}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Download className="w-4 h-4" />
                        <span>{module.download_count} downloads</span>
                      </div>
                      
                      {isInstalled(module.module_id) ? (
                        <div className="px-3 py-1 bg-green-600/20 text-green-300 rounded flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Installed
                        </div>
                      ) : (
                        <motion.button
                          onClick={(e) => handleInstallClick(e, module.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          Install
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots navigation */}
      {modules.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {modules.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-purple-400 w-4' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};