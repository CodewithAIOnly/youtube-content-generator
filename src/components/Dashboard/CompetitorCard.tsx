import React, { useState } from 'react';
import { ExternalLink, TrendingUp, Users, Video, Search, Trash2, Eye } from 'lucide-react';
import type { Competitor } from '../../types';
import { analyzeContent } from '../../services/gemini';
import { ContentAnalysisCard } from './ContentAnalysis';
import { useUserStore } from '../../store/userStore';
import { useYouTubeVideos } from '../../services/youtube';

interface CompetitorCardProps {
  competitor: Competitor;
}

export function CompetitorCard({ competitor }: CompetitorCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const removeCompetitor = useUserStore((state) => state.removeCompetitor);
  const { videos, isLoading: isLoadingVideos } = useYouTubeVideos(competitor.id, 5);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeContent(competitor.name);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing competitor:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    removeCompetitor(competitor.id);
    setShowConfirmDelete(false);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow relative">
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center p-6 z-10">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Competitor?
            </h4>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove {competitor.name}?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            {competitor.platform === 'youtube' ? (
              <>
                <Video className="w-4 h-4 mr-1" />
                {competitor.channelName}
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-1" />
                {competitor.platform}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
          </button>
          <a 
            href={competitor.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {competitor.metrics.followers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {competitor.metrics.engagement.toLocaleString()}%
          </p>
          <p className="text-sm text-gray-500">Engagement</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {competitor.metrics.posts}
          </p>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
      </div>

      {/* Top Videos Section */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Top Videos</h4>
        {isLoadingVideos ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-16 ml-2"></div>
              </div>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map((video) => (
              <a
                key={video.id}
                href={`https://youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between group"
              >
                <p className="text-sm text-gray-600 group-hover:text-indigo-600 truncate flex-1">
                  {video.title}
                </p>
                <span className="text-sm text-gray-500 flex items-center ml-2">
                  <Eye className="w-4 h-4 mr-1" />
                  {formatViews(video.viewCount)}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No videos available</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Last updated: {new Date(competitor.lastUpdated).toLocaleDateString()}
          </span>
          <span className="flex items-center text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            +5.2%
          </span>
        </div>
      </div>

      {analysis && (
        <div className="mt-4">
          <ContentAnalysisCard analysis={analysis} />
        </div>
      )}
    </div>
  );
}