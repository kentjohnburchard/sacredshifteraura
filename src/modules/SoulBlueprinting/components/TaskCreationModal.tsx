import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { SoulBlueprint } from '../SoulBlueprintingModule';
import { 
  X, 
  Save,
  Zap,
  Calendar,
  Star,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprints: SoulBlueprint[];
  onTaskCreated: () => void;
  defaultBlueprintId?: string;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  blueprints,
  onTaskCreated,
  defaultBlueprintId
}) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chakra: 'heart',
    frequency: 528,
    intention: '',
    status: 'active',
    priority: 3,
    due_date: '',
    blueprint_id: defaultBlueprintId || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to create tasks');
      }
      
      console.log('Creating task with data:', { ...formData, user_id: user.id });
      
      // Create the task
      const { data, error } = await supabase
        .from('sacred_tasks')
        .insert({
          ...formData,
          user_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      console.log('Created task:', data);
      setSuccess('Sacred task created successfully!');
      setFormData({
        title: '',
        description: '',
        chakra: 'heart',
        frequency: 528,
        intention: '',
        status: 'active',
        priority: 3,
        due_date: '',
        blueprint_id: defaultBlueprintId || ''
      });
      
      // Notify parent
      onTaskCreated();
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize blueprint_id if defaultBlueprintId is provided
  useState(() => {
    if (defaultBlueprintId && formData.blueprint_id !== defaultBlueprintId) {
      setFormData(prev => ({
        ...prev,
        blueprint_id: defaultBlueprintId
      }));
    }
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-purple-500/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-purple-500/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create Sacred Task</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-900/20 text-red-300 p-3 rounded-lg flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-900/20 text-green-300 p-3 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                placeholder="Enter sacred task title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                placeholder="Describe the purpose and details of this task..."
              />
            </div>
          </div>
          
          {/* Task Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-400" />
                Chakra
              </label>
              <select
                name="chakra"
                value={formData.chakra}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              >
                <option value="root">Root Chakra</option>
                <option value="sacral">Sacral Chakra</option>
                <option value="solar">Solar Plexus Chakra</option>
                <option value="heart">Heart Chakra</option>
                <option value="throat">Throat Chakra</option>
                <option value="third-eye">Third Eye Chakra</option>
                <option value="crown">Crown Chakra</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-400" />
                Frequency (Hz)
              </label>
              <input
                type="number"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Heart className="w-4 h-4 text-pink-400" />
                Intention
              </label>
              <input
                type="text"
                name="intention"
                value={formData.intention}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                placeholder="The sacred intention behind this task..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />
                Priority (1-5)
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              >
                <option value="1">1 - Lowest</option>
                <option value="2">2 - Low</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Highest</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-green-400" />
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="aligned">Aligned</option>
                <option value="blocked">Blocked</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>
          
          {/* Blueprint Connection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
              <Heart className="w-4 h-4 text-purple-400" />
              Soul Blueprint Alignment
            </label>
            <select
              name="blueprint_id"
              value={formData.blueprint_id}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="">None - No Blueprint Alignment</option>
              {blueprints.map(blueprint => (
                <option key={blueprint.id} value={blueprint.id}>
                  {blueprint.blueprint_text?.mission?.substring(0, 40) || 'Unnamed Blueprint'} - {blueprint.core_frequency}Hz
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-400">
              Connect this task to your soul blueprint to align your actions with your highest purpose
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};