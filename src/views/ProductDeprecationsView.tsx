
import React from 'react';
import { FeedItem } from '../types';
import { ProductDeprecationsTimeline } from '../components/ProductDeprecationsTimeline';
import { ProductDeprecationsLoader } from '../components/ProductDeprecationsLoader';

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
      <div className="col-span-full flex justify-center items-center min-h-[400px]">
        <ProductDeprecationsLoader />
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
