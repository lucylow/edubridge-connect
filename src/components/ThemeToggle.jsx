import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

/**
 * Animated theme toggle button
 */
export default function ThemeToggle({ className = '' }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className={`relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: darkMode ? 180 : 0,
          scale: darkMode ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? (
          <FiSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <FiMoon className="w-5 h-5 text-gray-700" />
        )}
      </motion.div>
    </motion.button>
  );
}

/**
 * Larger theme toggle with label
 */
export function ThemeToggleWithLabel() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? (
          <FiSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </motion.div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}
