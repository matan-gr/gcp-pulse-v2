import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AILoadingProps {
  variant?: 'minimal' | 'full' | 'inline' | 'card';
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  model?: string;
}

export const AILoading: React.FC<AILoadingProps> = ({ 
  variant = 'full', 
  title = 'Analyzing...',
  subtitle,
  icon: Icon = Sparkles,
  model
}) => {
  if (variant === 'minimal' || variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-900/30">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm font-medium">{title}</span>
        {model && <span className="text-xs opacity-70 ml-2">({model})</span>}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-indigo-500 opacity-50"
          />
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
            <Icon size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          {model && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{model}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-indigo-500 opacity-50"
        />
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
          <Icon size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        {model && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{model}</p>}
      </div>
    </div>
  );
};
