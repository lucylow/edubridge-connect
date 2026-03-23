import { useState } from 'react';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      reportedBy: 'Alice Johnson',
      reportedUser: 'Bob Smith',
      reason: 'Inappropriate behavior',
      description: 'User was rude during the session',
      status: 'pending',
      createdAt: '2024-03-15T10:30:00',
    },
    {
      id: '2',
      reportedBy: 'Charlie Brown',
      reportedUser: 'Diana Prince',
      reason: 'No-show',
      description: 'Tutor did not join the scheduled session',
      status: 'reviewing',
      createdAt: '2024-03-14T15:45:00',
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const updateReportStatus = (reportId: string, newStatus: Report['status']) => {
    setReports((prev) =>
      prev.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report))
    );
    toast.success('Report status updated');
    setSelectedReport(null);
  };

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    reviewing: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    resolved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    dismissed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Reports</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{reports.filter((r) => r.status === 'pending').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Reviewing</p>
          <p className="text-2xl font-bold">
            {reports.filter((r) => r.status === 'reviewing').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold">
            {reports.filter((r) => r.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Dismissed</p>
          <p className="text-2xl font-bold">
            {reports.filter((r) => r.status === 'dismissed').length}
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reported User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.reportedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.reportedUser}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-primary hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="text-2xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Reported By</p>
                <p className="font-medium">{selectedReport.reportedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reported User</p>
                <p className="font-medium">{selectedReport.reportedUser}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedReport.reason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p>{selectedReport.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedReport.status]}`}
                >
                  {selectedReport.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'reviewing')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start Review
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Resolve
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
