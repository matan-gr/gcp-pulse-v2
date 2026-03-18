import React from 'react';
import { AlertTriangle, RefreshCw, Mail, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = "Oops! Something went wrong", 
  message, 
  details,
  onRetry 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const handleReport = () => {
    const subject = encodeURIComponent(`Error Report: GCP Pulse - ${title}`);
    const body = encodeURIComponent(`
Error Message: ${message}
Technical Details: ${details || 'None provided'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `);
    window.open(`mailto:matangr@google.com?subject=${subject}&body=${body}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center max-w-2xl mx-auto"
    >
      <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
        <AlertTriangle className="text-red-500" size={48} />
      </div>
      
      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
        {title}
      </h3>
      
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-10 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        <button
          onClick={onRetry}
          className="flex items-center space-x-3 px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-500/30 active:scale-95"
        >
          <RefreshCw size={20} className={showDetails ? "animate-spin" : ""} />
          <span>Try Again</span>
        </button>
        
        <button
          onClick={handleReport}
          className="flex items-center space-x-3 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold active:scale-95"
        >
          <Mail size={20} />
          <span>Report Issue</span>
        </button>
      </div>

      {details && (
        <div className="w-full">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm font-medium mx-auto mb-4"
          >
            <Terminal size={14} />
            <span>{showDetails ? "Hide" : "Show"} Technical Details</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-slate-900 rounded-2xl text-left border border-slate-800 shadow-2xl">
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                    {details}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      <p className="mt-12 text-xs text-slate-400 dark:text-slate-600 font-medium">
        Contact: <span className="font-bold">matangr@google.com</span> for critical failures.
      </p>
    </motion.div>
  );
};
