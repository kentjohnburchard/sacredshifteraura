import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRSI, RSISensitivityMode } from '../../contexts/RSIContext';
import { 
  Settings, 
  X, 
  Eye, 
  Zap, 
  Heart, 
  Brain, 
  Lightbulb,
  Save,
  Info
} from 'lucide-react';

interface RSISettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RSISettingsPanel: React.FC<RSISettingsPanelProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { userConsent, updateUserConsent } = useRSI();
  const [localSettings, setLocalSettings] = useState(userConsent);
  
  const handleSave = () => {
    updateUserConsent(localSettings);
    onClose();
  };
  
  const handleCancel = () => {
    setLocalSettings(userConsent);
    onClose();
  };
  
  const handleSensitivityChange = (mode: RSISensitivityMode) => {
    setLocalSettings(prev => ({
      ...prev,
      sensitivityMode: mode
    }));
  };
  
  const handleToggleChange = (setting: keyof typeof localSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Interface Sensitivity
            </h2>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Adjust how deeply the interface responds to your energy and consciousness state.
            </p>
            
            <div className="p-3 bg-purple-900/20 text-purple-300 rounded-lg flex items-start gap-2 mb-4">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Sacred Reflection</div>
                <div className="text-sm">
                  The interface can serve as a mirror of your inner state, offering guidance and visual feedback
                  aligned with your chakras and consciousness patterns.
                </div>
              </div>
            </div>
          </div>
          
          {/* Sensitivity Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Interface Sensitivity
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSensitivityChange('light')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  localSettings.sensitivityMode === 'light'
                    ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                    : 'border-gray-700 bg-slate-800/50 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Eye className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Light</div>
                <div className="text-xs mt-1">Subtle guidance</div>
              </button>
              
              <button
                onClick={() => handleSensitivityChange('deep')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  localSettings.sensitivityMode === 'deep'
                    ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                    : 'border-gray-700 bg-slate-800/50 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Zap className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Deep</div>
                <div className="text-xs mt-1">Full mirroring</div>
              </button>
              
              <button
                onClick={() => handleSensitivityChange('silent')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  localSettings.sensitivityMode === 'silent'
                    ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                    : 'border-gray-700 bg-slate-800/50 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Heart className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Silent</div>
                <div className="text-xs mt-1">No visual cues</div>
              </button>
            </div>
          </div>
          
          {/* Feature Toggles */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-white">Chakra Theming</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.allowChakraTheming}
                  onChange={() => handleToggleChange('allowChakraTheming')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-white">Ego Pattern Detection</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.allowEgoPatternDetection}
                  onChange={() => handleToggleChange('allowEgoPatternDetection')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-400" />
                <span className="text-white">Breath Synchronization</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.allowBreathSynchronization}
                  onChange={() => handleToggleChange('allowBreathSynchronization')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span className="text-white">Guidance Suggestions</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.allowGuidanceSuggestions}
                  onChange={() => handleToggleChange('allowGuidanceSuggestions')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};