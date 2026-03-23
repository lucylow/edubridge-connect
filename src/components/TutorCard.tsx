import { Link } from 'react-router-dom';

interface TutorCardProps {
  tutor: {
    id: string;
    name: string;
    email?: string;
    subjects?: string[];
    grade?: string | number;
    bio?: string;
    rating?: number;
    sessionsCompleted?: number;
  };
  score: number;
  breakdown?: {
    subject: number;
    availability: number;
    rating: number;
  };
  onRequest?: () => void;
  sending?: boolean;
  rank?: number;
}

export default function TutorCard({ tutor, score, breakdown, onRequest, sending, rank }: TutorCardProps) {
  const scorePercent = Math.round(score);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return '🏆 Top Match';
    if (score >= 80) return '⭐ Great Match';
    if (score >= 70) return '✨ Good Match';
    return '👍 Match';
  };

  return (
    <div className="relative border dark:border-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
          #{rank}
        </div>
      )}

      <div className="flex justify-between items-start gap-4">
        {/* Tutor Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {tutor.name?.charAt(0).toUpperCase() || 'T'}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                {tutor.name || 'Tutor'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {tutor.grade || 'Experienced Tutor'}
              </p>

              {/* Subjects */}
              {tutor.subjects && tutor.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tutor.subjects.slice(0, 3).map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                  {tutor.subjects.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      +{tutor.subjects.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Bio */}
              {tutor.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {tutor.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  ⭐ {tutor.rating?.toFixed(1) || '5.0'}
                </span>
                <span className="flex items-center gap-1">
                  📚 {tutor.sessionsCompleted || 0} sessions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="flex flex-col items-end gap-2">
          <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getScoreColor(scorePercent)}`}>
            {scorePercent}% Match
          </div>
          <span className="text-xs text-gray-500">{getScoreBadge(scorePercent)}</span>
        </div>
      </div>

      {/* Score Breakdown */}
      {breakdown && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Subject</span>
                <span className="font-semibold">{breakdown.subject}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${breakdown.subject}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Available</span>
                <span className="font-semibold">{breakdown.availability}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${breakdown.availability}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Rating</span>
                <span className="font-semibold">{breakdown.rating}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${breakdown.rating}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        {onRequest && (
          <button
            onClick={onRequest}
            disabled={sending}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>📨</span>
                <span>Send Request</span>
              </>
            )}
          </button>
        )}
        <Link
          to={`/schedule/${tutor.id}`}
          className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition font-medium flex items-center justify-center gap-2"
        >
          <span>📅</span>
          <span>Schedule</span>
        </Link>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}
