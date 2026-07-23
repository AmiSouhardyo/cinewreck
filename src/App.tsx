import React, { useState, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { MovieForm } from './components/MovieForm';
import { RecommendationCard } from './components/RecommendationCard';
import { TrailerModal } from './components/TrailerModal';
import { FilterControls, CategoryFilter, SortOption, DurationFilter } from './components/FilterControls';
import { getMovieRecommendations } from './services/api';
import { MovieRecommendation, RecommendResponse } from './types';
import { Film, AlertCircle } from 'lucide-react';

export default function App() {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [recommendationSource, setRecommendationSource] = useState<string>('');
  const [inputMoviesUsed, setInputMoviesUsed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trailer modal state
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState<MovieRecommendation | null>(null);

  // Saved Watchlist state
  const [savedWatchlist, setSavedWatchlist] = useState<MovieRecommendation[]>([]);

  // Filter and Sort state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('match');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');

  // Ref for auto-scroll to recommendations
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleRecommendSubmit = async (movies: string[], recommendNiche: boolean = false) => {
    if (!movies || movies.length === 0) {
      setError('Please enter at least one favourite movie.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: RecommendResponse = await getMovieRecommendations(movies, recommendNiche);
      setRecommendations(response.recommendations);
      setRecommendationSource(response.recommendation_source);
      setInputMoviesUsed(response.input_movies);

      // Reset filters when new recommendations arrive
      setCategoryFilter('all');
      setSortOption('match');
      setDurationFilter('all');

      // Smooth scroll to recommendations section
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      setError(err.message || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSaveMovie = (movie: MovieRecommendation) => {
    setSavedWatchlist((prev) => {
      const exists = prev.some((item) => item.id === movie.id);
      if (exists) {
        return prev.filter((item) => item.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleDownloadWatchlist = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedWatchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "cinewreck_watchlist.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper to parse numeric votes for popularity sorting
  const parseVotes = (votesStr?: string): number => {
    if (!votesStr) return 0;
    const cleaned = votesStr.replace(/,/g, '').trim();
    const val = parseInt(cleaned, 10);
    return isNaN(val) ? 0 : val;
  };

  // Filtered and Sorted recommendations
  const displayedRecommendations = useMemo(() => {
    let result = [...recommendations];

    // 1. Filter by Category
    if (categoryFilter === 'mainstream') {
      result = result.filter((m) => m.category === 'mainstream');
    } else if (categoryFilter === 'niche') {
      result = result.filter((m) => m.category === 'niche');
    }

    // 2. Filter by Duration
    if (durationFilter === 'short') {
      result = result.filter((m) => (m.runtime_minutes || 120) < 110);
    } else if (durationFilter === 'medium') {
      result = result.filter((m) => {
        const mins = m.runtime_minutes || 120;
        return mins >= 110 && mins <= 140;
      });
    } else if (durationFilter === 'long') {
      result = result.filter((m) => (m.runtime_minutes || 120) > 140);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortOption === 'rating') {
        const rateA = parseFloat(a.imdb_rating || '0') || a.rating || 0;
        const rateB = parseFloat(b.imdb_rating || '0') || b.rating || 0;
        return rateB - rateA;
      }
      if (sortOption === 'popularity') {
        const votesA = parseVotes(a.imdb_votes);
        const votesB = parseVotes(b.imdb_votes);
        if (votesA !== votesB) return votesB - votesA;
        return b.match_score - a.match_score;
      }
      if (sortOption === 'runtime_asc') {
        return (a.runtime_minutes || 120) - (b.runtime_minutes || 120);
      }
      if (sortOption === 'runtime_desc') {
        return (b.runtime_minutes || 120) - (a.runtime_minutes || 120);
      }
      // default: match score
      return b.match_score - a.match_score;
    });

    return result;
  }, [recommendations, categoryFilter, sortOption, durationFilter]);

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans antialiased selection:bg-[#e50914] selection:text-white">
      {/* Header */}
      <Header
        savedCount={savedWatchlist.length}
        onDownloadWatchlist={handleDownloadWatchlist}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Matte Netflix Hero Section */}
        <section className="text-center space-y-3 max-w-3xl mx-auto pt-4">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Find Your Next <span className="text-[#e50914]">Favourite Movie</span>
          </h1>

          <p className="text-sm sm:text-base text-[#a3a3a3] font-normal leading-relaxed">
            Enter your favourite movies below to generate personalized cinema recommendations with real IMDb ratings, runtimes, plots, trailers, and tailored reasons why you'll love them.
          </p>
        </section>

        {/* Input Form Section */}
        <section>
          <MovieForm onSubmit={handleRecommendSubmit} isLoading={isLoading} />
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-lg flex items-center space-x-3 text-red-200 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        <div ref={resultsRef} className="scroll-mt-20">
          {recommendations.length > 0 && (
            <section className="space-y-6">
              {/* Results Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#2a2a2a]">
                <div>
                  <div className="flex items-center space-x-2">
                    <Film className="w-5 h-5 text-[#e50914]" />
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Recommended For You
                    </h2>
                  </div>
                  <p className="text-xs text-[#a3a3a3] mt-1">
                    Curated based on: <span className="text-white font-medium">{inputMoviesUsed.join(', ')}</span>
                  </p>
                </div>
              </div>

              {/* Filter and Sort Controls */}
              <FilterControls
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sortOption={sortOption}
                setSortOption={setSortOption}
                durationFilter={durationFilter}
                setDurationFilter={setDurationFilter}
                totalCount={recommendations.length}
                filteredCount={displayedRecommendations.length}
              />

              {/* Recommendation Cards Grid */}
              {displayedRecommendations.length > 0 ? (
                <div className="space-y-5">
                  {displayedRecommendations.map((movie, index) => (
                    <RecommendationCard
                      key={movie.id || index}
                      movie={movie}
                      rank={index + 1}
                      onOpenTrailer={setSelectedTrailerMovie}
                      isSaved={savedWatchlist.some((item) => item.id === movie.id)}
                      onToggleSave={handleToggleSaveMovie}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#181818] border border-[#2a2a2a] rounded-lg p-10 text-center text-sm text-[#a3a3a3]">
                  No movies match your current filter criteria. Try adjusting the category, duration, or click 'Reset Filters'.
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#0c0c0c] py-8 text-center text-xs text-[#757575] mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#e50914] lowercase text-sm">cinewreck</span>
            <span>— Personalized movie discovery engine.</span>
          </div>
          <p className="text-[#757575]">
            Powered by Gemini AI & OMDb API.
          </p>
        </div>
      </footer>

      {/* Trailer Modal */}
      <TrailerModal
        movie={selectedTrailerMovie}
        onClose={() => setSelectedTrailerMovie(null)}
      />
    </div>
  );
}
