import React from 'react';
import { Star, Play, Sparkles, Bookmark, BookmarkCheck, Clock, Award, Users, ExternalLink } from 'lucide-react';
import { MovieRecommendation } from '../types';

interface RecommendationCardProps {
  movie: MovieRecommendation;
  rank: number;
  onOpenTrailer: (movie: MovieRecommendation) => void;
  isSaved: boolean;
  onToggleSave: (movie: MovieRecommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  movie,
  rank,
  onOpenTrailer,
  isSaved,
  onToggleSave,
}) => {
  // Render rating stars (out of 5)
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    
    return (
      <div className="flex items-center space-x-0.5 text-[#f5c518]">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-3.5 h-3.5 fill-[#f5c518] text-[#f5c518]" />;
          } else if (i === fullStars && hasHalf) {
            return (
              <div key={i} className="relative w-3.5 h-3.5">
                <Star className="w-3.5 h-3.5 text-[#383838]" />
                <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                  <Star className="w-3.5 h-3.5 fill-[#f5c518] text-[#f5c518]" />
                </div>
              </div>
            );
          }
          return <Star key={i} className="w-3.5 h-3.5 text-[#383838]" />;
        })}
      </div>
    );
  };

  return (
    <div className="group relative bg-[#181818] border border-[#2a2a2a] hover:border-[#3d3d3d] rounded-lg overflow-hidden transition-all duration-200 shadow-md flex flex-col md:flex-row">
      {/* Rank Badge */}
      <div className="absolute top-0 left-0 z-20 px-3 py-1 bg-[#e50914] text-white font-bold text-xs rounded-br-md shadow-sm">
        #{rank}
      </div>

      {/* Movie Poster */}
      <div className="relative md:w-48 shrink-0 aspect-[2/3] overflow-hidden bg-[#141414]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent opacity-80 md:hidden"></div>

        {/* Quick Play Overlay on Poster */}
        <button
          onClick={() => onOpenTrailer(movie)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          title="Play Trailer"
        >
          <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </button>
      </div>

      {/* Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Header Row: Title & Save Action */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1 pr-12 sm:pr-0">
                <h3 className="text-xl font-bold text-white group-hover:text-[#e50914] transition-colors tracking-tight">
                  {movie.title}
                </h3>
                <span className="text-xs font-semibold text-[#a3a3a3] bg-[#262626] px-2 py-0.5 rounded">
                  {movie.year}
                </span>
              </div>
              <p className="text-xs text-[#a3a3a3] font-medium mt-0.5">
                Directed by <span className="text-gray-200">{movie.director}</span>
              </p>
            </div>

            {/* Match Score & Bookmark Save */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-2.5 py-1 text-xs font-bold bg-[#46d369]/10 text-[#46d369] border border-[#46d369]/30 rounded-full">
                {movie.match_score}% Match
              </span>
              <button
                onClick={() => onToggleSave(movie)}
                className={`p-2 rounded-md border transition-all ${
                  isSaved
                    ? 'bg-[#e50914]/20 border-[#e50914] text-[#e50914]'
                    : 'bg-[#262626] border-[#383838] text-[#a3a3a3] hover:text-white'
                }`}
                title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 fill-[#e50914]" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* OMDb Ratings, Metascore, Runtime & Votes Bar */}
          <div className="flex items-center space-x-2.5 my-2.5 flex-wrap gap-y-1.5 text-xs">
            {/* Real IMDb Score */}
            <div className="flex items-center space-x-1.5 bg-[#141414] px-2.5 py-1 rounded border border-[#2a2a2a]">
              {renderStars(movie.rating)}
              <span className="font-bold text-white ml-1">
                {movie.imdb_rating ? movie.imdb_rating : `${(movie.rating * 2).toFixed(1)}/10`}
              </span>
              <span className="text-[10px] font-bold text-black bg-[#f5c518] px-1 rounded">
                IMDb
              </span>
            </div>

            {/* Metascore if present */}
            {movie.metascore && (
              <div className="flex items-center space-x-1 bg-[#141414] px-2 py-1 rounded border border-[#2a2a2a]" title="Metascore">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-400">{movie.metascore}</span>
                <span className="text-[10px] text-[#a3a3a3]">Meta</span>
              </div>
            )}

            {/* Runtime */}
            {movie.runtime && (
              <div className="flex items-center space-x-1 bg-[#262626] px-2 py-1 rounded text-[#a3a3a3]">
                <Clock className="w-3 h-3 text-[#a3a3a3]" />
                <span className="font-medium text-gray-200">{movie.runtime}</span>
              </div>
            )}

            {/* Votes */}
            {movie.imdb_votes && (
              <div className="flex items-center space-x-1 bg-[#262626] px-2 py-1 rounded text-[#a3a3a3]">
                <Users className="w-3 h-3 text-[#a3a3a3]" />
                <span className="font-medium text-gray-200">{movie.imdb_votes} votes</span>
              </div>
            )}

            {/* Genres */}
            <div className="flex items-center space-x-1 flex-wrap gap-1">
              {(movie.genres || []).map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[11px] font-medium text-[#d4d4d4] bg-[#262626] rounded border border-[#333333]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Plot */}
          <p className="text-xs text-[#d4d4d4] leading-relaxed line-clamp-3 mb-3 font-normal">
            {movie.plot}
          </p>

          {/* "Why You Might Like It" section */}
          <div className="p-3 rounded-md bg-[#1f1f1f] border border-[#2e2e2e]">
            <div className="flex items-start space-x-2.5">
              <div className="p-1 rounded bg-[#e50914]/10 text-[#e50914] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#e50914] uppercase tracking-wider block mb-0.5">
                  Why You Might Like It
                </span>
                <p className="text-xs text-[#d4d4d4] leading-normal italic">
                  "{movie.why_like_it || movie.plot}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenTrailer(movie)}
            className="px-4 py-2 rounded-md bg-[#e50914] hover:bg-[#f40612] text-white font-bold text-xs transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Trailer</span>
          </button>

          <a
            href={`https://letterboxd.com/search/${encodeURIComponent(movie.title)}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-md bg-[#222222] hover:bg-[#2c2c2c] border border-[#383838] text-[#e5e5e5] hover:text-[#00e054] font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-sm"
            title={`View ${movie.title} on Letterboxd`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#00e054]" />
            <span>Letterboxd</span>
          </a>
        </div>
      </div>
    </div>
  );
};
