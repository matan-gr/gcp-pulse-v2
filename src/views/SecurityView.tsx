import React, { useState } from 'react';
import { FeedItem } from '../types';
import { ShieldAlert, ShieldCheck, Search, Filter, AlertTriangle, ExternalLink, Shield, Activity, ChevronDown, ChevronUp, Sparkles, Loader2, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityView } from '../hooks/useSecurityView';
import DOMPurify from 'dompurify';
import { getCategoryStyles, cn } from '../utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { StatSkeleton, SecuritySkeleton } from '../components/SkeletonLoader';
import { FeedCard } from '../components/FeedCard';

interface SecurityViewProps {
  items: FeedItem[];
  loading: boolean;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  subscribedCategories: string[];
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string) => void;
  analyses: Record<string, any>;
  isPresentationMode: boolean;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ 
  items, 
  loading,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  subscribedCategories,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode
}) => {
  const {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    processedData,
    filteredItems
  } = useSecurityView(items);

  const [visibleCount, setVisibleCount] = useState(10);
  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  React.useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, severityFilter]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <SecuritySkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#dadce0] dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -bottom-4 -right-4 opacity-5 transform rotate-12 scale-150 transition-transform group-hover:scale-125 duration-500">
            <Shield size={80} className="text-[#1a73e8]" />
          </div>
          <div className="relative z-10">
            <p className="text-[#5f6368] dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-1">Total Bulletins (30d)</p>
            <h3 className="text-3xl font-black text-[#202124] dark:text-slate-100">{processedData.stats.total}</h3>
            <div className="mt-4 flex items-center text-[#1a73e8] dark:text-[#8ab4f8] text-[10px] font-bold uppercase tracking-widest">
              <Activity size={12} className="mr-1.5" />
              <span>Past 30 Days</span>
            </div>
          </div>
        </div>

        <StatCard 
          label="Critical Severity" 
          value={processedData.stats.critical} 
          icon={ShieldAlert} 
          color="red" 
        />
        <StatCard 
          label="High Severity" 
          value={processedData.stats.high} 
          icon={AlertTriangle} 
          color="orange" 
        />
        <StatCard 
          label="Medium Severity" 
          value={processedData.stats.medium} 
          icon={ShieldCheck} 
          color="yellow" 
        />
      </div>

      {/* Controls */}
      <div className="sticky top-[64px] z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-[#dadce0] dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <div className="mr-2 p-2 bg-[#f1f3f4] dark:bg-slate-800 rounded-xl text-[#5f6368] dark:text-slate-300">
            <Filter size={16} />
          </div>
          {(['All', 'Critical', 'High', 'Medium', 'Low', 'Info'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                severityFilter === sev 
                  ? 'bg-[#1a73e8] text-white shadow-sm' 
                  : 'text-[#5f6368] dark:text-slate-300 hover:bg-[#f1f3f4] dark:hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5f6368] dark:text-slate-300 group-focus-within:text-[#1a73e8] transition-colors" />
          <input 
            type="text" 
            placeholder="Search bulletins, CVEs, products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#f1f3f4] dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] rounded-xl outline-none transition-all text-[13px] font-medium text-[#202124] dark:text-slate-100"
          />
        </div>
      </div>

      {/* Bulletin List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {displayedItems.length > 0 ? (
            displayedItems.map((item, index) => (
              <FeedCard 
                key={item.id} 
                item={item} 
                index={index} 
                onSummarize={onSummarize} 
                isSummarizing={summarizingId === (item.id || item.link)}
                onSave={onSave}
                isSaved={savedPosts.includes(item.link)}
                viewMode="list"
                subscribedCategories={subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.id || item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-[#dadce0] dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-[#f1f3f4] dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} className="text-[#dadce0] dark:text-[#5f6368]" />
              </div>
              <h3 className="text-md font-bold text-[#202124] dark:text-slate-100">No bulletins found</h3>
              <p className="text-[#5f6368] dark:text-slate-300 mt-1 text-[12px]">Try adjusting your filters or search terms.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 text-[#1a73e8] dark:text-blue-400 font-bold rounded-full border border-[#dadce0] dark:border-slate-700 hover:bg-[#f1f3f4] dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 uppercase tracking-widest text-xs"
          >
            <ChevronDown size={16} />
            <span>Load More Bulletins</span>
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors = {
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30',
    yellow: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30',
  };

  const activeColor = colors[color as keyof typeof colors];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#dadce0] dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${activeColor}`}>
          <Icon size={24} />
        </div>
        {/* Decorative background icon */}
        <div className="absolute -bottom-4 -right-4 opacity-5 transform rotate-12 scale-150 transition-transform group-hover:scale-125 duration-500">
           <Icon size={80} className={activeColor.split(' ')[0]} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-[#202124] dark:text-slate-100 mb-1">{value}</h3>
        <p className="text-[10px] font-bold text-[#5f6368] dark:text-slate-300 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};
