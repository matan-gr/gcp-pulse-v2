import { useMemo } from 'react';
import { FeedItem, AnalysisResult } from '../types';
import { extractImage, extractGCPProducts, calculateReadingTime } from '../utils';

export const useFeedCardLogic = (item: FeedItem, analysis?: AnalysisResult) => {
  return useMemo(() => {
    const image = item.thumbnailUrl || item.enclosure?.url || extractImage(item.content, item.link);
    const dateObj = new Date(item.isoDate);
    
    const readingTime = calculateReadingTime(item.content || item.contentSnippet);

    const now = new Date();
    const hoursSince = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    const isNew = hoursSince < 48;
    const isTrending = (item.source.startsWith('Cloud Blog') || item.source === 'Medium Blog') || item.source === 'Product Updates' || item.source === 'Google Cloud YouTube' || (item as any).viewCount > 1000;

    const isIncident = item.source === 'Service Health';
    const isDeprecation = item.isDeprecation || item.source === 'Product Deprecations';
    const isSecurityBulletin = item.source === 'Security Bulletins';

    let daysUntilEOL = 0;
    let urgencyColor = 'bg-slate-100 text-slate-600';
    
    if (isDeprecation) {
      const futureDateMatch = item.contentSnippet?.match(/(\d{4}-\d{2}-\d{2})/);
      if (futureDateMatch) {
        const eolDate = new Date(futureDateMatch[0]);
        const diffTime = eolDate.getTime() - now.getTime();
        daysUntilEOL = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysUntilEOL < 30) {
          urgencyColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        } else if (daysUntilEOL < 90) {
          urgencyColor = 'bg-orange-50 text-orange-700 border-orange-200';
        } else {
          urgencyColor = 'bg-amber-50 text-amber-700 border-amber-200';
        }
      }
    }

    const detectedProducts = analysis?.relatedProducts || extractGCPProducts(item.title + " " + item.contentSnippet);
    const displayLabels = Array.from(new Set([...detectedProducts, ...(item.categories || [])]));

    let status: 'Resolved' | 'Monitoring' | 'Investigating' = 'Investigating';
    let statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
    let cardBorder = 'border-rose-100';
    let iconColor = 'text-rose-600';

    if (isIncident) {
      const text = (item.title + item.contentSnippet).toLowerCase();
      if (text.includes('resolved')) {
        status = 'Resolved';
        statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        cardBorder = 'border-emerald-100';
        iconColor = 'text-emerald-600';
      } else if (text.includes('monitoring') || text.includes('identified')) {
        status = 'Monitoring';
        statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
        cardBorder = 'border-amber-100';
        iconColor = 'text-amber-600';
      }
    }

    return {
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
    };
  }, [item, analysis]);
};
