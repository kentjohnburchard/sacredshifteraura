import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Globe, 
  Check, 
  ChevronRight,
  ChevronDown,
  Info,
  Lock,
  FileText
} from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'gdpr' | 'data' | 'sov'>('privacy');
  const [expandedSection, setExpandedSection] = useState<string | null>('collection');
  const [gdprEnabled, setGdprEnabled] = useState(false);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-purple-500/30 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Sacred Privacy & Compliance</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-700">
          <div className="flex space-x-4">
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('privacy')}
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Privacy Policy
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'gdpr' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('gdpr')}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                GDPR Settings
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'data' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('data')}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Data Handling
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'sov' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('sov')}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Data Sovereignty
              </span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg mb-4">
                  <p className="text-purple-300">Sacred Shifter complies with the <span className="font-semibold">Australian Privacy Act 1988</span>, ensuring your data is handled with the utmost care and respect.</p>
                </div>
                
                {/* Collapsible sections */}
                <div className="space-y-2">
                  <div 
                    className={`p-4 rounded-lg bg-slate-800/70 border ${expandedSection === 'collection' ? 'border-purple-500/50' : 'border-gray-700'}`}
                  >
                    <button 
                      className="flex items-center justify-between w-full text-left"
                      onClick={() => setExpandedSection(expandedSection === 'collection' ? null : 'collection')}
                    >
                      <span className="font-medium text-white">Information We Collect</span>
                      {expandedSection === 'collection' ? <ChevronDown className="w-5 h-5 text-purple-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'collection' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 text-gray-300 text-sm space-y-2 overflow-hidden"
                        >
                          <p>We collect the following types of information:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Account information (email, username, password)</li>
                            <li>Profile information (your spiritual journey preferences)</li>
                            <li>Usage data (how you interact with our services)</li>
                            <li>Device information (browser type, operating system)</li>
                            <li>IP address and approximate location</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg bg-slate-800/70 border ${expandedSection === 'use' ? 'border-purple-500/50' : 'border-gray-700'}`}
                  >
                    <button 
                      className="flex items-center justify-between w-full text-left"
                      onClick={() => setExpandedSection(expandedSection === 'use' ? null : 'use')}
                    >
                      <span className="font-medium text-white">How We Use Your Information</span>
                      {expandedSection === 'use' ? <ChevronDown className="w-5 h-5 text-purple-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'use' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 text-gray-300 text-sm space-y-2 overflow-hidden"
                        >
                          <p>Your information helps us:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Provide and personalize our services to align with your spiritual journey</li>
                            <li>Process and synchronize your data across devices</li>
                            <li>Improve and enhance the Sacred Shifter experience</li>
                            <li>Communicate with you about your account and updates</li>
                            <li>Ensure the security and integrity of our platform</li>
                          </ul>
                          <p className="mt-2 text-purple-300">We never sell your personal data to third parties.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg bg-slate-800/70 border ${expandedSection === 'security' ? 'border-purple-500/50' : 'border-gray-700'}`}
                  >
                    <button 
                      className="flex items-center justify-between w-full text-left"
                      onClick={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
                    >
                      <span className="font-medium text-white">Security Measures</span>
                      {expandedSection === 'security' ? <ChevronDown className="w-5 h-5 text-purple-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'security' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 text-gray-300 text-sm space-y-2 overflow-hidden"
                        >
                          <p>We implement advanced security measures to protect your data:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>End-to-end encryption for sensitive data</li>
                            <li>Secure cloud storage with Supabase</li>
                            <li>Regular security audits and updates</li>
                            <li>Authentication protocols to prevent unauthorized access</li>
                            <li>Data encryption in transit and at rest</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mt-4">
                  For the complete privacy policy, please visit our website at 
                  <a href="#" className="text-purple-400 hover:text-purple-300 ml-1">sacredshifter.com/privacy</a>.
                </p>
              </motion.div>
            )}
            
            {activeTab === 'gdpr' && (
              <motion.div
                key="gdpr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-slate-800/70 border border-gray-700 p-5 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-white">GDPR Compliance</h3>
                        <p className="text-sm text-gray-400">Enhanced protections for EU residents</p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gdprEnabled}
                        onChange={() => setGdprEnabled(!gdprEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <AnimatePresence>
                    {gdprEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-700"
                      >
                        <p className="text-gray-300 mb-3">With GDPR compliance enabled, you gain additional rights:</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">Right to access all your personal data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">Right to be forgotten (complete data deletion)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">Right to data portability (export all your data)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">Right to object to certain data processing</span>
                          </li>
                        </ul>
                        
                        <button className="mt-4 px-4 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors rounded">
                          Request Data Export
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <p className="text-gray-300 mb-4">
                  The General Data Protection Regulation (GDPR) provides enhanced privacy rights for individuals in the European Union. If you are a resident of the EU or if you prefer the additional protections, you can enable GDPR compliance for your account.
                </p>
                
                <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    What happens when you enable GDPR compliance?
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="text-gray-300">• We limit data retention periods to the minimum necessary</li>
                    <li className="text-gray-300">• We provide data export in machine-readable format</li>
                    <li className="text-gray-300">• We offer complete account deletion with all associated data</li>
                    <li className="text-gray-300">• We process less analytics data about your usage</li>
                  </ul>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">How Sacred Shifter Handles Your Data</h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" />
                      What We Store
                    </h4>
                    <ul className="space-y-1.5 text-gray-300">
                      <li>• Your account information (email, username, password hash)</li>
                      <li>• Your spiritual journey progress and preferences</li>
                      <li>• Sacred circles, messages, and community connections</li>
                      <li>• Soul blueprints and frequency signatures</li>
                      <li>• Meditation records and consciousness journey logs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-400" />
                      Security Measures
                    </h4>
                    <ul className="space-y-1.5 text-gray-300">
                      <li>• Data encryption in transit (HTTPS/TLS)</li>
                      <li>• Password hashing using industry standards</li>
                      <li>• Optional end-to-end encryption for sensitive data</li>
                      <li>• Regular security audits of our infrastructure</li>
                      <li>• Cross-Site Scripting (XSS) and CSRF protection</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      Data Location
                    </h4>
                    <p className="text-gray-300 mb-3">
                      Sacred Shifter primarily stores data on Australian servers, respecting strong privacy laws. With the Hybrid setting, your most sensitive data is encrypted locally before storage.
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Australian server location:</span>
                      <span className="text-green-400">Enabled</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    Sacred Shifter is committed to the highest standards of data privacy and security, respecting the sacred nature of your spiritual journey data. We never sell your data to third parties.
                  </p>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'sov' && (
              <motion.div
                key="sov"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Data Sovereignty Options</h3>
                
                <p className="text-gray-300 mb-6">
                  Data sovereignty refers to who controls your data and where it's stored. Sacred Shifter offers three approaches to respect your preferences:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-green-400" />
                      Local Storage Only
                    </h4>
                    <p className="text-gray-300 mb-3">
                      Your data never leaves your device. All information is stored in your browser's secure storage.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Complete privacy</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>No internet required</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-300">
                        <X className="w-4 h-4" />
                        <span>No multi-device access</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-300">
                        <X className="w-4 h-4" />
                        <span>Data lost if browser cleared</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-blue-400" />
                      Sacred Cloud Sync
                    </h4>
                    <p className="text-gray-300 mb-3">
                      Data is securely stored in our Australian cloud infrastructure, allowing seamless synchronization between all your devices.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Multi-device access</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Automatic backups</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Real-time updates</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-300">
                        <Info className="w-4 h-4" />
                        <span>Requires internet</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-purple-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-purple-400" />
                        Hybrid with Encryption
                      </h4>
                      <div className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        Recommended
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-3">
                      Your sensitive data is encrypted locally before being synced to the cloud, combining privacy with convenience.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Multi-device access</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>End-to-end encryption</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Works offline</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Check className="w-4 h-4" />
                        <span>Maximum security</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="mt-6 text-sm text-gray-400">
                  You can change your data sovereignty settings at any time from the Settings menu. Changing from Cloud to Local will download all your data to your device.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-purple-500/20 bg-slate-900/70">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            
            <a 
              href="https://sacredshifter.com/privacy" 
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-2 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Full Legal Document</span>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};