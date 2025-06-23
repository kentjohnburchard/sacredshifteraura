import React, { useState } from 'react';
import { AuthScreen } from './auth/AuthScreen';
import Header from './Header';
import Footer from './Footer';
import { Sparkles, Zap, Users, Eye, Shield, Heart } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  if (showAuthScreen) {
    return <AuthScreen onBack={() => setShowAuthScreen(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      <Header isUserMode={false} onToggleMode={() => {}} />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Sacred Shifter
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A Metaphysical Operating System for Consciousness Evolution
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Transform your spiritual journey with advanced frequency harmonics, 
            sacred geometry, and conscious technology designed to elevate your awareness.
          </p>
          
          <button
            onClick={() => setShowAuthScreen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Begin Your Journey
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Eye,
              title: "Consciousness Monitoring",
              description: "Real-time awareness tracking with advanced biometric integration and sacred frequency analysis."
            },
            {
              icon: Zap,
              title: "Frequency Harmonics",
              description: "Harness the power of sound healing with precisely calibrated frequencies for chakra alignment."
            },
            {
              icon: Users,
              title: "Sacred Circles",
              description: "Connect with like-minded souls in quantum-entangled spiritual communities."
            },
            {
              icon: Shield,
              title: "Data Sovereignty",
              description: "Your spiritual data remains yours with advanced encryption and local storage options."
            },
            {
              icon: Heart,
              title: "Soul Blueprinting",
              description: "Discover your unique spiritual architecture and life purpose through sacred geometry."
            },
            {
              icon: Sparkles,
              title: "Modular Evolution",
              description: "Expand your capabilities with consciousness-enhancing modules from our marketplace."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Sacred Principles Section */}
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sacred Operating Principles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Principle of Oneness",
                description: "All consciousness is interconnected through the Global Event Horizon, creating unified awareness."
              },
              {
                title: "Principle of Vibration",
                description: "Everything resonates at specific frequencies. Our system harmonizes these vibrations for optimal spiritual growth."
              },
              {
                title: "Principle of Rhythm",
                description: "Natural cycles guide our expansion and contraction, allowing for sustainable consciousness evolution."
              },
              {
                title: "Super-Tautology",
                description: "Self-correcting systems maintain perfect logical consistency and spiritual integrity."
              }
            ].map((principle, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">{principle.title}</h3>
                <p className="text-gray-400">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transcend Reality?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of conscious beings who have already begun their transformation 
            with Sacred Shifter's revolutionary metaphysical technology.
          </p>
          <button
            onClick={() => setShowAuthScreen(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Your Evolution
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;