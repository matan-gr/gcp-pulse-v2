import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { FeedItem } from '../types';
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
        const text = await res.text();
        if (text && text.trim()) {
          return JSON.parse(text);
        }
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
        if (localCache && localCache.trim()) {
          const { content, timestamp } = JSON.parse(localCache.trim());
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
        You are the **Chief Cloud Intelligence Officer** and **Global Principal Architect** at a top-tier technology consultancy.
        Your mission is to produce the **ultimate Weekly Cloud Intelligence Briefing** for Google Cloud Platform (GCP).
        This report is the "Gold Standard" for CTOs, Lead Architects, and SRE Managers who require **absolute technical precision, strategic foresight, and actionable wisdom**.

        **Your briefing must be a masterpiece of Markdown engineering, structured to provide multi-dimensional, high-fidelity insights:**

        ### 🏗️ THE MISSION:
        1.  **Synthesize, Don't Just Summarize**: Connect the dots between different updates. If a new GKE feature is released alongside a Cloud Storage update, explain how they work together for better stateful application performance.
        2.  **Extreme Technical Depth**: For every major update, explain the "Under the Hood" mechanics. Use terms like "NVMe-over-TCP," "TPU v5p Pods," "Cross-Region Replication latency," etc.
        3.  **Strategic Foresight**: Explain *why* Google is making these moves. Is it to counter AWS's latest release? Is it a shift towards sovereign cloud?
        4.  **Risk & Reliability (SRE Focus)**: Identify potential pitfalls. What could break? What are the migration risks?
        5.  **FinOps & Economic Impact**: Provide concrete cost implications. Use bolding for monetary or percentage impacts (e.g., **"reduces egress costs by up to 40%"**).

        ### 🔍 MANDATORY RESEARCH & TOOLS:
        1.  **Google Search tool**: Use it extensively for EVERY major update (at least 10-12 items). Find official documentation, whitepapers, and technical blogs to add "meat" to the summary.
        2.  **Upcoming Intelligence**: Search for webinars, Cloud Summits, and training sessions happening between ${new Date().toLocaleDateString()} and ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
        3.  **Reference Links**: Every single item in the "Technical Deep Dive" and "Priority Alerts" sections MUST include a direct, clickable reference link to official Google Cloud documentation.

        ### 📊 INPUT DATA (${timeWindow}):
        ${contextData}

        ### 🏛️ OUTPUT STRUCTURE (STRICT ADHERENCE REQUIRED):

        # 🛡️ GCP Pulse: Global Intelligence Briefing
        **Date:** ${new Date().toLocaleDateString()} | **Scope:** ${timeWindow} | **Classification:** HIGH-FIDELITY ARCHITECTURAL ANALYSIS

        ---

        ## 🧭 Quick Navigation
        - [🎯 Executive Summary](#executive-summary-the-bottom-line)
        - [🚀 The Week Ahead](#the-week-ahead-upcoming-events--deadlines)
        - [✨ Top 5 Strategic Releases](#top-5-strategic-release-notes-new-features)
        - [🏗️ Technical Deep Dive](#technical-deep-dive-architecture--engineering)
        - [⚠️ Critical Alerts](#critical-alerts-deprecations--breaking-changes)
        - [🛡️ Security, Compliance & SRE](#security-compliance--sre)
        - [🌐 Strategic Landscape](#strategic-landscape--market-dynamics)
        - [💰 FinOps & Business Value](#finops--business-value-analysis)
        - [📚 Intelligence Digest](#intelligence-digest-must-read--watch)

        ---

        ## 🎯 Executive Summary: The "Bottom Line"
        [A high-impact, 3-paragraph summary. 
        - Paragraph 1: The "Big Picture" of the week.
        - Paragraph 2: The most critical technical shift.
        - Paragraph 3: The most urgent risk.
        > **Strategic Takeaway:** [A one-sentence bold statement on the week's overall impact.]
        ]

        ---

        ## 🚀 The Week Ahead: Upcoming Events & Deadlines
        [Use a Markdown table for visibility. Use the Google Search tool to populate this.]
        | Date | Event / Deadline | Category | Impact / Action Required | Official Link |
        | :--- | :--- | :--- | :--- | :--- |
        | [Date] | [Name] | [Event/Deprecation/Launch] | [Brief Description] | [Link] |

        ---

        ## ✨ Top 5 Strategic Release Notes (New Features)
        [Highlight the 5 most game-changing new features or releases this week. Make it punchy, engaging, and highly relevant to enterprise architects.
        For EACH item:
        - 🌟 **[Feature Name]**: [1-2 sentence description of the feature and its strategic value]
        - 💡 **Why it matters**: [The business or technical impact - why should a CTO care?]
        - 🔗 **Link**: [Official release note or documentation link]
        ]

        ---

        ## 🏗️ Technical Deep Dive: Architecture & Engineering
        [In-depth analysis of the top 5-7 technical updates. 
        For EACH item:
        ### 🔹 [Product Name]: [Feature Name]
        - **The "Under the Hood" Mechanics:** [Deep technical explanation of how it works]
        - **Architectural Shift:** [How this changes existing design patterns or best practices]
        - **SRE & Performance Note:** [Impact on latency, throughput, or reliability]
        - **Architect's Recommendation:** [Specific advice on adoption or implementation]
        - **Reference:** [Link to documentation]
        ]

        ---

        ## ⚠️ Critical Alerts: Deprecations & Breaking Changes
        [MANDATORY: Use a Markdown table for the overview.]
        | Service | Change Type | Effective Date | Risk Level | Mitigation Strategy | Link |
        | :--- | :--- | :--- | :--- | :--- | :--- |
        | [Name] | [Deprecation/Change] | [Date] | [CRITICAL/HIGH] | [What to do] | [Link] |

        ### 🛠️ Detailed Migration Paths:
        *   **[Product Name]**: [Deep dive into the change, why it's happening, and a step-by-step migration path with links].

        ---

        ## 🛡️ Security, Compliance & SRE
        [Detailed analysis of Security Bulletins, CVEs, and Service Health. 
        - **Vulnerability Analysis:** [Explain the risk of any new CVEs]
        - **Remediation Steps:** [What security teams must do immediately]
        - **Compliance Impact:** [Does this affect SOC2, HIPAA, or GDPR?]
        ]

        ---

        ## 🌐 Strategic Landscape & Market Dynamics
        [How this week's news impacts GCP's position vs AWS/Azure. 
        - **Competitive Edge:** [Where GCP is leading]
        - **Industry Trends:** [Alignment with AI, Data Sovereignty, or Sustainability]
        ]

        ---

        ## 💰 FinOps & Business Value Analysis
        [Cost implications and ROI.
        - **Cost Optimization:** [Specific ways to save money with new features]
        - **Business Value:** [How these updates accelerate time-to-market or innovation]
        ]

        ---

        ## 📚 Intelligence Digest: Must-Read & Watch
        [Curated list of the most important Blog posts and YouTube videos. 
        - **[Title]**: [2-sentence "Why it's worth your time" + Link]
        ]

        ---
        **End of Briefing**
      `;

      const { getAiInstance } = await import('../services/geminiService');
      const ai = getAiInstance();
      setLoading(true);
      setProgress(10);
      setStatus("Analyzing input data...");
      
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite-preview',
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
