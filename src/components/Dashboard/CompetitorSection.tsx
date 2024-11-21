import React, { memo } from 'react';
import { YouTubeCard } from './YouTubeCard';
import { useYouTubeVideos } from '../../services/youtube';
import type { YouTubeChannel } from '../../services/youtube';
import { ErrorBoundary } from '../ErrorBoundary';

interface CompetitorSectionProps {
  competitor: YouTubeChannel;
}

function CompetitorSectionContent({ competitor }: CompetitorSectionProps) {
  const { videos, isLoading: isLoadingVideos } = useYouTubeVideos(competitor.id, 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Latest Content from {competitor.channelName}
        </h2>
        <div className="space-y-4">
          {isLoadingVideos ? (
            <div className="animate-pulse space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            videos?.map((video) => (
              <YouTubeCard key={video.id} video={video} />
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Channel Analytics
        </h2>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Subscribers</p>
              <p className="text-xl font-semibold">
                {competitor.metrics.followers.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Engagement</p>
              <p className="text-xl font-semibold">
                {competitor.metrics.engagement}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Videos</p>
              <p className="text-xl font-semibold">
                {competitor.metrics.posts.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-semibold">
              {new Date(competitor.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CompetitorSection = memo(function CompetitorSection(props: CompetitorSectionProps) {
  return (
    <ErrorBoundary>
      <CompetitorSectionContent {...props} />
    </ErrorBoundary>
  );
});