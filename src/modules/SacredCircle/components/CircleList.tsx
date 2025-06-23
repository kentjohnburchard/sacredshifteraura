import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSacredCircle } from '../../../contexts/SacredCircleContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Users,
  Heart,
  Crown,
  Sparkles,
  MessageCircle,
  Settings,
  UserPlus,
  Star,
  PlusCircle,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

export const CircleList: React.FC = () => {
  const { circles, activeCircle, setActiveCircle, createCircle, error } = useSacredCircle();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter out direct message circles
  const regularCircles = circles.filter(circle => !circle.is_direct_message);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Seedling': return 'text-green-400 bg-green-900/20';
      case 'Flowering': return 'text-pink-400 bg-pink-900/20';
      case 'Fruiting': return 'text-orange-400 bg-orange-900/20';
      case 'Transcendent': return 'text-purple-400 bg-purple-900/20';
      case 'Enlightened': return 'text-amber-400 bg-amber-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Seedling': return <Sparkles className="w-3 h-3" />;
      case 'Flowering': return <Heart className="w-3 h-3" />;
      case 'Fruiting': return <Star className="w-3 h-3" />;
      case 'Transcendent': return <Crown className="w-3 h-3" />;
      case 'Enlightened': return <Crown className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) {
      setFormError('Circle name is required');
      return;
    }

    if (newCircleName.length < 3) {
      setFormError('Circle name must be at least 3 characters');
      return;
    }

    setIsCreating(true);
    setFormError(null);

    try {
      // Pass isPrivate as false by default, as per the plan
      await createCircle(newCircleName, newCircleDescription, false);
      setShowCreateForm(false);
      setNewCircleName('');
      setNewCircleDescription('');
    } catch (err) {
      console.error('Error creating circle:', err);
      setFormError('Failed to create circle. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Sacred Circles
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 text-red-300 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Circle list */}
      <div className="space-y-3">
        {regularCircles.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-3 text-purple-400/30" />
            <h3 className="text-white font-medium mb-1">No Sacred Circles Yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create your first circle or join an existing one.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Circle
            </button>
          </div>
        ) : (
          regularCircles.map((circle) => (
            <motion.div
              key={circle.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                activeCircle?.id === circle.id
                  ? 'border-purple-400 bg-purple-900/20'
                  : 'border-gray-700 bg-slate-800/50 hover:border-purple-500/50'
              }`}
              onClick={() => setActiveCircle(circle)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                {circle.image_url ? (
                  <img
                    src={circle.image_url}
                    alt={circle.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white truncate">{circle.name}</h3>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getTierColor(circle.ascension_tier)}`}>
                      {getTierIcon(circle.ascension_tier)}
                      {circle.ascension_tier}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{circle.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        <span>{circle.love_level}% Love</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{circle.member_count || 0}</span>
                      </div>
                      {circle.active_now && circle.active_now > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{circle.active_now} active</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-purple-300 font-medium">
                      {circle.ascension_points} AP
                    </div>
                  </div>
                </div>

                {circle.creator_id === user?.id && (
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create new circle form */}
      {showCreateForm && (
        <motion.div
          className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Create New Circle</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="mb-3 p-2 bg-red-900/20 text-red-300 rounded text-sm flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Circle Name
              </label>
              <input
                type="text"
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                placeholder="Enter a name for your sacred circle..."
                className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newCircleDescription}
                onChange={(e) => setNewCircleDescription(e.target.value)}
                placeholder="Describe the purpose of this circle..."
                className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none h-20"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCircle}
                disabled={isCreating}
                className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Create Circle
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create new direct message button (This button now opens the same create form) */}
      <div className="mt-4">
        <button
          className="w-full p-3 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-left"
          onClick={() => setShowCreateForm(true)} // Reusing the same form for now, though direct message creation is separate
        >
          <div className="flex items-center gap-2 text-gray-300">
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>Create New Circle</span>
          </div>
        </button>
      </div>
    </div>
  );
};