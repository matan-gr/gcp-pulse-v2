import React, { useMemo } from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { AnalysisResult } from '../types';
import { EmptyState } from '../components/EmptyState';
import { LayoutTemplate, TrendingUp, ShieldAlert, BookOpen, Video, Activity, SearchX } from 'lucide-react';
import { UserPreferences } from '../hooks/useUserPreferences';
import { motion } from 'motion/react';
import { AILoading } from '../components/ui/AILoading';

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
  // Group items by source
  const groupedItems = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {
      'Cloud Blog': [],
      'Product Updates': [],
      'Release Notes': [],
      'Security Bulletins': [],
      'Architecture Center': [],
      'Google Cloud YouTube': [],
      'Other': []
    };

    items.forEach(item => {
      const source = item.source || 'Other';
      if (source.startsWith('Cloud Blog')) {
        groups['Cloud Blog'].push(item);
      } else if (groups[source]) {
        groups[source].push(item);
      } else {
        groups['Other'].push(item);
      }
    });

    return groups;
  }, [items]);

  const heroItem = items[0];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonCard viewMode="grid" /></div>
          <div className="space-y-6"><SkeletonCard viewMode="list" /><SkeletonCard viewMode="list" /></div>
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
    <div className="space-y-12 pb-12">
      {isAiLoading && (
        <div className="flex justify-center mb-8">
          <AILoading variant="minimal" title="AI Analysis in progress..." />
        </div>
      )}

      {/* Hero Section */}
      <section>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-6">
          <TrendingUp size={24} />
          <h2 className="text-2xl font-bold tracking-tight">Top Story</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {heroItem && (
            <div className="w-full">
              <FeedCard 
                item={heroItem} 
                index={0}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === heroItem.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(heroItem.link)}
                viewMode="grid"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[heroItem.link]}
                isPresentationMode={isPresentationMode}
                showImages={true}
              />
            </div>
          )}
        </div>
      </section>

      {/* Cloud Blog & Product Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-6">
            <LayoutTemplate size={20} />
            <h2 className="text-xl font-bold tracking-tight">Cloud Blog</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groupedItems['Cloud Blog'].slice(0, 3).map((item, index) => (
              <FeedCard 
                key={item.link} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode="list"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-6">
            <Activity size={20} />
            <h2 className="text-xl font-bold tracking-tight">Product Updates</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groupedItems['Product Updates'].slice(0, 3).map((item, index) => (
              <FeedCard 
                key={item.link} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode="list"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Security & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-6">
            <ShieldAlert size={20} />
            <h2 className="text-xl font-bold tracking-tight">Security Bulletins</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groupedItems['Security Bulletins'].slice(0, 3).map((item, index) => (
              <FeedCard 
                key={item.link} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode="list"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))}
            {groupedItems['Security Bulletins'].length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No recent security bulletins.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-6">
            <BookOpen size={20} />
            <h2 className="text-xl font-bold tracking-tight">Architecture Center</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groupedItems['Architecture Center'].slice(0, 3).map((item, index) => (
              <FeedCard 
                key={item.link} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode="list"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))}
            {groupedItems['Architecture Center'].length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No recent architecture updates.</p>
            )}
          </div>
        </section>
      </div>

      {/* YouTube & Release Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-6">
            <Video size={20} />
            <h2 className="text-xl font-bold tracking-tight">Google Cloud YouTube</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedItems['Google Cloud YouTube'].slice(0, 2).map((item, index) => (
              <FeedCard 
                key={item.link} 
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
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-6">
            <LayoutTemplate size={20} />
            <h2 className="text-xl font-bold tracking-tight">Release Notes</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groupedItems['Release Notes'].slice(0, 3).map((item, index) => (
              <FeedCard 
                key={item.link} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode="list"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
