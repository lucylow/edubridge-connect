import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions } from '../services/api';
import { Link } from 'react-router-dom';

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>

      <div className="mb-8">
        <Link
          to="/matching"
          className="bg-primary text-white px-6 py-3 rounded-lg inline-block hover:bg-primary-dark transition font-medium"
        >
          🔍 Find a Tutor
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">My Sessions</h2>
          {sessions.length === 0 ? (
            <div className="border border-gray-200 p-6 rounded-lg text-center text-gray-500">
              <p>No sessions scheduled yet.</p>
              <p className="text-sm mt-2">Click "Find a Tutor" to get started!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sessions.map(session => (
                <li key={session.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <p><strong>Tutor:</strong> {session.tutorName || `Tutor #${session.tutorId}`}</p>
                  <p><strong>Subject:</strong> {session.subject || 'General'}</p>
                  <p><strong>Time:</strong> {new Date(session.scheduledStart).toLocaleString()}</p>
                  <p className={`text-sm mt-1 ${session.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                    Status: {session.status || 'scheduled'}
                  </p>
                  <Link to={`/session/${session.id}`} className="text-primary hover:underline inline-block mt-2">
                    {session.status === 'completed' ? 'View Details' : 'Join Session'} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Recommended Subjects</h2>
          <div className="border p-4 rounded-lg bg-gray-50 space-y-2">
            <div className="p-2 bg-white rounded hover:bg-blue-50 cursor-pointer transition">
              <Link to="/matching?subject=Math" className="block">📐 Mathematics</Link>
            </div>
            <div className="p-2 bg-white rounded hover:bg-blue-50 cursor-pointer transition">
              <Link to="/matching?subject=Science" className="block">🔬 Science</Link>
            </div>
            <div className="p-2 bg-white rounded hover:bg-blue-50 cursor-pointer transition">
              <Link to="/matching?subject=English" className="block">📚 English</Link>
            </div>
            <div className="p-2 bg-white rounded hover:bg-blue-50 cursor-pointer transition">
              <Link to="/matching?subject=History" className="block">🌍 History</Link>
            </div>
          </div>

          <div className="mt-6 border p-4 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-900 mb-2">Learning Progress</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Sessions Completed:</strong> {sessions.filter(s => s.status === 'completed').length}</p>
              <p><strong>Hours Learned:</strong> 0</p>
              <p><strong>Favorite Subject:</strong> Not yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
