import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onDownloadWatchlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ savedCount, onDownloadWatchlist }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur-md border-b border-[#262626] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Name (cinewreck in all small letters, no logo beside it, Netflix style typography) */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div>
            <span className="text-2xl font-black tracking-wider text-[#e50914] lowercase group-hover:text-red-500 transition-colors">
              cinewreck
            </span>
          </div>
        </div>

        {/* Action Button: Download your Watchlist */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onDownloadWatchlist}
            className="relative flex items-center space-x-2 px-4 py-2 rounded-md bg-[#e50914] hover:bg-[#f40612] text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
            title="Download Watchlist as JSON"
          >
            <Download className="w-4 h-4" />
            <span>Download your Watchlist</span>
            {savedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-black text-white text-[10px] font-bold rounded-full border border-red-400">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
