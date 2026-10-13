/**
 * Video processing and keyframe extraction utility for MangaMorph
 */

export interface ExtractedKeyframe {
  id: string;
  timestamp: number;
  dataUrl: string;
  label: string;
}

/**
 * Capture current frame from an HTMLVideoElement to a base64 JPEG data URL
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  maxWidth = 1280
): string {
  const canvas = document.createElement('canvas');
  let width = video.videoWidth || 640;
  let height = video.videoHeight || 360;

  if (width > maxWidth) {
    const scale = maxWidth / width;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Automatically sample N evenly-spaced keyframes across a video's duration
 */
export async function sampleKeyframesFromVideo(
  videoUrl: string,
  frameCount = 4,
  onProgress?: (progress: number) => void
): Promise<ExtractedKeyframe[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    const keyframes: ExtractedKeyframe[] = [];

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || isNaN(duration) || duration <= 0) {
        // Fallback: capture just 1 frame at start
        video.currentTime = 0;
        await new Promise((r) => setTimeout(r, 200));
        const frame = captureVideoFrame(video);
        resolve([
          {
            id: `frame-0`,
            timestamp: 0,
            dataUrl: frame,
            label: '00:00.00',
          },
        ]);
        return;
      }

      // Calculate sample timestamps avoiding exact 0 and exact end
      const step = duration / (frameCount + 1);
      const timestamps = Array.from({ length: frameCount }, (_, i) =>
        Math.max(0.1, (i + 1) * step)
      );

      try {
        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          video.currentTime = t;

          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked);
          });

          // Allow frame decode to settle
          await new Promise((r) => setTimeout(r, 100));

          const dataUrl = captureVideoFrame(video);
          const minutes = Math.floor(t / 60);
          const seconds = (t % 60).toFixed(1);
          const label = `${String(minutes).padStart(2, '0')}:${seconds.padStart(4, '0')}`;

          keyframes.push({
            id: `frame-${i}-${Date.now()}`,
            timestamp: t,
            dataUrl,
            label,
          });

          if (onProgress) {
            onProgress(Math.round(((i + 1) / timestamps.length) * 100));
          }
        }

        resolve(keyframes);
      } catch (err) {
        reject(err);
      } finally {
        video.src = '';
      }
    };

    video.onerror = (e) => {
      reject(new Error('Failed to load video file.'));
    };
  });
}

/**
 * Generate a dynamic procedural cinematic action video clip (Canvas WebM)
 * for testing movies-to-manga without requiring external downloads
 */
export async function generateDemoActionClip(): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Check if MediaRecorder supports video
  if (!('MediaRecorder' in window) || !canvas.captureStream) {
    throw new Error('Canvas recording not supported in this browser.');
  }

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm',
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(URL.createObjectURL(blob));
    };

    mediaRecorder.start();

    const totalFrames = 120; // 4 seconds at 30fps
    let frame = 0;

    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const progress = frame / totalFrames;
      // Draw dynamic samurai / cyberpunk anime action scene
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 640, 360);

      // Neon city silhouettes
      ctx.fillStyle = '#141c2e';
      ctx.fillRect(40, 100, 100, 260);
      ctx.fillRect(180, 60, 120, 300);
      ctx.fillRect(340, 120, 90, 240);
      ctx.fillRect(480, 80, 130, 280);

      // Neon lights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(70, 120 + Math.sin(frame * 0.1) * 20, 12, 50);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(220, 90, 40, 12);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(520, 140, 15, 60);

      // Rain streaks
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < 35; r++) {
        const rx = (r * 37 + frame * 18) % 640;
        const ry = (r * 53 + frame * 24) % 360;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 22);
        ctx.stroke();
      }

      // Moving character
      const charX = 140 + progress * 320;
      const charY = 240 + Math.sin(progress * Math.PI * 4) * 25;

      // Katana slash arc
      if (progress > 0.4 && progress < 0.75) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(charX + 20, charY, 70, -0.5 * Math.PI, 0.4 * Math.PI);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Character silhouette
      ctx.fillStyle = '#f1f5f9';
      // Head
      ctx.beginPath();
      ctx.arc(charX, charY - 40, 14, 0, Math.PI * 2);
      ctx.fill();
      // Body & coat flowing in wind
      ctx.beginPath();
      ctx.moveTo(charX - 8, charY - 26);
      ctx.lineTo(charX + 16, charY - 20);
      ctx.lineTo(charX + 35 - progress * 15, charY + 20);
      ctx.lineTo(charX - 25, charY + 15);
      ctx.closePath();
      ctx.fill();

      // Sword
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(charX + 10, charY - 15);
      ctx.lineTo(charX + 60, charY - 50);
      ctx.stroke();

      frame++;
    }, 1000 / 30);
  });
}
