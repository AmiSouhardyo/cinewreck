/**
 * Type definitions for cinewreck
 */

export interface MovieRecommendation {
  id: string;
  title: string;
  year: number;
  rating: number; // 5-star equivalent (e.g. 4.4)
  imdb_rating?: string; // Real IMDb score string e.g. "8.8" or "8.8/10"
  imdb_votes?: string; // Real IMDb votes string e.g. "2,410,000"
  metascore?: string; // Real Metascore e.g. "85"
  runtime?: string; // String e.g. "148 min"
  runtime_minutes?: number; // Integer e.g. 148
  category?: 'mainstream' | 'niche'; // Mainstream vs Niche / Hidden Gem
  poster: string;
  plot: string;
  why_like_it: string;
  trailer_url: string;
  youtube_id?: string;
  imdb_id?: string;
  genres: string[];
  director: string;
  match_score: number;
}

export interface RecommendResponse {
  recommendations: MovieRecommendation[];
  input_movies: string[];
  total_recommendations: number;
  recommendation_source: string;
}

export interface FavoritePreset {
  id: string;
  name: string;
  icon: string;
  movies: string[];
}
