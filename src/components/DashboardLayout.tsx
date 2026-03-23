import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define menu items based on role
  const menuItems = {
    tutor: [
      { name: 'Dashboard', icon: '📊', href: '/tutor/dashboard' },
      { name: 'My Sessions', icon: '📅', href: '/sessions' },
      { name: 'Find Learners', icon: '🔍', href: '/matching' },
      { name: 'Availability', icon: '🕐', href: '/availability' },
      { name: 'Profile', icon: '👤', href: '/profile' },
      { name: 'Settings', icon: '⚙️', href: '/settings' },
    ],
    learner: [
      { name: 'Dashboard', icon: '📊', href: '/learner/dashboard' },
      { name: 'My Sessions', icon: '📅', href: '/sessions' },
      { name: 'Find Tutors', icon: '🔍', href: '/matching' },
      { name: 'Profile', icon: '👤', href: '/profile' },
      { name: 'Settings', icon: '⚙️', href: '/settings' },
    ],
    admin: [
      { name: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
      { name: 'Users', icon: '👥', href: '/admin/users' },
      { name: 'Reports', icon: '🚩', href: '/admin/reports' },
      { name: 'Flagged Reviews', icon: '⚠️', href: '/admin/flagged-reviews' },
      { name: 'Settings', icon: '⚙️', href: '/settings' },
    ],
  };

  const items = user ? menuItems[user.role] || [] : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Sidebar (desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 pt-16`}
      >
        <div className="h-full overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="w-5 h-5 mr-3 text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 overflow-y-auto pt-16">
        {/* Top bar (mobile menu toggle) */}
        <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md focus:outline-none"
          >
            <span className="text-xl">☰</span>
          </button>
          <h1 className="ml-4 text-xl font-semibold">Menu</h1>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
