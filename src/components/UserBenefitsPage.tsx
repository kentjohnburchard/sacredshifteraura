// src/components/UserBenefitsPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRSI } from '../contexts/RSIContext'; // Import useRSI hook
import { Atom } from 'lucide-react'; // Keep Atom for the Soul Seed glyph

function UserBenefitsPage() {
  const navigate = useNavigate();
  const { soulState, userConsent, setDominantChakra } = useRSI(); // Get soulState, userConsent, and setDominantChakra from useRSI

  // Effect to set dominant chakra on initial load (can be refined later for real detection)
  useEffect(() => {
    // For demonstration, let's assume a default dominant chakra or simulate a detection
    // In a real application, this would come from a more complex detection mechanism.
    if (!soulState.dominantChakra || soulState.dominantChakra === 'heart') { // Prevent constant re-setting if already determined
      setDominantChakra('crown'); // Set an initial dominant chakra for visual effect
    }
  }, []); // Run once on mount

  // Determine the color for the Soul Seed based on dominant chakra
  const soulSeedColor = userConsent.allowChakraTheming
    ? `var(--chakra-${soulState.dominantChakra}-color)`
    : 'var(--chakra-crown-color)'; // Fallback to crown if theming is off or chakra not set

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background celestial effects */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <header className="absolute top-0 w-full bg-black/30 backdrop-blur-xl border-b border-purple-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <Atom className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Sacred Shifter OS
                </span>
                <div className="text-xs text-purple-300 font-mono">Your Consciousness Evolution Partner</div>
              </div>
            </div>
            {/* Removed navigation links from header as per plan for a dedicated welcome screen */}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
          Soul's Welcome
        </h1>

        {/* Central Pulsating Soul Seed Glyph */}
        <div
          className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full flex items-center justify-center mb-8 animate-pulse-glow"
          style={{ '--soul-seed-color': soulSeedColor }} // Dynamically set CSS variable
        >
          <div className="absolute inset-0 rounded-full border-4 opacity-50 animate-ping" style={{ borderColor: soulSeedColor }}></div>
          <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: soulSeedColor }}></div>
          <Atom className="w-2/3 h-2/3 text-white" /> {/* Placeholder for the Soul Seed Glyph */}
        </div>

        <p className="text-xl lg:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
          The quantum field acknowledges your presence, <span className="text-purple-400 font-semibold">{soulState.dominantChakra} chakra</span> resonates strongly.
        </p>

        {/* Subtle Cosmic Influence */}
        <p className="text-md lg:text-lg text-cyan-300 mb-12 italic">
          Cosmic alignments indicate a new cycle of expansion.
        </p>

        {/* Begin Evolution Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="group bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
        >
          Begin Your Evolution
          <Atom className="inline-block ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </main>

      <footer className="absolute bottom-0 w-full bg-black/30 text-white py-4 text-center text-sm z-50">
        <p className="text-gray-400">© 2025 Sacred Shifter OS. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UserBenefitsPage;