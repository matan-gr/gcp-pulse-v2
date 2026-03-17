import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { FeedItem } from '../types';
import { getAiInstance } from '../services/geminiService';
import { toast } from 'sonner';
import { checkRateLimit, recordUsage, getRemainingTime } from '../utils/rateLimiter';

interface WeeklyBriefContextType {
  brief: string | null;
  loading: boolean;
  progress: number;
  status: string;
  lastUpdated: Date | null;
  error: string | null;
  generateBrief: (force?: boolean) => Promise<void>;
}

const WeeklyBriefContext = createContext<WeeklyBriefContextType | undefined>(undefined);

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export const WeeklyBriefProvider: React.FC<{ children: React.ReactNode, items: FeedItem[] }> = ({ children, items }) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchServerCache = async () => {
    try {
      const res = await fetch('/api/weekly-brief');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch weekly brief cache", e);
    }
    return null;
  };

  const generateBrief = useCallback(async (force = false) => {
    if (loading || items.length === 0) {
      return;
    }

    if (!force) {
      // 1. Check server cache first
      const serverCache = await fetchServerCache();
      if (serverCache && serverCache.content) {
        const age = Date.now() - serverCache.timestamp;
        if (age < CACHE_DURATION_MS) {
          setBrief(serverCache.content);
          setLastUpdated(new Date(serverCache.timestamp));
          return;
        }
      }

      // 2. Check local cache
      try {
        const localCache = localStorage.getItem('GCP_PULSE_WEEKLY_BRIEF_CACHE');
        if (localCache) {
          const { content, timestamp } = JSON.parse(localCache);
          const age = Date.now() - timestamp;
          if (age < CACHE_DURATION_MS) {
            setBrief(content);
            setLastUpdated(new Date(timestamp));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load weekly brief from local cache", e);
      }
    }

    // Try to acquire lock
    try {
      const lockRes = await fetch('/api/weekly-brief/lock', { method: 'POST' });
      if (!lockRes.ok) {
        // Someone else is generating, start polling
        setLoading(true);
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
          const cache = await fetchServerCache();
          if (cache && !cache.isGenerating) {
            if (cache.content) {
              setBrief(cache.content);
              setLastUpdated(new Date(cache.timestamp));
              setLoading(false);
            } else {
              setError("Generation failed on another instance. Please try again.");
              setLoading(false);
            }
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }, 5000);
        return;
      }
    } catch (e) {
      console.error("Failed to acquire lock", e);
    }

    // Check rate limit: 500 per 60 minutes
    if (!checkRateLimit('weekly_brief', 500, 60)) {
      const waitTime = getRemainingTime('weekly_brief', 500, 60);
      toast.error("Rate limit exceeded", { description: `Please wait ${waitTime} minutes before generating another weekly brief.` });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter for last 7 days OR upcoming deprecations
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(now.getDate() + 90);

      const weeklyItems = items.filter(item => {
        const itemDate = new Date(item.isoDate);
        
        // 1. Include items from the last 7 days
        if (itemDate >= oneWeekAgo) return true;
        
        // 2. Include UPCOMING deprecations (within next 90 days)
        if (item.source === 'Product Deprecations' && item.eolDate) {
           const eol = new Date(item.eolDate);
           if (eol > now && eol <= ninetyDaysFromNow) return true;
           if (eol >= oneWeekAgo && eol <= now) return true;
        }
        
        return false;
      });
      
      // If we have very few items in the last week, take more recent items to provide a good brief
      const contextItems = weeklyItems.length >= 15 ? weeklyItems : items.slice(0, 80);
      const timeWindow = weeklyItems.length >= 15 ? "Last 7 Days + Upcoming Deprecations" : "Most Recent Updates (Comprehensive Analysis)";

      const contextData = JSON.stringify(contextItems.map(i => ({
        title: i.title,
        source: i.source,
        date: i.isoDate,
        eolDate: i.eolDate,
        summary: i.contentSnippet || i.content?.slice(0, 1500),
        link: i.link
      })));

      const prompt = `
        You are an elite Principal Cloud Architect, Site Reliability Engineer, and Lead Cloud Strategist at a Fortune 500 company.
        Your mission is to produce a **masterpiece Weekly Cloud Intelligence Briefing** for Google Cloud Platform (GCP).
        This report is read by CTOs, Architects, and Engineering Leads who demand **extreme technical depth, absolute accuracy, and strategic foresight**.

        **Your briefing must be visually stunning in Markdown and structured to provide deep, multi-dimensional insights:**
        1.  **Principal Cloud Architect / SRE**: Focus on technical implementation details, reliability engineering, complex architectural patterns, breaking changes, security vulnerabilities (CVEs), and performance benchmarks.
        2.  **Cloud Strategist & Economist**: Focus on industry shifts, competitive positioning (vs AWS/Azure), cost optimization (FinOps), and how these updates impact long-term cloud roadmaps.
        3.  **Executive Leadership**: Focus on high-level business value, strategic impact, risk management, and ROI of adopting new features.
        
        **MANDATORY: UPCOMING INTELLIGENCE (NEXT 7 DAYS)**
        You MUST use the **Google Search tool** to identify:
        -   **Upcoming Events**: Webinars, Cloud Summits, Training sessions, or major industry events (like Cloud Next or regional summits) happening between ${new Date().toLocaleDateString()} and ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
        -   **Immediate Deadlines**: Any deprecations, API shutdowns, or mandatory migrations with deadlines in the next 7 days.
        -   **Scheduled Launches**: Any announced feature rollouts or service launches scheduled for the coming week.

        **Input Data (${timeWindow}):**
        ${contextData}

        **CRITICAL REQUIREMENTS FOR "AMAZING" OUTPUT:**
        1.  **Deep Research Phase:** Use the **Google Search tool** extensively. For EVERY major update (at least 7-10 items), find official documentation, whitepapers, and technical blogs to add "meat" to the summary.
        2.  **Technical Granularity & Accuracy:** For every major update, explain the "Under the Hood" mechanics. Don't just say "it's faster"; explain *how* (e.g., "uses new TPU v5p accelerators with 459GB of HBM3 memory providing 2x training speed").
        3.  **Reference Links (MANDATORY):** Every single item in the "Technical Deep Dive" and "Priority Alerts" sections MUST include a direct, clickable reference link to official Google Cloud documentation or the relevant source.
        4.  **Actionable Intelligence:** Every section must end with a "Recommended Action" for the reader.
        5.  **Deprecation & Security Vigilance:** 
            *   **MANDATORY:** Use the **Google Search tool** to verify the latest Security Bulletins and Deprecations.
            *   Provide a detailed impact analysis for every deprecation. What happens if the user does nothing?
        6.  **Formatting Excellence:** 
            *   Use **bolding** for key technical terms and product names.
            *   Use > blockquotes for "Architect's Notes" or "Strategist's Perspective".
            *   Use --- horizontal rules to separate major sections.
            *   Use nested bullet points for complex technical details.
            *   Ensure the Markdown is clean, professional, and highly readable.

        **Output Structure:**
        # 🛡️ GCP Pulse: Weekly Intelligence Report
        **Date:** ${new Date().toLocaleDateString()} | **Scope:** ${timeWindow}
        
        ---
        
        ### 🧭 Quick Navigation
        - [🚀 The Week Ahead](#-the-week-ahead-upcoming-events--deadlines)
        - [🎯 Executive Summary](#-executive-summary-the-bottom-line)
        - [🏗️ Technical Deep Dive](#-technical-deep-dive-architecture--engineering)
        - [⚠️ Priority Alerts](#-priority-alerts-deprecations--breaking-changes)
        - [🛡️ Security & Reliability](#-security-compliance--reliability)
        - [🌐 Strategic Landscape](#-strategic-landscape-market--strategy)
        - [💰 FinOps & Value](#-finops--business-value)
        - [📚 Intelligence Digest](#-intelligence-digest-must-read--watch)

        ---

        ## 🚀 The Week Ahead: Upcoming Events & Deadlines
        [Use a Markdown table for visibility]
        | Date | Event / Deadline | Type | Impact / Action | Link |
        | :--- | :--- | :--- | :--- | :--- |
        | [Date] | [Name] | [Event/Deprecation/Launch] | [Brief Description] | [Link] |

        ---

        ## 🎯 Executive Summary: The "Bottom Line"
        [A high-impact summary of the week's most critical developments. Focus on strategic shifts and immediate risks. Use a > blockquote for the "Strategic Takeaway".]

        ---

        ## 🏗️ Technical Deep Dive: Architecture & Engineering
        [In-depth analysis of new features, architectural changes, and performance updates. 
        For EACH item:
        - **[Product Name]: [Feature Name]**
        - **The "How":** [Technical explanation of mechanics]
        - **Architectural Impact:** [How it changes design patterns]
        - **Reference:** [Link to documentation]
        - **Recommended Action:** [What engineers should do]
        ]

        ---

        ## ⚠️ Priority Alerts: Deprecations & Breaking Changes
        **MANDATORY:** Use a Markdown table for the overview.
        
        | Product / Service | Change Type | Effective Date | Impact Level | Mitigation Strategy | Official Link |
        | :--- | :--- | :--- | :--- | :--- | :--- |
        | [Name] | [Deprecation/Change] | [Date] | [Critical/High] | [What to do] | [Link] |

        ### Detailed Mitigation Plans:
        *   **[Product Name]**: [Deep dive into the change, why it's happening, and a step-by-step migration path with links].

        ---

        ## 🛡️ Security, Compliance & Reliability
        [Detailed analysis of Security Bulletins, CVEs, and Service Health incidents. Focus on remediation steps and links to bulletins.]

        ---

        ## 🌐 Strategic Landscape: Market & Strategy
        [How this week's news changes the game. Competitive analysis (GCP vs AWS/Azure) and strategic recommendations for long-term planning.]

        ---

        ## 💰 FinOps & Business Value
        [Cost implications of new features, potential savings, and business ROI analysis. Use bolding for monetary or percentage impacts.]

        ---

        ## 📚 Intelligence Digest: Must-Read & Watch
        [Curated list of the most important Blog posts (including Medium) and YouTube videos. Provide a 2-sentence "Why it's worth your time" for each, plus the link.]
      `;

      const ai = getAiInstance();
      setLoading(true);
      setProgress(10);
      setStatus("Analyzing input data...");
      
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are the world's leading GCP expert. Your weekly briefs are legendary for their depth, accuracy, and strategic value. You never provide shallow summaries; you always dig deep into the technical and business implications. You use the Google Search tool to verify every fact and find the most relevant official links. Your output is perfectly formatted Markdown that is both beautiful and highly functional.",
        }
      });

      let fullText = "";
      let chunkCount = 0;
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        chunkCount++;
        
        // Update progress based on chunk count (simple heuristic)
        if (chunkCount < 5) {
          setProgress(20);
          setStatus("Searching for official documentation...");
        } else if (chunkCount < 15) {
          setProgress(40);
          setStatus("Drafting technical analysis...");
        } else if (chunkCount < 30) {
          setProgress(70);
          setStatus("Formatting and refining...");
        } else {
          setProgress(90);
          setStatus("Finalizing...");
        }
      }
      
      setProgress(100);
      setStatus("Done!");
      setLoading(false);

      if (fullText) {
        setBrief(fullText);
        const now = new Date();
        setLastUpdated(now);
        
        recordUsage('weekly_brief', 60);
        
        // Save to local cache
        try {
          localStorage.setItem('GCP_PULSE_WEEKLY_BRIEF_CACHE', JSON.stringify({ content: fullText, timestamp: now.getTime() }));
        } catch (e) {
          console.warn("Failed to save weekly brief to local cache", e);
        }
        
        // Save to server cache
        await fetch('/api/weekly-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: fullText })
        });
      } else {
        throw new Error("No content generated from AI model");
      }

    } catch (err: any) {
      console.error("Failed to generate brief:", err);
      
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('Rate exceeded') || err.message?.includes('quota')) {
        setError("AI Quota Exceeded. Please try again later.");
        toast.error("Daily AI quota exceeded", { description: "Please try again later when your quota resets." });
      } else {
        setError(err.message || "Failed to generate briefing");
        toast.error("Failed to generate weekly brief", { description: "An error occurred while analyzing the latest updates. Please try again." });
      }
      
      // Release lock on failure
      await fetch('/api/weekly-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: null }) 
      }).catch(() => {});
      
    } finally {
      setLoading(false);
    }
  }, [items, loading]);

  useEffect(() => {
    // Initial fetch - only if we don't have a brief, aren't loading, and haven't hit an error yet
    if (items.length > 0 && !brief && !loading && !error) {
      generateBrief(false);
    }
  }, [items.length, brief, loading, error, generateBrief]);

  useEffect(() => {
    // Auto-refresh logic
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    
    autoRefreshRef.current = setInterval(async () => {
      const cache = await fetchServerCache();
      if (!cache || !cache.content || (Date.now() - cache.timestamp >= CACHE_DURATION_MS)) {
        // Cache is stale or missing, trigger regeneration
        if (items.length > 0 && !loading && !error) {
          generateBrief(true);
        }
      }
    }, 300000); // Check every 5 minutes

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [items, generateBrief, loading, error]);

  return (
    <WeeklyBriefContext.Provider value={{ brief, loading, progress, status, lastUpdated, error, generateBrief }}>
      {children}
    </WeeklyBriefContext.Provider>
  );
};

export const useWeeklyBriefContext = () => {
  const context = useContext(WeeklyBriefContext);
  if (context === undefined) {
    throw new Error('useWeeklyBriefContext must be used within a WeeklyBriefProvider');
  }
  return context;
};
