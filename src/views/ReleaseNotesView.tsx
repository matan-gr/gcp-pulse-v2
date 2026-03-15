import React, { useMemo, useEffect, useState } from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { AnalysisResult } from '../types';
import { Loader2, SearchX, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { extractGCPProducts } from '../utils';

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

  // Filter items to ONLY include the GCP Release Notes RSS feed
  const releaseNotesItems = useMemo(() => {
    return items.filter(item => item.source === 'Release Notes');
  }, [items]);

  // 1. First, split the release notes into individual announcements and extract products
  const parsedReleaseNotes = useMemo(() => {
    const parsed: FeedItem[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    releaseNotesItems.forEach(item => {
      const date = parseISO(item.isoDate);
      if (date < thirtyDaysAgo) return; // Skip items older than 30 days

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

        parsed.push({
          ...item,
          id: `${item.link}-${index}`,
          content: finalContent,
          contentSnippet: finalContent.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
          title: title,
          categories: allLabels
        });
      });
    });
    return parsed;
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
  const groupedItems = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {};

    parsedReleaseNotes.forEach(item => {
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) return;
      if (selectedCategory !== 'All' && !item.categories?.includes(selectedCategory)) return;

      const date = parseISO(item.isoDate);
      const monthKey = format(date, 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(item);
    });
    return groups;
  }, [parsedReleaseNotes, searchQuery, selectedCategory]);

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-[#202124] dark:text-[#e8eaed] mb-4 tracking-tight">GCP Release Notes</h1>
        <p className="text-lg text-[#5f6368] dark:text-[#9aa0a6]">Stay up-to-date with the latest features and improvements.</p>
      </header>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
        <input
          type="text"
          placeholder="Search release notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-full border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] w-full md:w-64"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-full border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] w-full md:w-48"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} viewMode="list" />
          ))}
        </div>
      ) : Object.keys(sortedGroupedItems).length === 0 ? (
        <EmptyState 
          icon={SearchX}
          title="No release notes found"
          description="No release notes match your current filters or search criteria."
          actionLabel="Clear All Filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory('All'); onClearFilters?.(); }}
        />
      ) : (
        <div className="space-y-12">
          {monthKeys.map(month => (
            <div key={month}>
              <h2 className="text-2xl font-bold text-[#202124] dark:text-[#e8eaed] mb-6 border-b border-[#dadce0] dark:border-[#3c4043] pb-2">{month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedGroupedItems[month].map((item, index) => (
                  <FeedCard 
                    key={`${item.link}-${index}`} 
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
