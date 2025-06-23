import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Cloud, 
  HardDrive, 
  ShieldCheck, 
  ArrowLeft,
  Lock,
  Globe,
  Key
} from 'lucide-react';

interface DataSovereigntySettingsProps {
  currentChoice: 'local' | 'cloud' | 'hybrid';
  onChange: (choice: 'local' | 'cloud' | 'hybrid') => void;
  onBack: () => void;
}

export const DataSovereigntySettings: React.FC<DataSovereigntySettingsProps> = ({
  currentChoice,
  onChange,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={onBack}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">Sacred Data Sovereignty</h2>
      </div>
      
      <p className="text-gray-300">
        Choose how your sacred journey data is stored and synchronized. This affects your privacy, security, and ability to access your data across devices.
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Cloud Option */}
        <motion.div
          className={`p-4 rounded-lg border ${
            currentChoice === 'cloud' 
              ? 'border-purple-500 bg-purple-900/20' 
              : 'border-gray-700 bg-slate-800/70 hover:border-purple-500/50'
          } cursor-pointer transition-all relative overflow-hidden`}
          onClick={() => onChange('cloud')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentChoice === 'cloud' && (
            <motion.div
              className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          
          <div className="flex items-start gap-4">
            <div className="bg-blue-900/30 p-3 rounded-full">
              <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-white">Sacred Cloud Sync</h3>
              
              <p className="text-sm text-gray-300">
                Your data is securely stored in the Sacred Cloud, allowing seamless synchronization across all your devices.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="px-2 py-1 bg-blue-900/20 text-blue-300 rounded text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Multi-device access</span>
                </div>
                
                <div className="px-2 py-1 bg-blue-900/20 text-blue-300 rounded text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Australian servers</span>
                </div>
                
                <div className="px-2 py-1 bg-blue-900/20 text-blue-300 rounded text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>End-to-end encryption</span>
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <div className={`w-5 h-5 rounded-full ${
                currentChoice === 'cloud' 
                  ? 'bg-purple-500 ring-2 ring-purple-300'
                  : 'border-2 border-gray-500'
              }`}></div>
            </div>
          </div>
        </motion.div>
        
        {/* Local Option */}
        <motion.div
          className={`p-4 rounded-lg border ${
            currentChoice === 'local' 
              ? 'border-purple-500 bg-purple-900/20' 
              : 'border-gray-700 bg-slate-800/70 hover:border-purple-500/50'
          } cursor-pointer transition-all relative overflow-hidden`}
          onClick={() => onChange('local')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentChoice === 'local' && (
            <motion.div
              className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          
          <div className="flex items-start gap-4">
            <div className="bg-green-900/30 p-3 rounded-full">
              <HardDrive className="w-6 h-6 text-green-400" />
            </div>
            
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-white">Local Storage Only</h3>
              
              <p className="text-sm text-gray-300">
                Your data remains exclusively on your device. Maximum privacy, but no synchronization between devices.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="px-2 py-1 bg-green-900/20 text-green-300 rounded text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Maximum privacy</span>
                </div>
                
                <div className="px-2 py-1 bg-green-900/20 text-green-300 rounded text-xs flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Device storage only</span>
                </div>
                
                <div className="px-2 py-1 bg-red-900/20 text-red-300 rounded text-xs flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>No cross-device sync</span>
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <div className={`w-5 h-5 rounded-full ${
                currentChoice === 'local' 
                  ? 'bg-purple-500 ring-2 ring-purple-300'
                  : 'border-2 border-gray-500'
              }`}></div>
            </div>
          </div>
        </motion.div>
        
        {/* Hybrid Option */}
        <motion.div
          className={`p-4 rounded-lg border ${
            currentChoice === 'hybrid' 
              ? 'border-purple-500 bg-purple-900/20' 
              : 'border-gray-700 bg-slate-800/70 hover:border-purple-500/50'
          } cursor-pointer transition-all relative overflow-hidden`}
          onClick={() => onChange('hybrid')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentChoice === 'hybrid' && (
            <motion.div
              className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          
          <div className="flex items-start gap-4">
            <div className="bg-purple-900/30 p-3 rounded-full">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-white">Hybrid with Encryption</h3>
              
              <p className="text-sm text-gray-300">
                The best of both worlds. Your data is encrypted locally before being stored in the cloud, ensuring privacy and synchronization.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="px-2 py-1 bg-purple-900/20 text-purple-300 rounded text-xs flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  <span>Client-side encryption</span>
                </div>
                
                <div className="px-2 py-1 bg-purple-900/20 text-purple-300 rounded text-xs flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>Cloud synchronization</span>
                </div>
                
                <div className="px-2 py-1 bg-purple-900/20 text-purple-300 rounded text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>End-to-end privacy</span>
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <div className={`w-5 h-5 rounded-full ${
                currentChoice === 'hybrid' 
                  ? 'bg-purple-500 ring-2 ring-purple-300'
                  : 'border-2 border-gray-500'
              }`}></div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-6">
        <motion.button
          type="button"
          onClick={() => onChange(currentChoice)}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Save Data Preferences</span>
        </motion.button>
      </div>
    </div>
  );
};