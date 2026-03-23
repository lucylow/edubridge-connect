export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold">15,234</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</p>
              <p className="text-3xl font-bold">432</p>
            </div>
            <span className="text-4xl">📹</span>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 8% from last week</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Reports</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <span className="text-4xl">🚩</span>
          </div>
          <p className="text-sm text-yellow-600 mt-2">Requires attention</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Satisfaction</p>
              <p className="text-3xl font-bold">4.8/5</p>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
          <p className="text-sm text-green-600 mt-2">Excellent rating</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent User Registrations</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div>
                    <p className="font-semibold">User {i}</p>
                    <p className="text-sm text-gray-500">user{i}@example.com</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{i}h ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">System Alerts</h2>
          <div className="space-y-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Pending Reports</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">12 reports waiting for review</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-800 dark:text-green-200">✅ System Healthy</p>
              <p className="text-sm text-green-700 dark:text-green-300">All services operational</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-800 dark:text-blue-200">📊 High Traffic</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Peak usage hours: 3-6 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
