import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';

export const SignInForm: React.FC = () => {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    await signIn(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-6">Welcome Back</h2>
      
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
          />
        </div>
      </div>
      
      <motion.button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account? <button type="button" className="text-purple-400 hover:text-purple-300" onClick={() => document.getElementById('sign-up-tab')?.click()}>Sign up</button>
        </p>
      </div>
    </form>
  );
};