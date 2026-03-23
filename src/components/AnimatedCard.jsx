import { motion } from 'framer-motion';
import { forwardRef } from 'react';

/**
 * Animated card component with hover effects
 */
export const AnimatedCard = forwardRef(({
  children,
  className = '',
  hoverScale = true,
  ...props
}, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={hoverScale ? { scale: 1.02 } : undefined}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow ${className}`}
    {...props}
  >
    {children}
  </motion.div>
));

AnimatedCard.displayName = 'AnimatedCard';

/**
 * Grid container with staggered animation
 */
export const AnimatedGrid = ({ children, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-4 ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * Fade in animation wrapper
 */
export const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Slide in from direction
 */
export const SlideIn = ({ children, direction = 'up', delay = 0, className = '' }) => {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scale animation
 */
export const ScaleIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay, type: 'spring' }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Stagger children animation
 */
export const StaggerContainer = ({ children, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};
