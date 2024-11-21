import React from 'react';
import { ExternalLink, Eye, ThumbsUp } from 'lucide-react';
import type { YouTubeVideo } from '../../services/youtube';

interface YouTubeCardProps {
  video: YouTubeVideo;
}

export function YouTubeCard({ video }: YouTubeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {video.title}
          </h3>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {video.viewCount.toLocaleString()} views
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {video.likeCount.toLocaleString()} likes
            </div>
          </div>
        </div>
        <a
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 text-indigo-600 hover:text-indigo-700"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}