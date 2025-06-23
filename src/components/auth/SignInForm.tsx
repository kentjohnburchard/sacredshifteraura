import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Key, 
  Fingerprint, 
  Database,
  Cloud,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface SignInFormProps {
  biometricAvailable?: boolean;
  onDataSovereigntyClick?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ 
  biometricAvailable = false,
  onDataSovereigntyClick
}) => {
  const { signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setFormError('All fields are required');
      return;
    }
    
    try {
      setFormError(null);
      await signIn(email, password);
    } catch (err) {
      setFormError('Authentication failed. Please try again.');
    }
  };

  const handleBiometricAuth = async () => {
    // In a real app, this would implement the WebAuthn API
    alert('Biometric authentication would be triggered here in a production app');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Key className="w-5 h-5 text-purple-400" />
        Welcome Back to Your Sacred Journey
      </h2>
      
      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Sacred Email</label>
        <motion.div 
          className={`relative ${emailFocused ? 'ring-2 ring-purple-500/50' : ''}`}
          animate={emailFocused ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            emailFocused ? 'text-purple-400' : 'text-gray-400'
          }`} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className="w-full bg-slate-800/90 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all duration-300 z-10 relative"
            placeholder="your@email.com"
            required
          />
          <motion.span 
            className="absolute inset-0 rounded-lg border border-purple-500/30 -z-10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: emailFocused ? [0, 0.5, 0] : 0,
              scale: emailFocused ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 1.5, repeat: emailFocused ? Infinity : 0 }}
          />
        </motion.div>
      </div>
      
      {/* Password Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">Divine Password</label>
          <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
        </div>
        <motion.div 
          className={`relative ${passwordFocused ? 'ring-2 ring-purple-500/50' : ''}`}
          animate={passwordFocused ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            passwordFocused ? 'text-purple-400' : 'text-gray-400'
          }`} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className="w-full bg-slate-800/90 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all duration-300 z-10 relative"
            placeholder="••••••••"
            required
          />
          <motion.span 
            className="absolute inset-0 rounded-lg border border-purple-500/30 -z-10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: passwordFocused ? [0, 0.5, 0] : 0,
              scale: passwordFocused ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 1.5, repeat: passwordFocused ? Infinity : 0 }}
          />
        </motion.div>
      </div>
      
      {/* Form Error */}
      {formError && (
        <div className="text-red-400 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{formError}</p>
        </div>
      )}
      
      {/* Data Sovereignty Setting */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
          />
          <label htmlFor="remember" className="text-gray-300">Remember me</label>
        </div>
        
        <button 
          type="button"
          onClick={onDataSovereigntyClick}
          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Settings</span>
        </button>
      </div>
      
      {/* Sign In Button */}
      <motion.button
        type="submit"
        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 overflow-hidden relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Aligning Frequencies...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </>
          )}
        </span>
      </motion.button>
      
      {/* Biometric Authentication */}
      {biometricAvailable && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-300 rounded-lg border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Sign In with Biometrics</span>
          </button>
        </div>
      )}
      
      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          New to Sacred Shifter?{' '}
          <button 
            type="button" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
            onClick={() => document.getElementById('sign-up-tab')?.click()}
          >
            Begin Your Journey
          </button>
        </p>
      </div>
      
      {/* Help Text */}
      <div className="mt-2 p-3 bg-slate-800/70 rounded-lg border border-gray-700/50 text-xs text-gray-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p>
          Sacred Shifter creates a unique soul signature for your account, 
          aligning your digital presence with your spiritual frequency.
        </p>
      </div>
    </form>
  );
};
