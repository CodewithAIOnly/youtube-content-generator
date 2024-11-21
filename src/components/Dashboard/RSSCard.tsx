import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import type { RSSPost } from '../../services/rss';

interface RSSCardProps {
  post: RSSPost;
}

export function RSSCard({ post }: RSSCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {post.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600"
              >
                {category}
              </span>
            ))}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600"
            >
              {post.title}
            </a>
          </h3>
          <p className="mt-2 text-gray-600 text-sm line-clamp-2">
            {post.content.replace(/<[^>]*>/g, '')}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(post.publishedAt)}
        </div>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-indigo-600 hover:text-indigo-700"
        >
          Read More
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}