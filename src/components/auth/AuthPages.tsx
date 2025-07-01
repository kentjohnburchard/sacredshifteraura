import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { Sparkles } from 'lucide-react';

export const AuthPages: React.FC = () => {
  const [activeView, setActiveView] = useState<'sign-in' | 'sign-up'>('sign-in');
  const { error } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="relative mx-auto mb-6">
            <img src="/LogoClean.png" alt="Sacred Shifter" className="h-24 mx-auto" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4">
            Sacred Shifter
          </h1>
          <p className="text-xl text-purple-300 mb-2">
            Metaphysical OS for Consciousness Evolution
          </p>
          <p className="text-gray-400 max-w-xl mx-auto">
            Your divine companion for soul growth, connecting you with sacred geometry and universal principles
          </p>
        </motion.div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-md mb-6 p-4 bg-red-900/20 text-red-300 rounded-lg"
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        <div className="w-full max-w-md">
          <div className="flex mb-6 bg-slate-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('sign-in')}
              className={`flex-1 py-2 text-center rounded transition-colors ${
                activeView === 'sign-in'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveView('sign-up')}
              className={`flex-1 py-2 text-center rounded transition-colors ${
                activeView === 'sign-up'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          <motion.div
            className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {activeView === 'sign-in' ? (
                <motion.div
                  key="sign-in"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignInForm />
                </motion.div>
              ) : (
                <motion.div
                  key="sign-up"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignUpForm />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>By signing in, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};