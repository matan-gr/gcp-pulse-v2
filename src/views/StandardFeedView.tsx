import React from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { AnalysisResult } from '../types';
import { Loader2, SearchX, Sparkles, ChevronDown } from 'lucide-react';
import { AILoading } from '../components/ui/AILoading';

interface StandardFeedViewProps {
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
  isAiLoading?: boolean;
  onClearFilters?: () => void;
  title?: string;
  showImages?: boolean;
  density?: 'comfortable' | 'compact';
}

const ITEMS_PER_PAGE = 12;

export const StandardFeedView: React.FC<StandardFeedViewProps> = ({
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
  isAiLoading,
  onClearFilters,
  title,
  showImages = true,
  density
}) => {
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);

  // Reset visible count when items change
  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [items]);

  const visibleItems = React.useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = visibleCount < items.length;

  return (
    <div className="space-y-6 pb-8 max-w-[1700px] mx-auto px-4 sm:px-6">
      {isAiLoading && (
        <div className="flex justify-center mb-4">
          <AILoading variant="minimal" title="AI Analysis in progress..." />
        </div>
      )}

      {title && (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
          <Sparkles size={20} className="stroke-[2.5]" />
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        </div>
      )}

      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} viewMode={viewMode} />
          ))
        ) : visibleItems.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={SearchX}
              title="No items found"
              description="No items match your current filters or search criteria."
              actionLabel="Clear All Filters"
              onAction={onClearFilters}
            />
          </div>
        ) : (
          <>
            {visibleItems.map((item, index) => (
              <FeedCard 
                key={`${item.link}-${index}`} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === (item.id || item.link)}
                onSave={onSave}
                isSaved={savedPosts.includes(item.link)}
                viewMode={viewMode}
                subscribedCategories={subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.id || item.link]}
                isPresentationMode={isPresentationMode}
                showImages={showImages}
                density={density || (viewMode === 'grid' ? 'compact' : 'comfortable')}
              />
            ))}
          </>
        )}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-[var(--color-bg-card-dark)] text-[#1a73e8] dark:text-blue-400 font-bold rounded-full border border-[#dadce0] dark:border-[var(--color-border-dark)] hover:bg-[#f8f9fa] dark:hover:bg-[var(--color-bg-app-dark)] transition-all shadow-sm active:scale-95 uppercase tracking-widest text-xs"
          >
            <ChevronDown size={16} />
            <span>Load More Updates</span>
          </button>
        </div>
      )}

      {!hasMore && visibleItems.length > 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            You've reached the end of the feed
          </p>
          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
        </div>
      )}
    </div>
  );
};
