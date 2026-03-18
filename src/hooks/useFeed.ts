
import { useQuery } from '@tanstack/react-query';
import { Feed, FeedItem } from '../types';
import { extractGCPProducts, cleanText } from '../utils';

export const fetchFeed = async (force = false): Promise<Feed> => {
  try {
    const url = force ? '/api/feed?refresh=true' : '/api/feed';
    const response = await fetch(url);
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) {
        // Fallback to status text if JSON parsing fails
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch Feed Error:", error);
    throw error;
  }
};

export const useFeed = () => {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () => fetchFeed(false),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useProductDeprecations = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: () => fetchFeed(false),
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Product Deprecations')
      .map(item => {
        // Extract a potential date from the content if possible
        let eolDate = item.isoDate;
        
        // Look for specific "Shutdown date" or "Retired on" or "After [Date]" patterns in HTML
        const shutdownRegex = /(?:shutdown|retirement|eol|retired|end of life|discontinued|after)\s*(?:date|on)?[:\s]+([A-Z][a-z]+ \d{1,2}, \d{4}|\d{4}-\d{2}-\d{2})/i;
        const shutdownMatch = (item.content || "").match(shutdownRegex);
        
        if (shutdownMatch) {
            const d = new Date(shutdownMatch[1]).getTime();
            if (!isNaN(d)) {
                eolDate = new Date(d).toISOString();
            }
        } else {
            // Fallback to general date extraction
            const dateRegex = /(\d{4}-\d{2}-\d{2})|([A-Z][a-z]+ \d{1,2}, \d{4})/g;
            const matches = (item.contentSnippet || item.content || "").match(dateRegex);
            
            if (matches) {
                const pubDate = new Date(item.isoDate).getTime();
                let maxDate = pubDate;
                
                matches.forEach(dateStr => {
                    const d = new Date(dateStr).getTime();
                    if (!isNaN(d) && d > maxDate) {
                        maxDate = d;
                    }
                });
                
                if (maxDate > pubDate) {
                    eolDate = new Date(maxDate).toISOString();
                }
            }
        }

        const parsedCategories = (item.categories || []).map(c => {
          if (typeof c === 'string') return c;
          if (typeof c === 'object' && c !== null) {
            if ('_' in c) return String((c as any)._);
            if ('term' in c) return String((c as any).term);
            if ('name' in c) return String((c as any).name);
            if ('$' in c && typeof (c as any).$ === 'object') {
               const attrs = (c as any).$;
               if ('term' in attrs) return String(attrs.term);
               if ('label' in attrs) return String(attrs.label);
            }
          }
          return '';
        }).filter(Boolean);

        const lowerCategories = parsedCategories.map(c => c.toLowerCase());
        const isChange = lowerCategories.some(c => c.includes('change')) || 
                        (item.title || "").toLowerCase().includes('change') ||
                        /<strong>\s*(Breaking\s+)?Change\s*<\/strong>/i.test(item.content || "");

        return {
          ...item,
          categories: Array.from(new Set([isChange ? 'Change' : 'Deprecation', ...parsedCategories])),
          eolDate: eolDate
        };
      }).slice(0, 100);
    }
  });
};

export const useSecurityBulletins = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: () => fetchFeed(false),
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return data.items
        .filter(item => item.source === 'Security Bulletins')
        .map(item => {
          // Extract real published date from content
          const pubDateMatch = (item.content || '').match(/Published:\s*<\/strong>\s*(\d{4}-\d{2}-\d{2})/i);
          let realDateStr = item.isoDate;
          if (pubDateMatch) {
            realDateStr = new Date(pubDateMatch[1]).toISOString();
          }

          // Robust Severity Extraction
          let severity = 'Unknown';
          const textToSearch = (item.title + " " + (item.content || item.contentSnippet)).toLowerCase();
          
          // Check for explicit "Severity: X" patterns first
          const severityMatch = textToSearch.match(/severity:\s*(critical|high|medium|low)/i);
          if (severityMatch) {
            severity = severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1);
          } else {
            // Fallback to keyword search with word boundaries
            if (/\bcritical\b/.test(textToSearch)) severity = 'Critical';
            else if (/\bhigh\b/.test(textToSearch)) severity = 'High';
            else if (/\bmedium\b/.test(textToSearch)) severity = 'Medium';
            else if (/\blow\b/.test(textToSearch)) severity = 'Low';
          }

          const categories = ['Security', 'Bulletin'];
          if (severity !== 'Unknown') categories.push(severity);
          if (item.categories) categories.push(...item.categories);

          // Clean up duplicated "Description" prefix often found in security bulletins
          let cleanContent = item.content || '';
          let cleanSnippet = item.contentSnippet || '';
          
          // Remove standalone "Description" headers or prefixes
          cleanContent = cleanContent.replace(/<(h[1-6]|p|strong|b|div)[^>]*>\s*Description:?\s*<\/\1>/gi, '');
          cleanContent = cleanContent.replace(/^(\s*(?:<[^>]+>)*\s*)Description:?\s*/i, '$1');
          cleanSnippet = cleanSnippet.replace(/^\s*Description:?\s*/i, '');

          return {
            ...item,
            content: cleanContent,
            contentSnippet: cleanSnippet,
            isoDate: realDateStr,
            pubDate: realDateStr,
            categories: Array.from(new Set(categories))
          };
        })
        .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
    }
  });
};

export const useArchitectureUpdates = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: () => fetchFeed(false),
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Architecture Center').map(item => {
        let title = item.title;
        let link = item.link || '';
        let description = item.contentSnippet || item.content || '';
        let category = 'Architecture';

        // Attempt to parse HTML content for better title/link/description
        if (item.content) {
          // Extract category from h3 if present (e.g. <h3>Feature</h3>)
          const h3Match = item.content.match(/<h3>(.*?)<\/h3>/i);
          if (h3Match) {
             category = h3Match[1].trim();
          }

          // Simple regex to find the first link in the content which usually contains the real title
          const linkMatch = item.content.match(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);
          if (linkMatch) {
            const extractedLink = linkMatch[1];
            const extractedTitle = linkMatch[2].replace(/<[^>]+>/g, '').trim(); // Remove any inner tags
            
            if (extractedTitle && extractedLink) {
                title = extractedTitle;
                link = extractedLink;
                
                // Try to get description (text after the link)
                // The format is often: <p>... <a ...>Title</a>: Description ... </p>
                const afterLink = item.content.split('</a>')[1];
                if (afterLink) {
                   // Remove leading colons, hyphens, spaces, and HTML tags
                   description = afterLink.replace(/^[:\s-]+/, '').replace(/<[^>]+>/g, '').trim();
                }
            }
          }
        }

        const products = extractGCPProducts(title + " " + description);
        
        // Fix relative or missing links
        if (link.startsWith('#')) {
          // Handle anchor links common in release notes
          link = `https://docs.cloud.google.com/architecture/release-notes${link}`;
        } else if (link.startsWith('/')) {
          // Handle absolute paths relative to domain
          link = `https://cloud.google.com${link}`;
        } else if (!link.startsWith('http')) {
          // Fallback or relative path without slash
          if (link) {
             link = `https://cloud.google.com/${link}`;
          } else {
             link = 'https://docs.cloud.google.com/architecture/release-notes';
          }
        }

        return {
          ...item,
          title,
          link,
          contentSnippet: description,
          categories: Array.from(new Set([category, ...products, ...(item.categories || [])]))
        };
      });
    }
  });
};


export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async (): Promise<FeedItem[]> => {
      const response = await fetch('/api/incidents');
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) { /* Ignore */ }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useYouTubeFeed = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: () => fetchFeed(false),
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Google Cloud YouTube');
    }
  });
};
