import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VisionNode, Connection } from '../UnityEngineModule';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import {
  Network,
  Plus,
  ArrowRight,
  X,
  Save,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize,
  Target
} from 'lucide-react';

interface ConnectionsVisualizerProps {
  nodes: VisionNode[];
  connections: Connection[];
  onNodeSelected: (node: VisionNode) => void;
  onConnectionCreated: (connection: Connection) => void;
}

export const ConnectionsVisualizer: React.FC<ConnectionsVisualizerProps> = ({
  nodes,
  connections,
  onNodeSelected,
  onConnectionCreated
}) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [zoom, setZoom] = useState(1);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [connectionData, setConnectionData] = useState<{
    sourceId: string;
    targetId: string;
    type: string;
    strength: number;
    description: string;
  }>({
    sourceId: '',
    targetId: '',
    type: 'inspiration',
    strength: 70,
    description: ''
  });
  
  // Initialize and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
        setHeight(containerRef.current.clientHeight);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Generate node positions using a force-directed layout algorithm simulation
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  
  useEffect(() => {
    if (nodes.length === 0) return;
    
    // Simple force-directed layout algorithm
    const positions: Record<string, { x: number; y: number }> = {};
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) * 0.35;
    
    // Initialize nodes in a circle
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      positions[node.id] = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });
    
    // Simulate forces to better position nodes
    const repulsionForce = 500; // Repulsion between nodes
    const attractionForce = 0.1; // Attraction for connected nodes
    
    for (let iteration = 0; iteration < 50; iteration++) {
      // Calculate repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          
          const dx = positions[nodeB.id].x - positions[nodeA.id].x;
          const dy = positions[nodeB.id].y - positions[nodeA.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = repulsionForce / (distance * distance);
            const forceX = dx / distance * force;
            const forceY = dy / distance * force;
            
            positions[nodeA.id].x -= forceX;
            positions[nodeA.id].y -= forceY;
            positions[nodeB.id].x += forceX;
            positions[nodeB.id].y += forceY;
          }
        }
      }
      
      // Apply attraction for connections
      connections.forEach(connection => {
        const sourcePos = positions[connection.source_node_id];
        const targetPos = positions[connection.target_node_id];
        
        if (sourcePos && targetPos) {
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = distance * attractionForce;
            const forceX = dx / distance * force;
            const forceY = dy / distance * force;
            
            positions[connection.source_node_id].x += forceX;
            positions[connection.source_node_id].y += forceY;
            positions[connection.target_node_id].x -= forceX;
            positions[connection.target_node_id].y -= forceY;
          }
        }
      });
      
      // Keep nodes within bounds
      Object.keys(positions).forEach(nodeId => {
        const pos = positions[nodeId];
        const padding = 50;
        
        pos.x = Math.max(padding, Math.min(width - padding, pos.x));
        pos.y = Math.max(padding, Math.min(height - padding, pos.y));
      });
    }
    
    setNodePositions(positions);
  }, [nodes, connections, width, height]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = (e.clientX - dragStart.x) * (1 / zoom);
    const dy = (e.clientY - dragStart.y) * (1 / zoom);
    
    setCenterX(centerX + dx);
    setCenterY(centerY + dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.5));
  };
  
  const handleZoomReset = () => {
    setZoom(1);
    setCenterX(0);
    setCenterY(0);
  };
  
  const handleCreateConnection = () => {
    setShowConnectionForm(true);
  };
  
  const handleSaveConnection = async () => {
    try {
      if (!connectionData.sourceId || !connectionData.targetId) {
        alert('Please select source and target nodes.');
        return;
      }
      
      const connection = {
        source_node_id: connectionData.sourceId,
        target_node_id: connectionData.targetId,
        connection_type: connectionData.type,
        connection_strength: connectionData.strength,
        connection_description: connectionData.description
      };
      
      const { data, error } = await supabase
        .from('unity_connections')
        .insert(connection)
        .select()
        .single();
        
      if (error) throw error;
      
      onConnectionCreated(data);
      setShowConnectionForm(false);
      
      // Reset connection form
      setConnectionData({
        sourceId: '',
        targetId: '',
        type: 'inspiration',
        strength: 70,
        description: ''
      });
      
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };
  
  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'inspiration': return '#A855F7'; // purple
      case 'evolution': return '#22C55E'; // green
      case 'contrast': return '#F97316'; // orange
      case 'harmony': return '#3B82F6'; // blue
      default: return '#A855F7'; // purple default
    }
  };
  
  const getNodeColor = (node: VisionNode) => {
    switch (node.chakra_alignment) {
      case 'root': return '#DC2626';
      case 'sacral': return '#EA580C';
      case 'solar': return '#FACC15';
      case 'heart': return '#22C55E';
      case 'throat': return '#3B82F6';
      case 'third_eye': return '#6366F1';
      case 'crown': return '#9333EA';
      default: return '#A855F7'; // purple default
    }
  };
  
  const renderSacredGeometryBackground = () => {
    return (
      <svg width="100%" height="100%" className="absolute inset-0 z-0 opacity-10">
        {/* Flower of Life pattern */}
        <defs>
          <pattern id="flower-of-life" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="25" cy="50" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="75" cy="50" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="50" cy="25" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="50" cy="75" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="25" cy="25" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="75" cy="25" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="25" cy="75" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="75" cy="75" r="25" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#flower-of-life)" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Connections Visualizer</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {nodes.length < 2 ? (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center">
            <Network className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Create More Vision Nodes</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              You need at least two vision nodes to create meaningful connections. 
              Create more nodes to visualize their interconnections.
            </p>
          </div>
        ) : (
          <>
            <div 
              ref={containerRef} 
              className="w-full h-[600px] bg-slate-800/30 rounded-xl relative overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {renderSacredGeometryBackground()}
              
              {/* SVG Visualization */}
              <svg 
                width="100%" 
                height="100%" 
                className="absolute inset-0 z-10"
                style={{ 
                  transform: `translate(${centerX}px, ${centerY}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.1s ease-out'
                }}
              >
                {/* Connections */}
                {connections.map(connection => {
                  const sourcePos = nodePositions[connection.source_node_id];
                  const targetPos = nodePositions[connection.target_node_id];
                  
                  if (!sourcePos || !targetPos) return null;
                  
                  const color = getConnectionColor(connection.connection_type);
                  const strength = connection.connection_strength / 100;
                  
                  return (
                    <g key={connection.id}>
                      <line
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={color}
                        strokeWidth={2 + strength * 3}
                        strokeOpacity={0.6 + strength * 0.4}
                        strokeDasharray={connection.connection_type === 'contrast' ? '5,5' : undefined}
                      />
                      
                      {/* Direction arrow */}
                      <polygon
                        points="0,-4 8,0 0,4"
                        fill={color}
                        transform={`translate(${targetPos.x}, ${targetPos.y}) rotate(${Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x) * 180 / Math.PI}) translate(-15, 0)`}
                      />
                    </g>
                  );
                })}
                
                {/* Nodes */}
                {nodes.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;
                  
                  const nodeColor = getNodeColor(node);
                  
                  return (
                    <g key={node.id} onClick={() => onNodeSelected(node)} style={{ cursor: 'pointer' }}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={25 + (node.resonance_score / 10)}
                        fill={nodeColor}
                        fillOpacity={0.2}
                        stroke={nodeColor}
                        strokeWidth={2}
                      />
                      
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={18}
                        fill={nodeColor}
                        fillOpacity={0.6}
                      />
                      
                      <text
                        x={pos.x}
                        y={pos.y + 45}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                      >
                        {node.title}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="mt-4 flex justify-end">
              <motion.button
                onClick={handleCreateConnection}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Connection
              </motion.button>
            </div>
          </>
        )}
      </div>
      
      {/* Connection Creation Form */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Connection</h3>
              <button
                onClick={() => setShowConnectionForm(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source Node
                </label>
                <select
                  value={connectionData.sourceId}
                  onChange={(e) => setConnectionData({...connectionData, sourceId: e.target.value})}
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">-- Select Source Node --</option>
                  {nodes.map(node => (
                    <option key={`source-${node.id}`} value={node.id}>
                      {node.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-purple-400" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Node
                </label>
                <select
                  value={connectionData.targetId}
                  onChange={(e) => setConnectionData({...connectionData, targetId: e.target.value})}
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">-- Select Target Node --</option>
                  {nodes.map(node => (
                    <option key={`target-${node.id}`} value={node.id}>
                      {node.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connection Type
                </label>
                <select
                  value={connectionData.type}
                  onChange={(e) => setConnectionData({...connectionData, type: e.target.value})}
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                >
                  <option value="inspiration">Inspiration</option>
                  <option value="evolution">Evolution</option>
                  <option value="contrast">Contrast</option>
                  <option value="harmony">Harmony</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connection Strength: {connectionData.strength}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={connectionData.strength}
                  onChange={(e) => setConnectionData({...connectionData, strength: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={connectionData.description}
                  onChange={(e) => setConnectionData({...connectionData, description: e.target.value})}
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-20"
                  placeholder="Describe how these nodes are connected..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConnectionForm(false)}
                className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              
              <motion.button
                onClick={handleSaveConnection}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                Create Connection
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};