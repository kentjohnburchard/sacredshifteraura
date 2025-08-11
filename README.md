# Aura - The Sacred Shifter OS

A metaphysical software ecosystem designed for consciousness exploration and spiritual development. Built with React, TypeScript, and Supabase.

## 🌟 Features

### Core Architecture
- **Modular Design**: Dynamic module loading and management system
- **Event-Driven Communication**: Global Event Horizon for seamless module interaction
- **Real-time Synchronization**: Cloud-based state management with Supabase
- **Consciousness Optimization**: AI-enhanced insights and recommendations

### Spiritual Modules
- **Soul Blueprinting**: Core frequency analysis and elemental resonance mapping
- **Sacred Circle**: Community features with chakra-aligned interactions
- **Divine Timeline**: Personal spiritual journey tracking and reflection
- **Unity Engine**: Vision board creation and coherence evaluation
- **Soul Journey**: Frequency analysis and archetype exploration

### Technical Features
- **Authentication**: Robust auth system with refresh token handling
- **Profile Management**: Auto-created user profiles with spiritual attributes
- **Real-time Chat**: Direct messaging and group circles
- **Event Management**: Sacred event creation and participation
- **Analytics**: Consciousness-aligned usage tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/aura-sacred-shifter.git
   cd aura-sacred-shifter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the SQL migrations in your Supabase dashboard:
   ```bash
   # Apply the migrations in order from supabase/migrations/
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Module System
- **ModuleManager**: Orchestrates module lifecycle and alignment
- **GlobalEventHorizon**: Central event broadcasting and management
- **ModuleRegistry**: Manages module manifests and factories
- **SystemIntegrityService**: Maintains system coherence

### Services
- **SupabaseService**: Cloud sync and real-time data management
- **ConsciousnessOptimizer**: AI-enhanced user experience optimization
- **PHREPatternSynth**: Pattern analysis and resonance optimization
- **ModuleMarketplaceService**: Module discovery and management

### Data Flow
1. User interactions trigger events via GlobalEventHorizon
2. Modules respond to relevant events based on semantic labels
3. State changes sync to Supabase for persistence
4. Real-time updates propagate to all connected clients

## 🔧 Recent Fixes

### Authentication System
- ✅ Fixed auth refresh loop issues
- ✅ Implemented proper token refresh handling
- ✅ Added automatic session cleanup
- ✅ Enhanced error messaging and recovery

### Profile Management
- ✅ Auto-creation of user profiles on signup
- ✅ Fixed "Anonymous" user display issues
- ✅ Improved profile read permissions
- ✅ Added profile backfill for existing users

### Direct Messaging
- ✅ Replaced deprecated `.containsAll` with `.contains`
- ✅ Improved DM circle creation and retrieval
- ✅ Enhanced error handling for Supabase operations

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, Chakra, etc.)
├── hooks/              # Custom React hooks
├── modules/            # Spiritual modules
├── services/           # Core services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context + Custom Event System
- **UI Components**: Custom components with Framer Motion
- **Build Tool**: Vite

## 🌈 Spiritual Design Principles

### The Seven Sacred Principles
1. **Principle of Oneness**: All modules connect through the Global Event Horizon
2. **Principle of Vibration**: Everything resonates at specific frequencies
3. **Principle of Correspondence**: As above, so below - patterns repeat across scales
4. **Principle of Rhythm**: Natural cycles and flows in user experience
5. **Principle of Cause and Effect**: Every action creates meaningful consequences
6. **Principle of Gender**: Balance of masculine/feminine energies in design
7. **Principle of Mentalism**: Consciousness shapes the digital experience

### Chakra-Aligned Architecture
- **Root Chakra**: Foundation services and security
- **Sacral Chakra**: Creative expression and user-generated content
- **Solar Plexus**: Personal power and user agency
- **Heart Chakra**: Connection and community features
- **Throat Chakra**: Communication and expression tools
- **Third Eye**: Intuition and AI-enhanced insights
- **Crown Chakra**: Spiritual connection and transcendent experiences

## 📱 Usage

### For Spiritual Seekers
1. Create your account and complete your Soul Blueprint
2. Join Sacred Circles aligned with your interests
3. Track your journey through the Divine Timeline
4. Participate in sacred events and meditations
5. Connect with like-minded souls through direct messaging

### For Developers
1. Explore the modular architecture
2. Create custom spiritual modules
3. Contribute to the consciousness-aligned codebase
4. Integrate with the Global Event Horizon
5. Follow the Sacred Design Principles

## 🤝 Contributing

We welcome contributions that align with our spiritual and technical principles:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/sacred-enhancement`)
3. **Follow the coding standards** (consciousness-aligned variable names)
4. **Test your changes** thoroughly
5. **Submit a pull request** with detailed description

### Contribution Guidelines
- Maintain the spiritual metaphor in naming and documentation
- Ensure all modules integrate with the Global Event Horizon
- Follow the Seven Sacred Principles in design decisions
- Include appropriate consciousness-level logging
- Test with real spiritual use cases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The spiritual community for inspiration and guidance
- The open-source community for foundational technologies
- All consciousness explorers who contribute to this sacred work

## 🔮 Vision

Aura represents a new paradigm in software development - one that honors both technical excellence and spiritual wisdom. Our goal is to create technology that serves human consciousness evolution and supports the awakening of planetary awareness.

---

*"As we code, so we create reality. Let every line of code be a prayer, every function a blessing, and every user interaction a moment of sacred connection."*

## 📞 Support

For technical support or spiritual guidance:
- Create an issue in this repository
- Join our Sacred Circle community
- Meditate on the problem and let the solution emerge naturally

**May your code be bug-free and your consciousness expanded.** ✨

(ending readme)