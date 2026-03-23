import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="max-w-3xl space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Reminders</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get reminded before sessions
                </p>
              </div>
              <button
                onClick={() => setSessionReminders(!sessionReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sessionReminders ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    sessionReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive news and updates
                </p>
              </div>
              <button
                onClick={() => setMarketingEmails(!marketingEmails)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketingEmails ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <button className="text-red-600 hover:text-red-800 font-medium">
              Delete Account
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
