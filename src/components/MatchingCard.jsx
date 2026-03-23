import { Link } from 'react-router-dom';

export default function MatchingCard({ tutor, score }) {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {tutor.name?.charAt(0) || 'T'}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{tutor.name || 'Tutor'}</h3>
          <p className="text-sm text-gray-500">{tutor.grade || 'College Student'}</p>

          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">Subjects:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(tutor.subjects || ['Math', 'Science']).map((subject, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span>⭐ {tutor.rating || '5.0'}</span>
            <span>📚 {tutor.sessionsCompleted || 0} sessions</span>
            {score && <span className="text-primary font-semibold">{score}% match</span>}
          </div>

          {tutor.bio && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
          )}

          <div className="mt-4">
            <Link
              to={`/schedule/${tutor.id}`}
              className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition text-sm font-medium"
            >
              Request Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
