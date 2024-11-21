import React, { useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TrendingTopicCard } from '../components/Dashboard/TrendingTopicCard';
import { Filter, TrendingUp, Hash } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useYouTubeVideos } from '../services/youtube';
import { analyzeTrends } from '../services/contentAnalysis';
import { ErrorBoundary } from '../components/ErrorBoundary';

function TrendsContent() {
  const { preferences } = useUserStore();
  const youtubeCompetitors = preferences.competitors.filter(c => c.platform === 'youtube');

  const competitorVideoHooks = youtubeCompetitors.map(competitor => {
    return useYouTubeVideos(competitor.id, 10);
  });

  const trendingTopics = useMemo(() => {
    const allVideos = competitorVideoHooks
      .filter(hook => !hook.error && Array.isArray(hook.videos))
      .flatMap(hook => hook.videos || []);

    return analyzeTrends(allVideos, preferences.contentType[0] || 'General');
  }, [competitorVideoHooks, preferences.contentType]);

  const trendingHashtags = useMemo(() => {
    if (!Array.isArray(trendingTopics)) return [];
    
    const hashtags = trendingTopics
      .filter(topic => Array.isArray(topic.hashtags))
      .flatMap(topic => topic.hashtags);
    
    return Array.from(new Set(hashtags)).slice(0, 10);
  }, [trendingTopics]);

  const isLoading = competitorVideoHooks.some(hook => hook.isLoading);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trending Topics</h1>
          <p className="text-gray-600 mt-1">
            Discover trending topics in your niche
          </p>
        </div>
        <div className="flex gap-4">
          <select className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="btn-secondary">
            <Filter className="w-5 h-5 mr-2" />
            Filter Trends
          </button>
        </div>
      </div>

      {trendingHashtags.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2 text-indigo-600" />
            Trending Hashtags
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium"
              >
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      )}

      {trendingTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTopics.map((trend) => (
            <TrendingTopicCard key={trend.title} topic={trend} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No trends found</h3>
          <p className="text-gray-500 mt-2">
            Add more competitors or check back later for trending topics
          </p>
        </div>
      )}
    </>
  );
}

export function Trends() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <ErrorBoundary>
          <TrendsContent />
        </ErrorBoundary>
      </div>
    </div>
  );
}