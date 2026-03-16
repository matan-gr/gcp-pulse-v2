
import React from 'react';
import { FeedItem } from '../types';
import { ProductDeprecationsTimeline } from '../components/ProductDeprecationsTimeline';
import { TimelineSkeleton } from '../components/SkeletonLoader';

interface ProductDeprecationsViewProps {
  items: FeedItem[];
  loading: boolean;
  onSummarize?: (item: FeedItem) => void;
  summarizingId?: string | null;
}

export const ProductDeprecationsView: React.FC<ProductDeprecationsViewProps> = ({ 
  items, 
  loading,
  onSummarize,
  summarizingId
}) => {
  if (loading) {
    return (
      <div className="col-span-full space-y-8">
        {[1, 2, 3].map(i => <TimelineSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <ProductDeprecationsTimeline 
        items={items} 
        onSummarize={onSummarize}
        summarizingId={summarizingId}
      />
    </div>
  );
};
