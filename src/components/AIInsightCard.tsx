import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { cn } from '../utils';

interface AIInsightCardProps {
  analysis: AnalysisResult;
  isCompact?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ analysis, isCompact }) => {
  const isHighPriority = (analysis.chartData?.actionPriority ?? 0) > 70;

  return (
    <div className={cn(
      "mb-3 rounded-2xl border relative overflow-hidden group/ai shadow-sm transition-all duration-300",
      "bg-gradient-to-br from-white to-slate-50 dark:from-[var(--color-bg-card-dark)] dark:to-[var(--color-bg-app-dark)]",
      isHighPriority 
        ? "border-rose-200 dark:border-rose-900/30" 
        : "border-blue-100 dark:border-blue-500/20",
      isCompact ? 'p-4' : 'p-5'
    )}>
      {/* Subtle background glow */}
      <div className={cn(
        "absolute inset-0 opacity-10 transition-opacity duration-500 group-hover/ai:opacity-20",
        isHighPriority ? "bg-rose-500" : "bg-blue-500"
      )} />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={cn(
          "flex items-center text-[11px] font-bold uppercase tracking-widest",
          isHighPriority ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"
        )}>
          <Sparkles size={14} className="mr-2" />
          AI Intelligence
        </div>
        <div className="flex gap-2">
          {analysis.chartData?.actionPriority !== undefined && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1",
              isHighPriority 
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800" 
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            )}>
              {isHighPriority ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
              Priority: {isHighPriority ? 'High' : 'Normal'}
            </span>
          )}
          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/30">
              {analysis.actionItems.length} Actions
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3 relative z-10">
        <p className={cn(
          "text-slate-800 dark:text-slate-200 leading-relaxed font-medium",
          isCompact ? 'text-[13px] line-clamp-2' : 'text-[14px] line-clamp-3'
        )}>
          {analysis.summary.split('\n')[0].replace(/^\*\*|\*\*$/g, '')}
        </p>
        
        {!isCompact && analysis.strategicImportance && (
          <div className={cn(
            "flex items-start space-x-2 text-[12px] italic pl-3 border-l-2",
            isHighPriority 
              ? "text-rose-600/80 dark:text-rose-400/80 border-rose-200 dark:border-rose-500/30"
              : "text-slate-500 dark:text-[var(--color-text-muted-dark)] border-blue-200 dark:border-blue-500/30"
          )}>
            <TrendingUp size={12} className="mt-0.5 shrink-0" />
            <p className="line-clamp-2">{analysis.strategicImportance}</p>
          </div>
        )}
      </div>
    </div>
  );
};
