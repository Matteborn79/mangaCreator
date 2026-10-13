import React from 'react';
import { Sparkles, BookOpen, Layers } from 'lucide-react';

interface MangaHeaderProps {
  activeTab: 'image' | 'movie' | 'gallery';
  onSelectTab: (tab: 'image' | 'movie' | 'gallery') => void;
  onExportCurrent: () => void;
}

export const MangaHeader: React.FC<MangaHeaderProps> = ({
  activeTab,
  onSelectTab,
  onExportCurrent,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border border-zinc-800">
            <span className="font-manga-jp">漫</span>
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('image');
            }}
            className="text-lg font-extrabold tracking-tight text-zinc-950 whitespace-nowrap"
          >
            MangaMorph
          </a>
        </div>

        {/* Zone 2: 4-5 Nav Links (Single-line, unboxed) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <button
            onClick={() => onSelectTab('image')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-950 ${
              activeTab === 'image'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950 py-4 -mb-[2px]'
                : ''
            }`}
          >
            Image Studio
          </button>
          <button
            onClick={() => onSelectTab('movie')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-950 ${
              activeTab === 'movie'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950 py-4 -mb-[2px]'
                : ''
            }`}
          >
            Movie to Manga
          </button>
          <button
            onClick={() => onSelectTab('gallery')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-950 ${
              activeTab === 'gallery'
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950 py-4 -mb-[2px]'
                : ''
            }`}
          >
            Sample Showcase
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportCurrent}
            className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Export Tankobon</span>
          </button>
        </div>
      </div>
    </header>
  );
};
