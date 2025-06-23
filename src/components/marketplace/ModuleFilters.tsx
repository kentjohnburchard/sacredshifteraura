import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  Check,
  SortAsc,
  Download,
  Star,
  Clock,
  AlignLeft
} from 'lucide-react';

interface ModuleFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  sortBy: 'popular' | 'rating' | 'recent' | 'name';
  onCategoryChange: (category: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sort: 'popular' | 'rating' | 'recent' | 'name') => void;
}

export const ModuleFilters: React.FC<ModuleFiltersProps> = ({
  selectedCategory,
  selectedTags,
  sortBy,
  onCategoryChange,
  onTagsChange,
  onSortChange
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    tags: true,
    sort: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'community', name: 'Community' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'tools', name: 'Tools' },
    { id: 'games', name: 'Games' },
    { id: 'productivity', name: 'Productivity' }
  ];

  const popularTags = [
    'consciousness', 'spiritual', 'healing', 'chakra', 'energy',
    'meditation', 'visualization', 'sound', 'community', 'sacred',
    'ritual', 'astrology', 'tarot', 'dreams', 'journaling'
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular', icon: Download },
    { id: 'rating', name: 'Highest Rated', icon: Star },
    { id: 'recent', name: 'Recently Added', icon: Clock },
    { id: 'name', name: 'Alphabetical', icon: AlignLeft }
  ];

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-white font-medium">Categories</span>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.categories && (
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center justify-between w-full p-2 rounded-lg text-sm ${
                  selectedCategory === category.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{category.name}</span>
                {selectedCategory === category.id && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('tags')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-white font-medium">Tags</span>
          {expandedSections.tags ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.tags && (
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <motion.button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800 text-gray-300 border border-gray-700 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Sort By */}
      <div>
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-white font-medium">Sort By</span>
          {expandedSections.sort ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.sort && (
          <div className="space-y-2">
            {sortOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => onSortChange(option.id as any)}
                  className={`flex items-center justify-between w-full p-2 rounded-lg text-sm ${
                    sortBy === option.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{option.name}</span>
                  </div>
                  {sortBy === option.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Filters */}
      {(selectedCategory || selectedTags.length > 0 || sortBy !== 'popular') && (
        <button
          onClick={() => {
            onCategoryChange('');
            onTagsChange([]);
            onSortChange('popular');
          }}
          className="mt-6 w-full py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors text-sm"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};