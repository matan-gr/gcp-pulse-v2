import React, { useMemo, useState } from 'react';
import { FeedItem, AnalysisResult } from '../types';
import { FeedCard } from '../components/FeedCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { SearchX, Sparkles, ChevronDown, RotateCw, HelpCircle } from 'lucide-react';
import { UserPreferences } from '../hooks/useUserPreferences';
import { AILoading } from '../components/ui/AILoading';
import { Tooltip } from '../components/ui/Tooltip';
import { extractImage } from '../utils';

const ITEMS_PER_PAGE = 12;

interface DiscoverViewProps {
  items: FeedItem[];
  loading: boolean;
  prefs: UserPreferences;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  isAiLoading: boolean;
  onToggleColumnVisibility: (column: string) => void;
  onUpdateColumnOrder: (order: string[]) => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  search?: string;
}

export const DiscoverView = React.memo<DiscoverViewProps>(({
  items,
  loading,
  prefs,
  onSummarize,
  summarizingId,
  onSave,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode,
  isAiLoading,
  onClearFilters,
  onRefresh,
}) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const bentoItems = useMemo(() => {
    let imageCount = 0;
    let noImageCount = 0;
    let releaseNotesCount = 0;

    const filteredItems = items.filter(item => {
      if (item.isDeprecation || item.source === 'Product Deprecations' || item.source === 'Security Bulletins') {
        return false;
      }
      if (item.source === 'Release Notes') {
        if (releaseNotesCount >= 3) return false;
        releaseNotesCount++;
      }
      return true;
    });

    return filteredItems.map((item, index) => {
      const image = item.thumbnailUrl || item.enclosure?.url || extractImage(item.content, item.link);
      const hasImage = !!image;
      
      return { ...item, hasImage, image };
    });
  }, [items]);

  const displayedItems = bentoItems.slice(0, visibleCount);
  const hasMore = visibleCount < bentoItems.length;

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} viewMode="grid" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <EmptyState 
          icon={SearchX}
          title="No updates found"
          description="We couldn't find any recent updates. This might be due to active filters or a temporary data issue."
          actionLabel="Clear Filters"
          onAction={onClearFilters}
        />
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-6 py-2 text-[#1a73e8] dark:text-blue-400 font-bold rounded-full border border-[#dadce0] dark:border-[var(--color-border-dark)] hover:bg-[#f8f9fa] dark:hover:bg-[var(--color-bg-app-dark)] transition-all shadow-sm text-xs uppercase tracking-widest"
          >
            <RotateCw size={14} />
            <span>Force Refresh Data</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-[1700px] mx-auto px-4 sm:px-6">
      {isAiLoading && (
        <div className="flex justify-center mb-4">
          <AILoading variant="minimal" title="AI Analysis in progress..." />
        </div>
      )}

      <header className="mb-12">
        <Tooltip content="The Discover feed shows a curated selection of the most important recent updates across all Google Cloud sources." position="right">
          <div className="flex items-center gap-3 mb-4 cursor-help">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Discover</h1>
          </div>
        </Tooltip>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">A curated selection of the most important recent updates, product launches, and technical insights from across the Google Cloud ecosystem.</p>
      </header>

      {/* Uniform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, index) => (
          <FeedCard 
            key={item.id || item.link} 
            item={item} 
            index={index}
            onSummarize={onSummarize}
            isSummarizing={summarizingId === (item.id || item.link)}
            onSave={onSave}
            isSaved={prefs.savedPosts.includes(item.link)}
            viewMode="grid"
            subscribedCategories={prefs.subscribedCategories}
            onToggleSubscription={toggleCategorySubscription}
            onSelectCategory={handleCategoryChange}
            analysis={analyses[item.id || item.link]}
            isPresentationMode={isPresentationMode}
            showImages={true}
            density="compact"
            className="col-span-1"
            featured={false}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-[var(--color-bg-card-dark)] text-[#1a73e8] dark:text-blue-400 font-bold rounded-full border border-[#dadce0] dark:border-[var(--color-border-dark)] hover:bg-[#f8f9fa] dark:hover:bg-[var(--color-bg-app-dark)] transition-all shadow-sm active:scale-95 uppercase tracking-widest text-xs"
          >
            <ChevronDown size={16} />
            <span>Load More Updates</span>
          </button>
        </div>
      )}
    </div>
  );
});
