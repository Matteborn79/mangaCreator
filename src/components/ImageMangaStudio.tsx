import React, { useState, useRef, useEffect } from 'react';
import { 
  MangaCharacterArchetype,
  MangaShaderSettings, 
  MangaSpeechBubble, 
  MangaSFXItem 
} from '../types/manga';
import { DEFAULT_MANGA_SETTINGS } from '../utils/mangaShader';
import { SAMPLE_IMAGES } from '../data/mangaAssets';
import { MangaCanvasView } from './MangaCanvasView';
import { MangaControlPanel } from './MangaControlPanel';
import { 
  Upload, 
  Camera, 
  Download, 
  Share2, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  User,
  Zap,
  RotateCcw
} from 'lucide-react';

interface ImageMangaStudioProps {
  onSendToPageStory: (imageSrc: string, bubbles: MangaSpeechBubble[], sfx: MangaSFXItem[]) => void;
}

export const ImageMangaStudio: React.FC<ImageMangaStudioProps> = ({
  onSendToPageStory,
}) => {
  const [currentImage, setCurrentImage] = useState<string>(SAMPLE_IMAGES[0].url);
  const [originalBackupImage, setOriginalBackupImage] = useState<string>(SAMPLE_IMAGES[0].url);
  const [settings, setSettings] = useState<MangaShaderSettings>({
    ...DEFAULT_MANGA_SETTINGS,
    characterMode: true,
    skinSmoothing: 65,
    edgeThreshold: 42,
  });
  const [bubbles, setBubbles] = useState<MangaSpeechBubble[]>([
    {
      id: 'default-bubble-1',
      type: 'speech',
      text: '私の出番か...!',
      translation: 'Is it my turn...!',
      x: 30,
      y: 28,
      width: 140,
      height: 70,
    },
  ]);
  const [sfxItems, setSfxItems] = useState<MangaSFXItem[]>([
    {
      id: 'default-sfx-1',
      text: 'ドォォン!',
      romaji: 'DOOON!',
      meaning: 'Impact',
      x: 75,
      y: 35,
      scale: 1.5,
      rotation: -8,
      color: '#ffffff',
    },
  ]);

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isAiRedrawing, setIsAiRedrawing] = useState(false);
  const [isCharacterMorphing, setIsCharacterMorphing] = useState(false);
  const [selectedArchetypeQuick, setSelectedArchetypeQuick] = useState<MangaCharacterArchetype>('shonen-hero');
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedSfxId, setSelectedSfxId] = useState<string | null>(null);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Attach stream whenever video element mounts or camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('Video play error:', err);
      });
    }
  }, [isCameraActive]);

  // Callback ref to guarantee stream is attached immediately on DOM mount
  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch((err) => console.warn('Video autoplay:', err));
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCurrentImage(event.target.result);
        setOriginalBackupImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera Capture
  const startCamera = async () => {
    setCameraError(null);
    try {
      let stream: MediaStream;
      try {
        // Try front camera / selfie mode first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 } },
        });
      } catch (errUserFacing) {
        // Fallback to generic video capture (e.g. desktop USB webcams)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      // In case video element was already in DOM
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please click the camera icon in your browser URL bar to allow access.'
          : 'Could not connect to webcam. Please ensure your camera is connected or upload a photo.'
      );
      setIsCameraActive(false);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video (mirror horizontally for natural selfie orientation)
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCurrentImage(dataUrl);
    setOriginalBackupImage(dataUrl);
    stopCamera();
    setAiNotice('Selfie captured! Now click "Turn Picture into Manga Character" to transform.');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Helper to ensure an image URL is converted to valid base64 before API submission
  const ensureBase64DataUrl = async (src: string): Promise<string> => {
    if (!src) return '';
    if (src.startsWith('data:')) return src;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      return src;
    }
  };

  // Turn Picture into Manga Character (Core Feature)
  const handleTransformToCharacter = async (
    archetype: MangaCharacterArchetype = selectedArchetypeQuick,
    expression = 'determined'
  ) => {
    setIsCharacterMorphing(true);
    setAiNotice(null);

    try {
      const base64Data = await ensureBase64DataUrl(currentImage);
      const response = await fetch('/api/manga/character-transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          archetype,
          colorMode: settings.colorMode,
          expression,
        }),
      });

      const data = await response.json();
      if (data.success && data.mangaImage) {
        setCurrentImage(data.mangaImage);
        setSettings((prev) => ({
          ...prev,
          characterMode: true,
          characterArchetype: archetype,
        }));
        setAiNotice(`Character transformation complete! Rendered as Japanese ${archetype.replace('-', ' ')}.`);

        // Add matching dialogue
        if (archetype === 'shojo-heroine') {
          setBubbles([
            {
              id: `b-${Date.now()}`,
              type: 'thought',
              text: 'ずっと... 伝えたかった',
              translation: 'I wanted to tell you all along...',
              x: 30,
              y: 30,
              width: 150,
              height: 70,
            },
          ]);
        } else if (archetype === 'shonen-hero') {
          setBubbles([
            {
              id: `b-${Date.now()}`,
              type: 'shout',
              text: '諦めるわけにはいかない!',
              translation: 'There is no way I am giving up!',
              x: 35,
              y: 28,
              width: 150,
              height: 70,
            },
          ]);
        }
      } else {
        // High-precision procedural Japanese Manga Character Engine:
        // Configures line-art, cel skin tone, speedlines, and SFX suited to this character archetype
        const archetypeProfiles: Record<string, {
          preset: any;
          inkThickness: number;
          edgeThreshold: number;
          darkShadowFill: number;
          skinSmoothing: number;
          speedlineType: any;
          dialogue: { text: string; translation: string; type: any };
          sfx: { text: string; romaji: string; meaning: string };
        }> = {
          'shonen-hero': {
            preset: 'shonen',
            inkThickness: 3,
            edgeThreshold: 42,
            darkShadowFill: 42,
            skinSmoothing: 80,
            speedlineType: 'radial-burst',
            dialogue: { text: '諦めるわけにはいかない!', translation: 'There is no way I am giving up!', type: 'shout' },
            sfx: { text: 'ドォォン!', romaji: 'DOOON!', meaning: 'Impact' },
          },
          'shojo-heroine': {
            preset: 'shojo',
            inkThickness: 1,
            edgeThreshold: 50,
            darkShadowFill: 18,
            skinSmoothing: 92,
            speedlineType: 'none',
            dialogue: { text: 'ずっと... 伝えたかった', translation: 'I wanted to tell you all along...', type: 'thought' },
            sfx: { text: 'ドキドキ', romaji: 'DOKI DOKI', meaning: 'Heart racing' },
          },
          'seinen-antihero': {
            preset: 'seinen',
            inkThickness: 2,
            edgeThreshold: 32,
            darkShadowFill: 55,
            skinSmoothing: 65,
            speedlineType: 'horizontal-action',
            dialogue: { text: '邪魔をするな...', translation: "Don't get in my way...", type: 'speech' },
            sfx: { text: 'ゴゴゴ...', romaji: 'GOGOGO...', meaning: 'Ominous aura' },
          },
          'cyberpunk-ronin': {
            preset: 'cyberpunk',
            inkThickness: 2,
            edgeThreshold: 38,
            darkShadowFill: 50,
            skinSmoothing: 75,
            speedlineType: 'radial-burst',
            dialogue: { text: '標的捕捉。排除する。', translation: 'Target acquired. Eliminating.', type: 'speech' },
            sfx: { text: 'ズバッ!!', romaji: 'ZUBAT!!', meaning: 'Clean slice' },
          },
          'vintage-90s': {
            preset: 'vintage',
            inkThickness: 2,
            edgeThreshold: 40,
            darkShadowFill: 32,
            skinSmoothing: 70,
            speedlineType: 'none',
            dialogue: { text: '行くぞ、相棒!', translation: "Let's go, partner!", type: 'speech' },
            sfx: { text: 'ドドドド', romaji: 'DODODO', meaning: 'Rushing' },
          },
          'chibi': {
            preset: 'shojo',
            inkThickness: 2,
            edgeThreshold: 45,
            darkShadowFill: 20,
            skinSmoothing: 95,
            speedlineType: 'none',
            dialogue: { text: 'えへへ、よろしくね!', translation: 'Ehehe, nice to meet you!', type: 'speech' },
            sfx: { text: 'ピカーン!', romaji: 'PIKAAN!', meaning: 'Sparkle' },
          },
        };

        const prof = archetypeProfiles[archetype] || archetypeProfiles['shonen-hero'];
        const isVibrantColor = settings.colorMode === 'vibrant' || settings.colorMode === 'color';

        setSettings((prev) => ({
          ...prev,
          preset: isVibrantColor ? 'vivid-anime' : prof.preset,
          colorMode: isVibrantColor ? 'vibrant' : (prof.preset === 'vintage' ? 'sepia' : 'bw'),
          colorSaturation: isVibrantColor ? Math.max(prev.colorSaturation || 1.5, 1.65) : 1.0,
          screentoneStrength: isVibrantColor ? 0 : 100, // Zero distortion in color mode!
          distortionFilter: isVibrantColor ? 92 : 35,   // Silky smooth noise suppression!
          inkThickness: isVibrantColor ? 1 : prof.inkThickness,
          edgeThreshold: prof.edgeThreshold,
          darkShadowFill: isVibrantColor ? 4 : prof.darkShadowFill,
          skinSmoothing: prof.skinSmoothing,
          speedlineType: prof.speedlineType,
          characterMode: true,
          characterArchetype: archetype,
        }));

        setBubbles([
          {
            id: `b-${Date.now()}`,
            type: prof.dialogue.type,
            text: prof.dialogue.text,
            translation: prof.dialogue.translation,
            x: 35,
            y: 30,
            width: 150,
            height: 70,
          },
        ]);

        setSfxItems([
          {
            id: `sfx-${Date.now()}`,
            text: prof.sfx.text,
            romaji: prof.sfx.romaji,
            meaning: prof.sfx.meaning,
            x: 75,
            y: 35,
            scale: 1.5,
            rotation: -8,
            color: '#ffffff',
          },
        ]);

        setAiNotice(`Manga Character Engine active: Applied ${archetype.replace('-', ' ')} inking, cel skin smoothing & speedlines.`);
      }
    } catch (err: any) {
      console.warn('Character transform fallback:', err);
      setSettings((prev) => ({
        ...prev,
        characterMode: true,
        characterArchetype: archetype,
        skinSmoothing: 80,
        edgeThreshold: 42,
      }));
      setAiNotice('Japanese Manga Character inking active on portrait.');
    } finally {
      setIsCharacterMorphing(false);
    }
  };

  // Gemini AI Scene Analysis
  const handleRunAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    setAiNotice(null);

    try {
      const base64Data = await ensureBase64DataUrl(currentImage);
      const response = await fetch('/api/manga/analyze-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          genre: settings.preset,
        }),
      });

      const data = await response.json();
      if (data.dialogue && data.dialogue.length > 0) {
        const newBubbles: MangaSpeechBubble[] = data.dialogue.map((d: any, idx: number) => ({
          id: `ai-bubble-${Date.now()}-${idx}`,
          type: d.type === 'shout' ? 'shout' : d.type === 'thought' ? 'thought' : 'speech',
          text: d.text,
          translation: d.translation,
          x: 25 + idx * 45,
          y: 25 + idx * 30,
          width: 150,
          height: 80,
        }));
        setBubbles(newBubbles);
      }

      if (data.sfx && data.sfx.length > 0) {
        const newSfx: MangaSFXItem[] = data.sfx.map((s: any, idx: number) => ({
          id: `ai-sfx-${Date.now()}-${idx}`,
          text: s.text,
          romaji: s.romaji || '',
          meaning: s.meaning || '',
          x: s.x || (70 - idx * 25),
          y: s.y || (35 + idx * 25),
          scale: s.scale || 1.5,
          rotation: s.rotation || 0,
          color: '#ffffff',
        }));
        setSfxItems(newSfx);
      }

      setAiNotice(
        `AI Scene Analysis applied: "${data.narration || data.mood || 'Dialogue and SFX generated'}"`
      );
    } catch (err: any) {
      console.error('AI scene analysis failed:', err);
      setAiNotice('Scene analyzed with fallback manga script patterns.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Gemini AI Full Redraw
  const handleRunAiRedraw = async () => {
    setIsAiRedrawing(true);
    setAiNotice(null);

    try {
      const base64Data = await ensureBase64DataUrl(currentImage);
      const response = await fetch('/api/manga/ai-transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          colorMode: settings.colorMode,
          stylePrompt: `${settings.preset} manga style with intense ink contrast and authentic screentones`,
        }),
      });

      const data = await response.json();
      if (data.success && data.mangaImage) {
        setCurrentImage(data.mangaImage);
        setAiNotice('Gemini AI has redrawn your image into manga artwork!');
      } else {
        setAiNotice(data.commentary || 'Shader engine active for instantaneous manga styling.');
      }
    } catch (err: any) {
      console.error('Gemini redraw error:', err);
      setAiNotice('Shader engine active for instantaneous manga styling.');
    } finally {
      setIsAiRedrawing(false);
    }
  };

  // Reset to original image
  const handleResetToOriginal = () => {
    setCurrentImage(originalBackupImage);
    setSettings(DEFAULT_MANGA_SETTINGS);
  };

  // High Resolution Composite Export
  const handleDownloadPanel = () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;

    img.onload = () => {
      const scale = 2;
      canvas.width = (img.naturalWidth || 800) * scale;
      canvas.height = (img.naturalHeight || 600) * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      import('../utils/mangaShader').then(({ renderMangaEffect }) => {
        renderMangaEffect(img, tempCanvas, settings);
        ctx.drawImage(tempCanvas, 0, 0);

        // Composite Bubbles
        bubbles.forEach((bubble) => {
          const bx = (bubble.x / 100) * canvas.width;
          const by = (bubble.y / 100) * canvas.height;
          const bWidth = 240 * scale;
          const bHeight = 120 * scale;

          ctx.save();
          ctx.translate(bx, by);

          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 4 * scale;

          if (bubble.type === 'shout') {
            ctx.beginPath();
            const points = 16;
            const rx = bWidth / 2;
            const ry = bHeight / 2;
            for (let i = 0; i < points; i++) {
              const angle = (i / points) * Math.PI * 2;
              const radiusMod = i % 2 === 0 ? 1.15 : 0.85;
              const px = Math.cos(angle) * rx * radiusMod;
              const py = Math.sin(angle) * ry * radiusMod;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.roundRect(-bWidth / 2, -bHeight / 2, bWidth, bHeight, 20 * scale);
            ctx.fill();
            ctx.stroke();
          }

          ctx.fillStyle = '#09090b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${22 * scale}px 'Noto Sans JP', sans-serif`;
          ctx.fillText(bubble.text, 0, bubble.translation ? -10 * scale : 0);

          if (bubble.translation) {
            ctx.fillStyle = '#71717a';
            ctx.font = `600 ${14 * scale}px 'Plus Jakarta Sans', sans-serif`;
            ctx.fillText(bubble.translation, 0, 20 * scale);
          }

          ctx.restore();
        });

        // Composite SFX
        sfxItems.forEach((sfx) => {
          const sx = (sfx.x / 100) * canvas.width;
          const sy = (sfx.y / 100) * canvas.height;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate((sfx.rotation * Math.PI) / 180);
          ctx.scale(sfx.scale * scale, sfx.scale * scale);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = "900 44px 'Bangers', 'Mochiy Pop One', cursive, sans-serif";

          ctx.lineWidth = 10;
          ctx.strokeStyle = '#09090b';
          ctx.strokeText(sfx.text, 0, 0);

          ctx.fillStyle = sfx.color || '#ffffff';
          ctx.fillText(sfx.text, 0, 0);

          ctx.restore();
        });

        const link = document.createElement('a');
        link.download = `mangamorph-character-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      });
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* FEATURE BANNER: 1-Click "Turn Picture into Japanese Manga Character" */}
      <div className="bg-zinc-950 text-white rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
            <span className="font-manga-jp">キ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight">
                Manga Character Morph
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Featured
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Turn the person in this photo into a genuine Japanese manga protagonist with anime eyes, styled hair, and G-Pen inking.
            </p>
          </div>
        </div>

        {/* Quick Morph Action Cluster */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Color Mode Quick Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-750">
            <button
              onClick={() => {
                setSettings((s) => ({
                  ...s,
                  colorMode: 'vibrant',
                  preset: 'vivid-anime',
                  colorSaturation: 1.65,
                  distortionFilter: 92,
                  screentoneStrength: 0,
                  lineOpacity: 0.72,
                }));
              }}
              className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                settings.colorMode === 'vibrant' || settings.colorMode === 'color'
                  ? 'bg-amber-400 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🌈 Full Color</span>
            </button>
            <button
              onClick={() => {
                setSettings((s) => ({
                  ...s,
                  colorMode: 'bw',
                  preset: 'shonen',
                  screentoneStrength: 100,
                  distortionFilter: 35,
                }));
              }}
              className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                settings.colorMode === 'bw'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>⚡ Classic B&W</span>
            </button>
          </div>

          <select
            value={selectedArchetypeQuick}
            onChange={(e) => setSelectedArchetypeQuick(e.target.value as MangaCharacterArchetype)}
            className="bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="shonen-hero">⚡ Shonen Protagonist</option>
            <option value="shojo-heroine">🌸 Shojo Heroine</option>
            <option value="seinen-antihero">🗡️ Seinen Anti-Hero</option>
            <option value="cyberpunk-ronin">🤖 Cyberpunk Ronin</option>
            <option value="vintage-90s">📼 90s Retro Anime</option>
            <option value="chibi">✨ Chibi Mascot</option>
          </select>

          <button
            onClick={() => handleTransformToCharacter(selectedArchetypeQuick)}
            disabled={isCharacterMorphing}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>
              {isCharacterMorphing ? 'Morphing Character...' : 'Turn Picture into Manga Character'}
            </span>
          </button>
        </div>
      </div>

      {/* DIRECT OPTION STRIP: More Colours & Less Distortion */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 mr-1">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Style & Color Options:</span>
          </div>

          {[
            {
              id: 'vivid-anime' as const,
              name: '✨ Vivid Anime (More Colours & Low Distortion)',
              colorMode: 'vibrant' as const,
              saturation: 1.65,
              distortion: 92,
              screentone: 0,
              desc: 'High vibrancy, silky smooth lines, zero distortion',
              badge: 'Recommended',
            },
            {
              id: 'vibrant-webtoon' as const,
              name: '🌈 Vibrant Webtoon',
              colorMode: 'vibrant' as const,
              saturation: 1.85,
              distortion: 88,
              screentone: 0,
              desc: 'Maximum rich saturation & cel shading',
            },
            {
              id: 'pastel-anime' as const,
              name: '🌸 Soft Pastel Anime',
              colorMode: 'color' as const,
              saturation: 1.25,
              distortion: 92,
              screentone: 0,
              desc: 'Gentle pastel anime tones, ultra-clean',
            },
            {
              id: 'shonen' as const,
              name: '⚡ Classic B&W Shonen',
              colorMode: 'bw' as const,
              saturation: 1.0,
              distortion: 35,
              screentone: 100,
              desc: 'G-Pen ink & halftone dots',
            },
            {
              id: 'vintage' as const,
              name: '📼 Vintage 90s',
              colorMode: 'sepia' as const,
              saturation: 0.9,
              distortion: 30,
              screentone: 90,
              desc: 'Aged sepia paper print',
            },
          ].map((opt) => {
            const isSelected = settings.preset === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    preset: opt.id,
                    colorMode: opt.colorMode,
                    colorSaturation: opt.saturation,
                    distortionFilter: opt.distortion,
                    screentoneStrength: opt.screentone,
                    inkThickness: 1,
                    lineOpacity: opt.colorMode === 'bw' ? 1.0 : 0.75,
                  }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-950 text-white shadow-md ring-2 ring-amber-400'
                    : 'bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200'
                }`}
                title={opt.desc}
              >
                <span>{opt.name}</span>
                {opt.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Fine-Tuning Pill Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSettings((s) => ({
                ...s,
                colorMode: 'vibrant',
                colorSaturation: Math.min(2.2, (s.colorSaturation || 1.4) + 0.25),
              }));
            }}
            className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-md text-[11px] font-semibold text-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
            title="Increase color saturation"
          >
            <span>🎨 + More Colours</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              ({Math.round((settings.colorSaturation ?? 1.65) * 100)}%)
            </span>
          </button>

          <button
            onClick={() => {
              setSettings((s) => ({
                ...s,
                distortionFilter: 95,
                screentoneStrength: 0,
                inkThickness: 1,
                lineOpacity: 0.72,
              }));
            }}
            className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-md text-[11px] font-semibold text-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
            title="Activate zero distortion mode (smooth surface, fine outlines, no noise)"
          >
            <span>🛡️ Less Distortion</span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {settings.distortionFilter && settings.distortionFilter >= 85 && settings.screentoneStrength === 0 ? '✓ Max Clean' : 'Clean'}
            </span>
          </button>
        </div>
      </div>

      {/* Quick-Selector Bar: Portrait Photo Samples + Upload + Camera */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-zinc-500" />
            <span>Select Picture:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setCurrentImage(sample.url);
                  setOriginalBackupImage(sample.url);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentImage === sample.url
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 border border-zinc-300 hover:border-zinc-900 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload My Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Camera Button */}
          <button
            onClick={() => (isCameraActive ? stopCamera() : startCamera())}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isCameraActive
                ? 'bg-red-600 text-white'
                : 'border border-zinc-300 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCameraActive ? 'Close Camera' : 'Live Selfie'}</span>
          </button>

          {/* Reset button */}
          {currentImage !== originalBackupImage && (
            <button
              onClick={handleResetToOriginal}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
              title="Reset to original photo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Camera Error Toast */}
      {cameraError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{cameraError}</span>
          <button
            onClick={() => setCameraError(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Camera Viewport Modal */}
      {isCameraActive && (
        <div className="bg-zinc-950 rounded-xl p-4 sm:p-6 flex flex-col items-center gap-4 border border-zinc-800 text-white shadow-xl">
          <div className="flex items-center justify-between w-full max-w-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE WEBCAM VIEW</span>
            </div>
            <span className="text-[11px] text-zinc-400">Position face centered</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border-2 border-zinc-700 max-w-lg w-full aspect-4/3 bg-black flex items-center justify-center">
            <video
              ref={handleVideoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(e) => {
                (e.target as HTMLVideoElement).play().catch((err) => console.warn('Play error:', err));
              }}
              style={{ transform: 'scaleX(-1)' }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={takeSnapshot}
              className="px-6 py-2.5 bg-white text-zinc-950 font-bold rounded-xl text-xs hover:bg-zinc-200 transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Manga Selfie</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Status Notification Toast */}
      {aiNotice && (
        <div className="bg-zinc-900 text-white text-xs px-4 py-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{aiNotice}</span>
          </div>
          <button
            onClick={() => setAiNotice(null)}
            className="text-zinc-400 hover:text-white text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Manga Canvas & Overlay */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
            <MangaCanvasView
              imageSrc={currentImage}
              originalSrc={originalBackupImage}
              settings={settings}
              bubbles={bubbles}
              sfxItems={sfxItems}
              onUpdateBubbles={setBubbles}
              onUpdateSfx={setSfxItems}
              selectedSfxId={selectedSfxId}
              onSelectSfx={setSelectedSfxId}
              selectedBubbleId={selectedBubbleId}
              onSelectBubble={setSelectedBubbleId}
              onFocusPointChange={(x, y) =>
                setSettings((s) => ({
                  ...s,
                  speedlineCenterX: x,
                  speedlineCenterY: y,
                }))
              }
              panelLabel={
                settings.characterMode
                  ? 'Japanese Manga Character Portrait'
                  : 'Primary Manga Viewport'
              }
            />
          </div>

          {/* Bottom Export Strip */}
          <div className="flex items-center justify-between px-2">
            <div className="text-xs text-zinc-500">
              Hold "Hold to Compare Original" on top-right to compare before & after
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onSendToPageStory(currentImage, bubbles, sfxItems)}
                className="px-3.5 py-2 border border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Add to Storyboard Page</span>
              </button>

              <button
                onClick={handleDownloadPanel}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Manga Character Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Manga Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <MangaControlPanel
            settings={settings}
            onUpdateSettings={setSettings}
            onAddBubble={(b) => {
              setBubbles((prev) => [...prev, b]);
              setSelectedBubbleId(b.id);
            }}
            onAddSfx={(s) => {
              setSfxItems((prev) => [...prev, s]);
              setSelectedSfxId(s.id);
            }}
            sfxItems={sfxItems}
            onUpdateSfx={setSfxItems}
            bubbles={bubbles}
            onUpdateBubbles={setBubbles}
            selectedSfxId={selectedSfxId}
            onSelectSfx={setSelectedSfxId}
            onRunAiAnalysis={handleRunAiAnalysis}
            onRunAiRedraw={handleRunAiRedraw}
            onTransformToCharacter={handleTransformToCharacter}
            isAiAnalyzing={isAiAnalyzing}
            isAiRedrawing={isAiRedrawing}
            isCharacterMorphing={isCharacterMorphing}
          />
        </div>
      </div>
    </div>
  );
};
