import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import type { TrendingTopic } from '../../types';
import { generateContentIdeas } from '../../services/gemini';

interface TrendingTopicCardProps {
  topic: TrendingTopic;
}

export function TrendingTopicCard({ topic }: TrendingTopicCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const competitors = ['Example Title 1', 'Example Title 2'];
      const generatedIdeas = await generateContentIdeas(topic.title, competitors);
      setIdeas(generatedIdeas);
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm font-medium text-gray-500">{topic.category}</span>
        </div>
        <span className="flex items-center text-green-500 text-sm">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {topic.momentum}%
        </span>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-gray-900">{topic.title}</h3>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Source: {topic.source}
        </span>
        <button
          onClick={handleGenerateIdeas}
          disabled={isGenerating}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Ideas'
          )}
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Ideas</h4>
          <ul className="space-y-2">
            {ideas.map((idea, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="mr-2">•</span>
                {idea}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}