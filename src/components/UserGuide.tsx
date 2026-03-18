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
              <Sparkles size={56} className="text-white/90 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h4 className="text-3xl font-black text-white tracking-tighter mb-2">GCP Pulse v2.6</h4>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">The Intelligence Layer for Google Cloud</p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium italic">
          "Transforming the noise of the cloud into the signal of strategy."
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          GCP Pulse is an enterprise-grade intelligence platform designed for Cloud Architects, SREs, and Engineering Leaders. It synthesizes real-time data from across the Google Cloud ecosystem using <strong>Gemini 3.1 Pro</strong> to provide actionable insights, security alerts, and architectural guidance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 transition-all hover:shadow-md group">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold mb-2">
              <Globe size={18} />
              <span className="text-xs uppercase tracking-wider">Aggregate</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Unified feed from 12+ official GCP sources including Blog, Release Notes, and YouTube.</p>
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
    id: 'whats-new',
    title: "What's New",
    icon: History,
    content: (
      <div className="space-y-6">
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-4">
            <CheckCircle2 size={20} />
            <span className="text-lg">Release Notes v2.6 (March 2026)</span>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Clock size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Product Deprecations Timeline</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">A new specialized view to track end-of-life services. Visualize deprecation dates on a timeline and get AI-powered migration advice.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Bookmark size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Console Shortcuts v2</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Expanded library of 20+ direct links to GCP services. New categories for Databases, Serverless, and Security Management.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-800 rounded-md h-fit"><Monitor size={12} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Presentation Mode Enhancements</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Optimized grid layouts for large screens and projectors. Toggle with the "P" key to hide sidebars and focus on content during team syncs.</p>
              </div>
            </li>
          </ul>
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
            Gemini-Powered Features
          </h4>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl h-fit">
                <Zap size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Instant Summarization</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Click the "Summarize" button on any card to generate a concise technical summary. Gemini extracts key takeaways, technical impact, and action items.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl h-fit">
                <Search size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Smart Semantic Search</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Toggle the sparkle icon in the search bar to use semantic search. Instead of keyword matching, Gemini understands the intent of your query (e.g., "security issues in GKE").</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl h-fit">
                <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Weekly Intelligence Brief</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">The Weekly Brief uses AI to synthesize the most important updates from the past 7 days into a structured report, categorized by product area.</p>
              </div>
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
            Built-in Utilities
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl h-fit">
                <Globe size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">IP Range Finder</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Search and filter official Google Cloud IP ranges. Supports CIDR lookup and service-specific filtering (e.g., CloudFront, Googlebot).</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl h-fit">
                <Server size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">GKE Lifecycle Tracker</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Monitor GKE version availability across Rapid, Regular, and Stable channels. Includes end-of-life dates and upgrade recommendations.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl h-fit">
                <GitMerge size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">GKE Skew Validator</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Validate control plane and node pool version compatibility against official Google Cloud skew policies to prevent upgrade failures.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl h-fit">
                <Bookmark size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Console Shortcuts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Quick access to the most used Google Cloud Console pages. Filter by category to find Compute, Storage, or Networking resources instantly.</p>
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
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Global Keyboard Shortcuts</h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Focus Search Bar</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">/</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Toggle Presentation Mode</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">P</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Switch to Weekly Brief</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">Ctrl + 1</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Switch to Discover Feed</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">Ctrl + 2</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Switch to Service Health</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">Ctrl + 3</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Switch to Security Bulletins</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">Ctrl + 4</kbd>
            </div>
            <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Switch to Engineering Tools</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold shadow-sm">Ctrl + 9</kbd>
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
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-red-500/30 transition-colors">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
              <Lock size={14} className="text-red-500" />
              "Quota Exceeded" (429 Error)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Cause:</strong> You've exceeded the Gemini API rate limit.<br/>
              <strong>Solution:</strong> Wait 5-10 minutes. Avoid rapid-fire summarization. The quota resets hourly.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 transition-colors">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
              <Search size={14} className="text-blue-500" />
              "No Results Found"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Cause:</strong> Over-restrictive filters or search query.<br/>
              <strong>Solution:</strong> Click "Clear All Filters" in the empty state view. Ensure the "Smart Filter" is off if you are looking for exact keywords.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition-colors">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
              <RotateCw size={14} className="text-emerald-500" />
              Feed is Stale
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Cause:</strong> Browser cache or proxy delay.<br/>
              <strong>Solution:</strong> Use the "Force Refresh" button in the header. This sends a `refresh=true` flag to the backend to purge the RSS cache.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-500/30 transition-colors">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Summarization "Hallucinations"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Cause:</strong> AI interpreting sparse metadata.<br/>
              <strong>Solution:</strong> Always verify critical technical details by clicking "View Original" to read the source documentation.
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
        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800">
          <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
            <Sparkles size={18} />
            Strategic Intelligence
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Cross-Reference Security</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">When viewing a Security Bulletin, use the <strong>Smart Search</strong> to find related Release Notes. Often, a security patch is accompanied by a product update that might require configuration changes.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Architecture Synthesis</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">The <strong>Architecture</strong> view isn't just for reading. Use it to understand how Google Cloud recommends building for scale. The AI summaries here focus on "Why" rather than just "How".</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
            <Zap size={18} />
            Efficiency Hacks
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Force Refresh for Critical Updates</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">During major events (like Google Cloud Next), use the <strong>Force Refresh</strong> button (top right) to bypass the 15-minute RSS cache and get updates as they hit the wire.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Deep Linking</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Every card has a direct link to the source. If a summary mentions a specific CLI command or API, click the source link to jump directly to the official documentation for the full syntax.</p>
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
