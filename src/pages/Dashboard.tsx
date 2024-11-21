import React, { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CompetitorSection } from '../components/Dashboard/CompetitorSection';
import { KeywordsList } from '../components/Dashboard/KeywordsList';
import { useUserStore } from '../store/userStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useCalendarStore } from '../store/calendarStore';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { searchYouTubeChannel } from '../services/youtube';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Lightbulb, 
  Bell,
  BarChart2,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  Search,
  Loader2,
  Youtube,
  Video
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { preferences } = useUserStore();
  const { channelMetrics, setChannelMetrics } = useDashboardStore();
  const { events } = useCalendarStore();
  const youtubeCompetitors = preferences.competitors.filter(c => c.platform === 'youtube');
  const [channelInput, setChannelInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get upcoming events
  const upcomingContent = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2);
  }, [events]);

  const notifications = [
    { id: '1', type: 'trend', message: 'New trending topic in your niche: "AI Development"' },
    { id: '2', type: 'competitor', message: 'Competitor posted high-performing content' }
  ];

  const handleChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const channel = await searchYouTubeChannel(channelInput.trim());
      if (channel) {
        setChannelMetrics({
          channelName: channel.channelName,
          views: channel.metrics.followers * 100,
          viewsChange: 15,
          engagement: channel.metrics.engagement,
          engagementChange: 5,
          subscribers: channel.metrics.followers,
          subscribersChange: 3
        });
        setChannelInput('');
      } else {
        setError('Channel not found');
      }
    } catch (err) {
      setError('Failed to fetch channel data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in {preferences.contentType.join(', ')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* YouTube Performance Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Youtube className="w-5 h-5 mr-2 text-red-600" />
              YouTube Performance
            </h2>
            
            {!channelMetrics ? (
              <form onSubmit={handleChannelSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={channelInput}
                    onChange={(e) => {
                      setChannelInput(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter YouTube channel name"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !channelInput.trim()}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Get Channel Stats'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 pb-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {channelMetrics.channelName}
                  </h3>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <div className="flex items-center">
                    <span className="font-semibold">{channelMetrics.views.toLocaleString()}</span>
                    <span className={`ml-2 flex items-center ${channelMetrics.viewsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {channelMetrics.viewsChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {Math.abs(channelMetrics.viewsChange)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Engagement</span>
                  <div className="flex items-center">
                    <span className="font-semibold">{channelMetrics.engagement}%</span>
                    <span className={`ml-2 flex items-center ${channelMetrics.engagementChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {channelMetrics.engagementChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {Math.abs(channelMetrics.engagementChange)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subscribers</span>
                  <div className="flex items-center">
                    <span className="font-semibold">{channelMetrics.subscribers.toLocaleString()}</span>
                    <span className={`ml-2 flex items-center ${channelMetrics.subscribersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {channelMetrics.subscribersChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {Math.abs(channelMetrics.subscribersChange)}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChannelMetrics(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Check Another Channel
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Content */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Upcoming Content
            </h2>
            <div className="space-y-3">
              {upcomingContent.length > 0 ? (
                upcomingContent.map(content => (
                  <div key={content.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{content.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(content.date)}</p>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs flex items-center">
                      <Video className="w-3 h-3 mr-1" />
                      {content.type}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No upcoming content scheduled
                </p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-indigo-600" />
              Notifications
            </h2>
            <div className="space-y-3">
              {notifications.map(notification => (
                <div key={notification.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Recommendation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Today's Content Recommendation
            </h2>
            <button 
              onClick={() => navigate('/content-ideas')}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View More Ideas
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              "10 Essential Developer Tools for 2024"
            </h3>
            <p className="text-gray-600 mb-4">
              This topic is trending in your niche with high engagement potential.
              Recent competitor videos on similar topics have averaged 15K+ views.
            </p>
            <button className="btn-secondary">
              Save for Later
            </button>
          </div>
        </div>

        <ErrorBoundary>
          {/* Competitor Insights */}
          {youtubeCompetitors.length > 0 && (
            <div className="space-y-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                Competitor Insights
              </h2>
              {youtubeCompetitors.map(competitor => (
                <CompetitorSection key={competitor.id} competitor={competitor} />
              ))}
            </div>
          )}

          {/* Trending Keywords */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trending Keywords
            </h2>
            <KeywordsList keywords={preferences.keywords} />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}