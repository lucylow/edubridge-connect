import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSession } from '../services/api';
import TimeSlotPicker from '../components/TimeSlotPicker';
import BookingModal from '../components/BookingModal';
import toast from 'react-hot-toast';

export default function Schedule() {
  const { tutorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [tutorInfo, setTutorInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch tutor info (mock for now)
    setTutorInfo({
      id: tutorId,
      name: 'Tutor Name',
      subjects: ['Math', 'Science'],
    });
  }, [tutorId]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !user?.id) return;
    setLoading(true);
    const sessionData = {
      tutorId: tutorId,
      learnerId: user.id,
      scheduledStart: selectedSlot.start,
      subject: subject || 'General',
    };
    try {
      const newSession = await createSession(sessionData);
      toast.success('Session booked successfully!');
      navigate(`/session/${newSession.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to schedule session. Please try again.');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          ← Back
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Tutor Info Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Session Details</h2>

            {tutorInfo && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {tutorInfo.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tutorInfo.name}</h3>
                    <p className="text-sm text-gray-500">Tutor</p>
                  </div>
                </div>

                {tutorInfo.subjects && (
                  <div>
                    <p className="text-sm font-medium mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {tutorInfo.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Subject (optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Algebra, Biology"
                className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">
                📅 How it works
              </h4>
              <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Select an available time slot</li>
                <li>Confirm your booking</li>
                <li>Tutor will be notified</li>
                <li>Join the session at scheduled time</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Select Available Time</h1>
            <TimeSlotPicker
              tutorId={tutorId}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
            />
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showModal && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          subject={subject}
          tutorName={tutorInfo?.name}
          loading={loading}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}
