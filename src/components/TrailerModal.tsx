import React from 'react';
import { X, Film, Sparkles, ExternalLink, Star, Clock, Award, Users, Play } from 'lucide-react';
import { MovieRecommendation } from '../types';

interface TrailerModalProps {
  movie: MovieRecommendation | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  const query = `${movie.title} ${movie.year} official trailer`;
  const youtubeUrl = movie.youtube_id
    ? `https://www.youtube.com/watch?v=${movie.youtube_id}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const letterboxdUrl = `https://letterboxd.com/search/${encodeURIComponent(movie.title)}/`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-[#181818] border border-[#333333] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#2a2a2a] bg-[#141414]">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-[#e50914]" />
            <h3 className="text-lg font-bold text-white">
              {movie.title} <span className="text-[#a3a3a3] text-sm">({movie.year})</span>
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded bg-[#e50914] hover:bg-[#f40612] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-[#262626] hover:bg-[#333333] text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Backdrop Stage */}
        <div className="relative aspect-video w-full bg-[#0a0a0a] overflow-hidden group">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover opacity-35 filter blur-sm scale-105 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/60 to-black/40" />

          {/* Center Play Button Action */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e50914] hover:bg-[#f40612] text-white flex items-center justify-center shadow-2xl shadow-[#e50914]/50 transform hover:scale-110 transition-all duration-300"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
            </a>

            <div className="max-w-md space-y-2">
              <h4 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {movie.title}
              </h4>
              <p className="text-xs text-gray-300 font-medium">
                Click below to watch the official trailer directly on YouTube.
              </p>
            </div>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-[#e50914] hover:bg-[#f40612] text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Official Trailer on YouTube</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Details Footer */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2 flex-wrap gap-1.5">
              <span className="px-3 py-1 bg-[#46d369]/10 text-[#46d369] text-xs font-bold rounded-full border border-[#46d369]/30">
                {movie.match_score}% Match Score
              </span>
              <span className="text-xs text-[#a3a3a3] font-medium">
                Directed by {movie.director}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <a
                href={letterboxdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00e054] hover:underline flex items-center space-x-1"
              >
                <span>Letterboxd</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(movie.title)}+movie`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e50914] hover:underline flex items-center space-x-1"
              >
                <span>Search Info</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* OMDb Metrics Row */}
          <div className="flex items-center space-x-3 flex-wrap gap-y-2 text-xs bg-[#121212] p-3 rounded-md border border-[#262626]">
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-[#f5c518] fill-[#f5c518]" />
              <span className="font-bold text-white">
                IMDb: {movie.imdb_rating || `${(movie.rating * 2).toFixed(1)}/10`}
              </span>
            </div>

            {movie.metascore && (
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">Metascore: {movie.metascore}</span>
              </div>
            )}

            {movie.runtime && (
              <div className="flex items-center space-x-1 text-[#a3a3a3]">
                <Clock className="w-3.5 h-3.5" />
                <span>Runtime: {movie.runtime}</span>
              </div>
            )}

            {movie.imdb_votes && (
              <div className="flex items-center space-x-1 text-[#a3a3a3]">
                <Users className="w-3.5 h-3.5" />
                <span>Votes: {movie.imdb_votes}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-[#a3a3a3] tracking-wider mb-1">
              Plot Logline
            </h4>
            <p className="text-sm text-[#e5e5e5] leading-relaxed">{movie.plot}</p>
          </div>

          <div className="p-4 rounded-md bg-[#1f1f1f] border border-[#2e2e2e]">
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#e50914]" />
              <span className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
                Why You Might Like It
              </span>
            </div>
            <p className="text-xs text-[#d4d4d4] italic">"{movie.why_like_it || movie.plot}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};
