import { RecommendResponse } from '../types';

/**
 * Sends favourite movies list to backend POST /recommend endpoint
 */
export async function getMovieRecommendations(
  movies: string[],
  recommendNiche: boolean = false
): Promise<RecommendResponse> {
  const cleanMovies = movies.map((m) => m.trim()).filter(Boolean);

  const response = await fetch('/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      movies: cleanMovies,
      recommendNiche,
    }),
  });

  if (!response.ok) {
    // Attempt fallback endpoint if primary returns error
    const fallbackResponse = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movies: cleanMovies,
        recommendNiche,
      }),
    });

    if (!fallbackResponse.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
    }

    return await fallbackResponse.json();
  }

  return await response.json();
}
