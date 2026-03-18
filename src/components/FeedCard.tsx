import React, { useState, useMemo, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedItem } from '../types';
import { extractImage, extractGCPProducts, cn, getCategoryColor, getCategoryStyles } from '../utils';
import { Tag, ExternalLink, Sparkles, Bookmark, Loader2, Check, AlertOctagon, Activity, Box, Link as LinkIcon, ChevronDown, ChevronUp, Clock, ArrowRight, Play, Youtube, TrendingUp, BookOpen, Zap, FileText, Shield, Layout, Cpu, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { format, differenceInDays } from 'date-fns';

import { AnalysisResult } from '../types';
import { AIInsightCard } from './AIInsightCard';
import { Tooltip } from './ui/Tooltip';
import { ErrorBoundary } from './ErrorBoundary';
import { useFeedCardLogic } from '../hooks/useFeedCardLogic';

interface FeedCardProps {
  item: FeedItem;
  index: number;
  onSummarize: (item: FeedItem) => void;
  isSummarizing: boolean;
  onSave: (item: FeedItem) => void;
  isSaved: boolean;
  viewMode: 'grid' | 'list';
  subscribedCategories: string[];
  onToggleSubscription: (category: string) => void;
  onSelectCategory?: (category: string) => void;
  analysis?: AnalysisResult;
  isPresentationMode?: boolean;
  density?: 'comfortable' | 'compact';
  showImages?: boolean;
  className?: string;
  featured?: boolean;
}

const markdownComponents = {
  a: ({node, ...props}: any) => <a {...props} className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />,
  img: () => null, // Hide images in markdown to prevent double images
  p: ({node, ...props}: any) => <p {...props} className="mb-2 last:mb-0" />,
  table: ({node, ...props}: any) => <div className="overflow-x-auto"><table {...props} className="min-w-full" /></div>,
};

export const FeedCard = React.memo<FeedCardProps>((props) => {
  const { item, className } = props;
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '400px 0px',
  });

  return (
    <div ref={ref} className={cn("min-h-[100px] h-full", className)}>
      {inView ? (
        <ErrorBoundary componentName={`FeedCard-${item.title}`}>
          <FeedCardContent {...props} />
        </ErrorBoundary>
      ) : (
        <div className="w-full h-64 bg-white dark:bg-[var(--color-bg-card-dark)] rounded-xl border border-slate-200 dark:border-[var(--color-border-dark)] shadow-sm p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div className="w-24 h-6 bg-slate-100 dark:bg-[var(--color-border-dark)] rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-slate-100 dark:bg-[var(--color-border-dark)] rounded animate-pulse" />
            </div>
            <div className="w-3/4 h-6 bg-slate-100 dark:bg-[var(--color-border-dark)] rounded animate-pulse" />
            <div className="space-y-2">
                <div className="w-full h-4 bg-slate-100 dark:bg-[var(--color-border-dark)] rounded animate-pulse" />
                <div className="w-full h-4 bg-slate-100 dark:bg-[var(--color-border-dark)] rounded animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-100 dark:bg-[var(--color-border-dark)] rounded animate-pulse" />
            </div>
        </div>
      )}
    </div>
  );
});

const FeedCardContent = React.memo<FeedCardProps>(({ 
  item, 
  index, 
  onSummarize, 
  isSummarizing, 
  onSave, 
  isSaved, 
  viewMode, 
  subscribedCategories, 
  onToggleSubscription, 
  onSelectCategory, 
  analysis, 
  isPresentationMode = false, 
  density = 'comfortable', 
  showImages = true,
  className,
  featured = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    image,
    readingTime,
    isNew,
    isTrending,
    isIncident,
    isDeprecation,
    isSecurityBulletin,
    daysUntilEOL,
    urgencyColor,
    displayLabels,
    status,
    statusColor,
    cardBorder,
    iconColor
  } = useFeedCardLogic(item, analysis);

  const dateObj = useMemo(() => new Date(item.isoDate), [item.isoDate]);
  const date = useMemo(() => format(dateObj, 'MMM d'), [dateObj]);

  const isCompact = density === 'compact' || isSecurityBulletin;
  const isListView = viewMode === 'list' && !isPresentationMode;

  const handleCopyLink = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.link);
    toast.success("Link copied to clipboard", { description: "You can now share this article." });
  }, [item.link]);

  const getSourceStyles = useMemo(() => (source: string) => {
    if (source.startsWith('Cloud Blog')) return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    if (source === 'Medium Blog') return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    switch (source) {
      case 'Product Updates': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Updates and Innovation': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Release Notes': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'Security Bulletins': return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      case 'Architecture Center': return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
      case 'Google AI Research':
      case 'Gemini Enterprise': return 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20';
      case 'Product Deprecations': return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'Google Cloud YouTube': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  }, []);

  const SourceIcon = useCallback(({ source, size = 10 }: { source: string, size?: number }) => {
    if (source.startsWith('Cloud Blog')) return <BookOpen size={size} />;
    if (source === 'Medium Blog') return <BookOpen size={size} />;
    switch (source) {
      case 'Product Updates':
      case 'Updates and Innovation': return <Zap size={size} />;
      case 'Release Notes': return <FileText size={size} />;
      case 'Security Bulletins': return <Shield size={size} />;
      case 'Architecture Center': return <Layout size={size} />;
      case 'Google AI Research': return <Cpu size={size} />;
      case 'Gemini Enterprise': return <Sparkles size={size} />;
      case 'Product Deprecations': return <AlertTriangle size={size} />;
      case 'Google Cloud YouTube': return <Youtube size={size} />;
      default: return <Tag size={size} />;
    }
  }, []);

  const getBorderColor = useMemo(() => (source: string) => {
    if (source.startsWith('Cloud Blog')) return 'border-l-blue-500';
    if (source === 'Medium Blog') return 'border-l-slate-800 dark:border-l-slate-400';
    switch (source) {
      case 'Product Updates': return 'border-l-emerald-500';
      case 'Release Notes': return 'border-l-blue-500';
      case 'Security Bulletins': return 'border-l-rose-500';
      case 'Architecture Center': return 'border-l-orange-500';
      case 'Google AI Research': return 'border-l-blue-500';
      case 'Gemini Enterprise': return 'border-l-fuchsia-500';
      case 'Product Deprecations': return 'border-l-amber-500';
      case 'Google Cloud YouTube': return 'border-l-red-500';
      default: return 'border-l-transparent';
    }
  }, []);

  // Incident Card Design
  if (isIncident) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-3xl shadow-sm border ${cardBorder} dark:border-[var(--color-border-dark)] flex flex-col relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white dark:bg-[var(--color-bg-card-dark)] ${isPresentationMode ? 'scale-105 shadow-xl' : ''}`}
      >
        {/* Status Header */}
        <div className={`px-5 py-3 border-b ${cardBorder} dark:border-[var(--color-border-dark)] ${status === 'Resolved' ? 'bg-emerald-50 dark:bg-emerald-500/10' : status === 'Monitoring' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-rose-50 dark:bg-rose-500/10'} flex justify-between items-center`}>
           <div className="flex items-center space-x-2">
              {status === 'Resolved' ? <Check size={14} className={iconColor} /> : <AlertOctagon size={14} className={iconColor} />}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${iconColor}`}>
                {status}
              </span>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 dark:text-[var(--color-text-muted-dark)] font-medium flex items-center">
                <Clock size={12} className="mr-1.5" />
                {new Date(item.isoDate).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[var(--color-text-muted-dark)] font-medium flex items-center">
                <BookOpen size={12} className="mr-1.5" />
                {readingTime}
              </span>
           </div>
        </div>

        <div className={`${isCompact ? 'p-4' : 'p-5 sm:p-6'} flex flex-col flex-1 relative`}>
          {item.serviceName && (
            <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                <Box size={12} className="mr-1.5" />
                {item.serviceName}
              </span>
              {item.categoryType && (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                  item.categoryType === 'Security' ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800" :
                  item.categoryType === 'Deprecation' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" :
                  item.categoryType === 'New Feature' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" :
                  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                )}>
                  {item.categoryType === 'Security' && <ShieldAlert size={12} className="mr-1.5" />}
                  {item.categoryType === 'Deprecation' && <AlertTriangle size={12} className="mr-1.5" />}
                  {item.categoryType === 'New Feature' && <Zap size={12} className="mr-1.5" />}
                  {item.categoryType === 'General' && <FileText size={12} className="mr-1.5" />}
                  {item.categoryType}
                </span>
              )}
            </div>
          )}

          <h3 className={`font-heading font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 z-10 relative ${isPresentationMode ? 'text-lg' : isCompact ? 'text-[15px] sm:text-[16px]' : 'text-[16px] sm:text-[18px]'} leading-tight`}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
              {item.title}
            </a>
          </h3>

          <p className={`text-slate-600 dark:text-slate-300 text-[13px] sm:text-[14px] mb-4 sm:mb-5 z-10 relative flex-1 leading-relaxed ${isPresentationMode ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {item.contentSnippet}
          </p>

          <div className="mt-auto z-10 flex items-center justify-between relative pt-4 border-t border-slate-100 dark:border-slate-800">
            <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center text-[11px] font-bold uppercase tracking-widest hover:underline transition-colors ${iconColor}`}
            >
                View Incident <ArrowRight size={12} className="ml-1.5" />
            </a>
            
            {!isPresentationMode && (
              <div className="flex space-x-2">
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSummarize(item);
                    }}
                    disabled={isSummarizing}
                    className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${iconColor}`}
                    title="Summarize Incident"
                >
                  {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Standard Feed Card Design
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "flex group relative rounded-[2.5rem] overflow-hidden transition-all duration-700 bg-white dark:bg-[var(--color-bg-card-dark)] border border-slate-200/60 dark:border-[var(--color-border-dark)] shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-blue-500/30 dark:hover:border-blue-400/30 border-l-[6px]",
          item.severity === 'Critical' ? "border-l-rose-500" :
          item.severity === 'High' ? "border-l-orange-500" :
          item.severity === 'Medium' ? "border-l-amber-500" :
          item.severity ? "border-l-blue-500" : "border-l-transparent",
          isListView ? "flex-row min-h-[160px]" : "flex-col h-full w-full",
          isSaved && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[var(--color-bg-card-dark)]"
        )}
      >
        {/* Deprecation Warning Banner */}
        {isDeprecation && daysUntilEOL > 0 && (
          <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between border-b ${urgencyColor}`}>
            <span className="flex items-center">
              <AlertOctagon size={12} className="mr-2" />
              Deprecation Notice
            </span>
            <span>{daysUntilEOL} Days Left</span>
          </div>
        )}
  
        {/* Image Section */}
        {image && !isPresentationMode && showImages && (
          <div 
            className={cn(
              "overflow-hidden relative cursor-pointer group/image bg-slate-100 dark:bg-slate-800 shrink-0",
              isListView ? "w-full sm:w-52 min-w-0 sm:min-w-[208px] h-36 sm:h-full" : "h-44 sm:h-48"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSummarize(item);
            }}
          >
              <img 
                  src={image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/image:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 flex items-end p-4">
                 <span className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center">
                    <Sparkles size={12} className="mr-2 text-blue-400" />
                    AI Analysis Available
                 </span>
              </div>
              
              {item.videoId && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl group-hover/image:scale-110 transition-transform duration-500">
                    <Play size={20} className="text-white ml-1 fill-white" />
                  </div>
                </div>
              )}
  
              {item.duration && (
                <div className="absolute top-3 right-3 z-20">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-lg tracking-wider">
                    {item.duration}
                  </span>
                </div>
              )}
          </div>
        )}
        
          <div className={`${isCompact ? 'p-6' : 'p-6 sm:p-8'} ${featured ? 'shrink-0' : 'flex-1'} flex flex-col min-w-0 ${isListView ? 'justify-between' : ''}`}>
          <div className="w-full min-w-0">
            <div className={`flex items-center justify-between w-full ${isCompact ? 'mb-2' : 'mb-4'}`}>
               <div className="flex items-center space-x-2">
                  {isNew && !isPresentationMode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white dark:bg-blue-500 uppercase tracking-[0.1em] shadow-lg shadow-blue-500/20">
                      <Sparkles size={9} className="fill-current" />
                      NEW
                    </span>
                  )}
                  <Tooltip content={`Source: ${item.source}. Click to filter by this source.`} position="top">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 shadow-sm group-hover:scale-105 cursor-help",
                      getSourceStyles(item.source)
                    )}>
                      <SourceIcon source={item.source} size={10} />
                      {item.source}
                    </span>
                  </Tooltip>
                  {item.severity && (
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 shadow-sm",
                      item.severity === 'Critical' ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800" :
                      item.severity === 'High' ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800" :
                      item.severity === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" :
                      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    )}>
                      {item.severity === 'Critical' ? <ShieldAlert size={10} /> : 
                       item.severity === 'High' ? <AlertTriangle size={10} /> : 
                       item.severity === 'Medium' ? <ShieldCheck size={10} /> : <Shield size={10} />}
                      {item.severity}
                    </span>
                  )}
                  {item.cve && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800 uppercase tracking-widest">
                      {item.cve}
                    </span>
                  )}
                  {isTrending && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white dark:bg-rose-500 border border-rose-600 uppercase tracking-widest shadow-lg shadow-rose-500/20">
                      <TrendingUp size={10} />
                      TRENDING
                    </span>
                  )}
               </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-[0.2em] tabular-nums bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                 {date}
               </span>
               <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-[0.2em] tabular-nums bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg flex items-center gap-1">
                 <Clock size={10} />
                 {readingTime}
               </span>
            </div>
            
            <h3 className={`font-heading font-bold text-slate-900 dark:text-white ${isCompact ? 'mb-2 text-[14px] sm:text-[15px]' : 'mb-3 text-[16px] sm:text-[18px]'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight tracking-tight`}>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none block">
                    {item.title}
                </a>
            </h3>

          {(item.channelName || item.channelTitle) && (
            <div className="mb-3 flex items-center text-[12px] text-slate-500 dark:text-[var(--color-text-muted-dark)] space-x-2">
              <div className="flex items-center">
                <Youtube size={14} className="mr-1.5 text-rose-500" />
                <span className="font-medium">{item.channelName || item.channelTitle}</span>
              </div>
              {item.viewCount !== undefined && (
                <div className="flex items-center">
                  <span className="opacity-40 mx-1.5">•</span>
                  <span>{new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(item.viewCount)} views</span>
                </div>
              )}
              {item.likeCount !== undefined && (
                <div className="flex items-center">
                  <span className="opacity-40 mx-1.5">•</span>
                  <span>{new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(item.likeCount)} likes</span>
                </div>
              )}
            </div>
          )}

          {/* Product Labels for Release Notes */}
          {(item.source === 'Release Notes' || item.source === 'Gemini Enterprise') && displayLabels.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {displayLabels.slice(0, 3).map((label) => (
                <span key={label} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-widest transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 dark:hover:border-blue-500/30 shadow-sm">
                  <Tag size={10} className="mr-1 opacity-70" />
                  {label}
                </span>
              ))}
            </div>
          )}
          
          <div className={`relative ${isCompact ? 'mb-2' : 'mb-4'}`}>
            <div className={`text-slate-600 dark:text-slate-300 ${isCompact ? 'text-[13px] leading-relaxed' : 'text-[14px] sm:text-[15px] leading-relaxed'} ${!isExpanded && !isPresentationMode ? 'max-h-[160px] overflow-hidden' : ''} prose dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-table:my-2`}>
                <ReactMarkdown 
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {(item.content || item.contentSnippet || '').replace(/]]>/g, '')}
                </ReactMarkdown>
            </div>
            {!isExpanded && !isPresentationMode && ((item.content && item.content.length > 100) || (item.contentSnippet && item.contentSnippet.length > 50)) && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-[var(--color-bg-card-dark)] to-transparent pointer-events-none" />
            )}
            {((item.content && item.content.length > 100) || (item.contentSnippet && item.contentSnippet.length > 50)) && !isPresentationMode && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="relative z-20 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1 flex items-center focus:outline-none uppercase tracking-widest transition-colors"
              >
                {isExpanded ? (
                  <>Less <ChevronUp size={12} className="ml-1" /></>
                ) : (
                  <>More <ChevronDown size={12} className="ml-1" /></>
                )}
              </button>
            )}
          </div>

          {/* Categories */}
          {!isPresentationMode && !isCompact && (
          <div className="mb-3 flex flex-wrap gap-2">
              {displayLabels.slice(0, 3).map((cat) => {
                const isSubscribed = subscribedCategories.includes(cat);
                return (
                  <button 
                    key={cat} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectCategory) onSelectCategory(cat);
                      else onToggleSubscription(cat);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm hover:scale-105 active:scale-95",
                      isSubscribed 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 dark:shadow-none'
                        : getCategoryStyles(cat)
                    )}
                  >
                      <span className="truncate max-w-[140px]">{cat}</span>
                  </button>
                );
              })}
          </div>
          )}

          {analysis && (
            <AIInsightCard analysis={analysis} isCompact={isCompact} />
          )}
        </div>
        
        <div className={`mt-auto ${!isListView ? `pt-4 border-t border-slate-100 dark:border-slate-800 ${isCompact ? 'pt-3' : 'pt-4'}` : ''}`}>
            <div className="flex items-center justify-between w-full">
                <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all group/link bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm hover:shadow-md"
                >
                    Read More <ArrowRight size={10} className="ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                </a>

                {!isPresentationMode && (
                <div className="flex items-center space-x-2">
                  <Tooltip content="Copy Link" position="top">
                    <button
                      onClick={handleCopyLink}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20"
                      aria-label="Copy Link"
                    >
                      <LinkIcon size={14} />
                    </button>
                  </Tooltip>

                  <Tooltip content="Save this update to your 'Read Later' list for quick access later." position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(item);
                    }}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300 border",
                      isSaved 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 shadow-inner' 
                        : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-transparent hover:border-blue-100 dark:hover:border-blue-500/20'
                    )}
                    aria-label={isSaved ? "Remove from Read Later" : "Read Later"}
                  >
                    <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
                  </button>
                </Tooltip>

                <Tooltip content="Generate an AI-powered summary of this update to save time." position="top">
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSummarize(item);
                      }}
                      disabled={isSummarizing}
                      className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-900 dark:bg-[var(--color-text-dark)] text-white dark:text-[var(--color-bg-app-dark)] hover:bg-slate-800 dark:hover:bg-white transition-all duration-300 text-[9px] font-black disabled:opacity-50 border border-transparent ml-1 uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      aria-label="Generate AI Summary"
                  >
                      {isSummarizing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} className="mr-1" />}
                      {isSummarizing ? '' : 'Summarize'}
                  </button>
                </Tooltip>
                </div>
                )}
            </div>
        </div>
        </div>
      </motion.div>
  );
});
