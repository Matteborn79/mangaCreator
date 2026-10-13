import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const port = 3000;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to normalize image payload to pure base64 bytes
async function resolveImageBase64(input: string): Promise<string> {
  if (!input) return '';
  // Check if it's already a data URI
  if (input.includes(';base64,')) {
    return input.split(';base64,')[1];
  }
  // Check if it's a local file path
  if (input.startsWith('/') || input.startsWith('src/')) {
    const cleanRelPath = input.startsWith('/') ? input.slice(1) : input;
    const fullPath = path.resolve(process.cwd(), cleanRelPath);
    if (fs.existsSync(fullPath)) {
      const buffer = await fs.promises.readFile(fullPath);
      return buffer.toString('base64');
    }
  }
  // Otherwise strip standard header if present
  return input.replace(/^data:image\/[a-z]+;base64,/, '');
}

// Server-side Gemini client with required User-Agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: AI Manga Image Transformation (using gemini-3.1-flash-lite-image)
app.post('/api/manga/ai-transform', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', stylePrompt = '', colorMode = 'bw' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Real-time procedural manga shader is active.',
        isFallback: true
      });
    }

    // Clean base64 string
    const cleanBase64 = await resolveImageBase64(imageBase64);

    const colorInstruction = colorMode === 'color' 
      ? 'Vibrant modern Japanese anime/manga comic color style with cell-shading and ink lines'
      : 'Classic black and white manga with crisp G-pen inking, dramatic halftone screentone dots, deep black shadows, clean line art';

    const promptText = `Convert this scene into an authentic Japanese manga illustration. 
Style instructions: ${colorInstruction}. ${stylePrompt ? `Specific focus: ${stylePrompt}.` : ''} 
Ensure high contrast, distinct character outlines, detailed manga screentone hatching, and dynamic manga comic book composition. 
Retain the subjects, poses, and scene arrangement from the original image while transforming the artistic medium entirely to manga.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });

    let generatedImageUrl: string | null = null;
    let textFeedback = '';

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textFeedback += part.text;
      }
    }

    if (generatedImageUrl) {
      return res.json({ success: true, mangaImage: generatedImageUrl, commentary: textFeedback });
    } else {
      return res.json({
        success: false,
        commentary: textFeedback || 'No image output generated from model. Falling back to shader engine.',
        isFallback: true,
      });
    }
  } catch (error: any) {
    const isQuota = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED';
    console.warn('/api/manga/ai-transform fallback activated:', isQuota ? 'Quota limit reached' : error?.message);
    return res.json({ 
      success: false,
      isFallback: true,
      isQuotaExceeded: isQuota,
      message: isQuota 
        ? 'Gemini image generation quota limit reached. Real-time procedural manga engine active.'
        : 'Gemini service unavailable. Procedural manga engine active.'
    });
  }
});

// API: Japanese Manga Character Transformation
app.post('/api/manga/character-transform', async (req, res) => {
  try {
    const { 
      imageBase64, 
      mimeType = 'image/jpeg', 
      archetype = 'shonen-hero',
      colorMode = 'bw',
      expression = 'determined'
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: false,
        isFallback: true,
        message: 'Real-time procedural character shader active.'
      });
    }

    const cleanBase64 = await resolveImageBase64(imageBase64);

    const archetypeDescriptions: Record<string, string> = {
      'shonen-hero': 'iconic Japanese Shonen Jump manga protagonist with bold spiky/dynamic anime hair, expressive determined manga eyes with sharp highlights, clean G-Pen inking, and confident hero expression',
      'shojo-heroine': 'beautiful Japanese Shojo romance manga heroine with large sparkling starry anime eyes, delicate eyelashes, soft flowing hair strands, gentle blush screentone, and delicate fine inking',
      'seinen-antihero': 'intense dark Seinen manga protagonist with sharp angular jawline, piercing focused eyes, deep black shadows (Beta-nuri), dramatic ink crosshatching, and gritty aesthetic',
      'cyberpunk-ronin': 'futuristic Cyberpunk anime/manga character with cybernetic tech accents or neural visor, sharp stylized facial features, sleek anime hair, and dramatic rim lighting',
      'vintage-90s': 'classic 1990s retro anime/manga character (reminiscent of 90s vintage tankobon), authentic hand-drawn cel ink outlines, and nostalgic character design',
      'chibi': 'adorable Chibi super-deformed manga character with oversized sparkling anime eyes, cute stylized hair, and cute expressive manga features'
    };

    const targetStyle = archetypeDescriptions[archetype] || archetypeDescriptions['shonen-hero'];
    const isVibrantColor = colorMode === 'color' || colorMode === 'vibrant';
    const colorDesc = isVibrantColor 
      ? 'Vivid full-color Japanese anime illustration with rich radiant colors, smooth clean cel shading, delicate crisp ink outlines, zero distortion, zero grain or halftone noise, high clarity'
      : 'Authentic black and white manga page art with crisp G-Pen line art and authentic halftone screentone dots';

    const promptText = `Transform the person/subject in this picture into an authentic Japanese manga character.
Character Style: ${targetStyle}.
Expression: ${expression}.
Medium: ${colorDesc}.
Important requirements:
1. Retain the person's fundamental facial identity, hairstyle silhouette, and head angle so they are clearly recognizable.
2. Completely redraw their features in genuine Japanese manga/anime art: iconic manga eye structure, simplified anime nose and mouth, stylized hair locks, and hand-inked line work.
3. ${isVibrantColor ? 'Use clean, rich vivid anime colors with smooth silky cel shading, delicate clean contours, and zero pixel distortion or noise.' : 'Replace realistic skin gradients with authentic manga flat tones and screentones (Ami-ten).'}
4. Output solely the character artwork.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });

    let generatedImageUrl: string | null = null;
    let commentary = '';

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        commentary += part.text;
      }
    }

    if (generatedImageUrl) {
      return res.json({ success: true, mangaImage: generatedImageUrl, commentary });
    } else {
      return res.json({
        success: false,
        commentary: commentary || 'Could not synthesize new character artwork. Real-time character shader active.',
        isFallback: true,
      });
    }
  } catch (error: any) {
    const isQuota = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED';
    console.warn('/api/manga/character-transform fallback activated:', isQuota ? 'Quota limit reached' : error?.message);
    return res.json({
      success: false,
      isFallback: true,
      isQuotaExceeded: isQuota,
      message: isQuota 
        ? 'Gemini image generation quota limit reached. Procedural Japanese manga character engine active.'
        : 'Procedural character shader active.'
    });
  }
});


// API: AI Manga Scene Analysis & Dialogue Generator
app.post('/api/manga/analyze-scene', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', genre = 'action' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return rich procedural suggestions if no API key
      return res.json({
        success: true,
        dialogue: [
          { text: "待て... 何かが来る!", translation: "Wait... something is coming!", character: "Hero", type: "speech" },
          { text: "クッ... この力は一体!?", translation: "Kgh... what is this power!?", character: "Rival", type: "thought" }
        ],
        sfx: [
          { text: "ゴゴゴ...", romaji: "GOGOGO...", meaning: "Menacing rumble / tension", x: 80, y: 30, rotation: -12, scale: 1.4 },
          { text: "ドンッ!", romaji: "DON!", meaning: "Sudden impact / reveal", x: 50, y: 75, rotation: 5, scale: 1.8 }
        ],
        narration: "The fated encounter began without a single warning.",
        recommendedLayout: "action-spread",
        speedlines: "radial-burst"
      });
    }

    const cleanBase64 = await resolveImageBase64(imageBase64);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image as a keyframe in a ${genre} manga chapter.
Generate structured JSON with:
1. "dialogue": array of 2-3 speech or thought lines suitable for speech bubbles (include "text" in Japanese manga style, "translation" in English, "character" hint, and "type": "speech" | "shout" | "thought" | "whisper").
2. "sfx": array of 2-3 authentic manga sound effects (Katakana "text", "romaji", "meaning", recommended relative percent "x" 10-90, "y" 10-90, "rotation" degrees -20 to 20, "scale" 1.0 to 2.0).
3. "narration": 1 sentence dramatic manga narrator box caption (English).
4. "mood": one word mood (e.g. "Climactic", "Suspenseful", "Heroic", "Eerie", "Comedic").
5. "speedlines": recommended speedline type ("radial-burst" | "horizontal-action" | "vertical-impact" | "none").

Return strictly valid JSON only.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Error in /api/manga/analyze-scene:', error);
    return res.json({
      success: true,
      dialogue: [
        { text: "ここからが本当の戦いだ!", translation: "The real battle starts now!", character: "Protagonist", type: "shout" }
      ],
      sfx: [
        { text: "ドォォン!", romaji: "DOOON!", meaning: "Tremendous crash", x: 75, y: 35, rotation: -8, scale: 1.6 }
      ],
      narration: "In that split second, the world stood motionless.",
      mood: "Dramatic",
      speedlines: "radial-burst"
    });
  }
});

// API: Multi-frame Movie Storyboard Generator
app.post('/api/manga/storyboard-script', async (req, res) => {
  const frameCount = Number(req.body?.frameCount) || 4;
  const genre = req.body?.genre || 'shonen';
  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        chapterTitle: "Chapter 1: The Turning Point",
        panels: Array.from({ length: frameCount }).map((_, i) => ({
          panelIndex: i,
          caption: `Panel ${i + 1}: The tension builds to a peak`,
          dialogue: i % 2 === 0 ? "逃がさん!" : "な...何だと!?",
          sfx: i === frameCount - 1 ? "ズバッ!!" : "ザッ..."
        }))
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create an epic Japanese ${genre} manga storyboard script for a ${frameCount}-panel page.
Return JSON with:
- "chapterTitle": string
- "panels": array of ${frameCount} objects with { "panelIndex": number, "caption": string, "dialogue": string, "sfx": string, "dialogueTranslation": string }
Strictly valid JSON.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Error in /api/manga/storyboard-script:', error);
    return res.json({
      success: true,
      chapterTitle: "Chapter 1: The Climax",
      panels: Array.from({ length: frameCount }).map((_, i) => ({
        panelIndex: i,
        caption: `Scene ${i + 1}: The encounter reaches its boiling point`,
        dialogue: i === frameCount - 1 ? "これで終わりだ!!" : i % 2 === 0 ? "逃がさん!" : "な...何だと!?",
        dialogueTranslation: i === frameCount - 1 ? "This is the end!!" : i % 2 === 0 ? "You won't get away!" : "W... What!?",
        sfx: i === frameCount - 1 ? "ズバッ!!" : "ドォォン!"
      }))
    });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MangaMorph server running on http://0.0.0.0:${port}`);
  });
}

startServer();
