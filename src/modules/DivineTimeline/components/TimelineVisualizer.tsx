import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineNode, TimelinePath } from '../DivineTimelineModule';
import { 
  Target,
  Sparkles, 
  ArrowRight, 
  Brain, 
  BarChart 
} from 'lucide-react';

interface TimelineVisualizerProps {
  nodes: TimelineNode[];
  paths: TimelinePath[];
  onNodeClick: (node: TimelineNode) => void;
  onPathClick: (path: TimelinePath) => void;
  analyzeResults: Record<string, any> | null;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  nodes,
  paths,
  onNodeClick,
  onPathClick,
  analyzeResults
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }

    const handleResize = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getChakraColor = (chakra: string) => {
    switch (chakra) {
      case 'root': return '#DC2626';
      case 'sacral': return '#EA580C';
      case 'solar_plexus': return '#FACC15';
      case 'heart': return '#22C55E';
      case 'throat': return '#3B82F6';
      case 'third_eye': return '#6366F1';
      case 'crown': return '#9333EA';
      default: return '#6B7280';
    }
  };
  
  const getTimelinePosition = (timeDistance: number) => {
    // Map time distance to x coordinate
    // Center is present (0)
    // Range is typically -365 to +365 days
    
    const { width } = dimensions;
    const maxDistance = 365; // one year
    
    // Use 80% of width with 10% padding on each side
    const usableWidth = width * 0.8;
    const leftPadding = width * 0.1;
    
    // Map time distance to position
    return leftPadding + (usableWidth * ((timeDistance + maxDistance) / (2 * maxDistance)));
  };
  
  const getConsciousnessLevel = (level: number) => {
    // Map consciousness level to y coordinate
    // Higher consciousness = higher on the chart (lower y value)
    
    const { height } = dimensions;
    const maxLevel = 100;
    
    // Use 80% of height with 10% padding on top and bottom
    const usableHeight = height * 0.8;
    const topPadding = height * 0.1;
    
    // Map consciousness level to position (inverted Y axis)
    return height - (topPadding + (usableHeight * (level / maxLevel)));
  };
  
  // Sort nodes by timeline position
  const pastNodes = nodes.filter(n => n.timeline_position === 'past')
    .sort((a, b) => a.time_distance - b.time_distance);
  const presentNodes = nodes.filter(n => n.timeline_position === 'present');
  const futureNodes = nodes.filter(n => n.timeline_position === 'future')
    .sort((a, b) => a.time_distance - b.time_distance);
  
  // Define paths between nodes
  const renderPaths = () => {
    if (paths.length === 0) return null;
    
    return paths.map(path => {
      // Find nodes in this path
      const pathNodes = nodes.filter(node => path.nodes.includes(node.id))
        .sort((a, b) => a.time_distance - b.time_distance);
      
      if (pathNodes.length < 2) return null;
      
      // Generate path string
      let pathString = '';
      pathNodes.forEach((node, i) => {
        const x = getTimelinePosition(node.time_distance);
        const y = getConsciousnessLevel(node.consciousness_level);
        
        if (i === 0) {
          pathString += `M ${x} ${y}`;
        } else {
          // Use curve for smoother paths
          const prevNode = pathNodes[i - 1];
          const prevX = getTimelinePosition(prevNode.time_distance);
          const prevY = getConsciousnessLevel(prevNode.consciousness_level);
          
          // Control point offset
          const offset = (x - prevX) / 2;
          
          pathString += ` C ${prevX + offset} ${prevY}, ${x - offset} ${y}, ${x} ${y}`;
        }
      });
      
      // Get color based on path type
      const getPathColor = (type: string) => {
        switch (type) {
          case 'optimal': return '#8B5CF6'; // purple
          case 'challenge': return '#F59E0B'; // amber
          case 'shadow': return '#DC2626'; // red
          case 'transcendent': return '#3B82F6'; // blue
          default: return '#8B5CF6';
        }
      };
      
      const pathColor = getPathColor(path.path_type);
      const pathOpacity = 0.6;
      
      return (
        <g key={path.id} onClick={() => onPathClick(path)} style={{ cursor: 'pointer' }}>
          {/* Path stroke */}
          <path
            d={pathString}
            fill="none"
            stroke={pathColor}
            strokeWidth={3}
            strokeOpacity={pathOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={path.path_type === 'transcendent' ? '10,5' : 'none'}
          />
          
          {/* Hover area (wider, invisible path for easier clicking) */}
          <path
            d={pathString}
            fill="none"
            stroke="transparent"
            strokeWidth={20}
            className="cursor-pointer"
          />
        </g>
      );
    });
  };
  
  // Render timeline axis
  const renderTimelineAxis = () => {
    const { width, height } = dimensions;
    
    // X axis (time)
    const xAxisY = height - 30;
    const xAxisStart = width * 0.1;
    const xAxisEnd = width * 0.9;
    
    // Time markers
    const timeMarkers = [
      { label: '-12m', distance: -365 },
      { label: '-6m', distance: -180 },
      { label: '-3m', distance: -90 },
      { label: 'Now', distance: 0 },
      { label: '+3m', distance: 90 },
      { label: '+6m', distance: 180 },
      { label: '+12m', distance: 365 }
    ];
    
    return (
      <g className="timeline-axis text-xs">
        {/* X Axis line */}
        <line 
          x1={xAxisStart} 
          y1={xAxisY} 
          x2={xAxisEnd} 
          y2={xAxisY} 
          stroke="#4B5563" 
          strokeWidth={1} 
        />
        
        {/* Time markers */}
        {timeMarkers.map(marker => (
          <g key={marker.label}>
            <line
              x1={getTimelinePosition(marker.distance)}
              y1={xAxisY}
              x2={getTimelinePosition(marker.distance)}
              y2={xAxisY + 5}
              stroke="#4B5563"
              strokeWidth={1}
            />
            <text
              x={getTimelinePosition(marker.distance)}
              y={xAxisY + 20}
              fill="#9CA3AF"
              textAnchor="middle"
              fontSize={12}
            >
              {marker.label}
            </text>
          </g>
        ))}
        
        {/* Y Axis label */}
        <text
          x={width - 20}
          y={xAxisY - 10}
          fill="#9CA3AF"
          textAnchor="end"
          fontSize={12}
        >
          Time
        </text>
        
        {/* Consciousness axis label */}
        <text
          x={20}
          y={20}
          fill="#9CA3AF"
          textAnchor="start"
          fontSize={12}
        >
          Consciousness Level
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {analyzeResults && showAnalysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Consciousness Evolution Analysis
            </h3>
            
            <button
              onClick={() => setShowAnalysis(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{Math.round(analyzeResults.averageLevel)}</div>
              <div className="text-xs text-gray-400">Avg Consciousness</div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">+{analyzeResults.totalReflectionShift}</div>
              <div className="text-xs text-gray-400">Reflection Growth</div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{analyzeResults.activatedNodesCount}</div>
              <div className="text-xs text-gray-400">Nodes Activated</div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{analyzeResults.reflectionsCount}</div>
              <div className="text-xs text-gray-400">Reflections</div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="text-white font-medium mb-3">Consciousness Trend</h4>
            
            <div className="h-20 relative">
              {analyzeResults.consciousnessLevels?.length > 0 && (
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {/* Line chart */}
                  <path
                    d={analyzeResults.consciousnessLevels.map((level: number, i: number) => {
                      const x = (i / (analyzeResults.consciousnessLevels.length - 1 || 1)) * 100;
                      const y = 100 - level;
                      return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  {analyzeResults.consciousnessLevels.map((level: number, i: number) => {
                    const x = (i / (analyzeResults.consciousnessLevels.length - 1 || 1)) * 100;
                    const y = 100 - level;
                    return (
                      <circle
                        key={i}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#8B5CF6"
                      />
                    );
                  })}
                </svg>
              )}
            </div>
            
            <div className="text-center mt-2 text-xs text-gray-400">
              {analyzeResults.trend > 0 ? (
                <span className="text-green-400">Your consciousness has increased by {analyzeResults.trend} points</span>
              ) : analyzeResults.trend < 0 ? (
                <span className="text-red-400">Your consciousness has decreased by {Math.abs(analyzeResults.trend)} points</span>
              ) : (
                <span>Your consciousness level is stable</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        {analyzeResults && !showAnalysis && (
          <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Brain className="w-4 h-4" />
              Consciousness analysis available
            </div>
            <button
              onClick={() => setShowAnalysis(true)}
              className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs"
            >
              View Analysis
            </button>
          </div>
        )}
        
        <div className="relative bg-slate-800/50 rounded-lg border border-gray-700 overflow-hidden">
          {/* Timeline visualization */}
          <svg 
            ref={svgRef} 
            width="100%" 
            height="500" 
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
            style={{ overflow: 'visible' }}
            className="text-xs"
          >
            {/* Path lines */}
            {renderPaths()}
            
            {/* Timeline axis */}
            {renderTimelineAxis()}
            
            {/* Nodes */}
            {nodes.map((node) => {
              const x = getTimelinePosition(node.time_distance);
              const y = getConsciousnessLevel(node.consciousness_level);
              const nodeSize = node.is_pivot_point ? 12 : 10;
              const nodeColor = getChakraColor(node.chakra_focus);
              const isActive = node.is_activated;
              
              return (
                <g key={node.id} onClick={() => onNodeClick(node)} style={{ cursor: 'pointer' }}>
                  {/* Node circle with glow effect */}
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeSize + 4}
                    fill={`url(#glow-${node.id})`}
                    opacity={0.3}
                    style={{
                      filter: isActive ? 'url(#glow-filter)' : 'none'
                    }}
                  />
                  
                  {/* Node circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeSize}
                    fill={nodeColor}
                    stroke={isActive ? 'white' : 'transparent'}
                    strokeWidth={2}
                    opacity={isActive ? 1 : 0.7}
                  />
                  
                  {/* Node label */}
                  <text
                    x={x}
                    y={node.timeline_position === 'past' ? y - 20 : y + 20}
                    fill="white"
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    {node.title}
                  </text>
                  
                  {/* Probability label (only for future nodes) */}
                  {node.timeline_position === 'future' && (
                    <text
                      x={x}
                      y={y + 35}
                      fill="#9CA3AF"
                      textAnchor="middle"
                      fontSize={10}
                    >
                      {node.probability}%
                    </text>
                  )}
                  
                  {/* Create a unique glow gradient for each node */}
                  <defs>
                    <radialGradient id={`glow-${node.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor={nodeColor} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={nodeColor} stopOpacity="0" />
                    </radialGradient>
                    
                    <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">Optimal Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-300">Challenge Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-300">Transcendent Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white rounded-full"></div>
            <span className="text-gray-300">Activated Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">Pivot Point</span>
          </div>
        </div>
      </div>
    </div>
  );
};