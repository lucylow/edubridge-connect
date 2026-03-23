export default function FlaggedReviews() {
  const flaggedReviews = [
    {
      id: 1,
      reviewer: 'John Doe',
      reviewee: 'Jane Smith',
      rating: 1,
      comment: 'This contains inappropriate language and needs review',
      flagReason: 'Inappropriate content',
      sessionDate: '2024-03-10',
    },
    {
      id: 2,
      reviewer: 'Alice Johnson',
      reviewee: 'Bob Wilson',
      rating: 2,
      comment: 'Suspicious review pattern detected',
      flagReason: 'Spam/fake review',
      sessionDate: '2024-03-12',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Flagged Reviews</h1>

      <div className="space-y-4">
        {flaggedReviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {review.reviewer} → {review.reviewee}
                </h3>
                <p className="text-sm text-gray-500">Session: {review.sessionDate}</p>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                <span className="text-gray-400">{'⭐'.repeat(5 - review.rating)}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                🚩 {review.flagReason}
              </p>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                {review.comment}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                Remove
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                Need More Info
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
