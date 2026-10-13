import React, { useState, useRef, useEffect } from 'react';
import { 
  MangaPanelData, 
  PageLayoutTemplate, 
  MangaShaderSettings 
} from '../types/manga';
import { DEFAULT_MANGA_SETTINGS, renderMangaEffect } from '../utils/mangaShader';
import { 
  captureVideoFrame, 
  sampleKeyframesFromVideo, 
  generateDemoActionClip, 
  ExtractedKeyframe 
} from '../utils/videoSampler';
import { MangaCanvasView } from './MangaCanvasView';
import { MangaControlPanel } from './MangaControlPanel';
import { 
  Upload, 
  Play, 
  Pause, 
  Film, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Layers, 
  RefreshCw,
  FastForward,
  BookOpen
} from 'lucide-react';

interface MovieMangaStudioProps {
  onExportTankobon: (panels: MangaPanelData[], layout: PageLayoutTemplate) => void;
}

export const MovieMangaStudio: React.FC<MovieMangaStudioProps> = ({
  onExportTankobon,
}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSampling, setIsSampling] = useState(false);
  const [sampleProgress, setSampleProgress] = useState(0);

  // Panels for the storyboard page
  const [panels, setPanels] = useState<MangaPanelData[]>([]);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number>(0);
  const [pageLayout, setPageLayout] = useState<PageLayoutTemplate>('4-koma');
  const [isMotionComicActive, setIsMotionComicActive] = useState(false);
  const [motionActiveIndex, setMotionActiveIndex] = useState(0);
  const [isAiScripting, setIsAiScripting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial demo video on first load if empty
  useEffect(() => {
    let isMounted = true;
    generateDemoActionClip()
      .then((clipUrl) => {
        if (isMounted) {
          setVideoSrc(clipUrl);
          // Auto-sample 4 keyframes
          sampleKeyframesFromVideo(clipUrl, 4).then((frames) => {
            if (isMounted) {
              const initialPanels: MangaPanelData[] = frames.map((f, i) => ({
                id: `panel-${i}-${Date.now()}`,
                index: i,
                originalImage: f.dataUrl,
                mangaImage: null,
                caption: `Frame ${f.label}`,
                settings: { ...DEFAULT_MANGA_SETTINGS },
                bubbles: [
                  {
                    id: `b-${i}`,
                    type: i === 3 ? 'shout' : 'speech',
                    text: i === 0 ? '何者だ!?' : i === 1 ? '追いついたぞ!' : i === 2 ? '受けてみろ!' : 'バカなッ!!',
                    translation: i === 0 ? 'Who goes there!?' : i === 1 ? 'Caught up to you!' : i === 2 ? 'Take this!' : 'Impossible!!',
                    x: 35,
                    y: 35,
                    width: 140,
                    height: 70,
                  },
                ],
                sfxItems: [
                  {
                    id: `sfx-${i}`,
                    text: i === 3 ? 'ズバッ!!' : i === 2 ? 'ドォォン!' : 'ドドドド',
                    romaji: i === 3 ? 'ZUBAT!!' : i === 2 ? 'DOOON!' : 'DODODO',
                    meaning: 'Impact',
                    x: 75,
                    y: 40,
                    scale: 1.4,
                    rotation: -10,
                    color: '#ffffff',
                  },
                ],
                videoTimestamp: f.timestamp,
              }));
              setPanels(initialPanels);
            }
          });
        }
      })
      .catch((err) => console.log('Demo video generation:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Motion Comic Player Interval
  useEffect(() => {
    if (!isMotionComicActive || panels.length === 0) return;
    const interval = setInterval(() => {
      setMotionActiveIndex((prev) => (prev + 1) % panels.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isMotionComicActive, panels.length]);

  // Video playback listeners
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Video File Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setIsPlaying(false);
    setPanels([]);
  };

  // Capture Current Frame
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const dataUrl = captureVideoFrame(videoRef.current);
    if (!dataUrl) return;

    const newPanel: MangaPanelData[] = [
      ...panels,
      {
        id: `panel-${panels.length}-${Date.now()}`,
        index: panels.length,
        originalImage: dataUrl,
        mangaImage: null,
        caption: `Scene ${panels.length + 1}`,
        settings: { ...DEFAULT_MANGA_SETTINGS },
        bubbles: [],
        sfxItems: [],
        videoTimestamp: currentTime,
      },
    ];

    setPanels(newPanel);
    setSelectedPanelIndex(newPanel.length - 1);
  };

  // Auto-Sample Keyframes
  const handleAutoSample = async (count: number) => {
    if (!videoSrc) return;
    setIsSampling(true);
    setSampleProgress(0);

    try {
      const sampled = await sampleKeyframesFromVideo(
        videoSrc,
        count,
        (progress) => setSampleProgress(progress)
      );

      const newPanels: MangaPanelData[] = sampled.map((f, i) => ({
        id: `panel-${i}-${Date.now()}`,
        index: i,
        originalImage: f.dataUrl,
        mangaImage: null,
        caption: `Panel ${i + 1} (${f.label})`,
        settings: { ...DEFAULT_MANGA_SETTINGS },
        bubbles: [],
        sfxItems: [],
        videoTimestamp: f.timestamp,
      }));

      setPanels(newPanels);
      setSelectedPanelIndex(0);
    } catch (err) {
      console.error('Failed to auto-sample keyframes:', err);
    } finally {
      setIsSampling(false);
    }
  };

  // AI Storyboard Script Generation
  const handleGenerateAiScript = async () => {
    if (panels.length === 0) return;
    setIsAiScripting(true);

    try {
      const response = await fetch('/api/manga/storyboard-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameCount: panels.length,
          genre: 'shonen action thriller',
        }),
      });

      const data = await response.json();
      if (data.panels && Array.isArray(data.panels)) {
        setPanels((prev) =>
          prev.map((panel, idx) => {
            const script = data.panels[idx];
            if (!script) return panel;

            return {
              ...panel,
              caption: script.caption || panel.caption,
              bubbles: [
                {
                  id: `script-b-${idx}`,
                  type: idx === prev.length - 1 ? 'shout' : 'speech',
                  text: script.dialogue || 'ここからが本番だ!',
                  translation: script.dialogueTranslation || 'The real fight begins!',
                  x: 35,
                  y: 35,
                  width: 140,
                  height: 70,
                },
              ],
              sfxItems: script.sfx
                ? [
                    {
                      id: `script-sfx-${idx}`,
                      text: script.sfx,
                      romaji: 'SFX',
                      meaning: 'Action effect',
                      x: 75,
                      y: 40,
                      scale: 1.4,
                      rotation: -8,
                      color: '#ffffff',
                    },
                  ]
                : panel.sfxItems,
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setIsAiScripting(false);
    }
  };

  // Remove a panel
  const handleRemovePanel = (index: number) => {
    const updated = panels.filter((_, i) => i !== index);
    setPanels(updated);
    if (selectedPanelIndex >= updated.length) {
      setSelectedPanelIndex(Math.max(0, updated.length - 1));
    }
  };

  const currentSelectedPanel = panels[selectedPanelIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Video Source and Scrubber Strip */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row gap-6 items-center">
        {/* Video Player Display */}
        <div className="relative rounded-lg overflow-hidden bg-zinc-950 border border-zinc-900 w-full lg:w-96 shrink-0 aspect-video flex items-center justify-center">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain"
              playsInline
            />
          ) : (
            <div className="text-zinc-500 text-xs flex flex-col items-center gap-1.5">
              <Film className="w-8 h-8 opacity-40" />
              <span>No Movie Loaded</span>
            </div>
          )}

          {/* Quick Play Overlay */}
          {videoSrc && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center group"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </div>
            </button>
          )}
        </div>

        {/* Video Controls & Keyframe Extraction Toolbar */}
        <div className="flex-1 w-full flex flex-col justify-between h-full gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sm text-zinc-900 block">
                Movie Keyframe Scrubber
              </span>
              <span className="text-xs text-zinc-500">
                {videoSrc ? 'Scrub through movie timeline & sample scenes into manga panels' : 'Upload MP4 or test with anime action scene'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-zinc-300 hover:border-zinc-900 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Movie</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </div>
          </div>

          {/* Scrubber Range Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs text-zinc-600 font-mono">
              <span>{new Date(currentTime * 1000).toISOString().substring(14, 19)}</span>
              <span>{new Date(duration * 1000).toISOString().substring(14, 19)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              disabled={!videoSrc}
              className="w-full accent-zinc-950 cursor-pointer"
            />
          </div>

          {/* Action Buttons for Frame Capture */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCaptureFrame}
                disabled={!videoSrc}
                className="px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Capture This Frame</span>
              </button>

              <button
                onClick={() => handleAutoSample(4)}
                disabled={!videoSrc || isSampling}
                className="px-3 py-1.5 border border-zinc-300 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 disabled:opacity-40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{isSampling ? `Sampling ${sampleProgress}%...` : 'Auto 4-Keyframes'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAiScript}
                disabled={panels.length === 0 || isAiScripting}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiScripting ? 'Writing Script...' : 'AI Story Script'}</span>
              </button>

              <button
                onClick={() => setIsMotionComicActive(!isMotionComicActive)}
                disabled={panels.length === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isMotionComicActive
                    ? 'bg-red-600 text-white'
                    : 'border border-zinc-300 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isMotionComicActive ? 'Stop Motion Comic' : 'Play Motion Comic'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard Keyframes Thumbnails Strip */}
      {panels.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span className="font-semibold text-zinc-900">
              Captured Panels ({panels.length})
            </span>
            <span>Click thumbnail to edit speech bubbles, ink lines, and sound effects</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {panels.map((panel, idx) => (
              <div
                key={panel.id}
                onClick={() => {
                  setSelectedPanelIndex(idx);
                  setIsMotionComicActive(false);
                }}
                className={`relative shrink-0 w-36 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedPanelIndex === idx
                    ? 'border-zinc-950 ring-2 ring-zinc-950/20'
                    : 'border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <img
                  src={panel.originalImage}
                  alt={`Panel ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 flex justify-between items-center">
                  <span>P{idx + 1}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePanel(idx);
                    }}
                    className="hover:text-red-400 p-0.5"
                    title="Remove panel"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motion Comic Active Screen or Editor Viewport */}
      {isMotionComicActive && panels.length > 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-4 text-white">
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>MOTION COMIC REEL · PANEL {motionActiveIndex + 1} OF {panels.length}</span>
          </div>

          <div className="w-full max-w-3xl">
            <MangaCanvasView
              imageSrc={panels[motionActiveIndex].originalImage}
              settings={panels[motionActiveIndex].settings}
              bubbles={panels[motionActiveIndex].bubbles}
              sfxItems={panels[motionActiveIndex].sfxItems}
              onUpdateBubbles={() => {}}
              onUpdateSfx={() => {}}
              panelLabel={`Panel ${motionActiveIndex + 1}`}
            />
          </div>
        </div>
      ) : currentSelectedPanel ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Editing Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
              <MangaCanvasView
                imageSrc={currentSelectedPanel.originalImage}
                settings={currentSelectedPanel.settings}
                bubbles={currentSelectedPanel.bubbles}
                sfxItems={currentSelectedPanel.sfxItems}
                onUpdateBubbles={(newBubbles) => {
                  setPanels((prev) =>
                    prev.map((p, i) =>
                      i === selectedPanelIndex ? { ...p, bubbles: newBubbles } : p
                    )
                  );
                }}
                onUpdateSfx={(newSfx) => {
                  setPanels((prev) =>
                    prev.map((p, i) =>
                      i === selectedPanelIndex ? { ...p, sfxItems: newSfx } : p
                    )
                  );
                }}
                panelLabel={`Movie Panel ${selectedPanelIndex + 1}`}
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-zinc-500">
                Styling panel {selectedPanelIndex + 1} of {panels.length}
              </span>

              <button
                onClick={() => onExportTankobon(panels, pageLayout)}
                className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Export Full Tankobon Manga Page</span>
              </button>
            </div>
          </div>

          {/* Right Column: Panel Tuning & SFX */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <MangaControlPanel
              settings={currentSelectedPanel.settings}
              onUpdateSettings={(newSettings) => {
                setPanels((prev) =>
                  prev.map((p, i) =>
                    i === selectedPanelIndex ? { ...p, settings: newSettings } : p
                  )
                );
              }}
              onAddBubble={(newBubble) => {
                setPanels((prev) =>
                  prev.map((p, i) =>
                    i === selectedPanelIndex
                      ? { ...p, bubbles: [...p.bubbles, newBubble] }
                      : p
                  )
                );
              }}
              onAddSfx={(newSfx) => {
                setPanels((prev) =>
                  prev.map((p, i) =>
                    i === selectedPanelIndex
                      ? { ...p, sfxItems: [...p.sfxItems, newSfx] }
                      : p
                  )
                );
              }}
              sfxItems={currentSelectedPanel.sfxItems}
              onUpdateSfx={(newSfx) => {
                setPanels((prev) =>
                  prev.map((p, i) =>
                    i === selectedPanelIndex ? { ...p, sfxItems: newSfx } : p
                  )
                );
              }}
              bubbles={currentSelectedPanel.bubbles}
              onUpdateBubbles={(newBubbles) => {
                setPanels((prev) =>
                  prev.map((p, i) =>
                    i === selectedPanelIndex ? { ...p, bubbles: newBubbles } : p
                  )
                );
              }}
              onRunAiAnalysis={() => {}}
              onRunAiRedraw={() => {}}
              isAiAnalyzing={false}
              isAiRedrawing={false}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
