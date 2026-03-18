
import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useFeed, useProductDeprecations, useSecurityBulletins, useArchitectureUpdates, useIncidents, useYouTubeFeed, fetchFeed } from './hooks/useFeed';
import { Toaster } from './components/ui/Toaster';
import { FeedItem } from './types';
import { useDebounce } from './hooks/useDebounce';
import { useUserPreferences } from './hooks/useUserPreferences';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useSummarizer } from './hooks/useSummarizer';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SummaryModal } from './components/SummaryModal';
import { PageLoader } from './components/ui/PageLoader';
import { getAiInstance } from './services/geminiService';
import { lazyWithRetry } from './hooks/useLazyWithRetry';
import { WeeklyBriefProvider } from './contexts/WeeklyBriefContext';
import { Newspaper, Zap } from 'lucide-react';

// Layout & Navigation
import { AppLayout } from './components/layout/AppLayout';

// Lazy Loaded Views
const DiscoverView = lazyWithRetry(() => import('./views/DiscoverView').then(module => ({ default: module.DiscoverView })));
const ProductDeprecationsView = lazyWithRetry(() => import('./views/ProductDeprecationsView').then(module => ({ default: module.ProductDeprecationsView })));
const ArchitectureView = lazyWithRetry(() => import('./views/ArchitectureView').then(module => ({ default: module.ArchitectureView })));
const StandardFeedView = lazyWithRetry(() => import('./views/StandardFeedView').then(module => ({ default: module.StandardFeedView })));
const SavedView = lazyWithRetry(() => import('./views/SavedView').then(module => ({ default: module.SavedView })));
const IncidentsView = lazyWithRetry(() => import('./views/IncidentsView').then(module => ({ default: module.IncidentsView })));
const SecurityView = lazyWithRetry(() => import('./views/SecurityView').then(module => ({ default: module.SecurityView })));
const ReleaseNotesView = lazyWithRetry(() => import('./views/ReleaseNotesView').then(module => ({ default: module.ReleaseNotesView })));
const WeeklyBriefView = lazyWithRetry(() => import('./views/WeeklyBriefView').then(module => ({ default: module.WeeklyBriefView })));
const ToolsView = lazyWithRetry(() => import('./views/ToolsView').then(module => ({ default: module.ToolsView })));
const YouTubeView = lazyWithRetry(() => import('./views/YouTubeView').then(module => ({ default: module.YouTubeView })));

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // UI State
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'all';
    const tab = path.substring(1);
    const validTabs = ['all', 'saved', 'incidents', 'deprecations', 'security', 'architecture', 'tools', 'weekly-brief', 'youtube', 'cloud-blog', 'release-notes', 'updates'];
    if (validTabs.includes(tab)) return tab as any;
    return 'all';
  }, [location.pathname]);

  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Fetching with React Query
  const { data: feed, isLoading: feedLoading, error: queryError, refetch: refetchFeed, isRefetching: feedRefetching } = useFeed();
  
  const handleForceRefresh = useCallback(async () => {
    try {
      toast.loading("Refreshing feed...", { id: 'force-refresh' });
      await queryClient.fetchQuery({
        queryKey: ['feed'],
        queryFn: () => fetchFeed(true),
      });
      toast.success("Feed refreshed successfully", { id: 'force-refresh' });
    } catch (e) {
      console.error("Force Refresh Error:", e);
      toast.error("Failed to refresh feed", { id: 'force-refresh' });
    }
  }, []);
  const { data: deprecations, isLoading: deprecationsLoading, error: deprecationsError } = useProductDeprecations();
  const { data: securityBulletins, isLoading: securityLoading, error: securityError } = useSecurityBulletins();
  const { data: architectureUpdates, isLoading: architectureLoading, error: architectureError } = useArchitectureUpdates();
  const { data: incidents, isLoading: incidentsLoading, error: incidentsError } = useIncidents();
  const { data: youtubeFeed, isLoading: youtubeLoading, error: youtubeError } = useYouTubeFeed();
  
  const loading = feedLoading || (activeTab === 'architecture' && architectureLoading) || (activeTab === 'incidents' && incidentsLoading) || (activeTab === 'deprecations' && deprecationsLoading) || (activeTab === 'youtube' && youtubeLoading); // Main loading state

  // Custom Hooks
  const { prefs, updatePrefs, toggleCategorySubscription, toggleSavedPost, clearSavedPosts } = useUserPreferences();
  const { summarizingId, analyses, summaryModal, handleSummarize, closeSummaryModal } = useSummarizer();

  const handleSetActiveTab = (tab: any) => {
    if (tab === 'all') navigate('/');
    else navigate(`/${tab}`);
  };

  // Feed Update Toast
  const prevRefetching = useRef(false);
  useEffect(() => {
    if (prevRefetching.current && !feedRefetching && !queryError) {
      toast.success("Feed updated", {
        description: "Latest intelligence and updates have been loaded.",
      });
    }
    prevRefetching.current = feedRefetching;
  }, [feedRefetching, queryError]);

  // Error Handling
  useEffect(() => {
    if (queryError) {
      toast.error("Critical: Failed to load feed updates", { 
        description: "The main intelligence engine is unreachable. Please check your connection.",
        duration: 8000
      });
    }
    
    // Check for partial feed errors
    if (feed?.errors && feed.errors.length > 0) {
      const errorCount = feed.errors.length;
      toast.warning(`${errorCount} feed sources failed to load`, {
        description: "Some updates might be missing. Click 'Help' to see troubleshooting steps.",
        action: {
          label: "View Errors",
          onClick: () => {
            console.table(feed.errors);
            toast.info("Technical details logged to console", {
              description: "Report these to matangr@google.com if they persist."
            });
          }
        },
        duration: 10000
      });
      
      // Simulated notification to matangr@google.com
      console.log(`[MONITORING] Reporting ${errorCount} feed failures to matangr@google.com`);
    }

    if (deprecationsError) toast.error("Failed to load product deprecations");
    if (architectureError) toast.error("Failed to load architecture updates");
    if (incidentsError) toast.error("Failed to load incidents");
  }, [queryError, deprecationsError, architectureError, incidentsError, feed?.errors]);

  // Search & Filter State
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});
  const search = searchMap[activeTab] || '';
  const setSearch = (val: string) => setSearchMap(prev => ({ ...prev, [activeTab]: val }));
  const [isSmartFilter, setIsSmartFilter] = useState(false);
  const [smartIndices, setSmartIndices] = useState<number[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [smartFilterSearch, setSmartFilterSearch] = useState('');
  
  // Use prefs for persistence
  const selectedCategories = prefs.filterCategories;
  const filterType = prefs.filterType;
  const dateRange = prefs.filterDateRange;
  const sortBy = prefs.sortBy;
  const sortDirection = prefs.sortDirection;
  
  const handleCategoryChange = useCallback((category: string) => {
    const current = prefs.filterCategories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updatePrefs({ filterCategories: updated });
  }, [prefs.filterCategories, updatePrefs]);

  const handleFilterTypeChange = useCallback((type: 'include' | 'exclude') => {
    updatePrefs({ filterType: type });
  }, [updatePrefs]);

  const handleDateRangeChange = useCallback((range: { start: string; end: string } | null) => {
    updatePrefs({ filterDateRange: range });
    if (range) toast.success("Date filter applied", { description: `Showing items from ${range.start} to ${range.end}.` });
    else toast.info("Date filter cleared", { description: "Showing items from all dates." });
  }, [updatePrefs]);

  const handleSortChange = useCallback((sortBy: 'date' | 'category', sortDirection: 'asc' | 'desc') => {
    updatePrefs({ sortBy, sortDirection });
  }, [updatePrefs]);

  const clearAllFilters = useCallback(() => {
    setSearchMap(prev => ({ ...prev, [activeTab]: '' }));
    setIsSmartFilter(false);
    updatePrefs({ 
      filterCategories: [], 
      filterDateRange: null 
    });
    toast.info("All filters cleared", { description: "Showing all available items." });
  }, [updatePrefs, activeTab]);

  const isAnyFilterActive = useMemo(() => {
    return search.length > 0 || selectedCategories.length > 0 || dateRange !== null || isSmartFilter;
  }, [search, selectedCategories, dateRange, isSmartFilter]);

  const debouncedSearch = useDebounce(search, 800);

  useEffect(() => {
    if (!isSmartFilter) return;
    const timer = setTimeout(() => {
      setSmartFilterSearch(search);
    }, 1500); // Longer debounce for AI filter to save quota
    return () => clearTimeout(timer);
  }, [search, isSmartFilter]);

  // Merge items for filtering and display
  const allItems = useMemo(() => {
    const itemMap = new Map<string, FeedItem>();

    // 1. Add raw feed items first
    (feed?.items || []).forEach(item => itemMap.set(item.id, item));

    // 2. Overlay specialized items (they have enhanced metadata/categories)
    (deprecations || []).forEach(item => itemMap.set(item.id, item));
    (securityBulletins || []).forEach(item => itemMap.set(item.id, item));
    (architectureUpdates || []).forEach(item => itemMap.set(item.id, item));
    (youtubeFeed || []).forEach(item => itemMap.set(item.id, item));

    // 3. Add incidents (distinct source)
    (incidents || []).forEach(item => itemMap.set(item.id, item));

    return Array.from(itemMap.values()).sort((a, b) => {
      // Prioritize active incidents
      const aActive = !!a.isActive;
      const bActive = !!b.isActive;
      
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      const timeA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
      const timeB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
      
      const validA = !isNaN(timeA) && timeA !== 0;
      const validB = !isNaN(timeB) && timeB !== 0;
      
      if (validA && validB) return timeB - timeA;
      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      return 0;
    });
  }, [feed, deprecations, securityBulletins, architectureUpdates, incidents, youtubeFeed]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allItems.forEach(item => item.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [allItems]);

  // Smart Filter Logic
  useEffect(() => {
    if (!isSmartFilter || !smartFilterSearch || allItems.length === 0) {
      setSmartIndices(null);
      return;
    }

    const fetchSmartFilter = async () => {
      setIsAiLoading(true);
      try {
        const itemsSummary = allItems.map((item, index) => ({
          index,
          title: item.title,
          snippet: item.contentSnippet?.slice(0, 200) || ""
        }));

        const prompt = `
          You are a helpful assistant filtering a blog feed.
          User Query: "${smartFilterSearch}"
          Here are the blog posts: ${JSON.stringify(itemsSummary)}
          Return a JSON array of the indices (integers) of the posts that are most relevant to the user's query.
        `;

        const ai = getAiInstance();
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const aiResponseText = response.text || "";
        const indices = (aiResponseText && aiResponseText.trim()) ? JSON.parse(aiResponseText) : [];
        
        setSmartIndices(indices);
        indices.length === 0 
          ? toast.info("No AI matches found", { description: "Try adjusting your search query." }) 
          : toast.success(`AI found ${indices.length} articles`, { description: "Showing the most relevant results." });
      } catch (e: any) {
        console.error("AI Filter Error:", e);
        if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED') || e.message?.includes('Rate exceeded') || e.message?.includes('quota')) {
           toast.error("AI Quota Exceeded", { description: "Please try again later." });
        } else {
           toast.error("AI filtering failed", { description: "An error occurred while analyzing the articles." });
        }
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchSmartFilter();
  }, [smartFilterSearch, isSmartFilter, allItems]);

  // Filter Items
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (activeTab === 'saved') items = items.filter(item => prefs.savedPosts.includes(item.link));
    else if (activeTab === 'incidents') items = items.filter(item => item.source === 'Service Health');
    else if (activeTab === 'deprecations') items = items.filter(item => item.source === 'Product Deprecations');
    else if (activeTab === 'security') items = items.filter(item => item.source === 'Security Bulletins');
    else if (activeTab === 'architecture') items = items.filter(item => item.source === 'Architecture Center');
    else if (activeTab === 'youtube') items = items.filter(item => item.source === 'Google Cloud YouTube');
    else if (activeTab === 'cloud-blog') {
      // Relaxed date filter to 180 days to avoid "zero results"
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
      items = items.filter(item => 
        ((item.source || '').startsWith('Cloud Blog') || item.source === 'Medium Blog') &&
        new Date(item.isoDate).getTime() >= sixMonthsAgo.getTime()
      );
    }
    else if (activeTab === 'release-notes') items = items.filter(item => item.source === 'Release Notes' || item.source === 'Gemini Enterprise');
    else if (activeTab === 'updates') items = items.filter(item => item.source === 'Product Updates' || item.source === 'Google AI Research');

    if (isSmartFilter && smartIndices !== null) {
      const smartItems = smartIndices.map(i => allItems[i]).filter(Boolean);
      const smartLinks = new Set(smartItems.map(i => i.link));
      items = items.filter(item => smartLinks.has(item.link));
    } else if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.contentSnippet?.toLowerCase().includes(lowerSearch) ||
        item.categories?.some(cat => cat.toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedCategories.length > 0) {
      if (filterType === 'exclude') {
        items = items.filter(item => 
          !item.categories?.some(cat => selectedCategories.includes(cat))
        );
      } else {
        items = items.filter(item => 
          item.categories?.some(cat => selectedCategories.includes(cat))
        );
      }
    }

    if (dateRange?.start) {
      const start = new Date(dateRange.start).getTime();
      items = items.filter(item => new Date(item.isoDate).getTime() >= start);
    }
    if (dateRange?.end) {
      const end = new Date(dateRange.end).getTime();
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      items = items.filter(item => new Date(item.isoDate).getTime() < endDate.getTime());
    }

    // Sorting
    const sortedItems = [...items];
    
    // Force date descending for Updates & Innovation page as requested
    // This ensures Product Updates and Google AI Research are interleaved by date
    const isUpdatesTab = activeTab === 'updates';
    const effectiveSortBy = isUpdatesTab ? 'date' : sortBy;
    const effectiveSortDirection = isUpdatesTab ? 'desc' : sortDirection;

    if (effectiveSortBy === 'date') {
      sortedItems.sort((a, b) => {
        const timeA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const timeB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        const validA = !isNaN(timeA) && timeA !== 0;
        const validB = !isNaN(timeB) && timeB !== 0;
        
        if (validA && validB) {
          return effectiveSortDirection === 'asc' ? timeA - timeB : timeB - timeA;
        }
        if (validA && !validB) return -1;
        if (!validA && validB) return 1;
        return 0;
      });
    } else if (effectiveSortBy === 'category') {
      sortedItems.sort((a, b) => {
        const catA = a.categories?.[0] || '';
        const catB = b.categories?.[0] || '';
        return effectiveSortDirection === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
      });
    }

    return sortedItems;
  }, [allItems, debouncedSearch, isSmartFilter, smartIndices, selectedCategories, filterType, dateRange, activeTab, prefs.savedPosts, sortBy, sortDirection]);

  const handleExportCSV = useCallback(() => {
    if (filteredItems.length === 0) {
      toast.error("No items to export", { description: "Please adjust your filters and try again." });
      return;
    }

    const headers = ["Date", "Title", "Category", "Link", "Source"];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(item => {
        const date = new Date(item.isoDate).toLocaleDateString();
        const title = `"${item.title.replace(/"/g, '""')}"`;
        const category = `"${(item.categories || []).join("; ")}"`;
        return [date, title, category, item.link, item.source].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gcp_pulse_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredItems.length} items to CSV`, { description: "Your download should begin shortly." });
  }, [filteredItems]);

  const handleSave = useCallback((item: FeedItem) => {
    toggleSavedPost(item.link);
  }, [toggleSavedPost]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }
      
      // Tab switching with Cmd/Ctrl + Number
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') handleSetActiveTab('weekly-brief');
        if (e.key === '2') handleSetActiveTab('all');
        if (e.key === '3') handleSetActiveTab('incidents');
        if (e.key === '4') handleSetActiveTab('security');
        if (e.key === '5') handleSetActiveTab('deprecations');
        if (e.key === '6') handleSetActiveTab('architecture');
        if (e.key === '7') handleSetActiveTab('youtube');
        if (e.key === '8') handleSetActiveTab('saved');
        if (e.key === '9') handleSetActiveTab('tools');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSetActiveTab]);

  if (queryError) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6">
            <ErrorDisplay 
              title="Intelligence Engine Offline"
              message="The platform is currently unable to reach the GCP intelligence feeds. This could be due to a network interruption or a temporary service outage." 
              details={queryError instanceof Error ? queryError.stack || queryError.message : String(queryError)}
              onRetry={() => refetchFeed()} 
            />
        </div>
    );
  }

    return (
    <WeeklyBriefProvider items={allItems}>
      <AppLayout
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        isPresentationMode={isPresentationMode}
        setIsPresentationMode={setIsPresentationMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        search={search}
        setSearch={setSearch}
        isSmartFilter={isSmartFilter}
        setIsSmartFilter={setIsSmartFilter}
        isAiLoading={isAiLoading}
        categories={categories}
        selectedCategories={selectedCategories}
        filterType={filterType}
        handleCategoryChange={handleCategoryChange}
        handleFilterTypeChange={handleFilterTypeChange}
        dateRange={dateRange}
        handleDateRangeChange={handleDateRangeChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        handleSortChange={handleSortChange}
        viewMode={prefs.viewMode}
        onViewModeChange={(mode) => updatePrefs({ viewMode: mode })}
        onExportCSV={handleExportCSV}
        isAnyFilterActive={isAnyFilterActive}
        onClearFilters={clearAllFilters}
        onRefresh={handleForceRefresh}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<PageLoader />}>
              {loading && allItems.length === 0 && location.pathname !== '/weekly-brief' ? (
                <PageLoader />
              ) : (
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <ErrorBoundary componentName="DiscoverView">
                    <DiscoverView
                      items={filteredItems}
                      loading={loading}
                      prefs={prefs}
                      onSummarize={handleSummarize}
                      summarizingId={summarizingId}
                      onSave={handleSave}
                      toggleCategorySubscription={toggleCategorySubscription}
                      handleCategoryChange={handleCategoryChange}
                      analyses={analyses}
                      isPresentationMode={isPresentationMode}
                      isAiLoading={isAiLoading}
                      onToggleColumnVisibility={(column) => {
                        const isHidden = prefs.hiddenColumns.includes(column);
                        updatePrefs({
                          hiddenColumns: isHidden 
                            ? prefs.hiddenColumns.filter(c => c !== column)
                            : [...prefs.hiddenColumns, column]
                        });
                      }}
                      onUpdateColumnOrder={(order) => updatePrefs({ columnOrder: order })}
                      onClearFilters={clearAllFilters}
                      onRefresh={handleForceRefresh}
                      search={search}
                    />
                  </ErrorBoundary>
                } />
                <Route path="/weekly-brief" element={<WeeklyBriefView items={allItems} />} />
                <Route path="/youtube" element={<YouTubeView items={filteredItems} loading={youtubeLoading} onClearFilters={clearAllFilters} />} />
                <Route path="/cloud-blog" element={
                  <StandardFeedView
                    items={filteredItems}
                    loading={loading}
                    viewMode={prefs.viewMode}
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                    onSave={handleSave}
                    savedPosts={prefs.savedPosts}
                    subscribedCategories={prefs.subscribedCategories}
                    toggleCategorySubscription={toggleCategorySubscription}
                    handleCategoryChange={handleCategoryChange}
                    analyses={analyses}
                    isPresentationMode={isPresentationMode}
                    isAiLoading={isAiLoading}
                    onClearFilters={clearAllFilters}
                    onRefresh={handleForceRefresh}
                    title="Google Cloud Blog"
                    description="Deep dives, technical tutorials, and strategic insights from Google Cloud experts and the developer community."
                    icon={Newspaper}
                    tooltip="Official Google Cloud and Medium blog posts."
                  />
                } />
                <Route path="/release-notes" element={
                  <ReleaseNotesView
                    items={filteredItems}
                    loading={loading}
                    viewMode={prefs.viewMode}
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                    onSave={handleSave}
                    savedPosts={prefs.savedPosts}
                    subscribedCategories={prefs.subscribedCategories}
                    toggleCategorySubscription={toggleCategorySubscription}
                    handleCategoryChange={handleCategoryChange}
                    analyses={analyses}
                    isPresentationMode={isPresentationMode}
                    onClearFilters={clearAllFilters}
                    onRefresh={handleForceRefresh}
                  />
                } />
                <Route path="/updates" element={
                  <StandardFeedView
                    items={filteredItems}
                    loading={loading}
                    viewMode={prefs.viewMode}
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                    onSave={handleSave}
                    savedPosts={prefs.savedPosts}
                    subscribedCategories={prefs.subscribedCategories}
                    toggleCategorySubscription={toggleCategorySubscription}
                    handleCategoryChange={handleCategoryChange}
                    analyses={analyses}
                    isPresentationMode={isPresentationMode}
                    isAiLoading={isAiLoading}
                    onClearFilters={clearAllFilters}
                    title="Product Updates & Research"
                    description="The latest product announcements, feature launches, and cutting-edge research from Google AI and Cloud teams."
                    icon={Zap}
                    tooltip="Interleaved feed of Product Updates and Google AI Research."
                  />
                } />
                <Route path="/incidents" element={<IncidentsView items={filteredItems} loading={loading} />} />
                <Route path="/saved" element={
                  <SavedView
                    items={filteredItems}
                    loading={loading}
                    viewMode={prefs.viewMode}
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                    onSave={handleSave}
                    savedPosts={prefs.savedPosts}
                    subscribedCategories={prefs.subscribedCategories}
                    toggleCategorySubscription={toggleCategorySubscription}
                    handleCategoryChange={handleCategoryChange}
                    analyses={analyses}
                    isPresentationMode={isPresentationMode}
                    onClearAll={clearSavedPosts}
                    onExplore={() => handleSetActiveTab('all')}
                  />
                } />
                <Route path="/tools" element={<ToolsView />} />
                <Route path="/deprecations" element={
                  <ProductDeprecationsView 
                    items={filteredItems} 
                    loading={deprecationsLoading} 
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                  />
                } />
                <Route path="/architecture" element={
                  <ArchitectureView 
                    items={filteredItems} 
                    loading={architectureLoading}
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                    onSave={handleSave}
                    savedPosts={prefs.savedPosts}
                    isPresentationMode={isPresentationMode}
                  />
                } />
                <Route path="/security" element={
                  <SecurityView 
                    items={filteredItems} 
                    loading={securityLoading}
                    onSummarize={handleSummarize}
                    summarizingId={summarizingId}
                    onSave={handleSave}
                    savedPosts={prefs.savedPosts}
                    subscribedCategories={prefs.subscribedCategories}
                    toggleCategorySubscription={toggleCategorySubscription}
                    handleCategoryChange={handleCategoryChange}
                    analyses={analyses}
                    isPresentationMode={isPresentationMode}
                  />
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
  
        {summaryModal && (
          <SummaryModal 
            isOpen={summaryModal.isOpen}
            onClose={closeSummaryModal}
            title={summaryModal.title}
            analysis={summaryModal.analysis}
            streamContent={summaryModal.streamContent}
            isStreaming={summaryModal.isStreaming}
            model="gemini-3.1-flash-lite-preview"
          />
        )}
      </AppLayout>
    </WeeklyBriefProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
