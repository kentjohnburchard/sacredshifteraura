import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, X, RefreshCw } from 'lucide-react';

export const SignInForm: React.FC = () => {
  const { signIn, isLoading, error, clearError, forceCleanSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    await signIn(email, password);
  };
  
  const isSessionError = error?.includes('expired') || error?.includes('refresh') || error?.includes('token');
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-6">Welcome Back</h2>
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/50 border border-red-500 rounded-lg p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-200 text-sm flex-1">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <a href="#" className="text-xs text-purple-400 hover:text-purple-300">Forgot password?</a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            placeholder="********"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <motion.button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Sign In
          </>
        )}
      </motion.button>
      
      {/* Session Expired Notice with Clear Session Button */}
      {isSessionError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-3"
        >
          <p className="text-amber-200 text-sm text-center mb-3">
            Your session has expired or there's an authentication issue.
          </p>
          <button
            type="button"
            onClick={forceCleanSignIn}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
            Clear Session & Try Again
          </button>
        </motion.div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account? <button type="button" className="text-purple-400 hover:text-purple-300" onClick={() => document.getElementById('sign-up-tab')?.click()}>Sign up</button>
        </p>
      </div>
      
      {/* Troubleshooting Help */}
      {error && (
        <div className="mt-4 text-center">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">Having trouble signing in?</summary>
            <div className="mt-2 text-left bg-slate-800/50 rounded p-2">
              <p className="mb-1">Try these steps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Clear your browser cache and cookies</li>
                <li>Try signing in from an incognito/private window</li>
                <li>Check your internet connection</li>
                <li>Use the "Clear Session" button above if available</li>
              </ul>
            </div>
          </details>
        </div>
      )}
    </form>
  );
};