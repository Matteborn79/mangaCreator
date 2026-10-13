import React, { useState } from 'react';
import { 
  MangaArtPreset, 
  MangaCharacterArchetype,
  MangaShaderSettings, 
  MangaSpeechBubble, 
  MangaSFXItem 
} from '../types/manga';
import { PRESET_CONFIGS } from '../utils/mangaShader';
import { SFX_PRESETS } from '../data/mangaAssets';
import { 
  Sparkles, 
  Sliders, 
  MessageSquare, 
  User, 
  Plus, 
  Layers, 
  Palette,
  Bot,
  Zap,
  Smile,
  Heart,
  Trash2,
  Edit3,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';

interface MangaControlPanelProps {
  settings: MangaShaderSettings;
  onUpdateSettings: (settings: MangaShaderSettings) => void;
  onAddBubble: (bubble: MangaSpeechBubble) => void;
  onAddSfx: (sfx: MangaSFXItem) => void;
  sfxItems?: MangaSFXItem[];
  onUpdateSfx?: (sfx: MangaSFXItem[]) => void;
  bubbles?: MangaSpeechBubble[];
  onUpdateBubbles?: (bubbles: MangaSpeechBubble[]) => void;
  selectedSfxId?: string | null;
  onSelectSfx?: (id: string | null) => void;
  onRunAiAnalysis: () => void;
  onRunAiRedraw: () => void;
  onTransformToCharacter?: (archetype: MangaCharacterArchetype, expression: string) => void;
  isAiAnalyzing: boolean;
  isAiRedrawing: boolean;
  isCharacterMorphing?: boolean;
}

export const MangaControlPanel: React.FC<MangaControlPanelProps> = ({
  settings,
  onUpdateSettings,
  onAddBubble,
  onAddSfx,
  sfxItems = [],
  onUpdateSfx,
  bubbles = [],
  onUpdateBubbles,
  selectedSfxId,
  onSelectSfx,
  onRunAiAnalysis,
  onRunAiRedraw,
  onTransformToCharacter,
  isAiAnalyzing,
  isAiRedrawing,
  isCharacterMorphing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'character' | 'presets' | 'tuning' | 'stickers' | 'ai'>('character');
  const [selectedArchetype, setSelectedArchetype] = useState<MangaCharacterArchetype>('shonen-hero');
  const [selectedExpression, setSelectedExpression] = useState<string>('determined');
  const [customDialogue, setCustomDialogue] = useState('覚悟しろ!');
  const [customTranslation, setCustomTranslation] = useState('Prepare yourself!');
  const [bubbleType, setBubbleType] = useState<'speech' | 'shout' | 'thought' | 'narration'>('speech');

  const [editingPanelSfxId, setEditingPanelSfxId] = useState<string | null>(null);
  const [customSfxText, setCustomSfxText] = useState('ドォォン!');
  const [customSfxRomaji, setCustomSfxRomaji] = useState('DOOON!');
  const [customSfxMeaning, setCustomSfxMeaning] = useState('Colossal impact');
  const [customSfxColor, setCustomSfxColor] = useState('#ffffff');

  const handlePresetSelect = (preset: MangaArtPreset) => {
    const presetValues = PRESET_CONFIGS[preset];
    if (presetValues) {
      onUpdateSettings({
        ...settings,
        ...presetValues,
      });
    }
  };

  const handleAddCustomBubble = () => {
    if (!customDialogue.trim()) return;
    onAddBubble({
      id: `bubble-${Date.now()}`,
      type: bubbleType,
      text: customDialogue.trim(),
      translation: customTranslation.trim() || undefined,
      x: 50 + (Math.random() * 20 - 10),
      y: 35 + (Math.random() * 20 - 10),
      width: 140,
      height: 80,
    });
  };

  const handleAddSfxPreset = (item: (typeof SFX_PRESETS)[0]) => {
    onAddSfx({
      id: `sfx-${Date.now()}`,
      text: item.text,
      romaji: item.romaji,
      meaning: item.meaning,
      x: 50 + (Math.random() * 30 - 15),
      y: 50 + (Math.random() * 30 - 15),
      scale: 1.4,
      rotation: Math.floor(Math.random() * 20 - 10),
      color: '#ffffff',
    });
  };

  const handleAddCustomSfx = () => {
    if (!customSfxText.trim()) return;
    onAddSfx({
      id: `sfx-${Date.now()}`,
      text: customSfxText.trim(),
      romaji: customSfxRomaji.trim() || 'SFX',
      meaning: customSfxMeaning.trim() || 'Custom sound effect',
      x: 50,
      y: 50,
      scale: 1.4,
      rotation: 0,
      color: customSfxColor,
    });
  };

  const handleRemoveSfx = (id: string) => {
    if (onUpdateSfx) {
      onUpdateSfx(sfxItems.filter((s) => s.id !== id));
      if (selectedSfxId === id) onSelectSfx?.(null);
      if (editingPanelSfxId === id) setEditingPanelSfxId(null);
    }
  };

  const handleClearAllSfx = () => {
    if (onUpdateSfx) {
      onUpdateSfx([]);
      onSelectSfx?.(null);
      setEditingPanelSfxId(null);
    }
  };

  const handleUpdateSfxItem = (id: string, updates: Partial<MangaSFXItem>) => {
    if (onUpdateSfx) {
      onUpdateSfx(sfxItems.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }
  };

  const handleRemoveBubble = (id: string) => {
    if (onUpdateBubbles) {
      onUpdateBubbles(bubbles.filter((b) => b.id !== id));
    }
  };

  const handleUpdateBubbleItem = (id: string, updates: Partial<MangaSpeechBubble>) => {
    if (onUpdateBubbles) {
      onUpdateBubbles(bubbles.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('character')}
          className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'character'
              ? 'bg-zinc-950 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Manga Character</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'presets'
              ? 'bg-white text-zinc-950 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Ink Presets</span>
        </button>

        <button
          onClick={() => setActiveTab('tuning')}
          className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tuning'
              ? 'bg-white text-zinc-950 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Tones</span>
        </button>

        <button
          onClick={() => setActiveTab('stickers')}
          className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'stickers'
              ? 'bg-white text-zinc-950 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SFX</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-white text-zinc-950 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Director</span>
        </button>
      </div>

      {/* Tab 0: Manga Character Transformation (PRIMARY USER FEATURE) */}
      {activeTab === 'character' && (
        <div className="flex flex-col gap-4 text-xs">
          <div className="p-3 bg-zinc-950 text-white rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Japanese Manga Character Morph</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">1-CLICK MORPH</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Turns the person in your photo into a stylized Japanese manga character with iconic manga eyes, stylized anime hair, hand-inked line art, and screentones while retaining their recognizable likeness.
            </p>
          </div>

          {/* Color & Clarity Selection */}
          <div className="flex flex-col gap-1.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 text-xs">Color & Distortion Mode:</span>
              <span className="text-[10px] text-amber-700 font-bold">
                {settings.colorMode === 'vibrant' || settings.colorMode === 'color' ? '✨ More Colours • Low Distortion' : '⚡ Classic B&W'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    colorMode: 'vibrant',
                    preset: 'vivid-anime',
                    colorSaturation: 1.65,
                    distortionFilter: 92,
                    screentoneStrength: 0,
                    lineOpacity: 0.72,
                    inkThickness: 1,
                  })
                }
                className={`py-2 px-2.5 rounded-lg text-left font-semibold transition-all cursor-pointer flex flex-col ${
                  settings.colorMode === 'vibrant' || settings.colorMode === 'color'
                    ? 'bg-zinc-950 text-white shadow-xs ring-1 ring-amber-400'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span className="text-[11px] flex items-center gap-1">
                  <span>🌈 Vivid Anime Color</span>
                </span>
                <span className={`text-[9px] font-normal mt-0.5 ${
                  settings.colorMode === 'vibrant' || settings.colorMode === 'color' ? 'text-zinc-300' : 'text-zinc-500'
                }`}>
                  More colours, silky smooth, zero distortion
                </span>
              </button>

              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    colorMode: 'bw',
                    preset: 'shonen',
                    screentoneStrength: 100,
                    distortionFilter: 35,
                  })
                }
                className={`py-2 px-2.5 rounded-lg text-left font-semibold transition-all cursor-pointer flex flex-col ${
                  settings.colorMode === 'bw'
                    ? 'bg-zinc-950 text-white shadow-xs ring-1 ring-amber-400'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span className="text-[11px] flex items-center gap-1">
                  <span>⚡ Classic B&W Ink</span>
                </span>
                <span className={`text-[9px] font-normal mt-0.5 ${
                  settings.colorMode === 'bw' ? 'text-zinc-300' : 'text-zinc-500'
                }`}>
                  G-Pen black ink & screentone dots
                </span>
              </button>
            </div>
          </div>

          {/* Archetype Selector */}
          <div>
            <span className="font-semibold text-zinc-800 block mb-2">
              1. Choose Character Archetype:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'shonen-hero' as MangaCharacterArchetype,
                  name: 'Shonen Protagonist',
                  badge: 'Weekly Jump',
                  desc: 'Spiky anime hair, fierce determined eyes, heroic smirk',
                },
                {
                  id: 'shojo-heroine' as MangaCharacterArchetype,
                  name: 'Shojo Heroine',
                  badge: 'Romance Manga',
                  desc: 'Starry sparkling eyes, soft flowing hair, delicate screentone',
                },
                {
                  id: 'seinen-antihero' as MangaCharacterArchetype,
                  name: 'Seinen Anti-Hero',
                  badge: 'Dark Manga',
                  desc: 'Sharp jawline, intense brooding gaze, heavy ink shadows',
                },
                {
                  id: 'cyberpunk-ronin' as MangaCharacterArchetype,
                  name: 'Cyberpunk Ronin',
                  badge: 'Neo-Tokyo',
                  desc: 'Futuristic visor/neural accents, sharp anime angles',
                },
                {
                  id: 'vintage-90s' as MangaCharacterArchetype,
                  name: '90s Retro Anime',
                  badge: 'Classic Cel',
                  desc: 'Classic hand-drawn cel look, nostalgic character design',
                },
                {
                  id: 'chibi' as MangaCharacterArchetype,
                  name: 'Chibi Mascot',
                  badge: 'Cute 4-Koma',
                  desc: 'Oversized sparkling anime eyes, cute chibi proportions',
                },
              ].map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    onClick={() => {
                      setSelectedArchetype(arch.id);
                      onUpdateSettings({
                        ...settings,
                        characterMode: true,
                        characterArchetype: arch.id,
                      });
                    }}
                    className={`text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-900 text-white shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{arch.name}</span>
                      <span className={`text-[9px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {arch.badge}
                      </span>
                    </div>
                    <p className={`text-[10px] mt-1 leading-tight ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {arch.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expression Selector */}
          <div>
            <span className="font-semibold text-zinc-800 block mb-1.5">
              2. Character Facial Expression:
            </span>
            <div className="grid grid-cols-5 gap-1 text-[11px]">
              {[
                { id: 'determined', label: 'Determined' },
                { id: 'smiling', label: 'Smiling' },
                { id: 'smirking', label: 'Smirk' },
                { id: 'fierce', label: 'Fierce' },
                { id: 'surprised', label: 'Surprised' },
              ].map((expr) => (
                <button
                  key={expr.id}
                  onClick={() => setSelectedExpression(expr.id)}
                  className={`py-1.5 px-1 text-center rounded font-medium transition-colors ${
                    selectedExpression === expr.id
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {expr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              if (onTransformToCharacter) {
                onTransformToCharacter(selectedArchetype, selectedExpression);
              }
            }}
            disabled={isCharacterMorphing}
            className="w-full py-3 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md text-xs group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>
              {isCharacterMorphing
                ? 'Morphing into Manga Character...'
                : 'Turn Picture into Manga Character'}
            </span>
          </button>

          {/* Real-time Facial Stylization Sliders */}
          <div className="pt-3 border-t border-zinc-100 flex flex-col gap-3">
            <span className="font-semibold text-zinc-800">Instant Facial Shader Tuning</span>

            {/* Anime Cel Skin Smoothing */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-zinc-700">
                <span className="font-medium">Anime Cel Skin Smoothing</span>
                <span className="font-mono text-zinc-500">{settings.skinSmoothing ?? 60}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.skinSmoothing ?? 60}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    characterMode: true,
                    skinSmoothing: Number(e.target.value),
                  })
                }
                className="w-full accent-zinc-950 cursor-pointer"
              />
            </div>

            {/* Manga Eye & Lash Contrast */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-zinc-700">
                <span className="font-medium">Manga Eyes & Ink Outline Contrast</span>
                <span className="font-mono text-zinc-500">{settings.edgeThreshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="2"
                value={settings.edgeThreshold}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    edgeThreshold: Number(e.target.value),
                  })
                }
                className="w-full accent-zinc-950 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Manga Style Presets */}
      {activeTab === 'presets' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-medium text-zinc-500">
            Select a classic Japanese manga publisher aesthetic or vivid color style:
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                id: 'vivid-anime' as MangaArtPreset,
                name: '✨ Vivid Anime',
                desc: 'Maximum rich colors, silky-smooth cel shading, zero distortion',
                tag: '✨ Recommended',
              },
              {
                id: 'vibrant-webtoon' as MangaArtPreset,
                name: '🌈 Vibrant Webtoon',
                desc: 'High-saturation digital comic art with clean cel shading',
                tag: 'Webtoon',
              },
              {
                id: 'clean-anime' as MangaArtPreset,
                name: '🎨 Clean Anime',
                desc: 'Balanced TV anime color palette with delicate clean outlines',
                tag: 'TV Anime',
              },
              {
                id: 'pastel-anime' as MangaArtPreset,
                name: '🌸 Pastel Anime',
                desc: 'Soft aesthetic pastel hues, ultra-clean and noise-free',
                tag: 'Aesthetic',
              },
              {
                id: 'shonen' as MangaArtPreset,
                name: '⚡ Shonen Action',
                desc: 'Bold G-pen, high contrast black shadows, punchy dots',
                tag: 'Weekly Jump',
              },
              {
                id: 'seinen' as MangaArtPreset,
                name: '🗡️ Seinen Grit',
                desc: 'Intricate fine ink lines, detailed crosshatch halftones',
                tag: 'Young Jump',
              },
              {
                id: 'shojo' as MangaArtPreset,
                name: '💖 Shojo Romance',
                desc: 'Delicate line work, soft sparkle dots, airy screentone',
                tag: 'Ribon / Lala',
              },
              {
                id: 'cyberpunk' as MangaArtPreset,
                name: '🤖 Cyberpunk Neo',
                desc: 'Deep black voids, stark futuristic screentone angles',
                tag: 'Neo-Tokyo',
              },
              {
                id: 'vintage' as MangaArtPreset,
                name: '📼 Vintage 90s',
                desc: 'Warm paper tint, aged ink texture, nostalgic tankobon',
                tag: 'Classic Comic',
              },
              {
                id: 'color-anime' as MangaArtPreset,
                name: '🖌️ Color Manga',
                desc: 'Traditional tankobon color print with crisp ink contours',
                tag: 'Color Print',
              },
            ].map((p) => {
              const isActive = settings.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'border-zinc-950 bg-zinc-900 text-white shadow-xs ring-1 ring-amber-400'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{p.name}</span>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {p.tag}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-snug line-clamp-2 ${
                      isActive ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Speedline selector */}
          <div className="mt-2 pt-3 border-t border-zinc-100 flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-800">Dynamic Action Lines</span>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'none', label: 'None' },
                { id: 'radial-burst', label: 'Radial Burst' },
                { id: 'horizontal-action', label: 'Horizontal' },
                { id: 'vertical-impact', label: 'Vertical' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      speedlineType: item.id as any,
                    })
                  }
                  className={`py-1.5 px-2 rounded text-center font-medium transition-colors cursor-pointer ${
                    settings.speedlineType === item.id
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fine-Tuning Colors, Inking & Anti-Distortion */}
      {activeTab === 'tuning' && (
        <div className="flex flex-col gap-3.5 text-xs">
          {/* SECTION 1: Colors & Clarity */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>Colors & Anti-Distortion</span>
              </span>
              <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                COLOR CLARITY
              </span>
            </div>

            {/* Color Mode Switch */}
            <div className="flex flex-col gap-1">
              <span className="font-medium text-zinc-700">Color Palette Mode</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'vibrant', label: '🌈 Vivid' },
                  { id: 'color', label: '🎨 Anime' },
                  { id: 'bw', label: '⚡ B&W Ink' },
                  { id: 'sepia', label: '📼 Sepia' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        colorMode: mode.id as any,
                        screentoneStrength: mode.id === 'bw' || mode.id === 'sepia' ? 100 : 0,
                      })
                    }
                    className={`py-1.5 px-1 rounded text-center text-[11px] font-semibold transition-colors cursor-pointer ${
                      settings.colorMode === mode.id
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Vibrancy & Saturation */}
            {(settings.colorMode === 'vibrant' || settings.colorMode === 'color') && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-zinc-800">
                  <span className="font-semibold">Colour Vibrancy & Saturation</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {Math.round((settings.colorSaturation ?? 1.6) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.2"
                  step="0.05"
                  value={settings.colorSaturation ?? 1.6}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      colorSaturation: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Natural (100%)</span>
                  <span>Vivid (160%)</span>
                  <span>Ultra Rich (220%)</span>
                </div>
              </div>
            )}

            {/* Anti-Distortion Noise Suppressor */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-zinc-800">
                <span className="font-semibold">Anti-Distortion & Noise Smoothing</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {settings.distortionFilter ?? 90}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.distortionFilter ?? 90}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    distortionFilter: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Textured (0%)</span>
                <span>Clean (70%)</span>
                <span>Zero Distortion (100%)</span>
              </div>
            </div>

            {/* Screentone / Halftone Intensity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-zinc-800">
                <span className="font-semibold">Screentone / Halftone Dot Level</span>
                <span className="font-mono text-zinc-600 font-bold">
                  {settings.screentoneStrength ?? 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.screentoneStrength ?? 0}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    screentoneStrength: Number(e.target.value),
                  })
                }
                className="w-full accent-zinc-950 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span className="text-emerald-700 font-medium">0% (Silky Clean Color)</span>
                <span>50% (Subtle)</span>
                <span>100% (Full Manga Dots)</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Inking & Contrast */}
          {/* G-Pen Ink Thickness */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-zinc-700">
              <span className="font-medium">Line Art Weight (G-Pen)</span>
              <span className="font-mono text-zinc-500">{settings.inkThickness}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={settings.inkThickness}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  inkThickness: Number(e.target.value),
                })
              }
              className="w-full accent-zinc-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Fine (1px)</span>
              <span>Medium (2px)</span>
              <span>Bold (4px)</span>
            </div>
          </div>

          {/* Line Opacity / Blending */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-zinc-700">
              <span className="font-medium">Line Art Softness & Blending</span>
              <span className="font-mono text-zinc-500">
                {Math.round((settings.lineOpacity ?? 0.75) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={settings.lineOpacity ?? 0.75}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  lineOpacity: Number(e.target.value),
                })
              }
              className="w-full accent-zinc-950 cursor-pointer"
            />
          </div>

          {/* Edge Sensitivity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-zinc-700">
              <span className="font-medium">Outline Edge Detection Sensitivity</span>
              <span className="font-mono text-zinc-500">{settings.edgeThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="2"
              value={settings.edgeThreshold}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  edgeThreshold: Number(e.target.value),
                })
              }
              className="w-full accent-zinc-950 cursor-pointer"
            />
          </div>

          {/* Dark Shadow Black Fill (Beta-nuri) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-zinc-700">
              <span className="font-medium">Shadow Black Fill (Beta-nuri)</span>
              <span className="font-mono text-zinc-500">{settings.darkShadowFill}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="2"
              value={settings.darkShadowFill}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  darkShadowFill: Number(e.target.value),
                })
              }
              className="w-full accent-zinc-950 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Sound Effects (SFX) & Speech Bubbles */}
      {activeTab === 'stickers' && (
        <div className="flex flex-col gap-4 text-xs">
          {/* Section 1: Active Placed SFX Manager (Edit & Delete) */}
          {sfxItems && sfxItems.length > 0 && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Active Sound Effects ({sfxItems.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearAllSfx}
                  className="text-[10px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  title="Remove all sound effects from canvas"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All SFX</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {sfxItems.map((sfx) => {
                  const isSelected = selectedSfxId === sfx.id;
                  const isEditing = editingPanelSfxId === sfx.id;

                  return (
                    <div
                      key={sfx.id}
                      className={`p-2 bg-white rounded-lg border transition-all ${
                        isSelected
                          ? 'border-amber-500 shadow-sm ring-1 ring-amber-400'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {/* SFX Header & Preview Row */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectSfx?.(isSelected ? null : sfx.id)}
                          className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <span
                            className="font-manga-sfx text-xl font-bold px-1.5 py-0.5 rounded bg-zinc-950 block shadow-xs shrink-0"
                            style={{
                              color: sfx.color || '#ffffff',
                              WebkitTextStroke: '1px #09090b',
                            }}
                          >
                            {sfx.text}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-zinc-900 truncate">
                              {sfx.romaji || sfx.text}
                            </span>
                            <span className="text-[10px] text-zinc-500 truncate">
                              {sfx.meaning || 'Sound effect'}
                            </span>
                          </div>
                        </button>

                        {/* Quick Actions: Edit toggle and Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPanelSfxId(isEditing ? null : sfx.id)
                            }
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isEditing
                                ? 'bg-amber-500 text-zinc-950 font-semibold'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                            }`}
                            title="Edit this SFX"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSfx(sfx.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors cursor-pointer"
                            title="Delete this SFX"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable In-Place Editor for this SFX */}
                      {isEditing && (
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 flex flex-col gap-2 bg-zinc-50/70 p-2 rounded-md">
                          <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-700">
                            <span>Edit Sound Effect Details</span>
                            <button
                              type="button"
                              onClick={() => setEditingPanelSfxId(null)}
                              className="text-zinc-400 hover:text-zinc-700 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Japanese Katakana Input */}
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[10px] text-zinc-500">
                              Japanese Text (Katakana)
                            </label>
                            <input
                              type="text"
                              value={sfx.text}
                              onChange={(e) =>
                                handleUpdateSfxItem(sfx.id, { text: e.target.value })
                              }
                              className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-xs font-manga-sfx focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Romaji & Meaning */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[10px] text-zinc-500">Romaji</label>
                              <input
                                type="text"
                                value={sfx.romaji}
                                onChange={(e) =>
                                  handleUpdateSfxItem(sfx.id, { romaji: e.target.value })
                                }
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-[11px] focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[10px] text-zinc-500">Meaning</label>
                              <input
                                type="text"
                                value={sfx.meaning}
                                onChange={(e) =>
                                  handleUpdateSfxItem(sfx.id, { meaning: e.target.value })
                                }
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-[11px] focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Lettering Color Swatches */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500">Color</label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[
                                { color: '#ffffff', label: 'White' },
                                { color: '#ef4444', label: 'Red' },
                                { color: '#facc15', label: 'Yellow' },
                                { color: '#f97316', label: 'Orange' },
                                { color: '#38bdf8', label: 'Cyan' },
                                { color: '#a855f7', label: 'Purple' },
                                { color: '#18181b', label: 'Black' },
                                { color: '#fbbf24', label: 'Gold' },
                              ].map((c) => (
                                <button
                                  key={c.color}
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSfxItem(sfx.id, { color: c.color })
                                  }
                                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                    (sfx.color || '#ffffff') === c.color
                                      ? 'ring-2 ring-amber-500 scale-110 border-white'
                                      : 'border-zinc-300 hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: c.color }}
                                  title={c.label}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Scale / Size Slider */}
                          <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between text-[10px] text-zinc-600">
                              <span>Scale / Size</span>
                              <span className="font-mono font-bold text-amber-700">
                                {sfx.scale.toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.6"
                              max="3.0"
                              step="0.1"
                              value={sfx.scale}
                              onChange={(e) =>
                                handleUpdateSfxItem(sfx.id, {
                                  scale: parseFloat(e.target.value),
                                })
                              }
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                          </div>

                          {/* Rotation Angle Slider */}
                          <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between text-[10px] text-zinc-600">
                              <span>Rotation</span>
                              <span className="font-mono font-bold text-amber-700">
                                {sfx.rotation}°
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                step="5"
                                value={sfx.rotation}
                                onChange={(e) =>
                                  handleUpdateSfxItem(sfx.id, {
                                    rotation: parseInt(e.target.value, 10),
                                  })
                                }
                                className="w-full accent-amber-500 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSfxItem(sfx.id, { rotation: 0 })
                                }
                                className="text-[10px] px-1.5 py-0.5 bg-zinc-200 hover:bg-zinc-300 rounded text-zinc-700 cursor-pointer"
                              >
                                0°
                              </button>
                            </div>
                          </div>

                          {/* Footer Action */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveSfx(sfx.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete SFX</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPanelSfxId(null)}
                              className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
                            >
                              Done Editing
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Create Custom SFX */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-2.5">
            <span className="font-semibold text-zinc-800">Create Custom Sound Effect</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Japanese Katakana (e.g. ズキューン!)"
                value={customSfxText}
                onChange={(e) => setCustomSfxText(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded text-xs font-manga-sfx focus:outline-none focus:border-zinc-950"
              />
              <input
                type="text"
                placeholder="Romaji (e.g. ZUKYUUUN!)"
                value={customSfxRomaji}
                onChange={(e) => setCustomSfxRomaji(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Meaning (e.g. Sudden intense shock)"
                value={customSfxMeaning}
                onChange={(e) => setCustomSfxMeaning(e.target.value)}
                className="flex-1 px-2.5 py-1 bg-white border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-950"
              />
              <div className="flex items-center gap-1">
                {['#ffffff', '#ef4444', '#facc15', '#38bdf8'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setCustomSfxColor(col)}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      customSfxColor === col
                        ? 'ring-2 ring-zinc-950 scale-110 border-white'
                        : 'border-zinc-300'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCustomSfx}
              className="py-1.5 bg-zinc-950 text-white rounded font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom SFX to Panel</span>
            </button>
          </div>

          {/* Section 3: Preset SFX Catalog */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-zinc-800">Preset Manga SFX Catalog</span>
              <span className="text-[11px] text-zinc-400">Click to place on canvas</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {SFX_PRESETS.map((item) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => handleAddSfxPreset(item)}
                  className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-950 hover:bg-zinc-50 transition-colors text-left flex flex-col group cursor-pointer"
                >
                  <span className="font-manga-sfx text-lg font-bold text-zinc-950 group-hover:scale-105 transition-transform">
                    {item.text}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">{item.romaji}</span>
                  <span className="text-[9px] text-zinc-400 truncate mt-0.5">{item.meaning}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Active Placed Speech Bubbles Manager */}
          {bubbles && bubbles.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800">
                  Active Bubbles on Panel ({bubbles.length})
                </span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {bubbles.map((b) => (
                  <div
                    key={b.id}
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col truncate flex-1">
                      <span className="font-manga-jp font-bold text-zinc-950 truncate">
                        {b.text}
                      </span>
                      {b.translation && (
                        <span className="text-[10px] text-zinc-500 truncate">
                          {b.translation}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBubble(b.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded hover:text-red-700 transition-colors cursor-pointer shrink-0"
                      title="Delete bubble"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Speech Bubble Builder */}
          <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
            <span className="font-semibold text-zinc-800">Add Speech Bubble</span>

            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'speech', label: 'Dialogue' },
                { id: 'shout', label: 'Shout' },
                { id: 'thought', label: 'Thought' },
                { id: 'narration', label: 'Caption' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBubbleType(t.id as any)}
                  className={`py-1 px-1.5 rounded text-[11px] text-center font-medium transition-colors cursor-pointer ${
                    bubbleType === t.id
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <input
                type="text"
                placeholder="Japanese text (e.g. 逃がさん!)"
                value={customDialogue}
                onChange={(e) => setCustomDialogue(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs font-manga-jp focus:outline-none focus:border-zinc-950"
              />
              <input
                type="text"
                placeholder="English translation subtitle"
                value={customTranslation}
                onChange={(e) => setCustomTranslation(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-950"
              />
            </div>

            <button
              type="button"
              onClick={handleAddCustomBubble}
              className="mt-1 py-1.5 bg-zinc-950 text-white rounded font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Place Bubble on Panel</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: AI Director */}
      {activeTab === 'ai' && (
        <div className="flex flex-col gap-3 text-xs">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-amber-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">Gemini AI Manga Director</span>
            Use Google Gemini to automatically analyze the scene composition, detect character emotions, and generate authentic Japanese dialogue and sound effects.
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRunAiAnalysis}
              disabled={isAiAnalyzing}
              className="w-full py-2.5 px-3 bg-zinc-950 text-white rounded-lg font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAiAnalyzing ? 'Analyzing Scene Dynamics...' : 'Auto-Generate Dialogue & SFX'}</span>
            </button>

            <button
              onClick={onRunAiRedraw}
              disabled={isAiRedrawing}
              className="w-full py-2.5 px-3 border border-zinc-300 bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-zinc-700" />
              <span>{isAiRedrawing ? 'Gemini AI Inking in Progress...' : 'Gemini AI Scene Redraw'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
