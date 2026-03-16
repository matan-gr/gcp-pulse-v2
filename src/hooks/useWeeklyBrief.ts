import { useWeeklyBriefContext } from '../contexts/WeeklyBriefContext';
import { FeedItem } from '../types';

export const useWeeklyBrief = (_items: FeedItem[]) => {
  return useWeeklyBriefContext();
};
