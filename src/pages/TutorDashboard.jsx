import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions } from '../services/api';
import CalendarPicker from '../components/CalendarPicker';
import { Link } from 'react-router-dom';

export default function TutorDashboard() {
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
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Upcoming Sessions</h2>
          {sessions.length === 0 ? (
            <div className="border border-gray-200 p-6 rounded-lg text-center text-gray-500">
              <p>No sessions scheduled yet.</p>
              <p className="text-sm mt-2">Sessions will appear here once learners book time with you.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sessions.map(session => (
                <li key={session.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <p><strong>With:</strong> Learner #{session.learnerId}</p>
                  <p><strong>Subject:</strong> {session.subject || 'General'}</p>
                  <p><strong>Time:</strong> {new Date(session.scheduledStart).toLocaleString()}</p>
                  <Link to={`/session/${session.id}`} className="text-primary hover:underline inline-block mt-2">Join Session →</Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Set Availability</h2>
            <div className="border p-6 rounded-lg bg-white">
              <CalendarPicker onSelect={(slots) => console.log('Set availability', slots)} />
              <p className="text-sm text-gray-500 mt-4">Select time slots when you're available to tutor.</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Pending Requests</h2>
          <div className="border p-4 rounded-lg bg-gray-50">
            <p className="text-gray-500">No pending requests</p>
            <p className="text-sm text-gray-400 mt-2">Session requests from learners will appear here.</p>
          </div>

          <div className="mt-6 border p-4 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Total Sessions:</strong> {sessions.length}</p>
              <p><strong>Hours Tutored:</strong> 0</p>
              <p><strong>Rating:</strong> ⭐ New Tutor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
