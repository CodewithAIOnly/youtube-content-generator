import useSWR from 'swr';

export interface RSSPost {
  id: string;
  title: string;
  content: string;
  link: string;
  author: string;
  publishedAt: string;
  categories: string[];
}

async function fetchRSS(url: string): Promise<RSSPost[]> {
  try {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(corsProxy + encodeURIComponent(url));
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = xml.querySelectorAll('item');

    return Array.from(items).map((item, index) => {
      const getElementText = (tagName: string) => 
        item.querySelector(tagName)?.textContent || '';

      const categories = Array.from(item.querySelectorAll('category'))
        .map(cat => cat.textContent || '')
        .filter(Boolean);

      return {
        id: getElementText('guid') || `${url}-${index}`,
        title: getElementText('title'),
        content: getElementText('content:encoded') || getElementText('description'),
        link: getElementText('link'),
        author: getElementText('dc:creator') || getElementText('author'),
        publishedAt: getElementText('pubDate'),
        categories,
      };
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw error;
  }
}

export function useRSSFeed(url: string) {
  const { data, error, isLoading } = useSWR(
    ['rss', url],
    () => fetchRSS(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return { posts: data || [], error, isLoading };
}