import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Clock, Flame, Sparkles } from 'lucide-react';

export type CategoryFilter = 'all' | 'mainstream' | 'niche';
export type SortOption = 'match' | 'rating' | 'popularity' | 'runtime_asc' | 'runtime_desc';
export type DurationFilter = 'all' | 'short' | 'medium' | 'long';

interface FilterControlsProps {
  categoryFilter: CategoryFilter;
  setCategoryFilter: (category: CategoryFilter) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  durationFilter: DurationFilter;
  setDurationFilter: (duration: DurationFilter) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  sortOption,
  setSortOption,
  durationFilter,
  setDurationFilter,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-[#181818] border border-[#2a2a2a] rounded-lg p-4 space-y-3 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Simple Filters Label */}
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-[#e50914]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Filters :
          </span>
        </div>

        {/* Runtime Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Runtime Duration Dropdown */}
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[#a3a3a3]" />
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
              className="bg-[#262626] border border-[#383838] text-white text-xs font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#e50914] cursor-pointer"
            >
              <option value="all">All Runtimes</option>
              <option value="short">Short (&lt; 110m)</option>
              <option value="medium">Medium (110–140m)</option>
              <option value="long">Long (&gt; 140m)</option>
            </select>
          </div>

          {/* Sort Option Dropdown */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#a3a3a3]" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-[#262626] border border-[#383838] text-white text-xs font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#e50914] cursor-pointer"
            >
              <option value="match">Sort: Best Match</option>
              <option value="rating">Sort: Highest IMDb Rating</option>
              <option value="popularity">Sort: Most Popular (Votes)</option>
              <option value="runtime_asc">Sort: Shortest Runtime</option>
              <option value="runtime_desc">Sort: Longest Runtime</option>
            </select>
          </div>
        </div>

      </div>

      {filteredCount !== totalCount && (
        <div className="text-[11px] text-[#a3a3a3] pt-1 border-t border-[#262626] flex items-center justify-between">
          <span>Showing {filteredCount} of {totalCount} recommendations</span>
          <button
            onClick={() => {
              setDurationFilter('all');
              setSortOption('match');
            }}
            className="text-[#e50914] hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
