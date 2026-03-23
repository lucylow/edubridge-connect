import { format } from 'date-fns';

interface BookingModalProps {
  slot: {
    start: Date;
    end: Date;
  };
  subject?: string;
  tutorName?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BookingModal({
  slot,
  subject,
  tutorName,
  loading,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const duration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60); // minutes

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">Confirm Booking</h2>
              <p className="text-blue-100 text-sm">Review your session details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tutor Info */}
          {tutorName && (
            <div className="flex items-center gap-3 pb-4 border-b dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {tutorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tutoring with</p>
                <p className="font-semibold text-lg">{tutorName}</p>
              </div>
            </div>
          )}

          {/* Session Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium">{format(slot.start, 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🕐</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                <p className="font-medium">
                  {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                </p>
                <p className="text-xs text-gray-500">({duration} minutes)</p>
              </div>
            </div>

            {subject && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📚</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                  <p className="font-medium">{subject}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-semibold">⚠️ Note:</span> The tutor will be notified and needs to
              confirm the session. You'll receive an email confirmation once approved.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Booking...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
