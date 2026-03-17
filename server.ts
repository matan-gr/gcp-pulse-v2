// ... imports
import express from "express";
import Parser from "rss-parser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist', 'index.html'));

// Trust Proxy for Cloud Run / Nginx
app.set('trust proxy', 1);

// Initialize Gemini AI client lazily
// REMOVED: AI endpoints have been moved to the frontend to comply with security guidelines.

const FEEDS = [
  { url: "https://cloudblog.withgoogle.com/rss/", name: "Cloud Blog - Main" },
  { url: "https://medium.com/feed/google-cloud", name: "Medium Blog" },
  { url: "https://blog.google/products/google-cloud/rss/", name: "Product Updates" },
  { url: "https://docs.cloud.google.com/feeds/gcp-release-notes.xml", name: "Release Notes" },
  { url: "https://docs.cloud.google.com/release-notes", name: "Product Deprecations" },
  { url: "https://docs.cloud.google.com/feeds/google-cloud-security-bulletins.xml", name: "Security Bulletins" },
  { url: "https://cloud.google.com/feeds/architecture-center-release-notes.xml", name: "Architecture Center" },
  { url: "http://googleaiblog.blogspot.com/atom.xml", name: "Google AI Research" },
  { url: "https://docs.cloud.google.com/feeds/gemini-enterprise-release-notes.xml", name: "Gemini Enterprise" },
  { url: "https://corsproxy.io/?https://www.youtube.com/feeds/videos.xml?channel_id=UCJS9pqu9BzkAMNTmzNMNhvg", name: "Google Cloud YouTube" }
];

const parser = new Parser({
  timeout: 5000, // 5 seconds timeout for RSS feeds
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['yt:videoId', 'videoId'],
      ['yt:channelId', 'channelId'],
      ['author', 'author'],
      ['content:encoded', 'contentEncoded'],
    ]
  }
});

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' })); // Increased limit for large payloads

// Compression Middleware
app.use(compression());

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid issues with external scripts/images if any
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2000, // Increased limit for smoother experience
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP. Please wait a moment and try again.'
  }
});
app.use('/api/', limiter);

// Helper to clean text
const cleanText = (text: string | undefined) => {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp;
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

// Helper to format ISO 8601 duration
const formatDuration = (isoDuration: string) => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return isoDuration;
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes || '0'}:${seconds.padStart(2, '0') || '00'}`;
  return result;
};

// In-memory cache
const youtubeCache = {
  enrichedYouTubeItems: null as any[] | null,
  lastUpdated: 0,
  CACHE_DURATION: 1000 * 60 * 60, // 1 hour
};

// In-memory cache for individual summaries
const summariesCache: Record<string, any> = {};

// Feed cache map to preserve data on fetch failure
const feedCacheMap = new Map<string, any[]>();

// Helper to enrich YouTube items using YouTube Data API v3
const enrichYouTubeItems = async (items: any[]) => {
  // YouTube items are already enriched in fetchYouTubeItems
  return items;
};

// Helper to process feed items based on source
const processFeedItem = (item: any, sourceName: string) => {
  // Parse categories to ensure they are strings
  const parsedCategories = (item.categories || []).map((c: any) => {
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

  // Common processing
  const baseItem = {
    ...item,
    source: sourceName,
    title: cleanText(item.title),
    contentSnippet: cleanText(item.contentSnippet || item.content || item.contentEncoded),
    content: item.content || item.contentEncoded || "",
    isoDate: item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()),
    categories: parsedCategories
  };

  // Specific processing
  if (sourceName.startsWith('Cloud Blog') || sourceName === 'Medium Blog') {
    // Cloud Blog specific logic (e.g., extract specific tags or clean content further)
    return { ...baseItem, type: 'blog' };
  } else if (sourceName === 'Product Updates') {
    return { ...baseItem, type: 'updates' };
  } else if (sourceName === 'Google Cloud YouTube') {
    // YouTube specific logic
    return { ...baseItem, type: 'video' };
  } else if (sourceName === 'Release Notes') {
    // Release Notes specific logic
    return { ...baseItem, type: 'release-notes' };
  } else {
    return { ...baseItem, type: 'general' };
  }
};

// Helper to fetch content with timeout, User-Agent, and retries
const fetchWithTimeout = async (url: string, options: any = {}) => {
  const { timeout = 10000, retries = 2, ...fetchOptions } = options;
  
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          ...fetchOptions.headers
        }
      });
      clearTimeout(id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      lastError = error;
      if (i < retries) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.warn(`Fetch failed for ${url}, retrying in ${delay}ms... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// Helper to retry async functions with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  sourceName: string,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      console.error(`Final attempt failed for ${sourceName}:`, error);
      throw error;
    }
    console.warn(`Fetch failed for ${sourceName}, retrying in ${delay}ms... (${3 - retries + 1}/3). Error: ${error}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, sourceName, retries - 1, delay * 2);
  }
};

// Helper to fetch and parse XML feeds
const fetchXmlFeed = async (url: string) => {
  try {
    const response = await fetchWithTimeout(url);
    let text = await response.text();
    
    // Sanitize XML: replace unescaped & with &amp;
    // This is specific to XML parsing issues
    text = text.replace(/&(?!(amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)/g, '&amp;');
    
    const feed = await parser.parseString(text);
    return feed;
  } catch (error) {
    console.error(`Error fetching XML feed from ${url}:`, error);
    throw error;
  }
};

// Helper to fetch and parse HTML content
const fetchHtmlContent = async (url: string) => {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    return cheerio.load(html);
  } catch (error) {
    console.error(`Error fetching HTML content from ${url}:`, error);
    throw error;
  }
};

// Helper to fetch JSON data
const fetchJsonData = async (url: string, options: any = {}) => {
  try {
    const response = await fetchWithTimeout(url, options);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching JSON from ${url}:`, error);
    throw error;
  }
};

// Helper to fetch HTML deprecations from the official release notes page
const fetchHtmlDeprecations = async (url: string) => {
  const DEPRECATION_REGEX = /(deprecat|sunset|retire|end of life|discontinu|shutdown)/i;
  
  try {
    const $ = await fetchHtmlContent(url);
    const items: any[] = [];

    // Find all labels that indicate a Deprecation or Change
    // We look for any label that might be a deprecation or change
    $('.devsite-label').each((_, element) => {
      const label = $(element);
      const labelText = label.text().trim().toLowerCase();
      
      if (labelText === 'deprecated' || labelText === 'change') {
        // Find the most granular container for this specific note
        // Usually it's a <tr> or a <li> or a specific div
        let container = label.closest('tr, li, .devsite-release-notes-item');
        
        // If no granular container found, fall back to the parent paragraph or div
        if (container.length === 0) {
          container = label.parent();
        }

        // Find the date - usually in a preceding h2 or h3 in the section
        let dateStr = "";
        const section = label.closest('section');
        if (section.length > 0) {
          const dateElement = section.find('h2.devsite-release-notes-date, h3.devsite-release-notes-date').first();
          if (dateElement.length > 0) {
            dateStr = dateElement.text().trim();
          } else {
            // Fallback: look for any preceding h2/h3
            dateStr = section.prevAll('h2, h3').first().text().trim();
          }
        }

        // Robust date parsing
        let isoDate = new Date().toISOString();
        if (dateStr) {
           const parsedDate = new Date(dateStr);
           if (!isNaN(parsedDate.getTime())) {
              isoDate = parsedDate.toISOString();
           }
        }

        // Extract title and content
        // The title should be the text of the note itself, excluding the label
        let fullText = container.text().trim();
        // Remove the label text from the start if it's there
        let cleanText = fullText.replace(/^(deprecated|change)\s*:?\s*/i, '').trim();
        
        let title = cleanText.split('\n')[0].trim();
        if (title.length > 120) {
           title = title.substring(0, 117) + "...";
        }
        
        if (!title || title.length < 5) {
           title = "GCP " + (labelText === 'deprecated' ? 'Deprecation' : 'Change');
        }

        const content = container.html() || "";
        const contentSnippet = cleanText;
        
        // APPLY REGEX FILTER (Requirement)
        // Check if the note actually mentions deprecation keywords
        if (!DEPRECATION_REGEX.test(title) && !DEPRECATION_REGEX.test(contentSnippet)) {
          return; // Skip this item
        }

        const link = url + (container.attr('id') ? `#${container.attr('id')}` : "");

        const guid = Buffer.from(`${title}-${isoDate}`).toString('base64').substring(0, 32);

        items.push({
          title: title,
          content: content,
          contentSnippet: contentSnippet,
          isoDate: isoDate,
          link: link,
          categories: [labelText.charAt(0).toUpperCase() + labelText.slice(1)],
          source: 'Product Deprecations',
          guid: `html-dep-${guid}`
        });
      }
    });

    // Deduplicate items by title and date to avoid multiple labels for the same note
    const uniqueItems = Array.from(new Map(items.map(item => [`${item.title}-${item.isoDate}`, item])).values());

    return uniqueItems;
  } catch (error) {
    console.error("Error fetching HTML deprecations:", error);
    return [];
  }
};

// Helper to fetch and parse Security Bulletins
const fetchSecurityBulletins = async (url: string) => {
  try {
    const $ = await fetchHtmlContent(url);
    const items: any[] = [];
    
    $('entry').each((i, el) => {
      const entry = $(el);
      const title = cleanText(entry.find('title').text());
      const content = entry.find('content').html() || entry.find('summary').html() || "";
      const contentSnippet = cleanText(entry.find('content').text() || entry.find('summary').text());
      const isoDate = entry.find('updated').text() || entry.find('published').text() || new Date().toISOString();
      const link = entry.find('link').attr('href') || "";
      const id = entry.find('id').text() || link || `sec-bull-${i}`;
      
      items.push({
        id,
        guid: id,
        title,
        content,
        contentSnippet,
        isoDate,
        source: 'Security Bulletins',
        categories: ['Security', 'Bulletin'],
        type: 'security',
        link
      });
    });
    
    console.log(`Fetched ${items.length} Security Bulletins via Cheerio`);
    return items;
  } catch (error) {
    console.error("Error fetching Security Bulletins:", error);
    return [];
  }
};

// Helper to fetch and parse Release Notes
const fetchReleaseNotes = async (url: string, sourceName: string) => {
  try {
    const feed = await fetchXmlFeed(url);
    const items = (feed.items || []).map(item => ({
      ...processFeedItem(item, sourceName),
      categories: (item.categories || []).map(c => typeof c === 'string' ? c : (c as any)._ || (c as any).term || ''),
      type: 'release-notes'
    }));
    
    console.log(`Fetched ${items.length} items from ${sourceName}`);
    feedCacheMap.set(url, items);
    return items;
  } catch (error) {
    console.error(`Error fetching Release Notes ${sourceName}:`, error);
    return [];
  }
};

// Helper to fetch and parse Architecture Center updates
const fetchArchitectureUpdates = async (url: string) => {
  try {
    const feed = await fetchXmlFeed(url);
    return (feed.items || []).map(item => ({
      ...processFeedItem(item, 'Architecture Center'),
      categories: ['Architecture', 'Design'],
      type: 'architecture'
    }));
  } catch (error) {
    console.error("Error fetching Architecture Center updates:", error);
    return [];
  }
};

// Helper to fetch and parse Cloud Blog items
const fetchCloudBlogItems = async (url: string, sourceName: string) => {
  try {
    const response = await fetchWithTimeout(url, { timeout: 20000 }); // Increase timeout to 20s
    const text = await response.text();
    const $ = cheerio.load(text, { xmlMode: true });
    const items: any[] = [];
    
    console.log(`Cloud Blog: Parsing items from ${url}`);
    
    const DEPRECATION_REGEX = /(deprecat|sunset|retire|end of life|discontinu|shutdown)/i;

    $('item, entry').each((i, el) => {
      const entry = $(el);
      const title = cleanText(entry.find('title').text());
      
      // Handle both RSS and Atom formats
      let content = entry.find('content\\:encoded').html() || 
                    entry.find('content').html() || 
                    entry.find('description').html() || 
                    entry.find('summary').html() || "";
      
      let contentSnippet = cleanText(entry.find('description').text() || 
                                    entry.find('summary').text() || 
                                    entry.find('content').text() || "");
      
      const link = entry.find('link').attr('href') || entry.find('link').text() || entry.find('guid').text() || "";
      const isoDate = entry.find('pubDate').text() || 
                      entry.find('published').text() || 
                      entry.find('updated').text() || 
                      entry.find('dc\\:date').text() ||
                      new Date().toISOString();
      
      const id = entry.find('guid').text() || entry.find('id').text() || link || `blog-${i}`;

      // Extract image if possible
      let thumbnailUrl = "";
      // Try media:content, then media:thumbnail, then enclosure, then img in content
      const mediaContent = entry.find('media\\:content').attr('url');
      const mediaThumbnail = entry.find('media\\:thumbnail').attr('url');
      const enclosure = entry.find('enclosure').attr('url');
      
      if (mediaContent) thumbnailUrl = mediaContent;
      else if (mediaThumbnail) thumbnailUrl = mediaThumbnail;
      else if (enclosure) thumbnailUrl = enclosure;
      else {
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) thumbnailUrl = imgMatch[1];
      }

      // Parse categories
      const categories: string[] = [];
      entry.find('category').each((_, cat) => {
        const term = $(cat).attr('term') || $(cat).text() || $(cat).attr('label');
        if (term) categories.push(term);
      });

      const isDeprecation = DEPRECATION_REGEX.test(title) || 
                           DEPRECATION_REGEX.test(contentSnippet) || 
                           categories.some(cat => DEPRECATION_REGEX.test(cat));

      items.push({
        id,
        guid: id,
        title,
        link,
        content,
        contentSnippet: contentSnippet.substring(0, 500),
        isoDate: new Date(isoDate).toISOString(),
        pubDate: new Date(isoDate).toISOString(),
        source: sourceName,
        categories,
        thumbnailUrl,
        type: 'blog',
        isDeprecation
      });
    });
    
    console.log(`Fetched ${items.length} items from ${sourceName} (${items.filter(i => i.isDeprecation).length} deprecations)`);
    return items;
  } catch (error) {
    console.error(`Error fetching Cloud Blog ${sourceName}:`, error);
    return [];
  }
};

// Helper to fetch YouTube details
const getYouTubeDetails = async (videoIds: string[]) => {
  const apiKey = (process.env.YOUTUBE_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is missing');

  const allDetails = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50).join(',');
    try {
      const data = await fetchJsonData(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${batchIds}&key=${apiKey}`, {
        timeout: 5000
      });
      if (data.items) allDetails.push(...data.items);
    } catch (err) {
      console.error("Error fetching YouTube batch:", err);
    }
  }
  return allDetails;
};

// Helper to fetch and parse Product Updates
const fetchProductUpdates = async (url: string, sourceName: string) => {
  try {
    const feed = await fetchXmlFeed(url);
    const rawItems = feed.items;
    
    const items = rawItems.map(item => {
      // Parse categories to ensure they are strings
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

      return {
        ...processFeedItem(item, sourceName),
        categories: parsedCategories
      };
    });
    
    console.log(`Fetched ${items.length} items from ${sourceName}`);
    return items;
  } catch (error) {
    console.error(`Error fetching Product Updates ${sourceName}:`, error);
    return [];
  }
};

// Helper to fetch and parse YouTube items
const fetchYouTubeItems = async (url: string, sourceName: string) => {
  try {
    const feed = await fetchXmlFeed(url);
    const rawItems = feed.items;
    
    let items = rawItems.map(item => processFeedItem(item, sourceName));

    // Extract video IDs
    const videoIds = items
      .map(item => {
        let videoId = (item as any).videoId || '';
        if (!videoId && item.id && item.id.includes('yt:video:')) {
          const match = item.id.match(/yt:video:([a-zA-Z0-9_-]{11})/);
          if (match) videoId = match[1];
        }
        if (!videoId && item.link) {
          const match = item.link.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
          if (match) videoId = match[1];
        }
        return videoId;
      })
      .filter(Boolean);

    if (videoIds.length > 0) {
      const details = await getYouTubeDetails(videoIds);
      items = items.map(item => {
        const videoId = (item as any).videoId || '';
        const detail = details.find((d: any) => d.id === videoId);
        if (detail) {
          const thumbnails = detail.snippet?.thumbnails;
          const thumbnailUrl = thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url;
          
          return {
            ...item,
            viewCount: parseInt(detail.statistics?.viewCount || '0'),
            likeCount: parseInt(detail.statistics?.likeCount || '0'),
            duration: formatDuration(detail.contentDetails?.duration || 'PT0S'),
            channelName: detail.snippet?.channelTitle,
            thumbnailUrl: thumbnailUrl
          };
        }
        return item;
      });
    }
    
    console.log(`Fetched and enriched ${items.length} items from ${sourceName}`);
    return items;
  } catch (error) {
    console.error(`Error fetching YouTube ${sourceName}:`, error);
    return [];
  }
};

// Helper to fetch and parse Cloud Blog items
const fetchCloudBlogUpdates = async (url: string, sourceName: string) => {
  const DEPRECATION_REGEX = /(deprecat|sunset|retire|end of life|discontinu|shutdown)/i;
  const feed = await fetchXmlFeed(url);
  const items = feed.items.map(item => {
    const processed = processFeedItem(item, sourceName);
    return {
      ...processed,
      isDeprecation: DEPRECATION_REGEX.test(processed.title || '') || DEPRECATION_REGEX.test(processed.content || '')
    };
  });
  feedCacheMap.set(url, items);
  return items;
};

// Helper to fetch and process a single feed
const fetchAndProcessFeed = async (feedSource: any) => {
  if (feedSource.name === 'Product Deprecations') {
    return await fetchHtmlDeprecations(feedSource.url);
  }
  
  if (feedSource.name === 'Release Notes') {
    return await fetchReleaseNotes(feedSource.url, feedSource.name);
  }
  
  if (feedSource.name === 'Security Bulletins') {
    const items = await fetchSecurityBulletins(feedSource.url);
    feedCacheMap.set(feedSource.url, items);
    return items;
  }

  if (feedSource.name === 'Architecture Center') {
    const items = await fetchArchitectureUpdates(feedSource.url);
    feedCacheMap.set(feedSource.url, items);
    return items;
  }

  if (feedSource.name === 'Product Updates') {
    const items = await fetchProductUpdates(feedSource.url, feedSource.name);
    feedCacheMap.set(feedSource.url, items);
    return items;
  }

  if (feedSource.name === 'Google Cloud YouTube') {
    const items = await fetchYouTubeItems(feedSource.url, feedSource.name);
    feedCacheMap.set(feedSource.url, items);
    return items;
  }

  if (feedSource.name.startsWith('Cloud Blog') || feedSource.name === 'Medium Blog') {
    return await fetchCloudBlogUpdates(feedSource.url, feedSource.name);
  }

  const feed = await fetchXmlFeed(feedSource.url);
  
  const rawItems = feed.items;

  const items = rawItems.map(item => {
    // Parse categories to ensure they are strings
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

    return {
      ...processFeedItem(item, feedSource.name),
      categories: parsedCategories
    };
  });

  feedCacheMap.set(feedSource.url, items);
  return items;
};

// Helper to fetch feeds
const fetchFeeds = async () => {
  const DEPRECATION_REGEX = /(deprecat|sunset|retire|end of life|discontinu|shutdown)/i;

  const feedPromises = FEEDS.map(async (feedSource) => {
    try {
      if (feedSource.name === 'Product Deprecations') {
        return await withRetry(async () => await fetchHtmlDeprecations(feedSource.url), feedSource.name);
      }
      
      if (feedSource.name === 'Release Notes') {
        return await withRetry(async () => await fetchReleaseNotes(feedSource.url, feedSource.name), feedSource.name);
      }
      
      if (feedSource.name === 'Security Bulletins') {
        const items = await withRetry(async () => await fetchSecurityBulletins(feedSource.url), feedSource.name);
        feedCacheMap.set(feedSource.url, items);
        return items;
      }

      if (feedSource.name === 'Architecture Center') {
        const items = await withRetry(async () => await fetchArchitectureUpdates(feedSource.url), feedSource.name);
        feedCacheMap.set(feedSource.url, items);
        return items;
      }

      if (feedSource.name === 'Product Updates') {
        const items = await withRetry(async () => await fetchProductUpdates(feedSource.url, feedSource.name), feedSource.name);
        feedCacheMap.set(feedSource.url, items);
        return items;
      }

      if (feedSource.name === 'Google Cloud YouTube') {
        const items = await withRetry(async () => await fetchYouTubeItems(feedSource.url, feedSource.name), feedSource.name);
        feedCacheMap.set(feedSource.url, items);
        return items;
      }

      if (feedSource.name.startsWith('Cloud Blog') || feedSource.name === 'Medium Blog') {
        return await withRetry(async () => await fetchCloudBlogUpdates(feedSource.url, feedSource.name), feedSource.name);
      }

      const feed = await withRetry(async () => await fetchXmlFeed(feedSource.url), feedSource.name);
      
      const rawItems = feed.items;

      const items = rawItems.map(item => processFeedItem(item, feedSource.name));

      feedCacheMap.set(feedSource.url, items);
      return items;
    } catch (error) {
      console.error(`Error fetching feed ${feedSource.name}:`, error);
      // Return cached items if available to avoid empty feeds on transient errors
      return feedCacheMap.get(feedSource.url) || [];
    }
  });


  const allItemsArrays = await Promise.all(feedPromises);
  let allItems = allItemsArrays.flat();
  
  // 1. Global Deduplication across all sources
  // We deduplicate by link if available, otherwise by title + date
  const seen = new Set();
  allItems = allItems.filter(item => {
    const key = item.link || `${item.title}-${item.isoDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Total items after deduplication: ${allItems.length}`);
  
  // 2. Enrich YouTube items
  allItems = await enrichYouTubeItems(allItems);

  // 3. Assign stable IDs
  allItems.forEach((item: any) => {
    if (!item.id) {
      item.id = item.guid || item.link || Buffer.from(`${item.title}-${item.isoDate}`).toString('base64').substring(0, 32);
    }
  });

  allItems.sort((a, b) => {
    const timeA = new Date(a.isoDate).getTime();
    const timeB = new Date(b.isoDate).getTime();
    
    const validA = !isNaN(timeA);
    const validB = !isNaN(timeB);
    
    if (validA && validB) return timeB - timeA;
    if (validA && !validB) return -1;
    if (!validA && validB) return 1;
    return 0;
  });

  return allItems;
};

// Cache configuration
let cache: {
  data: any;
  timestamp: number;
} | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours cache
let isFetching = false;
let fetchPromise: Promise<any> | null = null;

// Background refresh task
const refreshCache = async () => {
  if (isFetching) return;
  try {
    isFetching = true;
    console.log("Refreshing feed cache in background...");
    const allItems = await fetchFeeds();
    const responseData = {
      title: "Aggregated GCP Feeds",
      description: "Aggregated news and updates from Google Cloud",
      items: allItems
    };
    cache = {
      data: responseData,
      timestamp: Date.now()
    };
    console.log("Feed cache refreshed successfully.");
  } catch (error) {
    console.error("Error in background feed refresh:", error);
  } finally {
    isFetching = false;
  }
};

// Initial fetch and interval
refreshCache();
setInterval(refreshCache, CACHE_DURATION);

// API Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/feed", async (req, res) => {
  try {
    // Set Cache-Control header for API response
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // Cache for 5 mins (browser), 10 mins (CDN)

    // Return cache immediately if available and fresh
    if (cache && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      return res.json(cache.data);
    }

    // If already fetching, wait for the existing promise
    if (isFetching && fetchPromise) {
      const data = await fetchPromise;
      return res.json(data);
    }

    // Otherwise trigger a new fetch
    isFetching = true;
    fetchPromise = (async () => {
      try {
        const allItems = await fetchFeeds();
        const responseData = {
          title: "Aggregated GCP Feeds",
          description: "Aggregated news and updates from Google Cloud",
          items: allItems
        };
        cache = {
          data: responseData,
          timestamp: Date.now()
        };
        return responseData;
      } finally {
        isFetching = false;
        fetchPromise = null;
      }
    })();

    const data = await fetchPromise;
    res.json(data);
  } catch (error) {
    console.error("Error fetching RSS feeds:", error);
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

app.get("/api/summaries", (req, res) => {
  res.json(summariesCache);
});

app.get("/api/summaries/:id", (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id);
  const summary = summariesCache[decodedId];
  if (summary) {
    res.json(summary);
  } else {
    res.status(404).json({ error: "Summary not found" });
  }
});

app.post("/api/summaries", (req, res) => {
  const { id, analysis } = req.body;
  if (!id || !analysis) return res.status(400).json({ error: "Missing id or analysis" });
  
  summariesCache[id] = analysis;
  res.json({ success: true });
});

app.get("/api/debug-key", (req, res) => {
  res.json({
    keys: Object.keys(process.env),
    GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
  });
});

// In-memory cache for incidents
let incidentsCache: {
  data: any;
  timestamp: number;
} | null = null;
const INCIDENTS_CACHE_DURATION = 1000 * 60 * 15; // 15 minutes cache

// In-memory cache for weekly brief
let weeklyBriefCache = {
  content: null as string | null,
  timestamp: 0,
  isGenerating: false
};

app.get("/api/weekly-brief", (req, res) => {
  res.json(weeklyBriefCache);
});

app.post("/api/weekly-brief/lock", (req, res) => {
  if (weeklyBriefCache.isGenerating && Date.now() - weeklyBriefCache.timestamp < 5 * 60 * 1000) {
    return res.status(409).json({ error: "Already generating" });
  }
  weeklyBriefCache.isGenerating = true;
  weeklyBriefCache.timestamp = Date.now();
  res.json({ success: true });
});

app.post("/api/weekly-brief", (req, res) => {
  const { content } = req.body;
  if (!content) {
    // If content is null/empty, it means generation failed. Just release the lock.
    weeklyBriefCache.isGenerating = false;
    return res.status(400).json({ error: "Missing content, lock released" });
  }
  
  weeklyBriefCache = {
    content,
    timestamp: Date.now(),
    isGenerating: false
  };
  res.json({ success: true });
});

app.get("/api/incidents", async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    
    // Check cache
    if (incidentsCache && (Date.now() - incidentsCache.timestamp < INCIDENTS_CACHE_DURATION)) {
      return res.json(incidentsCache.data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch("https://status.cloud.google.com/incidents.json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.statusText}`);
    }
    const data = await response.json();

    const incidents = data.map((item: any) => {
      // Extract content from updates
      let content = "";
      if (item.most_recent_update?.text) {
        content = item.most_recent_update.text;
      } else if (item.updates && item.updates.length > 0) {
        content = item.updates[0].text;
      }

      // Defensive extraction
      const serviceName = item.service_name || item.service_key || "GCP Service";
      const severity = item.severity || item.priority || "medium"; // Default to medium if unknown
      const description = item.external_desc || item.summary || content || "No description available";
      
      return {
        id: item.uri || item.id || `incident-${Math.random()}`,
        title: description, // Use description as title for the feed item
        link: `https://status.cloud.google.com${item.uri || ''}`,
        isoDate: item.begin || new Date().toISOString(),
        source: 'Service Health',
        content: content,
        contentSnippet: content,
        
        // Specific Incident Fields
        serviceName: serviceName,
        severity: severity,
        description: description,
        updates: item.updates || [], // Pass full updates array
        begin: item.begin,
        end: item.end,
        isActive: !item.end, // Active if no end date
        isHistory: !!item.end
      };
    });

    // Sort by Date Descending (Active first, then by date)
    incidents.sort((a: any, b: any) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });

    // Update cache
    incidentsCache = {
      data: incidents,
      timestamp: Date.now()
    };

    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

app.get("/api/ip-ranges", async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Cache for 1 hour
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch("https://www.gstatic.com/ipranges/cloud.json", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch IP ranges: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching IP ranges:", error);
    res.status(500).json({ error: "Failed to fetch IP ranges" });
  }
});

app.get("/api/gke-feed", async (req, res) => {
  const { channel } = req.query;
  const feedUrls: Record<string, string> = {
    'stable': 'https://cloud.google.com/feeds/gke-stable-channel-release-notes.xml',
    'regular': 'https://cloud.google.com/feeds/gke-regular-channel-release-notes.xml',
    'rapid': 'https://cloud.google.com/feeds/gke-rapid-channel-release-notes.xml',
  };

  const url = feedUrls[String(channel).toLowerCase()];
  if (!url) {
    return res.status(400).json({ error: "Invalid channel" });
  }

  try {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Cache for 1 hour
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch GKE feed: ${response.statusText}`);
    }
    const xml = await response.text();
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  } catch (error) {
    console.error(`Error fetching GKE feed for ${channel}:`, error);
    res.status(500).json({ error: "Failed to fetch GKE feed" });
  }
});

// --- AI Endpoints ---

// REMOVED: AI endpoints have been moved to the frontend to comply with security guidelines.

// Vite middleware for development
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, './vite.config.ts'),
    server: { 
      middlewareMode: true
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static('dist', { index: false }));
  
  // SPA fallback with runtime env injection
  app.use((req, res) => {
    const indexPath = path.resolve('dist', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
      if (err) {
        console.error('Error reading index.html:', err);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
        }
        return;
      }
      
      const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
      const envScript = `<script>window.__GEMINI_API_KEY__ = ${JSON.stringify(apiKey)}; window.process = window.process || { env: {} }; window.process.env.GEMINI_API_KEY = ${JSON.stringify(apiKey)};</script>`;
      const injectedHtml = htmlData.replace('<head>', `<head>${envScript}`);
      
      res.send(injectedHtml);
    });
  });
}

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
