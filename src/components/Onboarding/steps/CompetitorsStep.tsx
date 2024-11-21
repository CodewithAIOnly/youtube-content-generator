import React, { useState } from 'react';
import { X, Plus, Search, Loader2, Rss } from 'lucide-react';
import { searchYouTubeChannel } from '../../../services/youtube';
import type { YouTubeChannel } from '../../../services/youtube';

interface CompetitorsStepProps {
  onComplete: (data: { competitors: YouTubeChannel[] }) => void;
}

export function CompetitorsStep({ onComplete }: CompetitorsStepProps) {
  const [competitors, setCompetitors] = useState<YouTubeChannel[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCompetitor = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const channel = await searchYouTubeChannel(input.trim());
      if (channel) {
        if (competitors.some(c => c.id === channel.id)) {
          setError('This channel has already been added');
          return;
        }
        setCompetitors([...competitors, channel]);
        setInput('');
      } else {
        setError('Channel not found');
      }
    } catch (err) {
      setError('Failed to add channel');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Add YouTube channels you'd like to track
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder="Enter YouTube channel name"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={handleAddCompetitor}
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-1" />
                Add
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {competitors.map((competitor) => (
          <div
            key={competitor.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img 
                    src={competitor.thumbnail} 
                    alt={competitor.channelName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{competitor.channelName}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {competitor.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCompetitor(competitor.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Followers</p>
                  <p className="font-medium">{competitor.metrics.followers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Engagement</p>
                  <p className="font-medium">{competitor.metrics.engagement}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Posts</p>
                  <p className="font-medium">{competitor.metrics.posts}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onComplete({ competitors })}
        disabled={competitors.length === 0}
        className="w-full btn-primary disabled:opacity-50"
      >
        Complete Setup
      </button>
    </div>
  );
}