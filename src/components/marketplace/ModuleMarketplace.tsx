import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleMarketplaceService, MarketplaceModule } from '../../services/ModuleMarketplaceService';
import { ModuleCard } from './ModuleCard';
import { ModuleDetails } from './ModuleDetails';
import { ModuleFilters } from './ModuleFilters';
import { ModuleSearch } from './ModuleSearch';
import { FeaturedModules } from './FeaturedModules';
import { 
  Store, 
  Search, 
  Filter, 
  Package, 
  Star, 
  Download, 
  RefreshCw,
  Sparkles,
  Grid,
  List,
  Loader
} from 'lucide-react';

export const ModuleMarketplace: React.FC = () => {
  const [marketplaceService] = useState(() => ModuleMarketplaceService.getInstance());
  const [modules, setModules] = useState<MarketplaceModule[]>([]);
  const [featuredModules, setFeaturedModules] = useState<MarketplaceModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<MarketplaceModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalModules, setTotalModules] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'name'>('popular');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    loadModules();
    loadFeaturedModules();
  }, []);

  useEffect(() => {
    loadModules();
  }, [searchQuery, selectedCategory, selectedTags, sortBy, showFeaturedOnly, currentPage]);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const result = await marketplaceService.browseModules({
        search: searchQuery,
        category: selectedCategory || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sort: sortBy,
        featured: showFeaturedOnly,
        page: currentPage,
        limit: 12
      });
      
      setModules(result.modules);
      setTotalModules(result.total);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedModules = async () => {
    try {
      const result = await marketplaceService.browseModules({
        featured: true,
        limit: 5
      });
      setFeaturedModules(result.modules);
    } catch (error) {
      console.error('Failed to load featured modules:', error);
    }
  };

  const handleInstall = async (moduleId: string) => {
    await marketplaceService.installModule(moduleId);
    // Refresh the module list to update installation status
    loadModules();
  };

  const handleUninstall = async (moduleId: string) => {
    await marketplaceService.uninstallModule(moduleId);
    // Refresh the module list to update installation status
    loadModules();
  };

  const handleModuleClick = (module: MarketplaceModule) => {
    setSelectedModule(module);
  };

  const handleBackToList = () => {
    setSelectedModule(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'popular' | 'rating' | 'recent' | 'name') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleFeaturedToggle = (featured: boolean) => {
    setShowFeaturedOnly(featured);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalModules / 12);

  if (selectedModule) {
    return (
      <ModuleDetails 
        module={selectedModule} 
        onBack={handleBackToList}
        onInstall={() => handleInstall(selectedModule.id)}
        onUninstall={() => handleUninstall(selectedModule.module_id)}
        isInstalled={marketplaceService.isModuleInstalled(selectedModule.module_id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Module Marketplace</h2>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
              Expand Your Consciousness
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">
          Discover and install powerful modules to enhance your Sacred Shifter experience.
          Each module is carefully crafted to expand your consciousness and spiritual journey.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <ModuleSearch onSearch={handleSearch} initialValue={searchQuery} />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleFeaturedToggle(!showFeaturedOnly)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
                showFeaturedOnly 
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-slate-800 text-gray-300 border border-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Featured
            </button>
            
            <button
              onClick={() => loadModules()}
              className="px-3 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 flex items-center gap-1 text-sm"
              title="Refresh modules"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Modules Carousel (only show if not filtering) */}
      {!searchQuery && !selectedCategory && !selectedTags.length && !showFeaturedOnly && (
        <FeaturedModules 
          modules={featuredModules} 
          onModuleClick={handleModuleClick}
          isInstalled={(moduleId) => marketplaceService.isModuleInstalled(moduleId)}
          onInstall={handleInstall}
        />
      )}

      {/* Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ModuleFilters
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            sortBy={sortBy}
            onCategoryChange={handleCategoryChange}
            onTagsChange={handleTagsChange}
            onSortChange={handleSortChange}
          />
        </div>

        {/* Module Grid */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {isLoading ? 'Loading modules...' : `${totalModules} Modules Found`}
              </h3>
              
              {totalModules > 0 && (
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                  <p className="text-purple-300">Loading sacred modules...</p>
                </div>
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No modules found</p>
                <p className="text-sm mt-2">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-4"
                }>
                  <AnimatePresence>
                    {modules.map((module) => (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ModuleCard
                          module={module}
                          onClick={() => handleModuleClick(module)}
                          isInstalled={marketplaceService.isModuleInstalled(module.module_id)}
                          onInstall={() => handleInstall(module.id)}
                          onUninstall={() => handleUninstall(module.module_id)}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum = currentPage - 2 + i;
                        if (pageNum < 1) pageNum += 5;
                        if (pageNum > totalPages) pageNum -= 5;
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-gray-300 border border-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};