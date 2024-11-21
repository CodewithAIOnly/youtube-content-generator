import { YouTubeVideo } from './youtube';

interface TitlePattern {
  pattern: string;
  frequency: number;
  engagement: number;
}

interface VideoMetrics {
  views: number;
  likes: number;
  publishDate: Date;
  viewsPerDay: number;
}

interface TrendingTopic {
  title: string;
  category: string;
  momentum: number;
  relatedVideos: YouTubeVideo[];
  hashtags: string[];
}

function calculateVideoMetrics(video: YouTubeVideo): VideoMetrics {
  const publishDate = new Date(video.publishedAt);
  const daysSincePublished = Math.max(1, (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    views: video.viewCount || 0,
    likes: video.likeCount || 0,
    publishDate,
    viewsPerDay: (video.viewCount || 0) / daysSincePublished
  };
}

export function analyzeTitlePatterns(videos: YouTubeVideo[]): TitlePattern[] {
  const patterns: Record<string, { count: number; totalEngagement: number }> = {};
  
  videos.forEach(video => {
    const title = video.title.toLowerCase();
    const engagement = video.viewCount + (video.likeCount * 2);

    if (title.includes('how to')) {
      addPattern(patterns, 'How to', engagement);
    }
    if (title.match(/top\s*\d+/)) {
      addPattern(patterns, 'Top X', engagement);
    }
    if (title.includes('why')) {
      addPattern(patterns, 'Why', engagement);
    }
    if (title.includes('vs')) {
      addPattern(patterns, 'Comparison', engagement);
    }
    if (title.match(/\d+\s*(tips|tricks|ways|steps)/)) {
      addPattern(patterns, 'Numbered List', engagement);
    }
  });

  return Object.entries(patterns)
    .map(([pattern, data]) => ({
      pattern,
      frequency: data.count,
      engagement: Math.round(data.totalEngagement / data.count)
    }))
    .sort((a, b) => b.engagement - a.engagement);
}

function addPattern(
  patterns: Record<string, { count: number; totalEngagement: number }>,
  pattern: string,
  engagement: number
) {
  if (!patterns[pattern]) {
    patterns[pattern] = { count: 0, totalEngagement: 0 };
  }
  patterns[pattern].count++;
  patterns[pattern].totalEngagement += engagement;
}

export function generateTitleSuggestions(
  videos: YouTubeVideo[],
  patterns: TitlePattern[],
  keywords: string[]
): string[] {
  const suggestions: string[] = [];
  const topPattern = patterns[0]?.pattern;

  const topTopics = videos
    .sort((a, b) => (b.viewCount + b.likeCount) - (a.viewCount + a.likeCount))
    .slice(0, 3)
    .map(video => {
      const title = video.title.toLowerCase();
      return title.split(/[-–—:]/).pop()?.trim() || title;
    });

  keywords.forEach(keyword => {
    switch (topPattern) {
      case 'How to':
        suggestions.push(`How to Master ${keyword} Like a Pro`);
        break;
      case 'Top X':
        suggestions.push(`Top 5 ${keyword} Techniques You Need to Know`);
        break;
      case 'Why':
        suggestions.push(`Why ${keyword} Is More Important Than Ever`);
        break;
      case 'Comparison':
        const pairs = keywords.filter(k => k !== keyword).slice(0, 1);
        if (pairs.length) {
          suggestions.push(`${keyword} vs ${pairs[0]}: Which Is Better?`);
        }
        break;
      case 'Numbered List':
        suggestions.push(`7 Game-Changing ${keyword} Tips for 2024`);
        break;
      default:
        suggestions.push(`The Ultimate Guide to ${keyword}`);
    }
  });

  return suggestions.slice(0, 5);
}

export function analyzeTrends(videos: YouTubeVideo[], contentType: string): TrendingTopic[] {
  if (!Array.isArray(videos) || videos.length === 0) return [];

  const keywordMap = new Map<string, {
    count: number;
    momentum: number;
    recentViews: number;
    videos: YouTubeVideo[];
    hashtags: Set<string>;
    lastPublished: Date;
    avgViewsPerDay: number;
  }>();

  videos.forEach(video => {
    if (!video?.title || !video.publishedAt) return;

    const metrics = calculateVideoMetrics(video);
    const isRecent = (Date.now() - metrics.publishDate.getTime()) < (30 * 24 * 60 * 60 * 1000);

    const titleWords = video.title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !['with', 'this', 'that', 'from', 'have', 'what', 'when', 'where', 'will'].includes(word)
      );

    const phrases = [];
    for (let i = 0; i < titleWords.length - 1; i++) {
      phrases.push(`${titleWords[i]} ${titleWords[i + 1]}`);
      if (i < titleWords.length - 2) {
        phrases.push(`${titleWords[i]} ${titleWords[i + 1]} ${titleWords[i + 2]}`);
      }
    }

    [...titleWords, ...phrases].forEach(keyword => {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          count: 0,
          momentum: 0,
          recentViews: 0,
          videos: [],
          hashtags: new Set(),
          lastPublished: metrics.publishDate,
          avgViewsPerDay: 0
        });
      }

      const data = keywordMap.get(keyword)!;
      data.count++;
      data.momentum += metrics.viewsPerDay;
      data.videos.push(video);
      
      if (isRecent) {
        data.recentViews += metrics.views;
      }
      
      if (metrics.publishDate > data.lastPublished) {
        data.lastPublished = metrics.publishDate;
      }

      data.avgViewsPerDay = data.videos.reduce((acc, v) => {
        const m = calculateVideoMetrics(v);
        return acc + m.viewsPerDay;
      }, 0) / data.videos.length;

      const hashtags = video.description?.match(/#[\w-]+/g) || [];
      hashtags.forEach(tag => data.hashtags.add(tag));
    });
  });

  return Array.from(keywordMap.entries())
    .map(([keyword, data]) => {
      const recencyBonus = (Date.now() - data.lastPublished.getTime()) < (7 * 24 * 60 * 60 * 1000) ? 1.5 : 1;
      const consistencyScore = data.count > 1 ? data.count / 10 : 0;
      const viewsScore = Math.log10(data.recentViews + 1) / 5;
      const momentumScore = data.avgViewsPerDay > 1000 ? Math.log10(data.avgViewsPerDay) / 3 : 0;

      const trendScore = (
        (viewsScore + momentumScore + consistencyScore) * 
        recencyBonus
      );

      return {
        title: keyword.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        category: contentType,
        momentum: Math.round(trendScore * 100) / 100,
        relatedVideos: data.videos
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 3),
        hashtags: Array.from(data.hashtags).slice(0, 5)
      };
    })
    .filter(topic => topic.momentum > 0.5)
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 6);
}