import useSWR from 'swr';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const CACHE_PREFIX = 'yt_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Handle quota exceeded or other storage errors
    console.warn('Failed to cache YouTube API response');
  }
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = getFromCache<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  setCache(key, data);
  return data;
}

export interface YouTubeChannel {
  id: string;
  channelName: string;
  platform: 'youtube';
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

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  channelTitle: string;
  embedUrl: string;
}

async function fetcher(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch YouTube data');
  return response.json();
}

// Fetch video statistics directly
async function fetchVideoStats(videoIds: string[]): Promise<Record<string, { viewCount: number; likeCount: number }>> {
  if (!videoIds.length) return {};
  
  const statsUrl = `${YOUTUBE_API_BASE}/videos?part=statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  const data = await fetcher(statsUrl);
  
  return data.items.reduce((acc: Record<string, { viewCount: number; likeCount: number }>, item: any) => {
    acc[item.id] = {
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0
    };
    return acc;
  }, {});
}

export async function searchYouTubeChannel(keyword: string): Promise<YouTubeChannel | null> {
  const cacheKey = `channel-search-${keyword}`;
  
  try {
    return await fetchWithCache(cacheKey, async () => {
      const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&maxResults=1&type=channel&q=${encodeURIComponent(keyword)}&key=${YOUTUBE_API_KEY}`;
      const searchData = await fetcher(searchUrl);
      
      if (!searchData.items?.[0]) return null;
      
      const channelId = searchData.items[0].id.channelId;
      const channelUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      const channelData = await fetcher(channelUrl);
      
      if (!channelData.items?.[0]) return null;
      
      const channel = channelData.items[0];
      const stats = channel.statistics;
      
      return {
        id: channel.id,
        channelName: channel.snippet.title,
        platform: 'youtube',
        profileUrl: `https://youtube.com/channel/${channel.id}`,
        lastUpdated: new Date().toISOString(),
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.default.url,
        metrics: {
          followers: parseInt(stats.subscriberCount),
          engagement: calculateEngagement(stats),
          posts: parseInt(stats.videoCount)
        }
      };
    });
  } catch (error) {
    console.error('Error searching YouTube channel:', error);
    return null;
  }
}

// Deduplicated channel videos hook
export function useYouTubeVideos(channelId: string, maxResults = 10) {
  const key = channelId ? ['videos', channelId, maxResults] : null;
  
  const { data: videos, error, isLoading } = useSWR(
    key,
    async () => {
      const cacheKey = `channel-videos-${channelId}-${maxResults}`;
      
      return fetchWithCache(cacheKey, async () => {
        const searchUrl = `${YOUTUBE_API_BASE}/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=${maxResults}&type=video`;
        const searchData = await fetcher(searchUrl);
        
        const videoIds = searchData.items?.map((item: any) => item.id.videoId) || [];
        const statsData = await fetchVideoStats(videoIds);
        
        return searchData.items?.map((item: any) => {
          const stats = statsData[item.id.videoId] || { viewCount: 0, likeCount: 0 };
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            viewCount: stats.viewCount,
            likeCount: stats.likeCount,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
          };
        }) || [];
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_EXPIRY,
    }
  );

  return { videos, error, isLoading };
}

function calculateEngagement(statistics: any) {
  const views = parseInt(statistics.viewCount);
  const subs = parseInt(statistics.subscriberCount);
  const videos = parseInt(statistics.videoCount);
  
  if (videos === 0 || subs === 0) return 0;
  
  return Number(((views / videos) / subs * 100).toFixed(2));
}