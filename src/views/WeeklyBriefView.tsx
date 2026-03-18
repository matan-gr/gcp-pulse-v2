import React from 'react';
import { FeedItem } from '../types';
import { Sparkles, RefreshCw, Calendar, FileText, Download, Share2, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { useWeeklyBrief } from '../hooks/useWeeklyBrief';
import { Tooltip } from '../components/ui/Tooltip';
import { toast } from 'sonner';
import { marked } from 'marked';
import { AILoading } from '../components/ui/AILoading';

interface WeeklyBriefViewProps {
  items: FeedItem[];
}

export const WeeklyBriefView = React.memo<WeeklyBriefViewProps>(({ items }) => {
  const { brief, loading, progress, status, lastUpdated, error, generateBrief } = useWeeklyBrief(items);

  const handleRefresh = () => {
    generateBrief(true);
  };

  const handleExport = async () => {
    if (!brief) return;
    
    const htmlContent = await marked.parse(brief);
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Cloud Brief - ${new Date().toLocaleDateString()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    :root {
      --color-primary: #1a73e8;
      --color-primary-dark: #1557b0;
      --color-bg: #ffffff;
      --color-text: #202124;
      --color-text-muted: #5f6368;
      --color-border: #dadce0;
      --color-accent-bg: #e8f0fe;
    }

    body {
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--color-text);
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 800px;
      margin: 40px auto;
      background: var(--color-bg);
      border-radius: 24px;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    header {
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      backdrop-filter: blur(4px);
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .meta {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
    }

    .content {
      padding: 40px;
    }

    /* Markdown Styles */
    .prose h1 { color: var(--color-text); font-size: 28px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; margin-top: 0; font-weight: 600; }
    .prose h2 { color: var(--color-text); font-size: 22px; margin-top: 32px; margin-bottom: 16px; font-weight: 600; }
    .prose h3 { color: var(--color-text); font-size: 18px; margin-top: 24px; margin-bottom: 12px; font-weight: 600; }
    .prose p { margin-bottom: 16px; }
    .prose ul, .prose ol { margin-bottom: 16px; padding-left: 24px; }
    .prose li { margin-bottom: 8px; }
    .prose blockquote {
      border-left: 4px solid var(--color-primary);
      background: var(--color-accent-bg);
      padding: 16px 24px;
      margin: 24px 0;
      border-radius: 0 12px 12px 0;
      font-style: italic;
    }
    .prose a { color: var(--color-primary); text-decoration: none; font-weight: 500; }
    .prose a:hover { text-decoration: underline; }
    .prose strong { font-weight: 600; color: #202124; }

    footer {
      padding: 24px 40px;
      background: #f8f9fa;
      border-top: 1px solid var(--color-border);
      text-align: center;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    @media print {
      body { background-color: white; }
      .container { box-shadow: none; border: none; margin: 0; max-width: 100%; }
      header { background: white; color: black; border-bottom: 2px solid black; }
      .logo-icon { border: 1px solid black; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header style="background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);">
      <div class="logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="m13 2-2 2.5h3L12 13h2l-4 9 1-9h-3z"/></svg>
        </div>
        <div class="logo-text">GCP Pulse</div>
      </div>
      <h1>Weekly Cloud Brief</h1>
      <div class="meta">Generated on ${new Date().toLocaleDateString()}</div>
    </header>
    <div class="content prose">
      ${htmlContent}
    </div>
    <footer>
      &copy; ${new Date().getFullYear()} GCP Pulse. All rights reserved. Generated by AI.
    </footer>
  </div>
</body>
</html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-cloud-brief-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Brief exported as rich HTML", { description: "Your download should begin shortly." });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GCP Pulse: Weekly Intelligence Briefing',
          text: 'Check out this week\'s Google Cloud intelligence report!',
          url: window.location.href,
        });
      } catch (err: any) {
        // Silently handle user cancellation
        if (err.name === 'AbortError') return;
        
        // For other errors (like NotAllowedError in iframes), fallback to clipboard
        console.warn('Web Share API failed, falling back to clipboard:', err);
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard", { description: "Sharing was restricted, so we copied the link for you." });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const MarkdownComponents = {
    h1: ({children, ...props}: any) => {
      const id = typeof children === 'string' ? children.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : undefined;
      return <h1 id={id} className="text-3xl font-bold text-[#202124] dark:text-slate-100 mb-6 pb-4 border-b border-[#dadce0] dark:border-slate-700" {...props}>{children}</h1>;
    },
    h2: ({children, ...props}: any) => {
      const id = typeof children === 'string' ? children.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : undefined;
      return <h2 id={id} className="text-2xl font-semibold text-[#202124] dark:text-slate-100 mt-8 mb-4 flex items-center" {...props}>{children}</h2>;
    },
    h3: ({children, ...props}: any) => {
      const id = typeof children === 'string' ? children.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : undefined;
      return <h3 id={id} className="text-xl font-semibold text-[#3c4043] dark:text-slate-300 mt-6 mb-3" {...props}>{children}</h3>;
    },
    strong: ({...props}: any) => (
      <strong className="font-semibold text-[#202124] dark:text-slate-100" {...props} />
    ),
    ul: ({...props}: any) => (
      <ul className="space-y-2 my-4 list-disc list-outside ml-5 text-[#3c4043] dark:text-slate-300" {...props} />
    ),
    ol: ({...props}: any) => (
      <ol className="space-y-2 my-4 list-decimal list-outside ml-5 text-[#3c4043] dark:text-slate-300" {...props} />
    ),
    li: ({...props}: any) => (
      <li className="leading-relaxed pl-1">{props.children}</li>
    ),
    table: ({...props}: any) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-[#dadce0] dark:border-slate-700 shadow-sm">
        <table className="w-full text-left border-collapse" {...props} />
      </div>
    ),
    thead: ({...props}: any) => (
      <thead className="bg-[#f8f9fa] dark:bg-slate-800" {...props} />
    ),
    th: ({...props}: any) => (
      <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] dark:text-slate-300 uppercase tracking-widest border-b border-[#dadce0] dark:border-slate-700" {...props} />
    ),
    td: ({...props}: any) => (
      <td className="px-4 py-3 text-[13px] text-[#3c4043] dark:text-slate-300 border-b border-[#dadce0] dark:border-slate-700 align-top" {...props} />
    ),
    tr: ({...props}: any) => (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
    ),
    blockquote: ({...props}: any) => (
      <blockquote className="pl-6 border-l-4 border-[#1a73e8] bg-[#f8faff] dark:bg-blue-500/10 py-4 pr-6 rounded-r-2xl my-8 text-[#3c4043] dark:text-slate-300 italic shadow-sm" {...props} />
    ),
    p: ({...props}: any) => (
      <p className="mb-6 leading-relaxed text-[#3c4043] dark:text-slate-300 text-[15px]" {...props} />
    ),
    a: ({...props}: any) => (
      <a className="text-[#1a73e8] dark:text-blue-400 hover:text-[#1557b0] dark:hover:text-blue-300 underline underline-offset-4 decoration-2 decoration-blue-500/30 hover:decoration-blue-500 transition-all font-semibold" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    hr: ({...props}: any) => (
      <hr className="my-12 border-[#dadce0] dark:border-slate-800" {...props} />
    ),
    code: ({...props}: any) => (
      <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-sm font-mono text-[#d93025] dark:text-red-400 font-medium" {...props} />
    ),
    pre: ({...props}: any) => (
      <pre className="p-6 bg-[#1e293b] dark:bg-slate-950 rounded-2xl overflow-x-auto my-8 font-mono text-sm border border-slate-700 shadow-xl" {...props} />
    ),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#dadce0] dark:border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2 border border-blue-100 dark:border-blue-500/20">
            <Sparkles size={12} className="mr-1.5" />
            AI Intelligence
          </div>
          <Tooltip content="The Weekly Brief is an AI-generated synthesis of the most critical cloud updates from the past 7 days." position="right">
            <h1 className="text-4xl font-extrabold text-[#202124] dark:text-white tracking-tight leading-none flex items-center gap-3 cursor-help">
              Weekly Brief
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </h1>
          </Tooltip>
          <p className="text-[#5f6368] dark:text-slate-400 flex items-center text-sm font-medium">
            <Calendar size={16} className="mr-2 text-slate-400" />
            {lastUpdated 
              ? `Updated ${lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` 
              : loading 
                ? 'Analyzing latest cloud signals...' 
                : 'Your personalized GCP intelligence report'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {brief && (
            <>
              <button
                onClick={handleShare}
                className="h-10 w-10 bg-white dark:bg-slate-800 border border-[#dadce0] dark:border-slate-700 rounded-xl text-[#3c4043] dark:text-slate-200 hover:bg-[#f8f9fa] dark:hover:bg-slate-700 transition-all flex items-center justify-center shadow-sm active:scale-95"
                title="Share Brief"
              >
                <Share2 size={14} />
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="h-10 px-4 bg-white dark:bg-slate-800 border border-[#dadce0] dark:border-slate-700 rounded-xl text-xs font-bold text-[#3c4043] dark:text-slate-200 hover:bg-[#f8f9fa] dark:hover:bg-slate-700 transition-all flex items-center disabled:opacity-50 shadow-sm active:scale-95 group"
              >
                <RefreshCw size={14} className={`mr-2 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </>
          )}
          <button
            onClick={handleExport}
            disabled={!brief || loading}
            className="h-10 px-5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold hover:bg-[#1557b0] transition-all flex items-center disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95"
          >
            <Download size={14} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#dadce0] dark:border-slate-800 shadow-xl overflow-hidden min-h-[600px] relative">
        {!loading && !brief && !error ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center min-h-[600px]">
             <div className="relative mb-8">
               <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
               <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                 <Sparkles size={64} className="text-[#1a73e8] dark:text-blue-400" />
               </div>
             </div>
             <h2 className="text-3xl font-black text-[#202124] dark:text-white mb-4 tracking-tight">
               Unlock Your Weekly Intelligence
             </h2>
             <p className="text-[#5f6368] dark:text-slate-400 max-w-lg mb-10 text-lg leading-relaxed">
               Our AI engine analyzes thousands of signals from official release notes, security bulletins, and architectural updates to synthesize a high-impact briefing tailored for cloud leaders.
             </p>
             <button
               onClick={() => generateBrief(true)}
               className="px-8 py-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center active:scale-95"
             >
               <Sparkles size={20} className="mr-3" />
               Generate Intelligence Report
             </button>
          </div>
        ) : loading ? (
          <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-center">
            <div className="w-full max-w-md p-12 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-10 relative inline-block"
              >
                <div className="absolute inset-0 bg-blue-500/30 blur-2xl animate-pulse rounded-full" />
                <Sparkles size={80} className="text-[#1a73e8] dark:text-blue-400 relative animate-bounce" />
              </motion.div>
              <h2 className="text-2xl font-black text-[#202124] dark:text-white mb-3 tracking-tight">Synthesizing Intelligence</h2>
              <p className="text-[#5f6368] dark:text-slate-400 text-sm mb-8 font-medium">{status}</p>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing Pipeline</p>
                <p className="text-xs font-bold text-[#1a73e8] dark:text-blue-400 font-mono">{progress}%</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-3xl mb-6 border border-red-100 dark:border-red-500/20">
              <FileText size={48} className="text-[#ea4335] dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-[#202124] dark:text-white mb-2">Analysis Interrupted</h3>
            <p className="text-[#5f6368] dark:text-slate-400 mb-8 text-base max-w-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-[#1a73e8] text-white rounded-2xl font-bold hover:bg-[#1557b0] transition-all active:scale-95 shadow-lg"
            >
              Restart Analysis
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="p-8 md:p-12 lg:p-16"
          >
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                {brief || ''}
              </ReactMarkdown>
            </article>
            
            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium italic">
                This report was synthesized using advanced AI models and real-time cloud signals.
              </p>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified Intelligence</span>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});
