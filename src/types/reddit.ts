export interface SubredditConfig {
  id?: string;
  subreddit: string;
  sortType: 'top' | 'rising' | 'new';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  minScore?: number;
  limit?: number;
  isActive: boolean;
  fetchInterval: number;
}

export interface FetcherScheduleConfig {
  id?: string;
  name: string;
  subreddits: SubredditConfig[];
  isActive: boolean;
  lastFetch?: Date;
} 