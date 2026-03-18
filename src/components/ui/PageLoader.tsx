import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const LOADING_TEXTS = [
  "Initializing intelligence engine...",
  "Fetching latest Google Cloud updates...",
  "Analyzing architecture patterns...",
  "Compiling security bulletins...",
  "Aggregating product deprecations...",
  "Preparing your personalized dashboard..."
];

export const PageLoader: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle text every 2 seconds
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 2000);

    // Simulate progress bar (fast to 80%, slow to 95%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 80) return prev + Math.random() * 15;
        if (prev < 95) return prev + Math.random() * 2;
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
      <div className="relative w-24 h-24 mb-10">
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"
        />
        {/* Spinning Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner Pulse */}
        <motion.div
          className="absolute inset-4 rounded-full bg-blue-100 dark:bg-blue-900/30"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo.svg" alt="Loading" className="w-10 h-10 opacity-80" />
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>
        <div className="flex justify-end mt-2">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {Math.min(99, Math.round(progress))}%
          </span>
        </div>
      </div>

      {/* Informative Texts */}
      <div className="h-8 relative w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {LOADING_TEXTS[textIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
