import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Zap, 
  Layout, 
  Search, 
  Filter, 
  Save, 
  Download, 
  Monitor, 
  BookOpen,
  MessageSquarePlus,
  Youtube,
  FileText,
  Database,
  ChevronRight,
  Info,
  History,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Globe,
  Lock,
  Terminal,
  Layers,
  RotateCw,
  Wrench,
  Server,
  GitMerge,
  Settings,
  Bookmark,
  Keyboard,
  Calendar,
  TrendingUp,
  Activity,
  ShieldAlert,
  Clock,
  ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Layout,
    content: (
      <div className="space-y-6">
        <div className="relative h-56 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl mb-6 group">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="relative text-center p-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-20 h-20 flex items-center justify-center overflow-hidden mx-auto mb-4 drop-shadow-lg">
                <img src="/logo.svg" alt="GCP Pulse Logo" className="w-full h-full object-contain" />
              </div>
            </motion.div>
            <h4 className="text-3xl font-black text-white tracking-tighter mb-2">GCP Pulse v2.7</h4>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">Enterprise Intelligence & Reliability</p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium italic">
          "The definitive intelligence layer for Google Cloud Platform."
        </p>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            GCP Pulse is an advanced intelligence platform that aggregates, analyzes, and synthesizes data from the entire Google Cloud ecosystem. It is built to solve the "information overload" problem for Cloud Architects and Platform Engineers.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Technical Architecture</h5>
            <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 list-disc pl-4">
              <li><strong>Real-time Aggregation:</strong> Multi-threaded polling of 15+ RSS, Atom, and HTML sources.</li>
              <li><strong>AI Synthesis:</strong> Deep integration with Gemini 3.1 Pro for semantic understanding and summarization.</li>
              <li><strong>Reliability:</strong> Built-in deployment self-healing with automatic cache synchronization.</li>
              <li><strong>Performance:</strong> Edge-optimized delivery with aggressive server-side and client-side caching.</li>
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 transition-all hover:shadow-md group">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold mb-2">
              <Globe size={18} />
              <span className="text-xs uppercase tracking-wider">Aggregate</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Unified feed from 15+ official GCP sources including Blog, Release Notes, and YouTube.</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 transition-all hover:shadow-md group">
            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-bold mb-2">
              <Cpu size={18} />
              <span className="text-xs uppercase tracking-wider">Synthesize</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">AI-powered technical summaries that extract business impact and migration requirements.</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 transition-all hover:shadow-md group">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
              <ShieldCheck size={18} />
              <span className="text-xs uppercase tracking-wider">Secure</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Proactive monitoring of Security Bulletins with direct CVE mapping and mitigation links.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'core-features',
    title: 'Core Features',
    icon: Zap,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              1. AI-Powered Weekly Brief
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every Monday, GCP Pulse synthesizes thousands of updates into a single executive report. It categorizes changes by product family (Compute, Data, AI, etc.) and identifies the top 3 items that require immediate architectural attention.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Search size={18} className="text-purple-500" />
              2. Smart Semantic Search
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Move beyond keyword matching. Our semantic search understands technical intent. Searching for "GKE security" will find updates about "Kubernetes vulnerabilities," "container hardening," and "IAM roles" even if the word "security" isn't in the title.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              3. Instant Technical Summaries
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Don't read 10-page blog posts. Click "Summarize" to get a 3-bullet point breakdown: <strong>What changed</strong>, <strong>Who is affected</strong>, and <strong>What to do next</strong>. Powered by Gemini 3.1 Pro.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-500" />
              4. Interactive Deprecations Timeline
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A dedicated view for tracking end-of-life services. See exactly when an API version or service will be retired and get AI-suggested migration paths to modern alternatives.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Activity size={18} className="text-red-500" />
              5. Real-time Service Health
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Integrated monitoring of the official GCP Service Health dashboard. Filter by your specific regions and services to see active incidents and historical reliability trends.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldAlert size={18} className="text-indigo-500" />
              6. Security Bulletin CVE Mapping
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stay ahead of vulnerabilities. Our security feed maps bulletins to specific CVE IDs and provides direct links to mitigation steps and official patches.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Server size={18} className="text-cyan-500" />
              7. GKE Version & Skew Intelligence
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track GKE version availability across Rapid, Regular, and Stable channels. The Skew Validator ensures your control plane and node pools are always in a supported state.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe size={18} className="text-teal-500" />
              8. Enterprise IP Management
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Quickly find and filter official Google Cloud IP ranges. Essential for firewall configuration and allowlisting. Supports CIDR lookup and service-specific filtering.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <RotateCw size={18} className="text-orange-500" />
              9. Deployment Self-Healing
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our platform automatically detects new deployments and clears browser caches/local storage to prevent "ChunkLoadErrors" and ensure you're always using the latest version.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Monitor size={18} className="text-pink-500" />
              10. Presentation Mode
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Optimized for team syncs and large screens. Toggle with the "P" key to hide sidebars and navigation, focusing entirely on the intelligence feed.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'whats-new',
    title: "What's New",
    icon: History,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-4">
            <CheckCircle2 size={20} />
            <span className="text-lg">Release Notes v2.7 (March 2026)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><RotateCw size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Deployment Self-Healing</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatic cache flushing and version synchronization during new Cloud Run deployments. No more stale assets.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Clock size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">"Last 24" Filter</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Instantly view the 24 most recent release notes. Optimized for mobile and desktop quick-checks.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">CVE Severity Mapping</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Security bulletins now include direct severity scores and links to official CVE databases for deeper analysis.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Zap size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Gemini 3.1 Integration</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Upgraded intelligence engine for faster summarization and more accurate semantic search results.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Server size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">GKE Version & Skew Intelligence</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Track GKE version availability and ensure control plane/node pool compatibility.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Globe size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Enterprise IP Management</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Searchable database of official Google Cloud IP ranges for firewall config.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Monitor size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Presentation Mode</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Optimized UI for team syncs and large screens. Toggle with the "P" key.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'strategic-views',
    title: 'Strategic Views',
    icon: TrendingUp,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Weekly Brief</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The <strong>Weekly Brief</strong> is your Monday morning executive summary. It uses Gemini to analyze the last 7 days of updates across all sources, grouping them by product family and highlighting the "Top 3" most critical changes for your organization.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ZapOff size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Product Deprecations</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Never be surprised by a service shutdown. The <strong>Deprecations</strong> view provides a chronological timeline of upcoming service retirements, API version sunsets, and feature removals.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Activity size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Service Health</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time monitoring of the Google Cloud Service Health dashboard. Filter by region and service to see ongoing incidents and historical stability data.
            </p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-red-900/30 rounded-lg">
                <ShieldAlert size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Security Bulletins</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Direct feed of GCP Security Bulletins. Each entry is enriched with CVE severity scores and links to mitigation steps. Use this view to stay ahead of vulnerabilities.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'usage',
    title: 'Advanced Usage',
    icon: Monitor,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal size={18} className="text-blue-500" />
            Smart Search Patterns
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The Smart Search (Sparkle icon) supports natural language. Try these patterns:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
              "Show me all GKE security updates from the last month"
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
              "What are the latest BigQuery performance improvements?"
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
              "Find deprecations related to Cloud Functions"
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={18} className="text-purple-500" />
            Architecture View
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Use the <strong>Architecture</strong> tab to find reference designs. Click on a card to see the AI analysis of how this architecture applies to modern multi-cloud or hybrid-cloud scenarios.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'limits',
    title: 'Limits & Limitations',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800">
          <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            Platform Constraints
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">AI Quotas</p>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                <li><strong>Rate Limit:</strong> 500 requests per 60 minutes per user.</li>
                <li><strong>Token Limit:</strong> Summaries are capped at 4,000 input characters to prevent context overflow.</li>
                <li><strong>Concurrency:</strong> Maximum 3 concurrent summarization tasks per user.</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Data Freshness</p>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                <li><strong>RSS Polling:</strong> Feeds are checked every 15 minutes.</li>
                <li><strong>Cache TTL:</strong> Backend cache for feed items is 5 minutes. Use "Force Refresh" to bypass.</li>
                <li><strong>History:</strong> The platform maintains a rolling 90-day window of updates for most views.</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">UI Limitations</p>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                <li><strong>Mobile:</strong> Presentation mode is disabled on screens smaller than 768px.</li>
                <li><strong>Export:</strong> CSV export is limited to the first 1,000 items in the current view.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ai-intelligence',
    title: 'AI Intelligence',
    icon: Sparkles,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-800">
          <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
            <Sparkles size={18} />
            Gemini 3.1 Pro Integration
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            GCP Pulse leverages the latest <strong>Gemini 3.1 Pro</strong> model to provide deep technical insights. Unlike standard LLMs, our integration is tuned specifically for Google Cloud's technical documentation and release patterns.
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl h-fit">
                <Zap size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Context-Aware Summarization</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Our summarization engine doesn't just shorten text; it identifies <strong>breaking changes</strong>, <strong>new API endpoints</strong>, and <strong>pricing updates</strong>. It provides a "Migration Difficulty" score (Low/Medium/High) for major updates.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl h-fit">
                <Search size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Semantic Intent Mapping</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">When you search, Gemini maps your query to the underlying GCP service hierarchy. A search for "serverless scaling" will automatically include Cloud Run, Cloud Functions, and App Engine results.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl h-fit">
                <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Trend Analysis</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">The AI monitors the frequency of updates across product areas to identify "Hot Topics" in the GCP ecosystem, helping you focus your learning and architectural reviews.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'reliability',
    title: 'Reliability & Deployment',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <RotateCw size={18} />
            Self-Healing Infrastructure
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            To ensure zero-interruption updates, GCP Pulse implements a sophisticated deployment synchronization system.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Automatic Cache Invalidation</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">When a new version is detected, the app automatically clears LocalStorage, SessionStorage, and Cache Storage. This prevents "stale state" bugs and ensures you always see the latest data.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Chunk Load Recovery</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">If a network error occurs during a version transition (e.g., a script chunk is missing), the Global Error Boundary catches it and performs a "Hard Reset" to restore application health.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'tools',
    title: 'Engineering Tools',
    icon: Wrench,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
          <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
            <Wrench size={18} />
            Platform Engineering Utilities
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl h-fit">
                <Globe size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">IP Range Intelligence</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Access a searchable database of all Google Cloud IP ranges. Filter by service (e.g., "Googlebot", "CloudFront") or region. Includes CIDR validation and export capabilities.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl h-fit">
                <Server size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">GKE Lifecycle Management</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Visualize GKE version availability across all release channels. Includes "Auto-Upgrade" windows and "End of Support" alerts for your specific cluster versions.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl h-fit">
                <GitMerge size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Version Skew Validator</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Ensure your Kubernetes control plane and worker nodes are compatible. Our validator uses official GCP skew policies to highlight potential upgrade risks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    icon: Keyboard,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Keyboard size={18} />
            Global Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Focus Search Bar</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">/</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Toggle Presentation Mode</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">P</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Open User Guide</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">G</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Force Refresh Data</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">R</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Switch to Weekly Brief</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">Ctrl + 1</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Switch to Discover Feed</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">Ctrl + 2</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Switch to Service Health</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">Ctrl + 3</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <span className="text-slate-600 dark:text-slate-400">Switch to Security Bulletins</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">Ctrl + 4</kbd>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: Info,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-red-500/30 transition-colors shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <Lock size={16} className="text-red-500" />
              "Quota Exceeded" (429 Error)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> You've exceeded the Gemini API rate limit for your project.<br/>
              <strong>Solution:</strong> Wait 5-10 minutes. Avoid rapid-fire summarization. The quota resets hourly. If you are an enterprise user, consider upgrading your API tier.
            </p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 transition-colors shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <Search size={16} className="text-blue-500" />
              "No Results Found"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Over-restrictive filters or search query.<br/>
              <strong>Solution:</strong> Click "Clear All Filters" in the empty state view. Ensure the "Smart Filter" is off if you are looking for exact keywords. Check if you have accidentally selected a category with no recent updates.
            </p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition-colors shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <RotateCw size={16} className="text-emerald-500" />
              Feed is Stale or Not Updating
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Browser cache or proxy delay.<br/>
              <strong>Solution:</strong> Use the "Force Refresh" button (top right) or press <kbd className="px-1 bg-slate-100 dark:bg-slate-700 rounded text-[9px]">R</kbd>. This sends a `refresh=true` flag to the backend to purge the RSS cache and fetch fresh data from Google's servers.
            </p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-500/30 transition-colors shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Summarization "Hallucinations"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> AI interpreting sparse metadata or complex technical jargon.<br/>
              <strong>Solution:</strong> Always verify critical technical details by clicking "View Original" to read the source documentation. AI summaries are intended as a guide, not a replacement for official docs.
            </p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500/30 transition-colors shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <Zap size={16} className="text-purple-500" />
              Application "Repairing..." Screen
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> A new version of the app was deployed and your browser had stale assets.<br/>
              <strong>Solution:</strong> Wait for the repair to complete. The app will automatically clear its cache and reload to ensure you're on the latest, most secure version.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'tips',
    title: 'Pro Tips',
    icon: Zap,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800">
          <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
            <Sparkles size={18} />
            Strategic Intelligence Hacks
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Cross-Reference Security & Releases</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">When viewing a Security Bulletin, use <strong>Smart Search</strong> to find related Release Notes. Often, a security patch is accompanied by a product update that might require configuration changes or offer new hardening features.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Architecture Synthesis for Design</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">The <strong>Architecture</strong> view isn't just for reading. Use it to understand how Google Cloud recommends building for scale. The AI summaries here focus on "Why" (the architectural rationale) rather than just "How" (the implementation steps).</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Mastering Smart Semantic Filters</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Combine the <strong>Smart Filter</strong> with specific product names (e.g., "GKE", "BigQuery") to quickly isolate noise from signal during major product launches like Google Cloud Next or I/O.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Leveraging the "Last 24" Filter</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Use the <strong>Last 24</strong> filter in Release Notes to instantly see the most recent announcements. This is perfect for your daily morning sync to ensure you haven't missed any overnight breaking changes.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <Zap size={18} />
            Efficiency & Productivity Hacks
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Force Refresh for Critical Events</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">During major events (like Google Cloud Next), use the <strong>Force Refresh</strong> button (top right) to bypass the 5-minute RSS cache and get updates as they hit the wire.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Presentation Mode for Standups</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Press <kbd className="px-1 bg-slate-100 dark:bg-slate-700 rounded text-[9px]">P</kbd> during team standups to hide navigation and focus on the feed. It makes it much easier for everyone to see the content on a shared screen.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Deep Linking to Bulletins</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Every card has a unique URL state. You can copy the URL from your browser's address bar after selecting a card to share that specific update directly with your team.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#1a1b1e] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] max-h-[700px]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">User Guide</h2>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {GUIDE_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeSection === section.id
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <section.icon size={16} className={activeSection === section.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                <span className="truncate">{section.title}</span>
                {activeSection === section.id && <ChevronRight size={12} className="ml-auto flex-shrink-0" />}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">GCP Pulse v2.6</p>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-end">
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {GUIDE_SECTIONS.find(s => s.id === activeSection)?.title}
                  </h3>
                  <div className="w-12 h-1 bg-blue-600 rounded-full" />
                </div>
                
                {GUIDE_SECTIONS.find(s => s.id === activeSection)?.content}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Need more help? Contact the GCP Pulse team.</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
