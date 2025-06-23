import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Calendar,
  MessageCircle,
  Crown,
  Star
} from 'lucide-react';

interface SacredCircleWelcomeProps {
  onGetStarted: () => void;
}

export const SacredCircleWelcome: React.FC<SacredCircleWelcomeProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Sacred Conversations',
      description: 'Connect with like-minded souls in meaningful dialogue',
      color: 'text-blue-400'
    },
    {
      icon: Heart,
      title: 'Heart-Centered Community',
      description: 'Share love frequencies and healing vibrations',
      color: 'text-pink-400'
    },
    {
      icon: Calendar,
      title: 'Spiritual Events',
      description: 'Join group meditations and sacred ceremonies',
      color: 'text-purple-400'
    },
    {
      icon: Crown,
      title: 'Ascension Tiers',
      description: 'Grow spiritually through community participation',
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center relative">
          <Users className="w-10 h-10 text-white" />
          <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping"></div>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
          Welcome to Sacred Circles
        </h1>
        
        <p className="text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
          A divine space for spiritual community, where souls gather to share wisdom, 
          healing frequencies, and sacred experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-4 bg-slate-800/50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center mb-3 mx-auto ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Enter Sacred Space
          </span>
        </motion.button>

        <div className="mt-8 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-medium">Sacred Principles</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-purple-300 text-sm">
            All interactions are guided by love, respect, and the highest good of all beings.
            Share authentically, listen deeply, and honor the sacred in every soul.
          </p>
        </div>
      </motion.div>
    </div>
  );
};