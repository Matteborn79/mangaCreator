/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MangaHeader } from './components/MangaHeader';
import { ImageMangaStudio } from './components/ImageMangaStudio';
import { MovieMangaStudio } from './components/MovieMangaStudio';
import { SampleShowcase } from './components/SampleShowcase';
import { TankobonPageModal } from './components/TankobonPageModal';
import { MangaPanelData, PageLayoutTemplate, MangaSpeechBubble, MangaSFXItem } from './types/manga';
import { DEFAULT_MANGA_SETTINGS } from './utils/mangaShader';
import { SAMPLE_IMAGES } from './data/mangaAssets';
import { Image, Film, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'image' | 'movie' | 'gallery'>('image');
  const [isTankobonModalOpen, setIsTankobonModalOpen] = useState(false);
  const [tankobonPanels, setTankobonPanels] = useState<MangaPanelData[]>([
    {
      id: 'p-1',
      index: 0,
      originalImage: SAMPLE_IMAGES[0].url,
      mangaImage: null,
      caption: 'Act 1: Alley Confrontation',
      settings: { ...DEFAULT_MANGA_SETTINGS },
      bubbles: [
        {
          id: 'b-1',
          type: 'speech',
          text: '誰の差し金だ...?',
          translation: 'Who sent you...?',
          x: 35,
          y: 30,
          width: 140,
          height: 70,
        },
      ],
      sfxItems: [
        {
          id: 's-1',
          text: 'ゴゴゴ...',
          romaji: 'GOGOGO...',
          meaning: 'Tension',
          x: 75,
          y: 40,
          scale: 1.4,
          rotation: -10,
          color: '#ffffff',
        },
      ],
    },
    {
      id: 'p-2',
      index: 1,
      originalImage: SAMPLE_IMAGES[1].url,
      mangaImage: null,
      caption: 'Act 2: The Clash',
      settings: { ...DEFAULT_MANGA_SETTINGS },
      bubbles: [
        {
          id: 'b-2',
          type: 'shout',
          text: '消え失せろ!!',
          translation: 'Vanish!!',
          x: 40,
          y: 30,
          width: 140,
          height: 70,
        },
      ],
      sfxItems: [
        {
          id: 's-2',
          text: 'ズバッ!!',
          romaji: 'ZUBAT!!',
          meaning: 'Slash',
          x: 70,
          y: 35,
          scale: 1.6,
          rotation: 8,
          color: '#ffffff',
        },
      ],
    },
    {
      id: 'p-3',
      index: 2,
      originalImage: SAMPLE_IMAGES[2].url,
      mangaImage: null,
      caption: 'Act 3: Aftermath',
      settings: { ...DEFAULT_MANGA_SETTINGS },
      bubbles: [
        {
          id: 'b-3',
          type: 'thought',
          text: '雨は止みそうにない...',
          translation: 'The rain shows no sign of stopping...',
          x: 45,
          y: 35,
          width: 150,
          height: 70,
        },
      ],
      sfxItems: [
        {
          id: 's-3',
          text: 'ザザーッ',
          romaji: 'ZAZAA',
          meaning: 'Rainfall',
          x: 75,
          y: 40,
          scale: 1.3,
          rotation: -5,
          color: '#ffffff',
        },
      ],
    },
  ]);
  const [tankobonLayout, setTankobonLayout] = useState<PageLayoutTemplate>('4-koma');

  const handleSendToPageStory = (
    imageSrc: string,
    bubbles: MangaSpeechBubble[],
    sfx: MangaSFXItem[]
  ) => {
    const newPanel: MangaPanelData = {
      id: `custom-panel-${Date.now()}`,
      index: tankobonPanels.length,
      originalImage: imageSrc,
      mangaImage: null,
      caption: `Panel ${tankobonPanels.length + 1}`,
      settings: { ...DEFAULT_MANGA_SETTINGS },
      bubbles,
      sfxItems: sfx,
    };
    setTankobonPanels([...tankobonPanels, newPanel]);
    setIsTankobonModalOpen(true);
  };

  const handleOpenTankobonWithPanels = (
    panels: MangaPanelData[],
    layout: PageLayoutTemplate
  ) => {
    setTankobonPanels(panels);
    setTankobonLayout(layout);
    setIsTankobonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans selection:bg-zinc-950 selection:text-white">
      {/* 3-Zone Header Contract */}
      <MangaHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExportCurrent={() => setIsTankobonModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Hero Section Banner */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              <span>Manga Studio Engine</span>
              <span aria-hidden="true">·</span>
              <span>G-Pen Inking</span>
              <span aria-hidden="true">·</span>
              <span>Screentone Shader</span>
              <span aria-hidden="true">·</span>
              <span>Gemini AI Director</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              Redo Images & Movies into Japanese Manga
            </h1>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Transform still photographs, webcam captures, and cinema movies into dramatic Shonen Jump and Seinen manga panels with authentic screentones, action speedlines, and Katakana sound effects.
            </p>
          </div>

          {/* Mode Switcher Buttons below the fold */}
          <div className="flex items-center gap-2 p-1 bg-zinc-200/80 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'image'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Image Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('movie')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'movie'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movie to Manga</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Showcase</span>
            </button>
          </div>
        </section>

        {/* Studio Content View */}
        {activeTab === 'image' && (
          <ImageMangaStudio onSendToPageStory={handleSendToPageStory} />
        )}

        {activeTab === 'movie' && (
          <MovieMangaStudio onExportTankobon={handleOpenTankobonWithPanels} />
        )}

        {activeTab === 'gallery' && (
          <SampleShowcase
            onSelectSample={(sampleUrl) => {
              setActiveTab('image');
            }}
          />
        )}
      </main>

      {/* Tankobon Page Export Modal */}
      <TankobonPageModal
        isOpen={isTankobonModalOpen}
        onClose={() => setIsTankobonModalOpen(false)}
        panels={tankobonPanels}
        initialLayout={tankobonLayout}
      />

      {/* Quiet Editorial Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 font-manga-jp">漫画工房</span>
            <span>·</span>
            <span>MangaMorph Studio</span>
            <span>·</span>
            <span>High-precision procedural inking & screentone compilation</span>
          </div>
          <div>
            <span>Read right-to-left · Tankobon B5 Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
