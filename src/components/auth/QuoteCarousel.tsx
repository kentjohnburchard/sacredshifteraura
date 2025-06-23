import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Inspirational quotes related to consciousness evolution
const quotes = [
  {
    text: "The universe is not outside of you. Look inside yourself; everything that you want, you already are.",
    author: "Rumi"
  },
  {
    text: "You are not a drop in the ocean. You are the entire ocean in a drop.",
    author: "Rumi"
  },
  {
    text: "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries of its existence.",
    author: "Nikola Tesla"
  },
  {
    text: "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.",
    author: "Carl Sagan"
  },
  {
    text: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.",
    author: "Pierre Teilhard de Chardin"
  },
  {
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass"
  },
  {
    text: "In the midst of movement and chaos, keep stillness inside of you.",
    author: "Deepak Chopra"
  }
];

export const QuoteCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Auto-advance quotes every 10 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);
  
  const nextQuote = () => {
    setIsAutoPlaying(false); // Pause auto-advance when manually navigating
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };
  
  const prevQuote = () => {
    setIsAutoPlaying(false); // Pause auto-advance when manually navigating
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };
  
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
      
      {/* Quote Icon */}
      <Quote className="absolute top-3 left-3 w-5 h-5 text-purple-500/30" />
      <Quote className="absolute bottom-3 right-3 w-5 h-5 text-purple-500/30 transform rotate-180" />
      
      <div className="px-6 pt-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-300 italic mb-2">"{quotes[currentIndex].text}"</p>
            <p className="text-purple-400 font-medium">— {quotes[currentIndex].author}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-center mt-2">
        <button
          onClick={prevQuote}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1 px-4">
          {quotes.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === currentIndex ? 'bg-purple-500' : 'bg-gray-700'
              } transition-all duration-300`}
            ></div>
          ))}
        </div>
        
        <button
          onClick={nextQuote}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};