export type MangaArtPreset = 
  | 'vivid-anime'     // Maximum vibrant colors, silky-smooth lines, zero distortion (Recommended)
  | 'clean-anime'     // Clean vivid color anime, delicate lines, low distortion
  | 'vibrant-webtoon' // Rich high-saturation digital comic, smooth cel shading
  | 'pastel-anime'    // Soft aesthetic pastel colors, delicate outlines, ultra clean
  | 'shonen'          // High contrast, bold inks, intense action screentones
  | 'seinen'          // Fine crosshatch, detailed ink, atmospheric gray halftones
  | 'shojo'           // Soft tones, delicate fine lines, sparkle dots
  | 'cyberpunk'       // Heavy black shadows, digital screentones, stark edges
  | 'vintage'         // 80s/90s tankobon paperback warm print
  | 'color-anime';    // Traditional printed color manga

export type MangaCharacterArchetype = 
  | 'shonen-hero'     // Spiky dynamic hair, determined hero eyes
  | 'shojo-heroine'    // Large starry eyes, soft flowing hair, delicate screentone
  | 'seinen-antihero'  // Sharp angular jaw, intense brooding eyes, dark ink
  | 'cyberpunk-ronin'  // Futuristic cyber accents, sharp inking
  | 'vintage-90s'      // 90s classic cel anime & tankobon character
  | 'chibi';           // Cute super-deformed proportions & big eyes

export interface MangaShaderSettings {
  preset: MangaArtPreset;
  inkThickness: number;       // 1 - 5 (Sobel threshold / dilation)
  edgeThreshold: number;      // 10 - 90 (edge detection sensitivity)
  screentonePitch: number;    // 3 - 16 (halftone dot frequency)
  screentoneContrast: number; // 0.5 - 2.5 (contrast before halftoning)
  screentoneAngle: number;    // 0 - 90 (degrees, default 45)
  paperGrain: number;         // 0 - 50 (subtle vintage manga grain)
  darkShadowFill: number;     // 0 - 100 (level of shadow black crushing)
  colorMode: 'bw' | 'color' | 'sepia' | 'vibrant';
  colorSaturation: number;    // 0.5 - 2.2 (color vibrancy multiplier)
  distortionFilter: number;   // 0 - 100 (anti-distortion noise suppressor)
  screentoneStrength: number; // 0 - 100 (0 = clean smooth color, 100 = full halftone dots)
  lineOpacity: number;        // 0.2 - 1.0 (ink line softness / blending)
  speedlineType: 'none' | 'radial-burst' | 'horizontal-action' | 'vertical-impact';
  speedlineDensity: number;   // 10 - 80
  speedlineCenterX: number;   // 0 - 100%
  speedlineCenterY: number;   // 0 - 100%
  characterMode?: boolean;    // Specialized anime character face enhancement
  characterArchetype?: MangaCharacterArchetype;
  skinSmoothing?: number;     // 0 - 100 (anime porcelain cel skin)
  mangaEyesIntensity?: number;// 0 - 100 (eye contrast & lash outlines)
  animeBlush?: boolean;       // cute manga cheek hatching ///
}

export interface MangaSpeechBubble {
  id: string;
  type: 'speech' | 'shout' | 'thought' | 'narration';
  text: string;
  translation?: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number;
  height: number;
  tailDirection?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'none';
  isVerticalText?: boolean;
}

export interface MangaSFXItem {
  id: string;
  text: string;      // Katakana e.g. "ドォォン!"
  romaji: string;    // "DOOON!"
  meaning: string;   // "Sudden colossal impact"
  x: number;         // percentage
  y: number;         // percentage
  scale: number;     // 0.8 - 2.5
  rotation: number;  // degrees
  color: string;     // white with black outline, black, or red
}

export type PageLayoutTemplate = 
  | 'single-splash'  // 1 large dramatic splash panel
  | '2-panel-split'  // 2 horizontal split panels
  | '3-panel-climax' // Wide top, medium mid, large climax bottom
  | '4-koma'         // Classic 4 vertical panel comic strip
  | '5-panel-action' // Dynamic Shonen diagonal and split page
  | '6-panel-grid';  // 2x3 sequential manga page

export interface MangaPanelData {
  id: string;
  index: number;
  originalImage: string;     // dataUrl or url
  mangaImage: string | null; // rendered manga dataUrl
  caption?: string;
  dialogue?: string;
  sfx?: string;
  bubbles: MangaSpeechBubble[];
  sfxItems: MangaSFXItem[];
  settings: MangaShaderSettings;
  videoTimestamp?: number;
}

export interface MangaPageProject {
  title: string;
  chapterNumber: number;
  author: string;
  layout: PageLayoutTemplate;
  panels: MangaPanelData[];
  readRightToLeft: boolean; // Traditional Japanese manga format
}
