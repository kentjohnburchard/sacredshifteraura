import React, { useState, useEffect, useRef } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { VisionNode, VisionBoard } from '../UnityEngineModule';
import {
  Layout,
  Plus,
  Settings,
  Save,
  Trash,
  ChevronDown,
  ChevronUp,
  Move,
  Maximize,
  Minimize,
  X,
  Lock,
  Unlock,
  Clock,
  Calendar,
  Image,
  Sparkles
} from 'lucide-react';

interface VisionBoardViewProps {
  boards: VisionBoard[];
  nodes: VisionNode[];
  selectedBoard: VisionBoard | null;
  onBoardSelected: (board: VisionBoard) => void;
  onNodeSelected: (node: VisionNode) => void;
  onBoardsUpdated: (boards: VisionBoard[]) => void;
}

export const VisionBoardView: React.FC<VisionBoardViewProps> = ({
  boards,
  nodes,
  selectedBoard,
  onBoardSelected,
  onNodeSelected,
  onBoardsUpdated
}) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [boardFormData, setBoardFormData] = useState<Partial<VisionBoard>>({
    title: '',
    description: '',
    is_public: false,
    board_theme: 'cosmic',
    nodes: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodeLayouts, setNodeLayouts] = useState<Record<string, {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    locked: boolean;
  }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize node layouts when selected board changes
    if (selectedBoard) {
      const storedLayout = selectedBoard.board_layout as Record<string, any> || {};
      
      // Create initial layout for nodes that don't have positions
      const newLayout: Record<string, any> = {...storedLayout};
      
      // Add missing nodes
      selectedBoard.nodes.forEach(nodeId => {
        if (!newLayout[nodeId]) {
          // Create random position for new node
          const x = Math.random() * 600;
          const y = Math.random() * 400;
          
          newLayout[nodeId] = {
            x,
            y,
            width: 200,
            height: 150,
            zIndex: 1,
            locked: false
          };
        }
      });
      
      setNodeLayouts(newLayout);
    }
  }, [selectedBoard]);
  
  const handleCreateBoard = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newBoard = {
        ...boardFormData,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('unity_vision_boards')
        .insert(newBoard)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update boards list
      onBoardsUpdated([data, ...boards]);
      
      // Select the new board
      onBoardSelected(data);
      
      // Reset form
      setBoardFormData({
        title: '',
        description: '',
        is_public: false,
        board_theme: 'cosmic',
        nodes: []
      });
      
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating vision board:', err);
      setError('Failed to create vision board. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveBoard = async () => {
    if (!selectedBoard) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update the board with latest node layouts
      const { data, error } = await supabase
        .from('unity_vision_boards')
        .update({
          board_layout: nodeLayouts
        })
        .eq('id', selectedBoard.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update boards list
      const updatedBoards = boards.map(b => 
        b.id === data.id ? data : b
      );
      onBoardsUpdated(updatedBoards);
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving vision board:', err);
      setError('Failed to save vision board. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteBoard = async () => {
    if (!selectedBoard || !confirm('Are you sure you want to delete this vision board?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('unity_vision_boards')
        .delete()
        .eq('id', selectedBoard.id);
        
      if (error) throw error;
      
      // Update boards list
      const updatedBoards = boards.filter(b => b.id !== selectedBoard.id);
      onBoardsUpdated(updatedBoards);
      
      // Deselect board
      onBoardSelected(updatedBoards[0] || null);
    } catch (err) {
      console.error('Error deleting vision board:', err);
      setError('Failed to delete vision board. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNodes = async (nodeIds: string[]) => {
    if (!selectedBoard) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Combine existing and new node IDs (no duplicates)
      const updatedNodeIds = [...new Set([...selectedBoard.nodes, ...nodeIds])];
      
      const { data, error } = await supabase
        .from('unity_vision_boards')
        .update({
          nodes: updatedNodeIds
        })
        .eq('id', selectedBoard.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update boards list
      const updatedBoards = boards.map(b => 
        b.id === data.id ? data : b
      );
      onBoardsUpdated(updatedBoards);
      
      // Select the updated board
      onBoardSelected(data);
      
      // Create layout positions for new nodes
      const newLayouts = {...nodeLayouts};
      
      nodeIds.forEach(nodeId => {
        if (!newLayouts[nodeId]) {
          // Create random position for new node
          const x = Math.random() * (boardRef.current?.clientWidth || 800) * 0.7;
          const y = Math.random() * (boardRef.current?.clientHeight || 600) * 0.7;
          
          newLayouts[nodeId] = {
            x,
            y,
            width: 200,
            height: 150,
            zIndex: 1,
            locked: false
          };
        }
      });
      
      setNodeLayouts(newLayouts);
      setShowNodePicker(false);
    } catch (err) {
      console.error('Error adding nodes to vision board:', err);
      setError('Failed to add nodes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveNode = async (nodeId: string) => {
    if (!selectedBoard) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Remove node from board
      const updatedNodeIds = selectedBoard.nodes.filter(id => id !== nodeId);
      
      const { data, error } = await supabase
        .from('unity_vision_boards')
        .update({
          nodes: updatedNodeIds
        })
        .eq('id', selectedBoard.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update boards list
      const updatedBoards = boards.map(b => 
        b.id === data.id ? data : b
      );
      onBoardsUpdated(updatedBoards);
      
      // Select the updated board
      onBoardSelected(data);
      
      // Remove node from layouts
      const newLayouts = {...nodeLayouts};
      delete newLayouts[nodeId];
      setNodeLayouts(newLayouts);
    } catch (err) {
      console.error('Error removing node from vision board:', err);
      setError('Failed to remove node. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    setNodeLayouts(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        x,
        y
      }
    }));
  };
  
  const handleNodeResize = (nodeId: string, width: number, height: number) => {
    setNodeLayouts(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        width,
        height
      }
    }));
  };
  
  const handleToggleLock = (nodeId: string) => {
    setNodeLayouts(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        locked: !prev[nodeId].locked
      }
    }));
  };
  
  const handleBringToFront = (nodeId: string) => {
    // Find the highest zIndex
    const highestZ = Object.values(nodeLayouts).reduce((max, layout) => 
      Math.max(max, layout.zIndex), 0);
      
    setNodeLayouts(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        zIndex: highestZ + 1
      }
    }));
  };
  
  const getBoardThemeStyles = (theme: string) => {
    switch (theme) {
      case 'cosmic':
        return 'bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900/30';
      case 'forest':
        return 'bg-gradient-to-br from-slate-900 via-green-900/30 to-emerald-900/30';
      case 'ocean':
        return 'bg-gradient-to-br from-slate-900 via-blue-900/30 to-cyan-900/30';
      case 'fire':
        return 'bg-gradient-to-br from-slate-900 via-red-900/30 to-orange-900/30';
      case 'earth':
        return 'bg-gradient-to-br from-slate-900 via-amber-900/30 to-yellow-900/30';
      default:
        return 'bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900/30';
    }
  };
  
  const renderCreateBoardForm = () => (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Create New Vision Board</h3>
        <button
          onClick={() => setShowCreateForm(false)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={boardFormData.title}
            onChange={(e) => setBoardFormData({...boardFormData, title: e.target.value})}
            className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            placeholder="My Vision Board"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={boardFormData.description || ''}
            onChange={(e) => setBoardFormData({...boardFormData, description: e.target.value})}
            className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
            placeholder="Describe your vision board..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={boardFormData.board_theme}
            onChange={(e) => setBoardFormData({...boardFormData, board_theme: e.target.value})}
            className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
          >
            <option value="cosmic">Cosmic (Purple/Indigo)</option>
            <option value="forest">Forest (Green)</option>
            <option value="ocean">Ocean (Blue)</option>
            <option value="fire">Fire (Red/Orange)</option>
            <option value="earth">Earth (Amber/Yellow)</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            checked={boardFormData.is_public || false}
            onChange={(e) => setBoardFormData({...boardFormData, is_public: e.target.checked})}
            className="mr-2 rounded"
          />
          <label htmlFor="is_public" className="text-gray-300">
            Make this vision board public
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowCreateForm(false)}
          className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        
        <motion.button
          onClick={handleCreateBoard}
          disabled={!boardFormData.title || isLoading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create Board
        </motion.button>
      </div>
    </div>
  );
  
  const renderNodePicker = () => {
    // Get nodes not already on the board
    const availableNodes = nodes.filter(node => 
      !selectedBoard?.nodes.includes(node.id)
    );
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Add Nodes to Board</h3>
            <button
              onClick={() => setShowNodePicker(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {availableNodes.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-gray-300 mb-2">No more nodes available</p>
              <p className="text-gray-500 text-sm">Create more vision nodes to add them to this board.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableNodes.map(node => (
                  <div 
                    key={node.id} 
                    className="p-4 bg-slate-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
                    onClick={() => handleAddNodes([node.id])}
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium text-white">{node.title}</h4>
                      <div className="text-xs px-2 py-1 bg-slate-700 rounded-full text-gray-300">
                        {node.frequency_hz}Hz
                      </div>
                    </div>
                    
                    {node.description && (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{node.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {(node.tags || []).slice(0, 3).map((tag, idx) => (
                        <div key={idx} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-gray-300">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowNodePicker(false)}
              className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderBoardList = () => (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layout className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Vision Boards</h2>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {boards.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg p-8 text-center">
          <Layout className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Create Your First Vision Board</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Vision boards help you organize and visualize your ideas in a timeline format.
          </p>
          <motion.button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 mr-2 inline-block" />
            Create Vision Board
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {boards.map(board => (
            <div
              key={board.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedBoard?.id === board.id
                  ? 'bg-purple-900/20 border-purple-500'
                  : 'bg-slate-800/50 border-gray-700 hover:border-purple-500/50'
              }`}
              onClick={() => onBoardSelected(board)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{board.title}</h3>
                <div className="text-xs px-2 py-1 rounded bg-slate-700/50 text-gray-300">
                  {board.nodes.length} nodes
                </div>
              </div>
              
              {board.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{board.description}</p>
              )}
              
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400">{new Date(board.created_at!).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {board.is_public ? (
                    <span className="text-green-400">Public</span>
                  ) : (
                    <span className="text-gray-400">Private</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderBoard = () => {
    if (!selectedBoard) return null;
    
    // Find nodes on this board
    const boardNodes = nodes.filter(node => 
      selectedBoard.nodes.includes(node.id)
    );
    
    return (
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{selectedBoard.title}</h2>
            {selectedBoard.description && (
              <p className="text-gray-400">{selectedBoard.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveBoard}
                  disabled={isLoading}
                  className="p-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowNodePicker(true)}
                  className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleDeleteBoard}
                  className="p-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div 
          ref={boardRef}
          className={`min-h-[500px] relative rounded-lg overflow-hidden p-4 ${getBoardThemeStyles(selectedBoard.board_theme)}`}
        >
          {boardNodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6 max-w-md text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-60" />
                <h3 className="text-xl font-bold text-white mb-2">This Vision Board is Empty</h3>
                <p className="text-gray-300 mb-4">Add vision nodes to start building your vision board.</p>
                <button
                  onClick={() => setShowNodePicker(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2 inline-block" />
                  Add Nodes
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sacred geometry background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-purple-500 rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-blue-500 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-cyan-500 rounded-full"></div>
              </div>
              
              {/* Timeline indicators */}
              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-purple-500/30"></div>
              <div className="absolute left-1/4 top-16 bottom-16 w-0.5 bg-purple-500/20"></div>
              <div className="absolute left-1/2 top-16 bottom-16 w-0.5 bg-purple-500/20"></div>
              <div className="absolute left-3/4 top-16 bottom-16 w-0.5 bg-purple-500/20"></div>
              
              <div className="absolute bottom-2 left-0 right-0 flex justify-between px-8 text-gray-500 text-xs">
                <div>Past</div>
                <div>Present</div>
                <div>Near Future</div>
                <div>Future</div>
              </div>
              
              {/* Vision nodes */}
              {boardNodes.map(node => {
                const layout = nodeLayouts[node.id] || { 
                  x: 100, 
                  y: 100, 
                  width: 200, 
                  height: 150,
                  zIndex: 1,
                  locked: false
                };
                
                return (
                  <motion.div
                    key={node.id}
                    className="absolute bg-slate-800/80 backdrop-blur-sm rounded-lg border border-purple-500/40 overflow-hidden shadow-lg"
                    style={{
                      width: layout.width,
                      height: layout.height,
                      zIndex: layout.zIndex,
                      x: layout.x,
                      y: layout.y,
                      cursor: isEditing && !layout.locked ? 'move' : 'default'
                    }}
                    drag={isEditing && !layout.locked}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      handleNodeDrag(node.id, layout.x + info.offset.x, layout.y + info.offset.y);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEditing) {
                        onNodeSelected(node);
                      } else {
                        handleBringToFront(node.id);
                      }
                    }}
                  >
                    {isEditing && (
                      <div className="absolute top-2 right-2 z-10 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLock(node.id);
                          }}
                          className="p-1 bg-slate-700/80 rounded"
                        >
                          {layout.locked ? (
                            <Lock className="w-3 h-3 text-red-400" />
                          ) : (
                            <Unlock className="w-3 h-3 text-green-400" />
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNode(node.id);
                          }}
                          className="p-1 bg-slate-700/80 rounded"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    )}
                    
                    <div className="p-3">
                      <h4 className="font-medium text-white text-sm mb-1">{node.title}</h4>
                      
                      {node.description && (
                        <p className="text-gray-300 text-xs mb-2 line-clamp-3">{node.description}</p>
                      )}
                      
                      <div className="absolute bottom-2 left-2 text-xs text-purple-300">
                        {node.frequency_hz}Hz
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  };

  // Main render logic
  if (showCreateForm) {
    return renderCreateBoardForm();
  }
  
  return (
    <>
      {!selectedBoard ? renderBoardList() : renderBoard()}
      
      {showNodePicker && renderNodePicker()}
    </>
  );
};