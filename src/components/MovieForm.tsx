import React, { useState } from 'react';
import { Film, RotateCcw, Sparkles } from 'lucide-react';
import { MovieAutocomplete } from './MovieAutocomplete';

interface MovieFormProps {
  onSubmit: (movies: string[], recommendNiche: boolean) => void;
  isLoading: boolean;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSubmit, isLoading }) => {
  // Strictly maintain 5 movie input fields
  const [movieInputs, setMovieInputs] = useState<string[]>([
    '',
    '',
    '',
    '',
    ''
  ]);
  const [recommendNiche, setRecommendNiche] = useState<boolean>(false);

  const handleInputChange = (index: number, value: string) => {
    const updated = [...movieInputs];
    updated[index] = value;
    setMovieInputs(updated);
  };

  const handleClearAll = () => {
    setMovieInputs(['', '', '', '', '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMovies = movieInputs
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (validMovies.length === 0) {
      onSubmit(['Inception'], recommendNiche);
      return;
    }

    onSubmit(validMovies, recommendNiche);
  };

  return (
    <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 sm:p-7 shadow-xl">
      {/* Header section */}
      <div className="mb-6 pb-5 border-b border-[#2a2a2a]">
        <div className="flex items-center space-x-2">
          <Film className="w-5 h-5 text-[#e50914]" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Your Favourite Films
          </h2>
        </div>
        <p className="text-xs text-[#a3a3a3] mt-1 font-normal">
          Type up to 5 movie titles below. Our engine analyzes themes, visual direction, and narrative depth.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {movieInputs.map((movie, index) => (
            <MovieAutocomplete
              key={index}
              index={index + 1}
              value={movie}
              onChange={(val) => handleInputChange(index, val)}
              onSelect={(val) => handleInputChange(index, val)}
              placeholder="Type Film Name Here"
              showRemove={false}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-md bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] text-[#a3a3a3] hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Checkbox for Recommend Niche Films */}
            <label className="flex items-center space-x-2 cursor-pointer select-none px-3 py-1.5 rounded-md bg-[#202020]/50 border border-[#303030]/60 hover:border-[#404040] transition-colors">
              <input
                type="checkbox"
                checked={recommendNiche}
                onChange={(e) => setRecommendNiche(e.target.checked)}
                className="w-4 h-4 rounded bg-[#141414]/60 border-[#383838]/80 text-[#e50914] accent-[#e50914]/80 opacity-70 checked:opacity-100 cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-300">
                Recommend Niche Films
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-2.5 rounded-md bg-[#e50914] hover:bg-[#f40612] active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Curating Recommendations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
