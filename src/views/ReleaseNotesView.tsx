import React, { useMemo, useEffect, useState } from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { TimelineSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { AnalysisResult } from '../types';
import { Loader2, SearchX, FileText, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { extractGCPProducts } from '../utils';
import { cn } from '../utils';

const ITEMS_PER_PAGE = 10;

interface ReleaseNotesViewProps {
  items: FeedItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  subscribedCategories: string[];
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  onClearFilters?: () => void;
}

export const ReleaseNotesView: React.FC<ReleaseNotesViewProps> = ({
  items,
  loading,
  viewMode,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  subscribedCategories,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode,
  onClearFilters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Filter items to ONLY include the GCP Release Notes RSS feed
  const releaseNotesItems = useMemo(() => {
    return items.filter(item => item.source === 'Release Notes');
  }, [items]);

  // 1. First, split the release notes into individual announcements and extract products
  const parsedReleaseNotes = useMemo(() => {
    const parsed: FeedItem[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90); // Increased to 90 days for better history

    releaseNotesItems.forEach(item => {
      const date = parseISO(item.isoDate);
      if (date < ninetyDaysAgo) return; 

      // Robust split: look for h1, h2, or h3 tags to separate announcements
      const splitContent = item.content.split(/<h[1-3][^>]*>/i);
      
      splitContent.forEach((contentPart, index) => {
        if (index === 0 && !item.content.match(/<h[1-3][^>]*>/i)) {
            const detectedProducts = extractGCPProducts(item.title + " " + item.content);
            const allLabels = Array.from(new Set([...detectedProducts, ...(item.categories || [])]));
            parsed.push({
              ...item,
              categories: allLabels
            });
            return;
        }
        if (index === 0) return; // Skip intro part if headers exist
        
        const announcementContent = contentPart.split(/<\/h[1-3]>/i)[1] || "";
        const title = contentPart.split(/<\/h[1-3]>/i)[0] || item.title;
        
        // Ensure content is not empty, fallback to title or snippet
        const finalContent = announcementContent.trim() || item.contentSnippet || title;
        
        // Filter out items that are too short (e.g., less than 50 characters)
        if (finalContent.replace(/<[^>]*>/g, "").length < 50) return;
        
        const detectedProducts = extractGCPProducts(title + " " + finalContent);
        const allLabels = Array.from(new Set([...detectedProducts, ...(item.categories || [])]));

        // Categorization logic
        let categoryType: 'New Feature' | 'Security' | 'Deprecation' | 'General' = 'General';
        const lowerTitle = title.toLowerCase();
        const lowerContent = finalContent.toLowerCase();
        if (lowerTitle.includes('security') || lowerContent.includes('security') || lowerTitle.includes('vulnerability') || lowerContent.includes('vulnerability')) {
          categoryType = 'Security';
        } else if (lowerTitle.includes('deprecation') || lowerContent.includes('deprecation') || lowerTitle.includes('deprecated') || lowerContent.includes('deprecated')) {
          categoryType = 'Deprecation';
        } else if (lowerTitle.includes('new') || lowerTitle.includes('feature') || lowerTitle.includes('launch') || lowerContent.includes('new') || lowerContent.includes('feature')) {
          categoryType = 'New Feature';
        }

        parsed.push({
          ...item,
          id: `${item.link}-${index}`,
          content: finalContent,
          contentSnippet: finalContent.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
          title: title,
          categories: allLabels,
          categoryType
        });
      });
    });
    return parsed.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
  }, [releaseNotesItems]);

  // 2. Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    parsedReleaseNotes.forEach(item => {
      item.categories?.forEach(cat => cats.add(cat));
    });
    return ['All', ...Array.from(cats).sort()];
  }, [parsedReleaseNotes]);

  // 3. Group items by month and filter
  const filteredItems = useMemo(() => {
    return parsedReleaseNotes.filter(item => {
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'All' && !item.categories?.includes(selectedCategory)) return false;
      return true;
    });
  }, [parsedReleaseNotes, searchQuery, selectedCategory]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  const groupedItems = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {};

    displayedItems.forEach(item => {
      const date = parseISO(item.isoDate);
      const monthKey = format(date, 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(item);
    });
    return groups;
  }, [displayedItems]);

  // Sort items within each month by date (descending)
  const sortedGroupedItems = useMemo(() => {
    const sorted: Record<string, FeedItem[]> = {};
    Object.keys(groupedItems).forEach(month => {
      sorted[month] = [...groupedItems[month]].sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
    });
    return sorted;
  }, [groupedItems]);

  const monthKeys = Object.keys(sortedGroupedItems).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <FileText size={24} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Release Notes</h1>
        </div>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">Stay up-to-date with the latest features, improvements, and changes across Google Cloud Platform.</p>
      </header>

      {/* Enhanced Filters */}
      <div className="mb-10 flex flex-col gap-4 bg-white dark:bg-[#1a1b1e] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            aria-label="Search release notes"
            placeholder="Search features, products, or changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              aria-label={`Filter by category ${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-12">
          {[1, 2, 3].map((i) => (
            <TimelineSkeleton key={i} />
          ))}
        </div>
      ) : Object.keys(sortedGroupedItems).length === 0 ? (
        <EmptyState 
          icon={SearchX}
          title="No release notes found"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear All Filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory('All'); onClearFilters?.(); }}
        />
      ) : (
        <div className="space-y-16">
          {monthKeys.map(month => (
            <section key={month} className="relative pl-10 border-l-[3px] border-slate-300 dark:border-slate-700" aria-labelledby={`month-${month.replace(' ', '-')}`}>
              <div className="absolute -left-[11.5px] top-1 w-6 h-6 rounded-full bg-blue-600 border-4 border-white dark:border-[#1a1b1e] shadow-lg shadow-blue-500/30" />
              <h2 id={`month-${month.replace(' ', '-')}`} className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">{month}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sortedGroupedItems[month].map((item, index) => (
                  <article key={`${item.link}-${index}`}>
                    <FeedCard 
                      item={item} 
                      index={index}
                      onSummarize={onSummarize}
                      isSummarizing={summarizingId === item.link}
                      onSave={onSave}
                      isSaved={savedPosts.includes(item.link)}
                      viewMode="list"
                      subscribedCategories={subscribedCategories}
                      onToggleSubscription={toggleCategorySubscription}
                      onSelectCategory={handleCategoryChange}
                      analysis={analyses[item.link]}
                      isPresentationMode={isPresentationMode}
                    />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center pt-12 pb-8">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-[#1a1b1e] text-blue-600 dark:text-blue-400 font-bold rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm active:scale-95 uppercase tracking-widest text-xs"
          >
            <ChevronDown size={16} />
            <span>Load More Announcements</span>
          </button>
        </div>
      )}
    </div>
  );
};
