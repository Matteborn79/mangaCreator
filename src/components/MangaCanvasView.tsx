import React, { useRef, useEffect, useState } from 'react';
import { 
  MangaShaderSettings, 
  MangaSpeechBubble, 
  MangaSFXItem 
} from '../types/manga';
import { renderMangaEffect } from '../utils/mangaShader';
import { 
  Trash2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Eye, 
  Crosshair,
  Edit3,
  X,
  Palette,
  Check
} from 'lucide-react';

interface MangaCanvasViewProps {
  imageSrc: string;
  originalSrc?: string;
  settings: MangaShaderSettings;
  bubbles: MangaSpeechBubble[];
  sfxItems: MangaSFXItem[];
  onUpdateBubbles: (bubbles: MangaSpeechBubble[]) => void;
  onUpdateSfx: (sfx: MangaSFXItem[]) => void;
  selectedSfxId?: string | null;
  onSelectSfx?: (id: string | null) => void;
  selectedBubbleId?: string | null;
  onSelectBubble?: (id: string | null) => void;
  onFocusPointChange?: (x: number, y: number) => void;
  panelLabel?: string;
}

const SFX_COLOR_PRESETS = [
  { color: '#ffffff', label: 'White' },
  { color: '#ef4444', label: 'Red' },
  { color: '#facc15', label: 'Yellow' },
  { color: '#f97316', label: 'Orange' },
  { color: '#38bdf8', label: 'Cyan' },
  { color: '#a855f7', label: 'Purple' },
  { color: '#18181b', label: 'Black' },
  { color: '#fbbf24', label: 'Gold' },
];

export const MangaCanvasView: React.FC<MangaCanvasViewProps> = ({
  imageSrc,
  originalSrc,
  settings,
  bubbles,
  sfxItems,
  onUpdateBubbles,
  onUpdateSfx,
  selectedSfxId: selectedSfxIdProp,
  onSelectSfx: onSelectSfxProp,
  selectedBubbleId: selectedBubbleIdProp,
  onSelectBubble: onSelectBubbleProp,
  onFocusPointChange,
  panelLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isComparing, setIsComparing] = useState(false);
  
  // Controlled or uncontrolled selection state
  const [internalSelectedBubbleId, setInternalSelectedBubbleId] = useState<string | null>(null);
  const [internalSelectedSfxId, setInternalSelectedSfxId] = useState<string | null>(null);
  const [editingSfxId, setEditingSfxId] = useState<string | null>(null);
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);

  const selectedBubbleId = selectedBubbleIdProp !== undefined ? selectedBubbleIdProp : internalSelectedBubbleId;
  const selectedSfxId = selectedSfxIdProp !== undefined ? selectedSfxIdProp : internalSelectedSfxId;

  const setSelectedBubbleId = (id: string | null) => {
    setInternalSelectedBubbleId(id);
    onSelectBubbleProp?.(id);
    if (id) {
      setInternalSelectedSfxId(null);
      onSelectSfxProp?.(null);
      setEditingSfxId(null);
    }
  };

  const setSelectedSfxId = (id: string | null) => {
    setInternalSelectedSfxId(id);
    onSelectSfxProp?.(id);
    if (id) {
      setInternalSelectedBubbleId(null);
      onSelectBubbleProp?.(null);
      setEditingBubbleId(null);
    }
  };

  const [isSettingFocus, setIsSettingFocus] = useState(false);
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    type: 'bubble' | 'sfx';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Render manga effect whenever image or shader settings change
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Keep aspect ratio with maximum crisp resolution
      const maxDim = 1200;
      let w = img.naturalWidth || 800;
      let h = img.naturalHeight || 600;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;

      renderMangaEffect(img, canvas, settings);
    };
  }, [imageSrc, settings]);

  // Keyboard shortcut listener: Delete/Backspace removes selected SFX or Bubble
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedSfxId) {
          e.preventDefault();
          removeSfx(selectedSfxId);
        } else if (selectedBubbleId) {
          e.preventDefault();
          removeBubble(selectedBubbleId);
        }
      } else if (e.key === 'Escape') {
        setSelectedSfxId(null);
        setSelectedBubbleId(null);
        setEditingSfxId(null);
        setEditingBubbleId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSfxId, selectedBubbleId, sfxItems, bubbles]);

  // Handle drag for speech bubbles & SFX
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    type: 'bubble' | 'sfx',
    currX: number,
    currY: number
  ) => {
    // Only respond to main button
    if (e.button !== 0) return;
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    if (type === 'bubble') {
      setSelectedBubbleId(id);
    } else {
      setSelectedSfxId(id);
    }

    setDraggingItem({
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      origX: currX,
      origY: currY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingItem || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - draggingItem.startX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - draggingItem.startY) / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, draggingItem.origX + deltaXPercent));
    const newY = Math.max(5, Math.min(95, draggingItem.origY + deltaYPercent));

    if (draggingItem.type === 'bubble') {
      onUpdateBubbles(
        bubbles.map((b) => (b.id === draggingItem.id ? { ...b, x: newX, y: newY } : b))
      );
    } else {
      onUpdateSfx(
        sfxItems.map((s) => (s.id === draggingItem.id ? { ...s, x: newX, y: newY } : s))
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
    setDraggingItem(null);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Never deselect if clicked inside any speech bubble or sound effect or toolbar
    if (
      target.closest('[data-canvas-item="bubble"]') ||
      target.closest('[data-canvas-item="sfx"]')
    ) {
      return;
    }

    if (isSettingFocus && containerRef.current && onFocusPointChange) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      onFocusPointChange(Math.round(xPercent), Math.round(yPercent));
      setIsSettingFocus(false);
      return;
    }

    // Only deselect if clicked directly on blank canvas area or container backdrop
    setSelectedBubbleId(null);
    setSelectedSfxId(null);
    setEditingSfxId(null);
    setEditingBubbleId(null);
  };

  const removeBubble = (id: string) => {
    onUpdateBubbles(bubbles.filter((b) => b.id !== id));
    if (selectedBubbleId === id) setSelectedBubbleId(null);
    if (editingBubbleId === id) setEditingBubbleId(null);
  };

  const removeSfx = (id: string) => {
    onUpdateSfx(sfxItems.filter((s) => s.id !== id));
    if (selectedSfxId === id) setSelectedSfxId(null);
    if (editingSfxId === id) setEditingSfxId(null);
  };

  const rotateSfx = (id: string, deltaDegrees: number = 15) => {
    onUpdateSfx(
      sfxItems.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + deltaDegrees) % 360 } : s))
    );
  };

  const scaleSfx = (id: string, delta: number) => {
    onUpdateSfx(
      sfxItems.map((s) =>
        s.id === id ? { ...s, scale: Math.max(0.6, Math.min(3.0, Number((s.scale + delta).toFixed(2)))) } : s
      )
    );
  };

  const cycleSfxColor = (id: string) => {
    const sfx = sfxItems.find((s) => s.id === id);
    if (!sfx) return;
    const colors = ['#ffffff', '#ef4444', '#facc15', '#f97316', '#38bdf8', '#a855f7', '#18181b', '#fbbf24'];
    const currIdx = colors.indexOf(sfx.color || '#ffffff');
    const nextColor = colors[(currIdx + 1) % colors.length];
    updateSfxField(id, { color: nextColor });
  };

  const updateSfxField = (id: string, updates: Partial<MangaSFXItem>) => {
    onUpdateSfx(
      sfxItems.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const updateBubbleField = (id: string, updates: Partial<MangaSpeechBubble>) => {
    onUpdateBubbles(
      bubbles.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full">
      {/* Top action helper bar */}
      <div className="w-full flex items-center justify-between pb-3 text-xs text-zinc-600">
        <div className="flex items-center gap-3">
          {panelLabel && (
            <span className="font-semibold text-zinc-900 tracking-tight">{panelLabel}</span>
          )}
          <span className="text-zinc-400">·</span>
          <span>{settings.preset.toUpperCase()} Ink</span>
          <span className="text-zinc-400">·</span>
          <span>{bubbles.length} Bubbles</span>
          <span className="text-zinc-400">·</span>
          <span>{sfxItems.length} SFX</span>
        </div>

        <div className="flex items-center gap-2">
          {settings.speedlineType === 'radial-burst' && (
            <button
              onClick={() => setIsSettingFocus(!isSettingFocus)}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isSettingFocus
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isSettingFocus ? 'Click on Canvas to Set Focal Point' : 'Set Focal Point'}</span>
            </button>
          )}

          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isComparing
                ? 'bg-zinc-950 text-white ring-2 ring-zinc-950/20'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Showing Original Photo' : 'Hold to Compare Original'}</span>
          </button>
        </div>
      </div>

      {/* Main Panel Viewport */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative overflow-visible w-full min-h-[360px] max-h-[72vh] flex items-center justify-center bg-zinc-950 manga-panel-border rounded-lg cursor-${
          isSettingFocus ? 'crosshair' : 'default'
        }`}
      >
        {/* Canvas is ALWAYS mounted so pixels are NEVER lost on comparison */}
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[72vh] object-contain block bg-white rounded"
        />

        {/* Comparison Overlay: Rendered on top of canvas without unmounting the canvas */}
        {isComparing && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-950/95 z-10 pointer-events-none rounded">
            <img
              src={originalSrc || imageSrc}
              alt="Original photo"
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[72vh] object-contain"
            />
            <div className="absolute top-3 left-3 bg-zinc-950/80 text-white font-mono text-[11px] px-2 py-0.5 rounded shadow">
              ORIGINAL PHOTO
            </div>
          </div>
        )}

        {/* Speedline center focal point marker */}
        {isSettingFocus && (
          <div
            className="absolute pointer-events-none w-8 h-8 -ml-4 -mt-4 border-2 border-red-500 rounded-full flex items-center justify-center animate-ping"
            style={{
              left: `${settings.speedlineCenterX}%`,
              top: `${settings.speedlineCenterY}%`,
            }}
          />
        )}

        {/* Overlaid Manga Speech Bubbles */}
        {!isComparing &&
          bubbles.map((bubble) => {
            const isSelected = selectedBubbleId === bubble.id;
            const isEditing = editingBubbleId === bubble.id;

            return (
              <div
                key={bubble.id}
                data-canvas-item="bubble"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBubbleId(bubble.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedBubbleId(bubble.id);
                  setEditingBubbleId(bubble.id);
                }}
                onPointerDown={(e) =>
                  handlePointerDown(e, bubble.id, 'bubble', bubble.x, bubble.y)
                }
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                    : 'hover:ring-2 hover:ring-blue-400/70 hover:shadow-sm'
                }`}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  zIndex: isEditing ? 60 : isSelected ? 50 : 25,
                }}
              >
                {/* Bubble Shape based on type */}
                <div
                  className={`relative p-3 bg-white text-zinc-950 border-2 border-zinc-950 font-bold leading-snug shadow-md cursor-pointer ${
                    bubble.type === 'shout'
                      ? 'rounded-none border-4 clip-shout'
                      : bubble.type === 'thought'
                      ? 'rounded-3xl border-dashed'
                      : bubble.type === 'narration'
                      ? 'rounded-none border-2 bg-zinc-100 text-xs uppercase tracking-wider'
                      : 'rounded-2xl'
                  }`}
                  style={{
                    minWidth: '120px',
                    maxWidth: '220px',
                  }}
                >
                  {/* Speech Bubble Tail */}
                  {bubble.type === 'speech' && (
                    <div
                      className="absolute -bottom-2 left-6 w-3 h-3 bg-white border-r-2 border-b-2 border-zinc-950 transform rotate-45"
                    />
                  )}

                  {/* Japanese Main Text */}
                  <div
                    className={`font-manga-jp ${
                      bubble.type === 'shout'
                        ? 'text-base font-extrabold tracking-wider'
                        : 'text-sm font-bold'
                    } text-center select-none`}
                  >
                    {bubble.text}
                  </div>

                  {/* English Subtitle Translation */}
                  {bubble.translation && (
                    <div className="text-[11px] font-medium text-zinc-500 text-center mt-1 pt-1 border-t border-zinc-200 select-none">
                      {bubble.translation}
                    </div>
                  )}

                  {/* Quick Bubble Action Controls */}
                  {isSelected && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -top-9 right-0 flex items-center gap-1 bg-zinc-950 text-white rounded-md px-2 py-1 text-[11px] shadow-xl border border-zinc-700 pointer-events-auto z-50 whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBubbleId(isEditing ? null : bubble.id);
                        }}
                        className={`p-1 rounded hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer ${
                          isEditing ? 'text-amber-400 font-bold' : 'text-zinc-200'
                        }`}
                        title="Edit bubble text & style"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <span className="text-zinc-600">|</span>

                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBubble(bubble.id);
                        }}
                        className="hover:text-red-400 text-red-500 p-1 rounded hover:bg-zinc-800 flex items-center gap-1 font-semibold cursor-pointer"
                        title="Delete bubble"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* In-place Bubble Editor Popover */}
                  {isEditing && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-zinc-950 border border-zinc-700 text-white rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2.5 w-64 text-xs pointer-events-auto"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Speech Bubble</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBubbleId(null);
                          }}
                          className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bubble Shape / Type Selector */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-400">Bubble Style</label>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBubbleField(bubble.id, { type: t.id as any });
                              }}
                              className={`py-0.5 px-1 rounded text-[10px] text-center font-medium transition-colors cursor-pointer ${
                                bubble.type === t.id
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-400">Japanese Dialogue</label>
                        <input
                          type="text"
                          value={bubble.text}
                          onChange={(e) => updateBubbleField(bubble.id, { text: e.target.value })}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-400 font-manga-jp"
                          placeholder="Japanese text..."
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-400">English Translation</label>
                        <input
                          type="text"
                          value={bubble.translation || ''}
                          onChange={(e) => updateBubbleField(bubble.id, { translation: e.target.value })}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-400"
                          placeholder="English translation..."
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBubble(bubble.id);
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBubbleId(null);
                          }}
                          className="px-3.5 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded text-[11px] cursor-pointer transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Overlaid Sound Effect (SFX / Onomatopoeia) Stickers */}
        {!isComparing &&
          sfxItems.map((sfx) => {
            const isSelected = selectedSfxId === sfx.id;
            const isEditing = editingSfxId === sfx.id;

            return (
              <div
                key={sfx.id}
                data-canvas-item="sfx"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSfxId(sfx.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedSfxId(sfx.id);
                  setEditingSfxId(sfx.id);
                }}
                onPointerDown={(e) =>
                  handlePointerDown(e, sfx.id, 'sfx', sfx.x, sfx.y)
                }
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none transition-all ${
                  isSelected
                    ? 'ring-2 ring-amber-500 rounded-lg p-1 shadow-lg'
                    : 'hover:ring-2 hover:ring-amber-400/60 rounded-lg p-1'
                }`}
                style={{
                  left: `${sfx.x}%`,
                  top: `${sfx.y}%`,
                  zIndex: isEditing ? 60 : isSelected ? 50 : 25,
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Manga Onomatopoeia Katakana Lettering with deep outline */}
                  <div
                    style={{
                      transform: `rotate(${sfx.rotation}deg) scale(${sfx.scale})`,
                      transformOrigin: 'center center',
                    }}
                    className="transition-transform duration-75"
                  >
                    <span
                      className="font-manga-sfx text-3xl sm:text-4xl font-extrabold tracking-wider block drop-shadow-[0_4px_4px_rgba(0,0,0,0.85)] cursor-grab"
                      style={{
                        color: sfx.color || '#ffffff',
                        WebkitTextStroke: '2px #09090b',
                        textShadow:
                          '3px 3px 0 #09090b, -1px -1px 0 #09090b, 1px -1px 0 #09090b, -1px 1px 0 #09090b',
                      }}
                    >
                      {sfx.text}
                    </span>
                  </div>

                  {/* SFX Floating Action Toolbar when selected */}
                  {isSelected && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -top-11 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-zinc-950 text-white rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-2xl z-40 border border-zinc-700 pointer-events-auto"
                    >
                      <span className="font-mono text-[10px] text-amber-400 font-bold px-1">
                        {sfx.romaji || sfx.text}
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSfxId(isEditing ? null : sfx.id);
                        }}
                        className={`p-1 rounded hover:bg-zinc-800 transition-colors flex items-center gap-1 text-[11px] ${
                          isEditing ? 'bg-amber-500 text-zinc-950 font-semibold' : 'text-zinc-200'
                        }`}
                        title="Edit SFX (Text, Romaji, Color, Size, Rotation)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Quick Rotate +15° */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          rotateSfx(sfx.id, 15);
                        }}
                        className="hover:text-amber-400 p-1 rounded hover:bg-zinc-800 text-zinc-300 transition-colors"
                        title="Rotate (+15°)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Zoom In */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          scaleSfx(sfx.id, 0.2);
                        }}
                        className="hover:text-amber-400 p-1 rounded hover:bg-zinc-800 text-zinc-300 transition-colors"
                        title="Enlarge (+)"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Zoom Out */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          scaleSfx(sfx.id, -0.2);
                        }}
                        className="hover:text-amber-400 p-1 rounded hover:bg-zinc-800 text-zinc-300 transition-colors"
                        title="Shrink (-)"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Color Swatch Cycle */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleSfxColor(sfx.id);
                        }}
                        className="w-4 h-4 rounded-full border border-white/70 mx-0.5 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: sfx.color || '#ffffff' }}
                        title="Click to cycle SFX color"
                      />

                      {/* Explicit Delete Button */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSfx(sfx.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px] ml-1 shadow-sm transition-colors cursor-pointer"
                        title="Delete Sound Effect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* Inline SFX Editor Popover */}
                  {isEditing && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-zinc-950 border border-zinc-700 text-white rounded-xl p-3.5 shadow-2xl z-50 flex flex-col gap-3 w-68 text-xs pointer-events-auto"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Sound Effect</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingSfxId(null)}
                          className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Japanese Katakana Text */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-zinc-300">
                          Japanese Text (Katakana)
                        </label>
                        <input
                          type="text"
                          value={sfx.text}
                          onChange={(e) => updateSfxField(sfx.id, { text: e.target.value })}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-sm font-manga-sfx text-white focus:outline-none focus:border-amber-400"
                          placeholder="e.g. ドォォン!"
                        />
                      </div>

                      {/* Romaji & Meaning */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-400">Romaji</label>
                          <input
                            type="text"
                            value={sfx.romaji}
                            onChange={(e) => updateSfxField(sfx.id, { romaji: e.target.value })}
                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                            placeholder="DOOON!"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-400">Meaning</label>
                          <input
                            type="text"
                            value={sfx.meaning}
                            onChange={(e) => updateSfxField(sfx.id, { meaning: e.target.value })}
                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                            placeholder="Heavy impact"
                          />
                        </div>
                      </div>

                      {/* SFX Color Palette */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-zinc-300">Lettering Color</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {SFX_COLOR_PRESETS.map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => updateSfxField(sfx.id, { color: c.color })}
                              className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                (sfx.color || '#ffffff') === c.color
                                  ? 'ring-2 ring-amber-400 scale-110 border-white'
                                  : 'border-zinc-600 hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Scale / Size Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px] text-zinc-300">
                          <span>Scale / Size</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {sfx.scale.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="3.0"
                          step="0.1"
                          value={sfx.scale}
                          onChange={(e) => updateSfxField(sfx.id, { scale: parseFloat(e.target.value) })}
                          className="accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Rotation Angle Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px] text-zinc-300">
                          <span>Rotation Angle</span>
                          <span className="font-mono text-amber-400 font-bold">{sfx.rotation}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="5"
                            value={sfx.rotation}
                            onChange={(e) =>
                              updateSfxField(sfx.id, { rotation: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => updateSfxField(sfx.id, { rotation: 0 })}
                            className="text-[10px] px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 cursor-pointer"
                            title="Reset rotation to 0°"
                          >
                            0°
                          </button>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => removeSfx(sfx.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete SFX</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSfxId(null)}
                          className="px-3.5 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded text-xs transition-colors cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
