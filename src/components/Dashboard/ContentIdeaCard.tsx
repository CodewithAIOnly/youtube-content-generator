import React from 'react';
import { Calendar, Lightbulb, TrendingUp } from 'lucide-react';
import type { ContentIdea } from '../../types';

interface ContentIdeaCardProps {
  idea: ContentIdea;
}

export function ContentIdeaCard({ idea }: ContentIdeaCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-500">{idea.category}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">{idea.title}</h3>
          <p className="mt-2 text-gray-600 text-sm">{idea.description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {idea.confidence}% Match
          </span>
          <span className="text-sm text-gray-500">
            Source: {idea.source}
          </span>
        </div>
        
        {idea.scheduledDate ? (
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="text-sm">{new Date(idea.scheduledDate).toLocaleDateString()}</span>
          </div>
        ) : (
          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Schedule
          </button>
        )}
      </div>
    </div>
  );
}