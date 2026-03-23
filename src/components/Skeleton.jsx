import { motion } from 'framer-motion';

/**
 * Base skeleton loader component
 */
export const Skeleton = ({ className = '', animate = true }) => (
  <div
    className={`${animate ? 'animate-pulse' : ''} bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

/**
 * Skeleton for session cards
 */
export const SessionSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-20" />
    </div>
    <Skeleton className="h-4 w-full" />
  </div>
);

/**
 * Skeleton for tutor profile cards
 */
export const TutorCardSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4 bg-white dark:bg-gray-800">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

/**
 * Skeleton for availability calendar
 */
export const CalendarSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
    <Skeleton className="h-8 w-48 mb-4" />
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

/**
 * Skeleton for dashboard stats card
 */
export const StatsCardSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-8 w-16 mb-1" />
    <Skeleton className="h-3 w-32" />
  </div>
);

/**
 * Skeleton for messages/chat
 */
export const MessageSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-40'} rounded-lg`} />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Full page skeleton loader
 */
export const PageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <Skeleton className="h-10 w-64 mb-6" />
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <SessionSkeleton />
        <SessionSkeleton />
        <SessionSkeleton />
      </div>
      <div className="space-y-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for search results
 */
export const SearchResultsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <TutorCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Animated skeleton group with stagger effect
 */
export const AnimatedSkeletonGroup = ({ count = 3, children }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          {children}
        </motion.div>
      ))}
    </motion.div>
  );
};
