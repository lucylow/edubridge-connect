import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions } from '../services/api';
import { Link } from 'react-router-dom';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.id) return;
      try {
        const data = await getUserSessions(user.id);
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user?.id]);

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'upcoming') return session.status === 'scheduled';
    if (filter === 'completed') return session.status === 'completed';
    if (filter === 'cancelled') return session.status === 'cancelled';
    return true;
  });

  if (loading) return <div className="text-center py-10">Loading sessions...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Sessions</h1>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6 border-b dark:border-gray-700">
        {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              filter === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No sessions found</p>
          <Link to="/matching" className="text-primary hover:underline mt-2 inline-block">
            Find a {user?.role === 'tutor' ? 'learner' : 'tutor'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{session.subject || 'General Session'}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <strong>
                        {user?.role === 'tutor' ? 'Learner' : 'Tutor'}:
                      </strong>{' '}
                      {user?.role === 'tutor' ? session.learnerName : session.tutorName}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(session.scheduledStart).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          session.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : session.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}
                      >
                        {session.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {session.status === 'scheduled' && (
                    <Link
                      to={`/session/${session.id}`}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition text-sm text-center"
                    >
                      Join Session
                    </Link>
                  )}
                  {session.status === 'completed' && (
                    <Link
                      to={`/session/${session.id}`}
                      className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition text-sm text-center"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
