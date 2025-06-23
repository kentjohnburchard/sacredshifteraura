import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { SoulBlueprint } from '../SoulBlueprintingModule';
import { TaskCreationModal } from './TaskCreationModal';
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
  created_at: string;
}

interface BlueprintTasksViewProps {
  blueprint: SoulBlueprint;
}

export const BlueprintTasksView: React.FC<BlueprintTasksViewProps> = ({ blueprint }) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [blueprints, setBlueprints] = useState<SoulBlueprint[]>([]);

  useEffect(() => {
    if (blueprint?.id) {
      fetchTasks();
      fetchBlueprints();
    }
  }, [blueprint?.id]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching tasks for blueprint ID:', blueprint.id);
      const { data, error } = await supabase
        .from('sacred_tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('blueprint_id', blueprint.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log('Fetched tasks:', data);
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlueprints = async () => {
    try {
      const { data, error } = await supabase
        .from('sacred_blueprints')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setBlueprints(data || []);
    } catch (err) {
      console.error('Error fetching blueprints:', err);
    }
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-500/20 text-blue-300';
      case 'complete': return 'bg-green-500/20 text-green-300';
      case 'blocked': return 'bg-red-500/20 text-red-300';
      case 'aligned': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const markTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('sacred_tasks')
        .update({ status: 'complete', completed_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'complete' } : task
      ));
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Tasks Aligned with This Blueprint</h3>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-1 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-30" />
          <h4 className="text-lg font-medium text-white mb-2">No Tasks Yet</h4>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create sacred tasks aligned with this blueprint to manifest your soul's purpose through intentional action.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Create First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{task.title}</h3>
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
              </div>
              
              {task.description && (
                <p className="text-gray-400 text-sm mb-3">{task.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3 text-xs">
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
                    {formatDate(task.due_date)}
                  </div>
                )}
                
                {task.priority && (
                  <div className="text-red-400 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    P{task.priority}
                  </div>
                )}
              </div>
              
              {task.intention && (
                <div className="mb-3 p-2 bg-slate-700/50 rounded text-sm text-gray-300 italic">
                  "{task.intention}"
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-purple-300 text-xs flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Blueprint Aligned
                </div>
                
                {task.status !== 'complete' && (
                  <button 
                    onClick={() => markTaskComplete(task.id)}
                    className="px-3 py-1 bg-green-600/20 text-green-300 rounded border border-green-500/30 hover:bg-green-600/30 transition-colors text-xs flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Blueprint Stats Summary */}
      <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Soul Blueprint Task Summary
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-700/50 rounded p-3">
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <div className="text-xs text-gray-400">Total Tasks</div>
          </div>
          
          <div className="bg-slate-700/50 rounded p-3">
            <div className="text-2xl font-bold text-green-400">
              {tasks.filter(t => t.status === 'complete').length}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          
          <div className="bg-slate-700/50 rounded p-3">
            <div className="text-2xl font-bold text-blue-400">
              {tasks.filter(t => t.status === 'active' || t.status === 'aligned').length}
            </div>
            <div className="text-xs text-gray-400">In Progress</div>
          </div>
          
          <div className="bg-slate-700/50 rounded p-3">
            <div className="text-2xl font-bold text-purple-400">
              {tasks.filter(t => t.status === 'aligned').length}
            </div>
            <div className="text-xs text-gray-400">Aligned</div>
          </div>
        </div>
      </div>

      <TaskCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        blueprints={blueprints}
        onTaskCreated={handleTaskCreated}
        defaultBlueprintId={blueprint.id}
      />
    </div>
  );
};