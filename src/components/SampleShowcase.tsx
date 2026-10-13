import React, { useState } from 'react';
import { SAMPLE_IMAGES } from '../data/mangaAssets';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface SampleShowcaseProps {
  onSelectSample: (sampleUrl: string) => void;
}

export const SampleShowcase: React.FC<SampleShowcaseProps> = ({
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<string>(SAMPLE_IMAGES[0].id);

  return (
    <div className="flex flex-col gap-8">
      {/* Editorial Header */}
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          The Art of Manga Transformation
        </h2>
        <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
          From motion picture frames to high-contrast Japanese comic panels. MangaMorph extracts fine G-Pen contour lines, simulates mathematical halftone screentones, and applies dynamic sound effect typography.
        </p>
      </div>

      {/* Bento Grid Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAMPLE_IMAGES.map((sample) => (
          <div
            key={sample.id}
            className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col group hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-950">
              <img
                src={sample.url}
                alt={sample.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                {sample.genre}
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1 gap-4">
              <div>
                <h3 className="font-bold text-base text-zinc-950">{sample.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">16:9 CINEMATIC</span>
                <button
                  onClick={() => onSelectSample(sample.url)}
                  className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manga Principles Card Strip */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 border border-zinc-800">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Authentic Manga Inking Mechanics</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            G-Pen Contours, Screentone Dot Pitch & Onomatopoeia
          </h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Japanese manga relies on black-and-white tonal contrast. Rather than simple grayscale filters, MangaMorph calculates Sobel line gradients, isolates solid blacks (Beta-nuri), and places 45° angle halftone dot matrices identical to traditional printed screentone film (アミ点).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 w-full lg:w-auto">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <span className="block font-bold text-lg text-white">45°</span>
            <span className="text-[10px] text-zinc-400">Screentone Angle</span>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <span className="block font-bold text-lg text-white">12+</span>
            <span className="text-[10px] text-zinc-400">Authentic SFX</span>
          </div>
        </div>
      </div>
    </div>
  );
};
