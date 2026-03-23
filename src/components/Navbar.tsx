import { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { supabase } from '../integrations/supabase/client';

export default function Navbar() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'tutor':
        return '/tutor/dashboard';
      default:
        return '/learner/dashboard';
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-xl text-gray-900 dark:text-white">EduBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-700 dark:text-gray-200 hover:text-primary transition"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Link
                to={getDashboardLink()}
                className="text-gray-700 dark:text-gray-200 hover:text-primary"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side: Theme toggle + User menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <span>☀️</span> : <span>🌙</span>}
            </button>

            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                  <span className="text-xs">▼</span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-primary">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
