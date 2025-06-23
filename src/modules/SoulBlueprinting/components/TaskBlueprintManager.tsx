import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { SoulBlueprint } from '../SoulBlueprintingModule';
import { 
  Clipboard, 
  PlusCircle, 
  Sparkles, 
  ArrowUpRight,
  Calendar,
  Clock,
  Star,
  Zap,
  Heart,
  CheckCircle,
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  chakra: string;
  frequency?: number;
  intention?: string;
  status: string;
  priority: number;
  due_date?: string;
  blueprint_id?: string;
}

export const TaskBlueprintManager: React.FC = () => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blueprints, setBlueprints] = useState<SoulBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUnalignedOnly, setShowUnalignedOnly] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Load blueprints
      const { data: blueprintsData, error: blueprintsError } = await supabase
        .from('sacred_blueprints')
        .select('*')
        .eq('user_id', user?.id);
      
      if (blueprintsError) throw blueprintsError;
      setBlueprints(blueprintsData || []);

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('sacred_tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tasks and blueprints');
    } finally {
      setIsLoading(false);
    }
  };

  const connectTaskToBlueprint = async (taskId: string, blueprintId: string | null) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase
        .from('sacred_tasks')
        .update({ blueprint_id: blueprintId })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, blueprint_id: blueprintId } : task
      ));
      
      setSuccess('Task successfully aligned with soul blueprint');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error connecting task to blueprint:', err);
      setError('Failed to align task with blueprint');
    } finally {
      setIsUpdating(false);
      setSelectedTask(null);
      setSelectedBlueprintId(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedBlueprintId(task.blueprint_id || null);
  };

  const handleSubmit = () => {
    if (!selectedTask) return;
    connectTaskToBlueprint(selectedTask.id, selectedBlueprintId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-500/20 text-blue-300';
      case 'complete': return 'bg-green-500/20 text-green-300';
      case 'blocked': return 'bg-red-500/20 text-red-300';
      case 'aligned': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    
    // Apply blueprint filter
    if (showUnalignedOnly && task.blueprint_id) {
      return false;
    }
    
    return true;
  });

  const getBlueprintName = (blueprintId: string) => {
    const blueprint = blueprints.find(bp => bp.id === blueprintId);
    return blueprint ? 
      `${blueprint.blueprint_text?.mission?.substring(0, 30)}...` : 
      'Unknown Blueprint';
  };

  const getChakraColor = (chakra: string) => {
    switch (chakra.toLowerCase()) {
      case 'root': return 'text-red-500';
      case 'sacral': return 'text-orange-500';
      case 'solar': return 'text-yellow-500';
      case 'heart': return 'text-green-500';
      case 'throat': return 'text-blue-500';
      case 'third-eye': return 'text-indigo-500';
      case 'crown': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const handleCreateTask = () => {
    // Redirect to the Soul Blueprint Editor with the tasks tab active
    window.location.href = '/soul-journey?tab=tasks';
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-purple-400" />
          Task Blueprint Alignment
        </h2>
        
        <button 
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-3 bg-slate-800 text-white rounded-lg border border-gray-700 focus:border-purple-400 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-3 bg-slate-800 text-white rounded-lg border border-gray-700 focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="complete">Complete</option>
            <option value="blocked">Blocked</option>
            <option value="aligned">Aligned</option>
          </select>
          
          <label className="flex items-center gap-2 p-3 bg-slate-800 text-white rounded-lg border border-gray-700">
            <input
              type="checkbox"
              checked={showUnalignedOnly}
              onChange={e => setShowUnalignedOnly(e.target.checked)}
              className="rounded text-purple-500"
            />
            <span className="text-sm">Unaligned Only</span>
          </label>
        </div>
      </div>
      
      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/20 text-red-300 p-4 rounded-lg flex items-start gap-2 mb-4"
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
            className="bg-green-900/20 text-green-300 p-4 rounded-lg flex items-start gap-2 mb-4"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task List */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 text-center">
          <Clipboard className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400">No tasks found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {filteredTasks.map(task => (
            <motion.div
              key={task.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedTask?.id === task.id
                  ? 'bg-purple-900/20 border-purple-500'
                  : 'bg-slate-800/50 border-gray-700 hover:border-purple-500/50'
              }`}
              onClick={() => handleTaskClick(task)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{task.title}</h3>
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
              </div>
              
              {task.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-1">{task.description}</p>
              )}
              
              <div className="flex items-center flex-wrap gap-2 text-xs">
                {task.chakra && (
                  <div className={`flex items-center gap-1 ${getChakraColor(task.chakra)}`}>
                    <Zap className="w-3 h-3" />
                    {task.chakra.replace('-', ' ')} Chakra
                  </div>
                )}
                
                {task.frequency && (
                  <div className="text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {task.frequency}Hz
                  </div>
                )}
                
                {task.due_date && (
                  <div className="text-amber-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
                
                {task.priority && (
                  <div className="text-red-400 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    P{task.priority}
                  </div>
                )}
              </div>
              
              {task.blueprint_id && (
                <div className="mt-3 p-2 bg-purple-900/10 border border-purple-500/20 rounded-lg text-xs text-purple-300 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Aligned with: {getBlueprintName(task.blueprint_id)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Blueprint Selection Dialog */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/90 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400" />
            Align Task with Soul Blueprint
          </h3>
          
          <p className="text-gray-300 mb-4">
            Selected Task: <span className="text-white font-medium">{selectedTask.title}</span>
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Blueprint
            </label>
            
            <select
              value={selectedBlueprintId || ''}
              onChange={e => setSelectedBlueprintId(e.target.value || null)}
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="">None (Remove Blueprint Alignment)</option>
              {blueprints.map(blueprint => (
                <option key={blueprint.id} value={blueprint.id}>
                  {blueprint.blueprint_text?.mission?.substring(0, 40) || 'Unnamed Blueprint'} - {blueprint.core_frequency}Hz
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setSelectedTask(null);
                setSelectedBlueprintId(null);
              }}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Aligning...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Align Task
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Empty State - No Blueprints */}
      {!isLoading && blueprints.length === 0 && (
        <div className="bg-amber-900/20 text-amber-300 p-4 rounded-lg mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">No Soul Blueprints Available</h4>
            <p className="text-sm">
              You need to create a Soul Blueprint before you can align tasks with it.
              Visit the Soul Blueprint tab to create your first blueprint.
            </p>
          </div>
        </div>
      )}
      
      {/* Add Task Button */}
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleCreateTask}
          className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Task
        </button>
      </div>
    </div>
  );
};