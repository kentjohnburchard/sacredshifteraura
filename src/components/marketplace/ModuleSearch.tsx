import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface ModuleSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export const ModuleSearch: React.FC<ModuleSearchProps> = ({ onSearch, initialValue = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search modules, capabilities, or tags..."
        className="w-full pl-10 pr-10 py-3 bg-slate-800 text-white rounded-lg border border-gray-700 focus:border-purple-400 focus:outline-none"
      />
      
      {searchQuery && (
        <motion.button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </form>
  );
};