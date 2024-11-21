import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Sparkles, Loader2, Clock } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useCalendarStore } from '../store/calendarStore';
import { useContentIdeas } from '../hooks/useContentIdeas';
import { DatePicker } from '../components/DatePicker';
import type { ContentIdea } from '../types';

export function ContentIdeas() {
  const { preferences } = useUserStore();
  const { currentIdeas, historicalIdeas, isProcessing, generateIdeas } = useContentIdeas();
  const addCalendarEvent = useCalendarStore((state) => state.addEvent);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [schedulingIdea, setSchedulingIdea] = useState<ContentIdea | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredIdeas = selectedCategory === 'all' 
    ? currentIdeas 
    : currentIdeas.filter(idea => idea.category === selectedCategory);

  const handleSchedule = (idea: ContentIdea) => {
    setSchedulingIdea(idea);
    setSelectedDate(new Date());
  };

  const confirmSchedule = () => {
    if (schedulingIdea) {
      addCalendarEvent({
        title: schedulingIdea.title,
        date: selectedDate.toISOString(),
        type: 'content',
        status: 'scheduled',
        description: schedulingIdea.description,
        category: schedulingIdea.category
      });
      setSchedulingIdea(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Ideas</h1>
            <p className="text-gray-600 mt-1">
              Generate and manage content ideas based on your keywords
            </p>
          </div>
          <button
            onClick={generateIdeas}
            disabled={isProcessing}
            className="btn-primary"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate New Ideas
              </>
            )}
          </button>
        </div>

        {/* Keywords/Categories Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto pb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Ideas
            </button>
            {preferences.keywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSelectedCategory(keyword)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === keyword
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* Current Ideas Table */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isProcessing ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea, index) => (
                    <tr key={idea.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {idea.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {idea.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {idea.confidence}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleSchedule(idea)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Schedule
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No ideas generated yet. Click "Generate New Ideas" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Ideas Section */}
        {historicalIdeas.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Previously Generated Ideas</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalIdeas.map((idea, index) => (
                      <tr key={idea.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {idea.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {idea.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {idea.confidence}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(idea.generatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Date Picker Modal */}
        {schedulingIdea && (
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onClose={() => setSchedulingIdea(null)}
            onSchedule={confirmSchedule}
          />
        )}
      </div>
    </div>
  );
}