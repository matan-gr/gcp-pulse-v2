import React from 'react';
import { cn } from '../utils';

interface SkeletonProps {
  className?: string;
}

const SkeletonBase: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("bg-slate-200 dark:bg-slate-800 animate-pulse rounded", className)} />
);

export const StatSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#dadce0] dark:border-slate-700 shadow-sm flex flex-col justify-between h-32">
    <div className="space-y-2">
      <SkeletonBase className="h-3 w-24" />
      <SkeletonBase className="h-8 w-16" />
    </div>
    <SkeletonBase className="h-3 w-20" />
  </div>
);

export const CardSkeleton = ({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) => {
  const isList = viewMode === 'list';
  
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex",
      isList ? "flex-row h-48" : "flex-col h-[450px]"
    )}>
      <div className={cn(
        "bg-slate-100 dark:bg-slate-800",
        isList ? "w-52 h-full" : "w-full h-48"
      )} />
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <SkeletonBase className="h-4 w-24 rounded-full" />
          <SkeletonBase className="h-4 w-16 rounded-full" />
        </div>
        <SkeletonBase className="h-6 w-5/6 rounded-lg" />
        <div className="space-y-2 flex-1">
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-2/3" />
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <SkeletonBase className="h-8 w-24 rounded-lg" />
          <div className="flex space-x-2">
            <SkeletonBase className="h-8 w-8 rounded-full" />
            <SkeletonBase className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SecuritySkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#dadce0] dark:border-slate-700 border-l-[6px] border-l-slate-200 dark:border-l-slate-800 p-6 shadow-sm">
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
      <div className="space-y-3 flex-1">
        <div className="flex gap-2">
          <SkeletonBase className="h-5 w-20 rounded-full" />
          <SkeletonBase className="h-5 w-24 rounded-full" />
          <SkeletonBase className="h-5 w-16 rounded-full" />
        </div>
        <SkeletonBase className="h-7 w-3/4 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <SkeletonBase className="h-9 w-28 rounded-lg" />
        <SkeletonBase className="h-9 w-9 rounded-full" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-2/3" />
    </div>
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
      <SkeletonBase className="h-5 w-24 rounded-md" />
      <SkeletonBase className="h-5 w-24 rounded-md" />
    </div>
  </div>
);

export const TimelineSkeleton = () => (
  <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 mb-12">
    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-[#1a1b1e]" />
    <SkeletonBase className="h-6 w-32 mb-8 rounded-lg" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CardSkeleton viewMode="list" />
      <CardSkeleton viewMode="list" />
    </div>
  </div>
);

export const IncidentSkeleton = () => (
  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
      <SkeletonBase className="h-4 w-24 rounded-full" />
      <SkeletonBase className="h-3 w-32" />
    </div>
    <div className="p-6 space-y-4">
      <SkeletonBase className="h-5 w-32 rounded-lg" />
      <SkeletonBase className="h-7 w-5/6 rounded-lg" />
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);
