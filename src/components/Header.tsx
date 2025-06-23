// src/components/Header.tsx
import React from 'react';
import { Brain, Atom, Infinity, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileHeader } from './UserProfileHeader';
import { HelpButton } from './HelpButton';
import { PrinciplesButton } from './PrinciplesButton';
import { AdminAccessControl } from './AdminAccessControl';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface HeaderProps {
  isUserMode?: boolean;
  onToggleMode?: () => void;
  // NEW: Add isAdmin prop
  isAdmin?: boolean;
}

// MODIFIED: Destructure isAdmin from props
const Header: React.FC<HeaderProps> = ({ isUserMode = false, onToggleMode, isAdmin }) => {
  const { user } = useAuth(); // Keep user for other purposes

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900/50 to-slate-900 border-b border-purple-500/20 z-50 relative">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/LogoClean.png" alt="Sacred Shifter" className="h-12" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <SyncStatusIndicator />
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm">
              <PrinciplesButton />

              {/* MODIFIED: Pass isAdmin to AdminAccessControl */}
              <AdminAccessControl isAdmin={isAdmin}>
                {onToggleMode && (
                  <button
                    onClick={onToggleMode}
                    className="px-3 py-2 bg-amber-600/20 text-amber-300 rounded-lg border border-amber-500/30 hover:bg-amber-600/30 transition-colors text-xs"
                  >
                    {isUserMode ? 'Admin View' : 'Soul View'}
                  </button>
                )}
              </AdminAccessControl>

              <div className="text-right">
                <div className="text-xs text-gray-400">Version</div>
                <div className="text-white font-mono">1.0.0</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <HelpButton moduleType="overview" />
              {user && <UserProfileHeader />}

              <div
                className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"
                title="Consciousness Active"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;