import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient
import {
  SupabaseService,
  SharedIntentionRecord,
} from '../services/SupabaseService';
import {
  Network,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Zap,
  Loader,
  Heart,
  Link, // Added Link icon for connections
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast or similar

// Define an interface for connection data with the other intention's title
interface IntentionConnection {
  id: string;
  intention_id_1: string;
  intention_id_2: string;
  connection_type: string;
  resonance_score: number;
  // This is for the joined table data:
  shared_intentions: {
    title: string;
  };
}

export const SharedIntentionsManager: React.FC = () => {
  const { user } = useAuth();
  const supabaseService = SupabaseService.getInstance();
  const supabaseClient: SupabaseClient = supabaseService.client; // Get the Supabase client instance

  const [intentions, setIntentions] = useState<SharedIntentionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentIntention, setCurrentIntention] =
    useState<SharedIntentionRecord | null>(null);
  const [formData, setFormData] = useState<Partial<SharedIntentionRecord>>({
    title: '',
    description: '',
    essence_labels: [],
    chakra_focus: '',
    frequency_hz: 0,
    target_outcome: '',
    is_public: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for connection modal
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [primaryIntentionForConnection, setPrimaryIntentionForConnection] =
    useState<SharedIntentionRecord | null>(null);
  const [availableIntentionsForConnection, setAvailableIntentionsForConnection] =
    useState<SharedIntentionRecord[]>([]);
  const [selectedIntentionToConnect, setSelectedIntentionToConnect] =
    useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  // State for displaying existing connections
  const [expandedConnections, setExpandedConnections] = useState<{
    [key: string]: IntentionConnection[];
  }>({});
  const [loadingConnections, setLoadingConnections] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchIntentions();
    }
  }, [user?.id]);

  const fetchIntentions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedIntentions = await supabaseService.getUserSharedIntentions();
      setIntentions(fetchedIntentions);
    } catch (err) {
      console.error('Error fetching intentions:', err);
      setError('Failed to load shared intentions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'frequency_hz') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else if (name === 'essence_labels') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(',').map((s) => s.trim()).filter((s) => s),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (currentIntention) {
        // Update existing intention
        await supabaseService.updateSharedIntention(
          currentIntention.id!,
          formData
        );
        toast.success('Intention updated successfully!'); // Toast notification
      } else {
        // Create new intention
        if (!formData.title || !user?.id) {
          throw new Error('Title and User ID are required.');
        }
        await supabaseService.createSharedIntention({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          essence_labels: formData.essence_labels,
          chakra_focus: formData.chakra_focus,
          frequency_hz: formData.frequency_hz,
          target_outcome: formData.target_outcome,
          is_public: formData.is_public,
        });
        toast.success('Intention created successfully!'); // Toast notification
      }

      await fetchIntentions();
      setShowForm(false);
      setCurrentIntention(null);
      setFormData({
        title: '',
        description: '',
        essence_labels: [],
        chakra_focus: '',
        frequency_hz: 0,
        target_outcome: '',
        is_public: false,
      });
    } catch (err) {
      console.error('Error submitting intention:', err);
      setError('Failed to save intention. Please try again.');
      toast.error('Failed to save intention.'); // Toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (intention: SharedIntentionRecord) => {
    setCurrentIntention(intention);
    setFormData({
      title: intention.title,
      description: intention.description || '',
      essence_labels: intention.essence_labels || [],
      chakra_focus: intention.chakra_focus || '',
      frequency_hz: intention.frequency_hz || 0,
      target_outcome: intention.target_outcome || '',
      is_public: intention.is_public || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this intention?'))
      return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await supabaseService.deleteSharedIntention(id);
      toast.success('Intention deleted successfully!'); // Toast notification
      await fetchIntentions();
    } catch (err) {
      console.error('Error deleting intention:', err);
      setError('Failed to delete intention. Please try again.');
      toast.error('Failed to delete intention.'); // Toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentIntention(null);
    setFormData({
      title: '',
      description: '',
      essence_labels: [],
      chakra_focus: '',
      frequency_hz: 0,
      target_outcome: '',
      is_public: false,
    });
    setShowForm(true);
  };

  const getChakraColor = (chakra: string) => {
    switch (chakra?.toLowerCase()) {
      case 'root':
        return 'text-red-500';
      case 'sacral':
        return 'text-orange-500';
      case 'solar':
        return 'text-yellow-500';
      case 'heart':
        return 'text-green-500';
      case 'throat':
        return 'text-blue-500';
      case 'third_eye':
        return 'text-indigo-500';
      case 'crown':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const chakraOptions = [
    { id: 'root', name: 'Root' },
    { id: 'sacral', name: 'Sacral' },
    { id: 'solar', name: 'Solar' },
    { id: 'heart', name: 'Heart' },
    { id: 'throat', name: 'Throat' },
    { id: 'third_eye', name: 'Third Eye' },
    { id: 'crown', name: 'Crown' },
  ];

  // --- New Connection Logic ---

  const openConnectionModal = (primaryIntentionId: string) => {
    const primaryInt = intentions.find((int) => int.id === primaryIntentionId);
    if (!primaryInt) {
      toast.error('Primary intention not found.');
      return;
    }
    setPrimaryIntentionForConnection(primaryInt);

    // Filter out the primary intention and any already connected intentions
    const available = intentions.filter(
      (int) => int.id !== primaryIntentionId
    );
    setAvailableIntentionsForConnection(available);
    setSelectedIntentionToConnect(''); // Reset selection
    setShowConnectionModal(true);
  };

  const handleConnectIntentions = async () => {
    if (
      !primaryIntentionForConnection ||
      !primaryIntentionForConnection.id ||
      !selectedIntentionToConnect
    ) {
      toast.error('Please select an intention to connect.');
      return;
    }

    setIsConnecting(true);
    try {
      await supabaseService.createIntentionConnection(
        primaryIntentionForConnection.id,
        selectedIntentionToConnect
      );
      toast.success('Intentions connected in harmony!');
      setShowConnectionModal(false);
      setPrimaryIntentionForConnection(null);
      setSelectedIntentionToConnect('');
      // Re-fetch intentions to update resonance scores and connections display
      await fetchIntentions();
    } catch (err) {
      console.error('Error connecting intentions:', err);
      toast.error('Failed to connect intentions.');
    } finally {
      setIsConnecting(false);
    }
  };

  // --- New Display Existing Connections Logic ---

  const fetchConnections = async (intentionId: string) => {
    if (loadingConnections.includes(intentionId)) return; // Prevent double fetching

    setLoadingConnections((prev) => [...prev, intentionId]);
    try {
      const { data, error } = await supabaseClient
        .from('intention_connections')
        .select('*, intention_id_2!intention_connections_intention_id_2_fkey (title)') // Use the correct foreign key name
        .or(`intention_id_1.eq.${intentionId},intention_id_2.eq.${intentionId}`); // Fetch connections where this intention is either ID1 or ID2

      if (error) {
        throw error;
      }

      if (data) {
        // Map the data to a more usable format, determining the "other" intention
        const formattedConnections = data.map((conn: any) => {
            const isPrimary = conn.intention_id_1 === intentionId;
            const otherIntentionTitle = isPrimary 
                ? conn.intention_id_2.title 
                : conn.intention_id_1.title; // If this intention is ID2, the other is ID1's title
            
            return {
                id: conn.id,
                otherTitle: otherIntentionTitle,
                resonance_score: conn.resonance_score,
                // Include other relevant connection details if needed
            };
        });
        setExpandedConnections((prev) => ({
          ...prev,
          [intentionId]: formattedConnections,
        }));
      }
    } catch (err) {
      console.error(`Error fetching connections for ${intentionId}:`, err);
      toast.error('Failed to load connections.');
    } finally {
      setLoadingConnections((prev) => prev.filter((id) => id !== intentionId));
    }
  };

  const toggleConnectionsDisplay = async (intentionId: string) => {
    if (expandedConnections[intentionId]) {
      // If already expanded, collapse it
      setExpandedConnections((prev) => {
        const newState = { ...prev };
        delete newState[intentionId];
        return newState;
      });
    } else {
      // If not expanded, fetch and expand
      await fetchConnections(intentionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-400" />
            Shared Intentionality Matrix
          </h2>
          <button
            onClick={handleAddClick}
            className="px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Intention
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-900/20 text-red-300 p-3 rounded-lg flex items-center gap-2 mb-4"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-900/20 text-green-300 p-3 rounded-lg flex items-center gap-2 mb-4"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">
                  {currentIntention ? 'Edit Intention' : 'New Intention'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Essence Labels (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="essence_labels"
                    value={(formData.essence_labels || []).join(', ')}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Chakra Focus
                    </label>
                    <select
                      name="chakra_focus"
                      value={formData.chakra_focus || ''}
                      onChange={handleFormChange}
                      className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="">Select Chakra</option>
                      {chakraOptions.map((chakra) => (
                        <option key={chakra.id} value={chakra.id}>
                          {chakra.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Frequency (Hz)
                    </label>
                    <input
                      type="number"
                      name="frequency_hz"
                      value={formData.frequency_hz || 0}
                      onChange={handleFormChange}
                      step="0.1"
                      className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Outcome
                  </label>
                  <input
                    type="text"
                    name="target_outcome"
                    value={formData.target_outcome || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public || false}
                    onChange={handleFormChange}
                    className="rounded text-purple-500"
                  />
                  <label className="text-sm font-medium text-gray-300">
                    Make Public
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Intention
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="ml-4 text-purple-300">Loading intentions...</p>
          </div>
        ) : intentions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No shared intentions yet.</p>
            <p className="text-sm mt-2">Start by adding your first intention!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {intentions.map((intention) => (
              <motion.div
                key={intention.id}
                className="bg-slate-800/50 rounded-lg border border-gray-700 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white">{intention.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(intention)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Edit Intention"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(intention.id!)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Intention"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {intention.description && (
                  <p className="text-gray-400 text-sm mb-3">
                    {intention.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {intention.essence_labels?.map((label, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded"
                    >
                      {label}
                    </span>
                  ))}
                  {intention.chakra_focus && (
                    <span
                      className={`px-2 py-1 rounded ${getChakraColor(
                        intention.chakra_focus
                      )}`}
                    >
                      <Heart className="w-3 h-3 inline mr-1" />
                      {intention.chakra_focus.replace('_', ' ')}
                    </span>
                  )}
                  {intention.frequency_hz && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      <Zap className="w-3 h-3 inline mr-1" />
                      {intention.frequency_hz} Hz
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    Target:{' '}
                    <span className="text-white">
                      {intention.target_outcome || 'N/A'}
                    </span>
                  </div>
                  {/* Display Current Resonance Score */}
                  <div className="text-gray-500">
                    Resonance Score:{' '}
                    <strong className="text-emerald-400">
                      {intention.current_resonance_score != null
                        ? intention.current_resonance_score.toFixed(2) // Format to 2 decimal places
                        : 'N/A'}
                    </strong>
                  </div>
                </div>

                {/* Resonate With... Button */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => openConnectionModal(intention.id!)}
                    className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Link className="w-4 h-4" />
                    Resonate With...
                  </button>

                  {/* Toggle Existing Connections Display */}
                  <button
                    onClick={() => toggleConnectionsDisplay(intention.id!)}
                    className="px-3 py-2 bg-gray-600/20 text-gray-300 rounded-lg border border-gray-500/30 hover:bg-gray-600/30 transition-colors flex items-center gap-1 text-sm"
                  >
                    {expandedConnections[intention.id!] ? (
                      <>
                        <X className="w-4 h-4" /> Hide Connections
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4" /> Show Connections
                      </>
                    )}
                  </button>
                </div>

                {/* Display Existing Connections */}
                <AnimatePresence>
                  {expandedConnections[intention.id!] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-gray-600"
                    >
                      <h4 className="text-sm font-semibold text-gray-200 mb-2">
                        Existing Connections:
                      </h4>
                      {loadingConnections.includes(intention.id!) ? (
                        <div className="flex items-center text-gray-400 text-sm">
                          <Loader className="w-4 h-4 animate-spin mr-2" />{' '}
                          Loading connections...
                        </div>
                      ) : expandedConnections[intention.id!].length > 0 ? (
                        <ul className="space-y-2">
                          {expandedConnections[intention.id!].map((conn) => (
                            <li key={conn.id} className="text-gray-300 text-sm">
                              Connected with:{' '}
                              <strong className="text-white">
                                {conn.otherTitle}
                              </strong>{' '}
                              (Resonance Score:{' '}
                              <span className="text-emerald-400">
                                {conn.resonance_score.toFixed(2)}
                              </span>
                              )
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">No connections yet.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {showConnectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-purple-500/30 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Resonate With "{primaryIntentionForConnection?.title}"
                </h3>
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-300 mb-4">
                Select another intention to form a connection and calculate
                their resonance.
              </p>

              {availableIntentionsForConnection.length === 0 ? (
                <p className="text-gray-400">
                  No other intentions available to connect with. Create more
                  intentions first!
                </p>
              ) : (
                <div className="mb-4">
                  <label
                    htmlFor="select-intention"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Choose an intention:
                  </label>
                  <select
                    id="select-intention"
                    value={selectedIntentionToConnect}
                    onChange={(e) =>
                      setSelectedIntentionToConnect(e.target.value)
                    }
                    className="w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">-- Select --</option>
                    {availableIntentionsForConnection.map((int) => (
                      <option key={int.id} value={int.id}>
                        {int.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectIntentions}
                  disabled={!selectedIntentionToConnect || isConnecting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Connecting...
                    </>
                  ) : (
                    'Connect Intentions'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
