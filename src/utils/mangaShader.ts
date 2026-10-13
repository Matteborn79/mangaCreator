import { MangaShaderSettings } from '../types/manga';

export const DEFAULT_MANGA_SETTINGS: MangaShaderSettings = {
  preset: 'vivid-anime',
  inkThickness: 1,
  edgeThreshold: 48,
  screentonePitch: 8,
  screentoneContrast: 1.15,
  screentoneAngle: 45,
  paperGrain: 0,
  darkShadowFill: 4,
  colorMode: 'vibrant',
  colorSaturation: 1.65,
  distortionFilter: 90,
  screentoneStrength: 0,
  lineOpacity: 0.75,
  speedlineType: 'none',
  speedlineDensity: 40,
  speedlineCenterX: 50,
  speedlineCenterY: 50,
  characterMode: true,
  skinSmoothing: 85,
};

export const PRESET_CONFIGS: Record<string, Partial<MangaShaderSettings>> = {
  'vivid-anime': {
    preset: 'vivid-anime',
    inkThickness: 1,
    edgeThreshold: 48,
    screentonePitch: 8,
    screentoneContrast: 1.15,
    screentoneAngle: 45,
    paperGrain: 0,
    darkShadowFill: 4,
    colorMode: 'vibrant',
    colorSaturation: 1.65,
    distortionFilter: 92,
    screentoneStrength: 0,
    lineOpacity: 0.72,
    skinSmoothing: 85,
  },
  'clean-anime': {
    preset: 'clean-anime',
    inkThickness: 1,
    edgeThreshold: 46,
    screentonePitch: 8,
    screentoneContrast: 1.2,
    screentoneAngle: 45,
    paperGrain: 0,
    darkShadowFill: 6,
    colorMode: 'vibrant',
    colorSaturation: 1.45,
    distortionFilter: 85,
    screentoneStrength: 0,
    lineOpacity: 0.78,
    skinSmoothing: 80,
  },
  'vibrant-webtoon': {
    preset: 'vibrant-webtoon',
    inkThickness: 1,
    edgeThreshold: 44,
    screentonePitch: 7,
    screentoneContrast: 1.25,
    screentoneAngle: 45,
    paperGrain: 0,
    darkShadowFill: 8,
    colorMode: 'vibrant',
    colorSaturation: 1.85,
    distortionFilter: 88,
    screentoneStrength: 0,
    lineOpacity: 0.82,
    skinSmoothing: 82,
  },
  'pastel-anime': {
    preset: 'pastel-anime',
    inkThickness: 1,
    edgeThreshold: 50,
    screentonePitch: 8,
    screentoneContrast: 1.1,
    screentoneAngle: 45,
    paperGrain: 0,
    darkShadowFill: 3,
    colorMode: 'color',
    colorSaturation: 1.25,
    distortionFilter: 92,
    screentoneStrength: 0,
    lineOpacity: 0.65,
    skinSmoothing: 90,
  },
  shonen: {
    preset: 'shonen',
    inkThickness: 3,
    edgeThreshold: 42,
    screentonePitch: 8,
    screentoneContrast: 1.6,
    screentoneAngle: 45,
    paperGrain: 15,
    darkShadowFill: 42,
    colorMode: 'bw',
    colorSaturation: 1.0,
    distortionFilter: 30,
    screentoneStrength: 100,
    lineOpacity: 1.0,
    skinSmoothing: 50,
  },
  seinen: {
    preset: 'seinen',
    inkThickness: 1,
    edgeThreshold: 30,
    screentonePitch: 5,
    screentoneContrast: 1.2,
    screentoneAngle: 45,
    paperGrain: 10,
    darkShadowFill: 25,
    colorMode: 'bw',
    colorSaturation: 1.0,
    distortionFilter: 35,
    screentoneStrength: 100,
    lineOpacity: 0.9,
    skinSmoothing: 40,
  },
  shojo: {
    preset: 'shojo',
    inkThickness: 1,
    edgeThreshold: 50,
    screentonePitch: 10,
    screentoneContrast: 1.1,
    screentoneAngle: 30,
    paperGrain: 5,
    darkShadowFill: 18,
    colorMode: 'bw',
    colorSaturation: 1.0,
    distortionFilter: 65,
    screentoneStrength: 75,
    lineOpacity: 0.8,
    skinSmoothing: 85,
  },
  cyberpunk: {
    preset: 'cyberpunk',
    inkThickness: 2,
    edgeThreshold: 38,
    screentonePitch: 6,
    screentoneContrast: 1.8,
    screentoneAngle: 60,
    paperGrain: 20,
    darkShadowFill: 55,
    colorMode: 'bw',
    colorSaturation: 1.0,
    distortionFilter: 40,
    screentoneStrength: 100,
    lineOpacity: 1.0,
    skinSmoothing: 50,
  },
  vintage: {
    preset: 'vintage',
    inkThickness: 2,
    edgeThreshold: 40,
    screentonePitch: 8,
    screentoneContrast: 1.3,
    screentoneAngle: 45,
    paperGrain: 28,
    darkShadowFill: 30,
    colorMode: 'sepia',
    colorSaturation: 0.9,
    distortionFilter: 25,
    screentoneStrength: 90,
    lineOpacity: 0.95,
    skinSmoothing: 40,
  },
  'color-anime': {
    preset: 'color-anime',
    inkThickness: 1,
    edgeThreshold: 42,
    screentonePitch: 8,
    screentoneContrast: 1.25,
    screentoneAngle: 45,
    paperGrain: 0,
    darkShadowFill: 14,
    colorMode: 'color',
    colorSaturation: 1.35,
    distortionFilter: 70,
    screentoneStrength: 25,
    lineOpacity: 0.8,
    skinSmoothing: 70,
  },
};

/**
 * Process an HTMLImageElement or Canvas through the procedural manga rendering pipeline
 */
export function renderMangaEffect(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  targetCanvas: HTMLCanvasElement,
  settings: MangaShaderSettings
): void {
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || width === 0 || height === 0) return;

  // Temporary canvas to get raw source pixels
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.drawImage(source, 0, 0, width, height);
  const srcImageData = tempCtx.getImageData(0, 0, width, height);
  const srcData = srcImageData.data;

  const outputImageData = ctx.createImageData(width, height);
  const outData = outputImageData.data;

  // Step 1: Compute Grayscale Luminance Map
  const grayMap = new Float32Array(width * height);
  for (let i = 0; i < srcData.length; i += 4) {
    const r = srcData[i];
    const g = srcData[i + 1];
    const b = srcData[i + 2];
    // Perceptual luminance
    grayMap[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Step 1.5: Anti-Distortion Filter (Edge-Preserving Noise Suppressor)
  // Eliminates noisy camera grain & texture artifacts while preserving crisp character outlines
  const edgeSourceMap = new Float32Array(width * height);
  const distStrength = (settings.distortionFilter ?? 70) / 100;

  if (distStrength > 0) {
    for (let y = 1; y < height - 1; y++) {
      const yOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = yOffset + x;
        const center = grayMap[idx];
        let sum = center;
        let count = 1;

        const edgeTolerance = 30 * (1 - distStrength * 0.35);
        const n1 = grayMap[idx - 1];
        const n2 = grayMap[idx + 1];
        const n3 = grayMap[idx - width];
        const n4 = grayMap[idx + width];

        if (Math.abs(n1 - center) < edgeTolerance) { sum += n1; count++; }
        if (Math.abs(n2 - center) < edgeTolerance) { sum += n2; count++; }
        if (Math.abs(n3 - center) < edgeTolerance) { sum += n3; count++; }
        if (Math.abs(n4 - center) < edgeTolerance) { sum += n4; count++; }

        edgeSourceMap[idx] = sum / count;
      }
    }
  } else {
    edgeSourceMap.set(grayMap);
  }

  // Step 1.6: Surface-Smoothing Filter for Colors (Removes blotchy noise and distortion)
  const isColor = settings.colorMode === 'color' || settings.colorMode === 'vibrant';
  const cleanR = new Uint8Array(width * height);
  const cleanG = new Uint8Array(width * height);
  const cleanB = new Uint8Array(width * height);

  if (isColor && distStrength > 0.25) {
    const colorTolerance = 42 * (1 - distStrength * 0.35);
    for (let y = 1; y < height - 1; y++) {
      const yOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = yOffset + x;
        const p4 = idx * 4;
        const cr = srcData[p4];
        const cg = srcData[p4 + 1];
        const cb = srcData[p4 + 2];
        let sumR = cr * 2;
        let sumG = cg * 2;
        let sumB = cb * 2;
        let count = 2;

        const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
        for (let k = 0; k < 4; k++) {
          const nIdx = neighbors[k] * 4;
          const nr = srcData[nIdx];
          const ng = srcData[nIdx + 1];
          const nb = srcData[nIdx + 2];
          const diff = Math.max(Math.abs(nr - cr), Math.abs(ng - cg), Math.abs(nb - cb));
          if (diff < colorTolerance) {
            sumR += nr;
            sumG += ng;
            sumB += nb;
            count++;
          }
        }
        cleanR[idx] = Math.round(sumR / count);
        cleanG[idx] = Math.round(sumG / count);
        cleanB[idx] = Math.round(sumB / count);
      }
    }
  }

  // Step 2: Sobel Edge Detection for G-Pen Manga Line Art
  const edgeMap = new Uint8Array(width * height);
  const threshold = (100 - settings.edgeThreshold) * 2.8;

  for (let y = 1; y < height - 1; y++) {
    const yOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = yOffset + x;

      // Sobel kernel X
      const gx =
        -edgeSourceMap[idx - width - 1] + edgeSourceMap[idx - width + 1] +
        -2 * edgeSourceMap[idx - 1] + 2 * edgeSourceMap[idx + 1] +
        -edgeSourceMap[idx + width - 1] + edgeSourceMap[idx + width + 1];

      // Sobel kernel Y
      const gy =
        -edgeSourceMap[idx - width - 1] - 2 * edgeSourceMap[idx - width] - edgeSourceMap[idx - width + 1] +
        edgeSourceMap[idx + width - 1] + 2 * edgeSourceMap[idx + width] + edgeSourceMap[idx + width + 1];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      if (magnitude > threshold) {
        edgeMap[idx] = 1;
      }
    }
  }

  // Anti-speckle edge filtering (eliminates single-pixel noise distortion)
  if (distStrength > 0.3) {
    for (let y = 1; y < height - 1; y++) {
      const yOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = yOffset + x;
        if (edgeMap[idx] === 1) {
          const neighborEdges =
            edgeMap[idx - 1] +
            edgeMap[idx + 1] +
            edgeMap[idx - width] +
            edgeMap[idx + width];
          if (neighborEdges === 0) {
            edgeMap[idx] = 0; // Isolated speckle removed!
          }
        }
      }
    }
  }

  // Optional morphological dilation for thicker G-Pen ink lines
  let finalEdgeMap = edgeMap;
  if (settings.inkThickness > 1) {
    finalEdgeMap = new Uint8Array(width * height);
    const radius = Math.min(settings.inkThickness - 1, 2);
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let isEdge = false;
        for (let dy = -radius; dy <= radius && !isEdge; dy++) {
          for (let dx = -radius; dx <= radius && !isEdge; dx++) {
            if (edgeMap[(y + dy) * width + (x + dx)]) {
              isEdge = true;
            }
          }
        }
        if (isEdge) {
          finalEdgeMap[y * width + x] = 1;
        }
      }
    }
  }

  // Step 3: Screentone & Ink Halftone Shader
  const angleRad = (settings.screentoneAngle * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const pitch = Math.max(3, settings.screentonePitch);
  const contrast = settings.screentoneContrast;
  const shadowCutoff = (settings.darkShadowFill / 100) * 255;
  const grainAmount = settings.paperGrain * 0.7;

  const saturationMultiplier = settings.colorSaturation ?? (settings.colorMode === 'vibrant' ? 1.6 : 1.2);
  const toneStrength = (settings.screentoneStrength ?? (settings.colorMode === 'vibrant' ? 0 : 50)) / 100;
  const lineOpacity = settings.lineOpacity ?? (isColor ? 0.75 : 1.0);

  // Paper base color for B&W / Sepia
  const paperR = settings.colorMode === 'sepia' ? 245 : 255;
  const paperG = settings.colorMode === 'sepia' ? 240 : 255;
  const paperB = settings.colorMode === 'sepia' ? 228 : 255;

  for (let y = 0; y < height; y++) {
    const yWidth = y * width;
    for (let x = 0; x < width; x++) {
      const pIdx = yWidth + x;
      const pixel4 = pIdx * 4;

      const isLineArt = finalEdgeMap[pIdx] === 1;

      // Base gray value with contrast adjustment
      let gray = grayMap[pIdx];

      // Anime character face skin cel smoothing:
      if (settings.characterMode || (settings.skinSmoothing && settings.skinSmoothing > 0)) {
        const smoothLevel = (settings.skinSmoothing || 60) / 100;
        // Posterize mid-tones into clean anime cell shading
        if (gray > 90 && gray < 235) {
          const celStep = Math.round(gray / 38) * 38;
          gray = gray * (1 - smoothLevel * 0.75) + celStep * (smoothLevel * 0.75);
        }
      }

      gray = Math.max(0, Math.min(255, 128 + (gray - 128) * contrast));

      // Paper grain noise
      if (grainAmount > 0 && !isColor) {
        const noise = (Math.random() - 0.5) * grainAmount;
        gray = Math.max(0, Math.min(255, gray + noise));
      }

      // Check if this pixel is deep solid black (beta-nuri ink)
      const isSolidBlack = shadowCutoff > 0 && gray < shadowCutoff;

      if (isColor) {
        // --- COLOR ANIME / WEBTOON MODE (HIGH COLOR, LOW DISTORTION) ---
        let r = (distStrength > 0.25 && cleanR[pIdx] > 0) ? cleanR[pIdx] : srcData[pixel4];
        let g = (distStrength > 0.25 && cleanG[pIdx] > 0) ? cleanG[pIdx] : srcData[pixel4 + 1];
        let b = (distStrength > 0.25 && cleanB[pIdx] > 0) ? cleanB[pIdx] : srcData[pixel4 + 2];

        // Color Saturation & Perceptual Vibrance Boost
        if (saturationMultiplier !== 1.0) {
          const l = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const sat = (maxC - minC) / (maxC + 1e-4);
          // Vibrance: give lower-saturated colors a relative boost to make scenery & eyes glow without overburning skin
          const vibranceScale = saturationMultiplier * (1 + (1 - sat) * 0.35);

          r = Math.max(0, Math.min(255, l + (r - l) * vibranceScale));
          g = Math.max(0, Math.min(255, l + (g - l) * vibranceScale));
          b = Math.max(0, Math.min(255, l + (b - l) * vibranceScale));

          if (settings.colorMode === 'vibrant') {
            // Radiant anime keyframe grade
            r = Math.min(255, r * 1.03);
            g = Math.min(255, g * 1.02);
            b = Math.min(255, b * 1.04);
          }
        }

        // Apply Cel Shading Shadow
        if (isSolidBlack) {
          r = Math.max(0, r * 0.4);
          g = Math.max(0, g * 0.4);
          b = Math.max(0, b * 0.42);
        }

        // Screentone Halftone overlay (only if enabled > 0)
        if (toneStrength > 0) {
          const rotX = x * cosA - y * sinA;
          const rotY = x * sinA + y * cosA;
          const modX = ((rotX % pitch) + pitch) % pitch;
          const modY = ((rotY % pitch) + pitch) % pitch;
          const centerOffset = pitch / 2;
          const dx = modX - centerOffset;
          const dy = modY - centerOffset;
          const distSq = dx * dx + dy * dy;
          const darkness = 1.0 - (gray / 255);
          const dotRadiusSq = (darkness * pitch * 0.55) ** 2;

          if (darkness > 0.12 && distSq < dotRadiusSq) {
            const dimFactor = 1 - toneStrength * 0.45;
            r = Math.max(0, r * dimFactor);
            g = Math.max(0, g * dimFactor);
            b = Math.max(0, b * dimFactor);
          }
        }

        // Clean Inked Line Art Blending (smooth anti-aliased anime lines, zero jagged distortion)
        if (isLineArt) {
          const inkR = 14;
          const inkG = 14;
          const inkB = 18;
          r = r * (1 - lineOpacity) + inkR * lineOpacity;
          g = g * (1 - lineOpacity) + inkG * lineOpacity;
          b = b * (1 - lineOpacity) + inkB * lineOpacity;
        }

        outData[pixel4] = Math.round(r);
        outData[pixel4 + 1] = Math.round(g);
        outData[pixel4 + 2] = Math.round(b);
        outData[pixel4 + 3] = 255;
      } else {
        // --- CLASSIC B&W / SEPIA TANKOBON MODE ---
        if (isLineArt || isSolidBlack) {
          outData[pixel4] = 10;
          outData[pixel4 + 1] = 10;
          outData[pixel4 + 2] = 12;
          outData[pixel4 + 3] = 255;
        } else {
          const rotX = x * cosA - y * sinA;
          const rotY = x * sinA + y * cosA;
          const modX = ((rotX % pitch) + pitch) % pitch;
          const modY = ((rotY % pitch) + pitch) % pitch;
          const centerOffset = pitch / 2;
          const dx = modX - centerOffset;
          const dy = modY - centerOffset;
          const distSq = dx * dx + dy * dy;

          const darkness = 1.0 - (gray / 255);
          const dotRadiusSq = (darkness * pitch * 0.55) ** 2;
          const isDot = darkness > 0.08 && distSq < dotRadiusSq;

          if (isDot && toneStrength > 0) {
            outData[pixel4] = 20;
            outData[pixel4 + 1] = 20;
            outData[pixel4 + 2] = 20;
          } else {
            outData[pixel4] = paperR;
            outData[pixel4 + 1] = paperG;
            outData[pixel4 + 2] = paperB;
          }
          outData[pixel4 + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(outputImageData, 0, 0);

  // Step 4: Speedlines Overlay (if enabled)
  if (settings.speedlineType !== 'none') {
    drawSpeedlines(ctx, width, height, settings);
  }
}

/**
 * Draw authentic dynamic manga speed lines
 */
function drawSpeedlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: MangaShaderSettings
): void {
  ctx.save();
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = '#09090b';

  const count = Math.max(12, Math.floor(settings.speedlineDensity * 1.5));

  if (settings.speedlineType === 'radial-burst') {
    const cx = (settings.speedlineCenterX / 100) * width;
    const cy = (settings.speedlineCenterY / 100) * height;
    const clearRadius = Math.min(width, height) * 0.22;
    const maxRadius = Math.hypot(width, height);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      const lengthVariation = 0.8 + Math.random() * 0.4;
      const startDist = clearRadius + Math.random() * 25;
      const endDist = maxRadius * lengthVariation;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx + cos * startDist, cy + sin * startDist);
      const perpCos = -sin;
      const perpSin = cos;
      const widthAtEnd = 2 + Math.random() * 5;

      ctx.lineTo(
        cx + cos * endDist + perpCos * widthAtEnd,
        cy + sin * endDist + perpSin * widthAtEnd
      );
      ctx.lineTo(
        cx + cos * endDist - perpCos * widthAtEnd,
        cy + sin * endDist - perpSin * widthAtEnd
      );
      ctx.closePath();
      ctx.fill();
    }
  } else if (settings.speedlineType === 'horizontal-action') {
    for (let i = 0; i < count; i++) {
      const y = Math.random() * height;
      const lineLen = width * (0.3 + Math.random() * 0.7);
      const xStart = Math.random() > 0.5 ? 0 : width - lineLen;
      const lineW = 1 + Math.random() * 3.5;

      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(xStart, y);
      ctx.lineTo(xStart + lineLen, y);
      ctx.stroke();
    }
  } else if (settings.speedlineType === 'vertical-impact') {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const lineLen = height * (0.3 + Math.random() * 0.7);
      const yStart = Math.random() > 0.5 ? 0 : height - lineLen;
      const lineW = 1 + Math.random() * 3.5;

      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(x, yStart);
      ctx.lineTo(x, yStart + lineLen);
      ctx.stroke();
    }
  }

  ctx.restore();
}
