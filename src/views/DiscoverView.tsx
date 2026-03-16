import React, { useMemo } from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { AnalysisResult } from '../types';
import { EmptyState } from '../components/EmptyState';
import { SearchX, Sparkles } from 'lucide-react';
import { UserPreferences } from '../hooks/useUserPreferences';
import { AILoading } from '../components/ui/AILoading';
import { extractImage } from '../utils';

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
  search?: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
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
}) => {
  
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
      const image = item.thumbnailUrl || item.enclosure?.url || extractImage(item.content);
      const hasImage = !!image;
      
      return { ...item, hasImage, image };
    });
  }, [items]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} viewMode="grid" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState 
        icon={SearchX}
        title="No updates found"
        description="We couldn't find any recent updates. Please check back later."
        actionLabel="Clear Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-[1700px] mx-auto px-4 sm:px-6">
      {isAiLoading && (
        <div className="flex justify-center mb-4">
          <AILoading variant="minimal" title="AI Analysis in progress..." />
        </div>
      )}

      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
        <Sparkles size={20} className="stroke-[2.5]" />
        <h2 className="text-xl font-bold tracking-tight">Discover</h2>
      </div>

      {/* Uniform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bentoItems.map((item, index) => (
          <FeedCard 
            key={item.id || item.link} 
            item={item} 
            index={index}
            onSummarize={onSummarize}
            isSummarizing={summarizingId === item.link}
            onSave={onSave}
            isSaved={prefs.savedPosts.includes(item.link)}
            viewMode="grid"
            subscribedCategories={prefs.subscribedCategories}
            onToggleSubscription={toggleCategorySubscription}
            onSelectCategory={handleCategoryChange}
            analysis={analyses[item.link]}
            isPresentationMode={isPresentationMode}
            showImages={true}
            density="compact"
            className="col-span-1"
            featured={false}
          />
        ))}
      </div>
    </div>
  );
};
