import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSyncContext } from '../../contexts/SyncContext';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { DataSovereigntySettings } from './DataSovereigntySettings';
import { ComplianceModal } from './ComplianceModal';
import { QuoteCarousel } from './QuoteCarousel';
import { SacredGeometryBackground } from './SacredGeometryBackground';
import { 
  Sparkles,
  Lock,
  Info,
  Globe,
  ShieldCheck,
  ArrowRight,
  Key,
  Eye,
  Database,
  Cloud,
  CloudOff
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [activeView, setActiveView] = useState<'sign-in' | 'sign-up' | 'data-sovereignty'>('sign-in');
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [dataSovereigntyChoice, setDataSovereigntyChoice] = useState<'local' | 'cloud' | 'hybrid'>('cloud');
  const [logoHovered, setLogoHovered] = useState(false);
  const { error, isLoading } = useAuth();
  const { syncStatus } = useSyncContext();
  const logoRef = useRef<HTMLDivElement>(null);

  // Subtle background animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check for biometric authentication capability
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  useEffect(() => {
    // Check if Web Authentication API is available
    const checkBiometricAvailability = async () => {
      if (window.PublicKeyCredential) {
        try {
          // Check if platform authenticator is available
          const available = await (window.PublicKeyCredential as any)
            .isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        } catch (err) {
          console.error('Error checking biometric availability:', err);
          setBiometricAvailable(false);
        }
      }
    };

    checkBiometricAvailability();
  }, []);

  const handleViewChange = (view: 'sign-in' | 'sign-up' | 'data-sovereignty') => {
    setActiveView(view);
  };

  const handleDataSovereigntyChange = (choice: 'local' | 'cloud' | 'hybrid') => {
    setDataSovereigntyChoice(choice);
    // In a real implementation, this would update the user's settings
    // For now, just go back to sign-in after selection
    setActiveView('sign-in');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 md:p-0 relative overflow-hidden"
      style={{
        // REVERTED BACKGROUND GRADIENT TO ORIGINAL VALUES FOR TEXT CONTRAST FOCUS
        background: `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(91, 33, 182, 0.3) 0%,
          rgba(67, 56, 202, 0.2) 50%,
          rgba(17, 24, 39, 0.95) 100%)`,
      }}
    >
      {/* Sacred Geometry Background */}
      <SacredGeometryBackground />
      
      {/* Main Authentication Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="relative mx-auto mb-6"
            ref={logoRef}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <motion.img 
              src="/LogoClean.png" 
              alt="Sacred Shifter" 
              className="h-24 mx-auto relative z-10"
              animate={logoHovered ? { 
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0, -2, 0],
                transition: { duration: 2, repeat: Infinity }
              } : {}}
            />
            <motion.div 
              className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center z-20"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <motion.div 
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500/20 via-violet-500/10 to-indigo-500/20 z-0 blur-md"
              animate={logoHovered ? { 
                scale: [1, 1.2, 1.1],
                opacity: [0.3, 0.6, 0.3]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-3">
            Sacred Shifter
          </h1>
          {/* IMPROVED CONTRAST FOR SUBTITLE */}
          <p className="text-xl text-white mb-2"> 
            Metaphysical OS for Consciousness Evolution
          </p>
          {/* IMPROVED CONTRAST FOR DESCRIPTIVE PARAGRAPH */}
          <p className="text-gray-300 max-w-md mx-auto"> 
            Your divine companion for soul growth, connecting you with sacred geometry and universal principles
          </p>
        </motion.div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md mb-6 p-4 bg-red-900/20 text-white rounded-lg" // CHANGED text-red-300 to text-white
            >
              <p>Your frequency may be out of alignment. {error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Auth Card */}
        <motion.div
          className="backdrop-blur-md bg-slate-900/70 rounded-xl border border-purple-500/30 shadow-xl shadow-purple-900/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Tab Navigation */}
          {activeView !== 'data-sovereignty' && (
            <div className="flex mb-6 bg-slate-800/50 p-1 rounded-lg mx-4 mt-4">
              <button
                onClick={() => setActiveView('sign-in')}
                className={`flex-1 py-3 text-center rounded-md transition-colors duration-300 flex items-center justify-center gap-2 ${
                  activeView === 'sign-in'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white' // CHANGED text-gray-400 to text-gray-300
                }`}
              >
                <Key className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setActiveView('sign-up')}
                className={`flex-1 py-3 text-center rounded-md transition-colors duration-300 flex items-center justify-center gap-2 ${
                  activeView === 'sign-up'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white' // CHANGED text-gray-400 to text-gray-300
                }`}
              >
                <Eye className="w-4 h-4" />
                Sign Up
              </button>
            </div>
          )}
          
          {/* Main Content Area */}
          <div className="p-6 pt-0">
            <AnimatePresence mode="wait">
              {activeView === 'sign-in' && (
                <motion.div
                  key="sign-in"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignInForm
                    biometricAvailable={biometricAvailable}
                    onDataSovereigntyClick={() => setActiveView('data-sovereignty')}
                  />
                </motion.div>
              )}
              
              {activeView === 'sign-up' && (
                <motion.div
                  key="sign-up"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignUpForm
                    onDataSovereigntyClick={() => setActiveView('data-sovereignty')}
                  />
                </motion.div>
              )}
              
              {activeView === 'data-sovereignty' && (
                <motion.div
                  key="data-sovereignty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DataSovereigntySettings
                    currentChoice={dataSovereigntyChoice}
                    onChange={handleDataSovereigntyChange}
                    onBack={() => setActiveView('sign-in')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Inspirational Quote Carousel */}
        <div className="mt-8 max-w-md">
          <QuoteCarousel />
        </div>
        
        {/* Footer */}
        {/* IMPROVED CONTRAST FOR FOOTER TEXTS */}
        <div className="mt-6 text-center text-gray-300 text-sm"> {/* CHANGED text-gray-500 to text-gray-300 */}
          <p className="flex items-center justify-center gap-3">
            <button 
              onClick={() => setShowComplianceModal(true)}
              className="text-purple-300 hover:text-purple-200 flex items-center gap-1" // CHANGED text-purple-400 to text-purple-300, hover to 200
            >
              <ShieldCheck className="w-4 h-4" />
              Privacy & Legal
            </button>
            
            <span className="text-gray-500">|</span> {/* CHANGED text-gray-600 to text-gray-500 */}
            
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-gray-500" /> {/* CHANGED text-gray-600 to text-gray-500 */}
              {syncStatus.isOnline ? (
                <span className="flex items-center gap-1 text-green-300"> {/* CHANGED text-green-400 to text-green-300 */}
                  <Cloud className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-300"> {/* CHANGED text-gray-400 to text-gray-300 */}
                  <CloudOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </span>
            
            <span className="text-gray-500">|</span> {/* CHANGED text-gray-600 to text-gray-500 */}
            
            <a
              href="https://sacredshifter.com/terms"
              target="_blank"
              rel="noreferrer"
              className="text-purple-300 hover:text-purple-200 flex items-center gap-1" // CHANGED text-purple-400 to text-purple-300, hover to 200
            >
              <Info className="w-4 h-4" />
              Terms
            </a>
          </p>
          <p className="mt-2">© 2025 Sacred Shifter. All rights reserved.</p>
        </div>
      </div>
      
      {/* Compliance Modal */}
      <ComplianceModal 
        isOpen={showComplianceModal} 
        onClose={() => setShowComplianceModal(false)}
      />
    </div>
  );
};

export default AuthScreen;