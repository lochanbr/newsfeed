// News API fetching logic

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
}

export async function fetchNews(country: string, category: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  if (!apiKey) throw new Error('News API key not found');

  // Example using NewsData.io API
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=${country}&category=${category}&language=en`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('News API request failed');
  const data = await response.json();

  // Map API response to NewsArticle[]
  return (data.results || []).map((item: any) => ({
    title: item.title,
    description: item.description,
    url: item.link,
    image: item.image_url || '/placeholder.jpg',
    source: item.source_id || 'Unknown',
  }));
}
