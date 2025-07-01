import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { VisionNode } from '../UnityEngineModule';
import { 
  Lightbulb, 
  Tag, 
  Zap, 
  Heart, 
  Settings, 
  Save, 
  X,
  Globe,
  Lock,
  Upload,
  Sparkles,
  Plus,
  Trash
} from 'lucide-react';

interface VisionNodeCreatorProps {
  onNodeCreated: (node: VisionNode) => void;
  onCancel: () => void;
  editNode?: VisionNode; // For editing existing nodes
}

export const VisionNodeCreator: React.FC<VisionNodeCreatorProps> = ({
  onNodeCreated,
  onCancel,
  editNode
}) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  // Default frequencies based on chakras
  const chakraFrequencies = {
    root: 396,
    sacral: 417,
    solar: 528,
    heart: 639,
    throat: 741,
    third_eye: 852,
    crown: 963
  };
  
  const [formData, setFormData] = useState<Partial<VisionNode>>(editNode || {
    title: '',
    description: '',
    frequency_hz: 528, // Default to MI/transformation frequency
    chakra_alignment: 'heart',
    is_public: false,
    tags: [],
    sacred_geometry_pattern: 'flower_of_life',
    resonance_score: 0
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If changing chakra, also update the frequency
    if (name === 'chakra_alignment' && value in chakraFrequencies) {
      const chakraFreq = chakraFrequencies[value as keyof typeof chakraFrequencies];
      setFormData(prev => ({
        ...prev,
        [name]: value,
        frequency_hz: chakraFreq
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    
    setNewTag('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user?.id) {
        throw new Error('You must be logged in to create a vision node');
      }
      
      const nodeData = {
        ...formData,
        user_id: user.id
      };
      
      let result;
      
      if (editNode?.id) {
        // Update existing node
        const { data, error } = await supabase
          .from('unity_vision_nodes')
          .update(nodeData)
          .eq('id', editNode.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new node
        const { data, error } = await supabase
          .from('unity_vision_nodes')
          .insert(nodeData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Call the callback with the created/updated node
      onNodeCreated(result as VisionNode);
      
    } catch (err) {
      console.error('Error saving vision node:', err);
      setError('Failed to save vision node. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{editNode ? 'Edit Vision Node' : 'Create New Vision Node'}</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vision Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                placeholder="Name your vision..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                placeholder="Describe your vision in detail..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="flex-1 p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 p-2 bg-slate-800/50 rounded-lg min-h-12">
                {(formData.tags || []).map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 text-purple-300 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(formData.tags || []).length === 0 && (
                  <div className="text-gray-500 text-sm">No tags added yet</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chakra Alignment
                </label>
                <select
                  name="chakra_alignment"
                  value={formData.chakra_alignment || 'heart'}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="root">Root Chakra</option>
                  <option value="sacral">Sacral Chakra</option>
                  <option value="solar">Solar Plexus Chakra</option>
                  <option value="heart">Heart Chakra</option>
                  <option value="throat">Throat Chakra</option>
                  <option value="third_eye">Third Eye Chakra</option>
                  <option value="crown">Crown Chakra</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frequency (Hz)
                </label>
                <input
                  type="number"
                  name="frequency_hz"
                  value={formData.frequency_hz || 528}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Common: 396, 417, 528, 639, 741, 852, 963 Hz
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sacred Geometry Pattern
              </label>
              <select
                name="sacred_geometry_pattern"
                value={formData.sacred_geometry_pattern || 'flower_of_life'}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              >
                <option value="flower_of_life">Flower of Life</option>
                <option value="sri_yantra">Sri Yantra</option>
                <option value="metatrons_cube">Metatron's Cube</option>
                <option value="merkaba">Merkaba</option>
                <option value="torus">Torus</option>
                <option value="fibonacci_spiral">Fibonacci Spiral</option>
                <option value="seed_of_life">Seed of Life</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media URL (Optional)
              </label>
              <input
                type="text"
                name="media_url"
                value={formData.media_url || ''}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={formData.is_public || false}
                onChange={handleCheckboxChange}
                className="mr-2 rounded"
              />
              <label htmlFor="is_public" className="text-gray-300 flex items-center gap-2">
                {formData.is_public ? (
                  <Globe className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <span>{formData.is_public ? 'Public - Visible to all users' : 'Private - Only visible to you'}</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          
          <motion.button
            type="submit"
            disabled={isSubmitting || !formData.title}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editNode ? 'Update' : 'Create'} Vision Node</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};