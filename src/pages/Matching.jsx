import { useState, useEffect, useCallback } from 'react';
import { getMatches } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TutorCard from '../components/TutorCard';
import toast from 'react-hot-toast';

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Matching() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(null);
  const debouncedSubject = useDebounce(subject, 500);

  const fetchMatches = useCallback(async () => {
    if (!debouncedSubject.trim()) {
      setMatches([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getMatches(debouncedSubject);
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to fetch matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSubject]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleSendRequest = async (tutorId) => {
    setSendingRequest(tutorId);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Match request sent! The tutor will be notified.');
    } catch (err) {
      toast.error('Failed to send match request');
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find a Tutor</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Search Filters</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2 text-sm">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Algebra II, AP Biology"
                  className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm">Preferred Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t dark:border-gray-700">
                <h3 className="font-semibold text-sm mb-2">How Matching Works</h3>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Subject expertise (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Availability (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Reputation (15%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Success rate (10%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Activity (5%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-2">
          {!subject && (
            <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Start Your Search</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a subject to find the perfect tutor match
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Finding best matches...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing tutor profiles and availability</p>
            </div>
          )}

          {!loading && subject && matches.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No tutors found for "{subject}"</p>
              <p className="text-sm text-gray-500 mt-2">Try searching for a different subject or check back later</p>
            </div>
          )}

          {matches.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {matches.length} tutor{matches.length !== 1 ? 's' : ''} found
                </h2>
                <span className="text-sm text-gray-500">Sorted by match score</span>
              </div>

              <div className="space-y-4">
                {matches.map((match, idx) => (
                  <div
                    key={match.user.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <TutorCard
                      tutor={match.user}
                      score={match.score}
                      breakdown={match.breakdown}
                      onRequest={() => handleSendRequest(match.user.id)}
                      sending={sendingRequest === match.user.id}
                      rank={idx + 1}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
