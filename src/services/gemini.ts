import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ContentAnalysis {
  themes: string[];
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  contentScore: number;
  suggestedImprovements: string[];
}

export async function analyzeContent(content: string): Promise<ContentAnalysis> {
  try {
    const prompt = `
      Analyze the following content and provide:
      1. Main themes (max 3)
      2. Key keywords (max 5)
      3. Overall sentiment
      4. Content quality score (0-100)
      5. Suggested improvements (max 3)

      Content: ${content}

      Respond only with a JSON object in this exact format:
      {
        "themes": ["theme1", "theme2", "theme3"],
        "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "sentiment": "positive",
        "contentScore": 85,
        "suggestedImprovements": ["improvement1", "improvement2", "improvement3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      return {
        themes: ['Content Analysis'],
        keywords: ['analysis', 'content', 'quality'],
        sentiment: 'neutral',
        contentScore: 70,
        suggestedImprovements: ['Consider adding more detail']
      };
    }
  } catch (error) {
    console.error('Content analysis error:', error);
    // Return default analysis on error
    return {
      themes: ['Content Analysis'],
      keywords: ['analysis', 'content', 'quality'],
      sentiment: 'neutral',
      contentScore: 70,
      suggestedImprovements: ['Consider adding more detail']
    };
  }
}

export async function generateContentIdeas(topic: string, competitors: string[]): Promise<string[]> {
  try {
    const prompt = `
      Generate 5 unique content ideas based on this topic: "${topic}"
      Consider these existing titles for reference: ${competitors.slice(0, 5).join(', ')}
      
      Create unique, engaging titles that are different from the reference content.
      Each title should be compelling and SEO-friendly.
      
      Respond with only a JSON array of strings, each string being a title.
      Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const ideas = JSON.parse(response);
      if (Array.isArray(ideas) && ideas.length > 0) {
        return ideas;
      }
      throw new Error('Invalid response format');
    } catch {
      // Fallback titles based on topic
      return [
        `Ultimate Guide to ${topic}`,
        `Top 10 ${topic} Tips for 2024`,
        `How to Master ${topic} Like a Pro`,
        `${topic} Secrets Revealed`,
        `Essential ${topic} Strategies`
      ];
    }
  } catch (error) {
    console.error('Content generation error:', error);
    // Return default ideas based on topic
    return [
      `Ultimate Guide to ${topic}`,
      `Top 10 ${topic} Tips for 2024`,
      `How to Master ${topic} Like a Pro`,
      `${topic} Secrets Revealed`,
      `Essential ${topic} Strategies`
    ];
  }
}