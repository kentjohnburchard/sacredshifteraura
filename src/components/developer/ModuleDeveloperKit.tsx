import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Terminal, 
  Package, 
  Upload, 
  Download, 
  FileCode,
  Layers,
  Cpu,
  Zap,
  Tag,
  Check,
  Copy,
  RefreshCw,
  Play,
  Save
} from 'lucide-react';

export const ModuleDeveloperKit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'test' | 'publish'>('create');
  const [moduleName, setModuleName] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [essenceLabels, setEssenceLabels] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState('');
  const [newEssenceLabel, setNewEssenceLabel] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [testResults, setTestResults] = useState<{passed: number; failed: number; total: number} | null>(null);

  const handleAddCapability = () => {
    if (newCapability && !capabilities.includes(newCapability)) {
      setCapabilities([...capabilities, newCapability]);
      setNewCapability('');
    }
  };

  const handleAddEssenceLabel = () => {
    if (newEssenceLabel && !essenceLabels.includes(newEssenceLabel)) {
      setEssenceLabels([...essenceLabels, newEssenceLabel]);
      setNewEssenceLabel('');
    }
  };

  const handleRemoveCapability = (cap: string) => {
    setCapabilities(capabilities.filter(c => c !== cap));
  };

  const handleRemoveEssenceLabel = (label: string) => {
    setEssenceLabels(essenceLabels.filter(l => l !== label));
  };

  const handleGenerateTemplate = () => {
    if (!moduleName || !moduleId) return;
    
    setIsGenerating(true);
    
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  const handleBuildModule = () => {
    setIsBuilding(true);
    setBuildProgress(0);
    
    // Simulate build process
    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleRunTests = () => {
    setTestResults(null);
    
    // Simulate test running
    setTimeout(() => {
      setTestResults({
        passed: Math.floor(Math.random() * 10) + 10,
        failed: Math.floor(Math.random() * 3),
        total: Math.floor(Math.random() * 10) + 10 + Math.floor(Math.random() * 3)
      });
    }, 2000);
  };

  const generateModuleCode = () => {
    return `import { IModule, ModuleManifest, GESemanticEvent } from '../types';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';

export class ${moduleName.replace(/\s+/g, '')}Module implements IModule {
  private manifest: ModuleManifest;
  private geh: GlobalEventHorizon;
  private isInitialized = false;
  private isActive = false;

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.geh = GlobalEventHorizon.getInstance();
  }

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.geh.publish({
      type: 'module:${moduleId}:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', ...this.manifest.essenceLabels]
    });

    // Initialize module logic here
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:${moduleId}:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', ...this.manifest.essenceLabels]
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:${moduleId}:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'active' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', ...this.manifest.essenceLabels]
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:${moduleId}:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', ...this.manifest.essenceLabels]
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;

    this.geh.publish({
      type: 'module:${moduleId}:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', ...this.manifest.essenceLabels]
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      // Expose your module's functionality here
      ${capabilities.map(cap => `${cap.replace(/[^a-zA-Z0-9]/g, '')}: {
        // Implement ${cap} functionality
        process: () => '${cap} processing complete',
        status: () => 'operational'
      }`).join(',\n      ')}
    };
  }
}`;
  };

  const generateManifestCode = () => {
    return `{
  "id": "${moduleId || 'com.metaphysical-os.modules.your-module-id'}",
  "name": "${moduleName || 'Your Module Name'}",
  "version": "1.0.0",
  "description": "${moduleDescription || 'Your module description'}",
  "capabilities": [
    ${capabilities.map(cap => `"${cap}"`).join(',\n    ')}
  ],
  "exposedItems": {
    ${capabilities.map(cap => `"${cap.replace(/[^a-zA-Z0-9]/g, '')}": "./${cap.replace(/[^a-zA-Z0-9]/g, '')}"`).join(',\n    ')}
  },
  "telosAlignment": {
    "consciousness:expansion": 0.8,
    "data:harmony": 0.6
  },
  "integrityScore": 0.95,
  "resourceFootprintMB": 25,
  "essenceLabels": [
    ${essenceLabels.map(label => `"${label}"`).join(',\n    ')}
  ]
}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Module Developer Kit</h2>
          <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
            Beta
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">
          Create, test, and publish your own modules for the Sacred Shifter ecosystem.
          Follow the guided workflow to build modules that align with the system's principles.
        </p>
        
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'create'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'test'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Test
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'publish'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Module Definition
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    placeholder="e.g., Sacred Geometry Visualizer"
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module ID
                  </label>
                  <input
                    type="text"
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    placeholder="e.g., sacred-geometry"
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Describe your module's purpose and functionality..."
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capabilities
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCapability}
                      onChange={(e) => setNewCapability(e.target.value)}
                      placeholder="e.g., sacred-visualization"
                      className="flex-1 p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAddCapability}
                      disabled={!newCapability}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[100px] max-h-[150px] overflow-y-auto p-2 bg-slate-800/50 rounded-lg border border-gray-700">
                    {capabilities.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        No capabilities added
                      </div>
                    ) : (
                      capabilities.map((cap, index) => (
                        <div
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded flex items-center gap-1 text-sm"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{cap}</span>
                          <button
                            onClick={() => handleRemoveCapability(cap)}
                            className="ml-1 text-blue-300 hover:text-blue-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Essence Labels
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newEssenceLabel}
                      onChange={(e) => setNewEssenceLabel(e.target.value)}
                      placeholder="e.g., consciousness:expansion"
                      className="flex-1 p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAddEssenceLabel}
                      disabled={!newEssenceLabel}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[100px] max-h-[150px] overflow-y-auto p-2 bg-slate-800/50 rounded-lg border border-gray-700">
                    {essenceLabels.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        No essence labels added
                      </div>
                    ) : (
                      essenceLabels.map((label, index) => (
                        <div
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded flex items-center gap-1 text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{label}</span>
                          <button
                            onClick={() => handleRemoveEssenceLabel(label)}
                            className="ml-1 text-purple-300 hover:text-purple-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                
                <button
                  onClick={handleGenerateTemplate}
                  disabled={!moduleName || !moduleId || isGenerating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCode className="w-4 h-4" />
                      Generate Template
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Preview */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6 mt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-400" />
                    Generated Code
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <FileCode className="w-4 h-4" />
                    <span>{moduleId || 'YourModule'}.ts</span>
                  </div>
                  <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono">
                    {generateModuleCode()}
                  </pre>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <FileCode className="w-4 h-4" />
                    <span>manifest.json</span>
                  </div>
                  <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono">
                    {generateManifestCode()}
                  </pre>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                Module Testing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 h-full">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      Module Integrity Check
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400">Manifest Validation</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Passed
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400">Semantic Consistency</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Passed
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400">Resource Footprint</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Passed
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400">Lifecycle Methods</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Passed
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-3 bg-green-900/20 rounded-lg border border-green-500/30 text-green-300 text-sm">
                      Module integrity score: 95/100
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 h-full">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Module Tests
                    </h4>
                    
                    <div className="mb-4">
                      <button
                        onClick={handleRunTests}
                        className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Run Tests
                      </button>
                    </div>
                    
                    {testResults ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                            <div className="text-xl font-bold text-green-400">{testResults.passed}</div>
                            <div className="text-xs text-green-300">Passed</div>
                          </div>
                          
                          <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                            <div className="text-xl font-bold text-red-400">{testResults.failed}</div>
                            <div className="text-xs text-red-300">Failed</div>
                          </div>
                          
                          <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <div className="text-xl font-bold text-blue-400">{testResults.total}</div>
                            <div className="text-xs text-blue-300">Total</div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-slate-700/50 rounded-lg border border-gray-600 max-h-[200px] overflow-y-auto">
                          <div className="text-sm text-green-400 mb-2">✓ Module initialization test passed</div>
                          <div className="text-sm text-green-400 mb-2">✓ Module activation test passed</div>
                          <div className="text-sm text-green-400 mb-2">✓ Module deactivation test passed</div>
                          <div className="text-sm text-green-400 mb-2">✓ Module destroy test passed</div>
                          <div className="text-sm text-green-400 mb-2">✓ Event publishing test passed</div>
                          <div className="text-sm text-green-400 mb-2">✓ Event subscription test passed</div>
                          {testResults.failed > 0 && (
                            <div className="text-sm text-red-400 mb-2">✗ Resource cleanup test failed</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-gray-400">
                        <div className="text-center">
                          <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Run tests to see results</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Build Module
                </h4>
                
                <div className="mb-4">
                  {isBuilding ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Building module...</span>
                        <span className="text-purple-400">{buildProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${buildProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleBuildModule}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Build Module
                    </button>
                  )}
                </div>
                
                {buildProgress === 100 && (
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 text-green-300 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Build successful! Module package is ready.
                    </span>
                    <button className="text-green-300 hover:text-green-200 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'publish' && (
          <motion.div
            key="publish"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Publish to Marketplace
              </h3>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-4">Module Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Module Name
                      </label>
                      <input
                        type="text"
                        value={moduleName}
                        disabled
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none disabled:opacity-70"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Module ID
                      </label>
                      <input
                        type="text"
                        value={moduleId}
                        disabled
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none disabled:opacity-70"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="">Select a category</option>
                      <option value="meditation">Meditation</option>
                      <option value="community">Community</option>
                      <option value="analytics">Analytics</option>
                      <option value="tools">Tools</option>
                      <option value="games">Games</option>
                      <option value="productivity">Productivity</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Long Description (Markdown supported)
                    </label>
                    <textarea
                      className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-32"
                      placeholder="Provide a detailed description of your module..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="price"
                          value="free"
                          defaultChecked
                          className="text-purple-600"
                        />
                        <span className="text-gray-300">Free</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="price"
                          value="paid"
                          className="text-purple-600"
                        />
                        <span className="text-gray-300">Paid</span>
                      </label>
                      
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Price in USD"
                          className="w-full p-2 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-4">Media & Assets</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Module Package
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-slate-700 text-gray-400 rounded-lg border border-gray-600 truncate">
                          {moduleName ? `${moduleName.replace(/\s+/g, '')}.zip` : 'No file selected'}
                        </div>
                        <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Screenshots (up to 5)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-slate-700 text-gray-400 rounded-lg border border-gray-600 truncate">
                          No files selected
                        </div>
                        <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Demo URL (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/demo"
                      className="w-full p-3 bg-slate-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-4">Publishing Options</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded text-purple-600"
                      />
                      <span className="text-gray-300">I agree to the Module Marketplace Terms of Service</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded text-purple-600"
                      />
                      <span className="text-gray-300">I confirm this module does not contain malicious code</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded text-purple-600"
                      />
                      <span className="text-gray-300">Request verification badge (requires review)</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors">
                    Save as Draft
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors">
                      Preview
                    </button>
                    
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Publish to Marketplace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};