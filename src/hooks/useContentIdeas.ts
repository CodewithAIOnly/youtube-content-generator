import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useYouTubeVideos } from '../services/youtube';
import { generateContentIdeas } from '../services/gemini';
import { analyzeTitlePatterns, generateTitleSuggestions } from '../services/contentAnalysis';
import type { ContentIdea } from '../types';

const HISTORY_KEY = 'content_ideas_history';
const CURRENT_IDEAS_KEY = 'content_ideas_current';
const MAX_HISTORY_ITEMS = 100;

function getStoredIdeas(key: string): ContentIdea[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeIdeas(key: string, ideas: ContentIdea[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ideas));
  } catch {
    console.warn(`Failed to save ideas to ${key}`);
  }
}

function generateDefaultIdeas(keywords: string[]): ContentIdea[] {
  const timestamp = new Date().toISOString();
  return keywords.flatMap((keyword, keywordIndex) => [
    {
      id: `default-${timestamp}-${keywordIndex}-1`,
      title: `Ultimate Guide to ${keyword}`,
      description: 'Based on keyword analysis',
      source: 'Keyword Analysis',
      confidence: 85,
      category: keyword,
      generatedAt: timestamp
    },
    {
      id: `default-${timestamp}-${keywordIndex}-2`,
      title: `Top 10 ${keyword} Trends for 2024`,
      description: 'Based on keyword analysis',
      source: 'Keyword Analysis',
      confidence: 82,
      category: keyword,
      generatedAt: timestamp
    }
  ]);
}

export function useContentIdeas() {
  const [currentIdeas, setCurrentIdeas] = useState<ContentIdea[]>(() => getStoredIdeas(CURRENT_IDEAS_KEY));
  const [historicalIdeas, setHistoricalIdeas] = useState<ContentIdea[]>(() => {
    // Get stored ideas and sort by generation date (newest first)
    const stored = getStoredIdeas(HISTORY_KEY);
    return stored
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, MAX_HISTORY_ITEMS);
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { preferences } = useUserStore();
  
  const youtubeCompetitors = preferences.competitors.filter(c => c.platform === 'youtube');
  const competitorVideoHooks = youtubeCompetitors.map(competitor => 
    useYouTubeVideos(competitor.id, 20)
  );

  // Persist current ideas whenever they change
  useEffect(() => {
    storeIdeas(CURRENT_IDEAS_KEY, currentIdeas);
  }, [currentIdeas]);

  // Persist historical ideas whenever they change, maintaining the limit
  useEffect(() => {
    const sortedHistory = [...historicalIdeas]
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, MAX_HISTORY_ITEMS);
    
    storeIdeas(HISTORY_KEY, sortedHistory);
  }, [historicalIdeas]);

  const generateIdeas = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Archive current ideas to history if they exist
      if (currentIdeas.length > 0) {
        const updatedHistory = [...currentIdeas, ...historicalIdeas]
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
          .slice(0, MAX_HISTORY_ITEMS);
        setHistoricalIdeas(updatedHistory);
      }

      // Generate ideas based on keywords and competitors
      const timestamp = new Date().toISOString();
      let newIdeas: ContentIdea[] = [];

      // Get competitor videos for context
      const allVideos = competitorVideoHooks.flatMap(hook => hook.videos || []);
      const patterns = analyzeTitlePatterns(allVideos);

      // Generate ideas for each keyword
      for (const keyword of preferences.keywords) {
        try {
          // Get AI-generated ideas
          const aiIdeas = await generateContentIdeas(
            keyword,
            allVideos.map(v => v.title)
          );

          // Get pattern-based suggestions
          const patternIdeas = generateTitleSuggestions(
            allVideos,
            patterns,
            [keyword]
          );

          // Combine and format ideas
          const combinedIdeas = [
            ...aiIdeas.map((title, index) => ({
              id: `ai-${timestamp}-${keyword}-${index}`,
              title,
              description: 'AI-generated content idea',
              source: 'AI Generator',
              confidence: Math.round(85 + (Math.random() * 10)),
              category: keyword,
              generatedAt: timestamp
            })),
            ...patternIdeas.map((title, index) => ({
              id: `pattern-${timestamp}-${keyword}-${index}`,
              title,
              description: 'Based on competitor patterns',
              source: 'Pattern Analysis',
              confidence: Math.round(90 - (index * 2)),
              category: keyword,
              generatedAt: timestamp
            }))
          ];

          newIdeas = [...newIdeas, ...combinedIdeas];
        } catch (error) {
          console.warn(`Error generating ideas for keyword "${keyword}":`, error);
          // Add fallback ideas for this keyword
          newIdeas = [...newIdeas, ...generateDefaultIdeas([keyword])];
        }
      }

      // Ensure we have at least some ideas
      if (newIdeas.length === 0) {
        newIdeas = generateDefaultIdeas(preferences.keywords);
      }

      setCurrentIdeas(newIdeas);
    } catch (error) {
      console.error('Error in idea generation:', error);
      // Set fallback ideas if everything fails
      setCurrentIdeas(generateDefaultIdeas(preferences.keywords));
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    currentIdeas,
    historicalIdeas: historicalIdeas.slice(0, MAX_HISTORY_ITEMS), // Ensure we never return more than the limit
    isProcessing,
    generateIdeas
  };
}