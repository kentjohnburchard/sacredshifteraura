import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Database,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

interface SignUpFormProps {
  onDataSovereigntyClick?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ 
  onDataSovereigntyClick 
}) => {
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Focus states for animations
  const [emailFocused, setEmailFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[0-9]/.test(password)) strength += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
    
    return Math.min(5, strength); // 0-5 scale
  };
  
  const getStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-500';
    if (passwordStrength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStrengthText = () => {
    if (passwordStrength < 2) return 'Weak';
    if (passwordStrength < 4) return 'Fair';
    return 'Strong';
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordError('');
    setFormError(null);
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !username) {
      setFormError('All fields are required');
      return;
    }
    
    // Check password match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Check password strength
    if (passwordStrength < 3) {
      setPasswordError('Please choose a stronger password');
      return;
    }
    
    try {
      await signUp(email, password, username);
    } catch (err) {
      console.error('Sign up error:', err);
      setFormError('Error creating account. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-purple-400" />
        Begin Your Sacred Journey
      </h2>
      
      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Soul Email</label>
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
      
      {/* Username Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Sacred Username</label>
        <motion.div 
          className={`relative ${usernameFocused ? 'ring-2 ring-purple-500/50' : ''}`}
          animate={usernameFocused ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            usernameFocused ? 'text-purple-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
            className="w-full bg-slate-800/90 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all duration-300 z-10 relative"
            placeholder="Enter your sacred username"
            required
          />
          <motion.span 
            className="absolute inset-0 rounded-lg border border-purple-500/30 -z-10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: usernameFocused ? [0, 0.5, 0] : 0,
              scale: usernameFocused ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 1.5, repeat: usernameFocused ? Infinity : 0 }}
          />
        </motion.div>
      </div>
      
      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Sacred Password</label>
        <motion.div 
          className={`relative ${passwordFocused ? 'ring-2 ring-purple-500/50' : ''}`}
          animate={passwordFocused ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors z-20 ${
            passwordFocused ? 'text-purple-400' : 'text-gray-400'
          }`} />
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className="w-full bg-slate-800/90 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all duration-300 z-10 relative"
            placeholder="••••••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 z-20"
          >
            {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
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
        
        {/* Password strength indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-400">Password Strength</div>
              <div className={`text-xs ${
                passwordStrength < 2 ? 'text-red-400' : 
                passwordStrength < 4 ? 'text-yellow-400' : 
                'text-green-400'
              }`}>{getStrengthText()}</div>
            </div>
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${getStrengthColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
        <motion.div 
          className={`relative ${confirmPasswordFocused ? 'ring-2 ring-purple-500/50' : ''}`}
          animate={confirmPasswordFocused ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors z-20 ${
            confirmPasswordFocused ? 'text-purple-400' : 'text-gray-400'
          }`} />
          <input
            type={confirmPasswordVisible ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
            className="w-full bg-slate-800/90 border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all duration-300 z-10 relative"
            placeholder="••••••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 z-20"
          >
            {confirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <motion.span 
            className="absolute inset-0 rounded-lg border border-purple-500/30 -z-10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: confirmPasswordFocused ? [0, 0.5, 0] : 0,
              scale: confirmPasswordFocused ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 1.5, repeat: confirmPasswordFocused ? Infinity : 0 }}
          />
        </motion.div>
        {passwordError && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {passwordError}
          </p>
        )}
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
            id="terms"
            className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
            required
          />
          <label htmlFor="terms" className="text-gray-300">
            I accept the <span className="text-purple-400">Terms</span>
          </label>
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
      
      {/* Sign Up Button */}
      <motion.button
        type="submit"
        className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 overflow-hidden relative"
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
              <span>Creating Your Sacred Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Begin Your Journey</span>
            </>
          )}
        </span>
      </motion.button>
      
      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already on the path?{' '}
          <button 
            type="button" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
            onClick={() => document.getElementById('sign-in-tab')?.click()}
          >
            Return to Sacred Portal
          </button>
        </p>
      </div>
      
      {/* Help Text */}
      <div className="mt-2 p-3 bg-slate-800/70 rounded-lg border border-gray-700/50 text-xs text-gray-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p>
          Your sacred account gives you access to all aspects of the
          Sacred Shifter ecosystem, including cloud synchronization of 
          your soul's journey across devices.
        </p>
      </div>
    </form>
  );
};
