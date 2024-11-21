export interface Competitor {
  id: string;
  name: string;
  platform: 'youtube' | 'blog';
  profileUrl: string;
  lastUpdated: string;
  description: string;
  thumbnail: string;
  metrics: {
    followers: number;
    engagement: number;
    posts: number;
  };
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  source: string;
  confidence: number;
  category: string;
  generatedAt: string;
  scheduledDate?: string;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  momentum: number;
  source: string;
  hashtags?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'content' | 'reminder';
  status: 'draft' | 'scheduled' | 'published';
  description?: string;
  category?: string;
}

export interface PaymentEvent {
  id: string;
  type: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'subscription_expired';
  attributes: {
    product_name: string;
    renews_at?: string;
    ends_at?: string;
    status: string;
  };
}