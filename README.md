# MangaMorph (漫画モーフ) 🎨⚡

> **Transform photos, live webcam video, and movie clips into authentic Japanese manga comic panels, tankōbon pages, and motion comics with G-Pen inking, screentones, dynamic speedlines, and Gemini AI.**

---

## 🌟 Overview

**MangaMorph** is a full-featured web application that converts real-world imagery into Japanese manga art. Built with React 19, TypeScript, Tailwind CSS, and powered by server-side Google Gemini models (`gemini-3.1-flash-lite-image` and `gemini-3.8-flash`), MangaMorph bridges classic manga craftsmanship with modern generative AI and real-time canvas shader processing.

Whether you want to snap a live selfie in manga style, convert dramatic photos into high-contrast ink panels, generate multi-frame anime storyboards from video clips, or compile an entire *tankōbon* (単行本) manga page, MangaMorph provides an authentic, creative studio experience.

---

## ✨ Key Features

### 1. 🖌️ Real-Time Procedural Manga Engine
- **Authentic G-Pen Inking**: High-precision edge extraction and line-art rendering with adjustable stroke threshold, ink weight, and contrast.
- **Halftone Screentones (*Ami-ten* 網点)**: Classic dot matrix shading simulating printed manga paper with customizable dot size, frequency, and density.
- **Beta-Nuri (*べた塗り*)**: Deep solid black shadow fills for high-contrast dramatic flair.
- **Dynamic Speedlines**:
  - **Radial Burst**: High-impact focus lines radiating outward from action centers.
  - **Horizontal Action**: Kinetic dash lines for chase sequences and movement.
  - **Vertical Impact**: Dramatic downward or upward motion lines for drops and jumps.
- **Multiple Color Modes**:
  - **Classic B&W**: Authentic newsprint manga aesthetic.
  - **Vintage Sepia**: Aged retro tankōbon book tone.
  - **Full-Color Anime Cel**: Vibrant modern anime palette with crisp ink lines and clean shading.

### 2. 🤖 Gemini AI Manga Transformation
- **AI Scene Morphing (`gemini-3.1-flash-lite-image`)**: Converts photos into authentic manga illustration panels, preserving composition while redrawing surfaces as hand-inked line art.
- **Japanese Character Transformation**: Converts portraits and selfies into iconic manga character styles:
  - **Shōnen Hero**: Dynamic spiky hair, determined eyes, bold G-Pen outlines.
  - **Shōjo Heroine**: Sparkling starry eyes, delicate eyelashes, soft screentone blush.
  - **Seinen Anti-Hero**: Sharp angular jawlines, piercing eyes, heavy black crosshatching.
  - **Cyberpunk Ronin**: Futuristic tech accents, neural visors, and rim lighting.
  - **90s Retro Cel**: Classic vintage 1990s anime aesthetic.
  - **Chibi**: Super-deformed adorable proportions and expressive oversized eyes.
- **Smart Multimodal Scene & Dialogue Analysis (`gemini-3.8-flash`)**: Analyzes uploaded imagery to generate context-aware Japanese dialogue, Romaji pronunciation, English translations, and recommended Katakana sound effects.
- **Graceful Zero-Downtime Fallback**: If offline or if API quotas are reached, the system automatically switches to the procedural client-side manga shader engine without interruption.

### 3. 💬 Interactive Speech Bubble & SFX Studio
- **Speech Bubble Types**:
  - Standard Dialogue (Oval)
  - Spiky Shout (Explosive action dialogue)
  - Cloud Thought (Internal monologue)
  - Rectangular Caption (Narrator commentary box)
- **Direct Canvas Manipulation**:
  - Click to select and drag anywhere on the canvas.
  - Double-click to edit Japanese text and English translations directly.
  - Quick-switch bubble style or delete with dedicated controls.
- **Authentic Katakana Manga Sound Effects (SFX / 擬音語・擬態語)**:
  - Library of authentic sound effects (*DON!*, *GOGOGO...*, *ZUBAT!*, *DODODO...*, *BAKI!*, *SHU!*).
  - Customize SFX color, size scale, rotation angle, and canvas coordinates.

### 4. 🎥 Movie & Motion Manga Studio
- Upload video clips or analyze sample cinematic footage.
- Extract keyframes into sequenced manga panels.
- Generate episodic storyboard scripts with chapter titles, panel captions, and dramatic pacing.

### 5. 📖 Tankōbon Page Layout Builder (単行本)
- Arrange multiple panels into traditional manga comic book pages.
- Multiple panel layout templates (4-Koma comedy strip, Action Spread, 3-Tier Cinematic).
- Add chapter headers, volume metadata, and export print-ready high-resolution page spreads.

### 6. 📸 Live Webcam & Selfie Manga Mirror
- Real-time video stream filtering with webcam input.
- Snap instant high-contrast manga portraits straight from the browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) + [Motion](https://motion.dev/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Backend Server** | [Express 4](https://expressjs.com/) with `tsx` runner |
| **AI / Machine Learning** | [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini API) |
| **Typography** | Mochiy Pop One, Noto Sans JP, Bangers, Yuji Boku, Plus Jakarta Sans |
| **Graphics Processing** | HTML5 Canvas 2D API (Sobel convolution, halftone dot matrix, polar coordinates) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**, **yarn**, or **bun**
- *(Optional)* A **Google Gemini API Key** (available free at [Google AI Studio](https://aistudio.google.com/)) for AI transformations.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mangamorph.git
   cd mangamorph
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   APP_URL="http://localhost:3000"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express server with Vite middleware in development mode |
| `npm run build` | Compiles TypeScript and builds the production frontend bundles via Vite |
| `npm run start` | Runs the full-stack server in production mode |
| `npm run lint` | Runs `tsc --noEmit` to validate all TypeScript code |
| `npm run clean` | Cleans up the `dist` build directory |

---

## 📁 Project Structure

```text
├── server.ts                    # Express backend & Gemini API proxy endpoints
├── index.html                   # HTML entry point with manga font preloads
├── metadata.json                # Project capabilities & permissions
├── package.json                 # Dependencies and build scripts
├── vite.config.ts               # Vite configuration with React & Tailwind plugins
├── tsconfig.json                # TypeScript compiler configuration
├── .env.example                 # Template for required environment variables
└── src/
    ├── main.tsx                 # React application mounting point
    ├── App.tsx                  # Primary application container & tab router
    ├── index.css                # Global styles & Tailwind CSS imports
    ├── components/
    │   ├── ImageMangaStudio.tsx # Photo upload, webcam selfie, and transformation controls
    │   ├── MovieMangaStudio.tsx # Video keyframe storyboard generator
    │   ├── MangaCanvasView.tsx  # Interactive canvas renderer (halftone, bubbles, SFX, compare slider)
    │   ├── MangaControlPanel.tsx# Sidebar with inking, screentones, bubble & SFX editor
    │   ├── MangaHeader.tsx      # Application header & navigation tabs
    │   ├── SampleShowcase.tsx   # Curated preset gallery with before/after samples
    │   └── TankobonPageModal.tsx# Multi-panel manga page creator & exporter
    ├── data/
    │   └── mangaAssets.ts       # Preset images, sound effect stickers, and dialogue templates
    ├── types/
    │   └── manga.ts             # TypeScript interfaces for bubbles, SFX, shaders, and panels
    └── utils/
        └── mangaShader.ts       # Canvas procedural shader pipeline (G-Pen, screentones, speedlines)
```

---

## 🔌 API Endpoints

The backend (`server.ts`) exposes the following API routes:

- **`POST /api/manga/ai-transform`**:
  Converts an image into manga style using `gemini-3.1-flash-lite-image`. Accepts `imageBase64`, `mimeType`, `stylePrompt`, and `colorMode`.
- **`POST /api/manga/character-transform`**:
  Transforms the subject into a stylized manga archetype (*Shōnen*, *Shōjo*, *Seinen*, *Cyberpunk*, *90s*, or *Chibi*).
- **`POST /api/manga/analyze-scene`**:
  Analyzes an image keyframe with `gemini-3.8-flash` to suggest Japanese dialogue, translations, mood, speedlines, and Katakana SFX.
- **`POST /api/manga/storyboard-script`**:
  Generates a multi-panel chapter script with dramatic narrative beats for video keyframes.

---

## ⚖️ License

This project is licensed under the **Apache-2.0 License**. See the [LICENSE](LICENSE) file or inline headers for details.

---

## 🤝 Contributing & Feedback

Contributions, suggestions, and pull requests are warmly welcomed!
Feel free to open an issue or reach out with ideas for new manga archetypes, screentone patterns, or layout templates.
