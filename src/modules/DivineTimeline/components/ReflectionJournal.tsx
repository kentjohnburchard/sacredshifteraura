import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineNode } from '../DivineTimelineModule';
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  Brain, 
  Send, 
  Target, 
  Star,
  Heart
} from 'lucide-react';

interface ReflectionJournalProps {
  node: TimelineNode;
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const ReflectionJournal: React.FC<ReflectionJournalProps> = ({
  node,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [reflection, setReflection] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReflection(text);
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  };
  
  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    
    try {
      await onSubmit(reflection);
      setReflection('');
    } catch (error) {
      console.error('Error submitting reflection:', error);
    }
  };
  
  const getPrompts = () => {
    const basePrompts = [
      "What insights did you gain from this experience?",
      "How has this changed your perspective?",
      "What emotions were most prominent?",
      "What patterns do you notice in your consciousness?"
    ];
    
    // Add specific prompts based on node type
    if (node.title.includes("Awakening")) {
      basePrompts.push(
        "What triggered this awakening?",
        "How has your awareness shifted?",
        "What new understanding has emerged?"
      );
    } else if (node.title.includes("Integration")) {
      basePrompts.push(
        "What are you integrating into your daily life?",
        "What challenges have you faced in this integration?",
        "How has this integration affected your relationships?"
      );
    } else if (node.title.includes("Shadow")) {
      basePrompts.push(
        "What shadow aspects are you becoming aware of?",
        "How do these shadow aspects serve you?",
        "What emotions arise when facing these shadows?"
      );
    }
    
    return basePrompts;
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Timeline
        </button>
        
        <div>
          <h2 className="text-xl font-bold text-white">Reflection Journal</h2>
          <div className="text-purple-300">{node.title}</div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg text-sm text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Reflection form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Your Reflection
                </label>
                <div className="text-xs text-gray-400">
                  {wordCount} words
                </div>
              </div>
              <textarea
                value={reflection}
                onChange={handleTextChange}
                placeholder="Share your thoughts, insights, and experiences related to this timeline node..."
                className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-64"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading || !reflection.trim()}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Save Reflection
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Node Context
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-300 text-sm">{node.description}</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
              <Brain className="w-4 h-4" />
              <span>Consciousness Level: {node.consciousness_level}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <Target className="w-4 h-4" />
              <span>Probability: {node.probability}%</span>
            </div>
          </div>
          
          {/* Reflection prompts */}
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Reflection Prompts
            </h3>
            
            <div className="space-y-3">
              {getPrompts().map((prompt, index) => (
                <div 
                  key={index} 
                  className="p-2 rounded bg-slate-700/30 text-gray-300 text-sm cursor-pointer hover:bg-purple-900/20 hover:text-purple-300 transition-colors"
                  onClick={() => setReflection(prev => 
                    prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`
                  )}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};