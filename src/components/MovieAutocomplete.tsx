import React, { useState, useEffect, useRef } from "react";

interface Suggestion {
  id: string;
  title: string;
  year: string;
  poster: string | null;
}

interface MovieAutocompleteProps {
  value: string;
  onSelect: (movieTitle: string) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  index: number;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const MovieAutocomplete: React.FC<MovieAutocompleteProps> = ({ 
  value, 
  onSelect, 
  onChange,
  placeholder = "Type Film Name Here",
  index,
  onRemove,
  showRemove = false
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const skipSearchRef = useRef(false);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API call to backend OMDb proxy
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      setIsOpen(false);
      return;
    }

    if (!value || value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const fetchTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        
        if (data.suggestions && data.suggestions.length > 0 && !skipSearchRef.current) {
          setSuggestions(data.suggestions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Failed to fetch movie suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(fetchTimer);
  }, [value]);

  const handleSelection = (title: string) => {
    skipSearchRef.current = true;
    onSelect(title);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Matte Input Container */}
      <div className="flex items-center gap-3 bg-[#181818] border border-[#333333] rounded-md p-3 focus-within:border-[#e50914] transition-colors">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#262626] text-[#e50914] font-semibold text-xs shrink-0">
          {index}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-white focus:outline-none placeholder-[#757575] text-sm font-medium"
          autoComplete="off"
        />
        {isLoading && (
          <div className="w-4 h-4 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin shrink-0"></div>
        )}
        {showRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[#757575] hover:text-[#e50914] transition-colors shrink-0 p-1"
            title="Remove movie"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Matte Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 bg-[#1f1f1f] border border-[#333333] rounded-md shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((movie) => (
            <li
              key={movie.id}
              onClick={() => handleSelection(movie.title)}
              className="flex items-center gap-3.5 p-2.5 cursor-pointer hover:bg-[#2a2a2a] transition-colors border-b border-[#262626] last:border-0"
            >
              {movie.poster ? (
                <img 
                  src={movie.poster} 
                  alt={`${movie.title} poster`} 
                  className="w-9 h-12 object-cover rounded shadow-sm shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-12 bg-[#2a2a2a] rounded flex items-center justify-center text-[10px] text-[#757575] text-center shrink-0">
                  No Image
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="font-semibold text-white hover:text-[#e50914] transition-colors text-sm">{movie.title}</span>
                <span className="text-xs text-[#a3a3a3]">{movie.year}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
