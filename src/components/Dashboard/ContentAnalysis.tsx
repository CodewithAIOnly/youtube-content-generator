import React from 'react';
import { BarChart2, ThumbsUp, MessageSquare } from 'lucide-react';
import type { ContentAnalysis } from '../../services/gemini';

interface ContentAnalysisProps {
  analysis: ContentAnalysis;
}

export function ContentAnalysisCard({ analysis }: ContentAnalysisProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Content Analysis</h3>
        <span className="flex items-center text-blue-600">
          <BarChart2 className="w-5 h-5 mr-1" />
          Score: {analysis.contentScore}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Main Themes</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.themes.map((theme, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThumbsUp className={`w-5 h-5 ${
            analysis.sentiment === 'positive' ? 'text-green-500' :
            analysis.sentiment === 'negative' ? 'text-red-500' :
            'text-yellow-500'
          }`} />
          <span className="text-sm text-gray-600 capitalize">
            {analysis.sentiment} Sentiment
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            Suggested Improvements
          </h4>
          <ul className="space-y-2">
            {analysis.suggestedImprovements.map((improvement, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="mr-2">•</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}