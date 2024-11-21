import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CompetitorCard } from '../components/Dashboard/CompetitorCard';
import { Plus, Search, Loader2, X } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { searchYouTubeChannel, type YouTubeChannel } from '../services/youtube';

export function Competitors() {
  const { preferences, setPreferences } = useUserStore();
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
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
        if (preferences.competitors.some(c => c.id === channel.id)) {
          setError('This channel has already been added');
          return;
        }
        setPreferences({ 
          competitors: [...preferences.competitors, channel] 
        });
        setInput('');
        setIsAddingCompetitor(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competitors</h1>
            <p className="text-gray-600 mt-1">
              Track and analyze your competitors' content
            </p>
          </div>
          <button 
            onClick={() => setIsAddingCompetitor(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Competitor
          </button>
        </div>

        {isAddingCompetitor && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add YouTube Channel</h2>
              <button 
                onClick={() => setIsAddingCompetitor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        )}

        {preferences.competitors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No competitors added yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Add competitors to start tracking their content
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {preferences.competitors.map((competitor) => (
              <CompetitorCard key={competitor.id} competitor={competitor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}