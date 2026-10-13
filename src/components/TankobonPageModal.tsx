import React, { useRef, useState, useEffect } from 'react';
import { 
  MangaPanelData, 
  PageLayoutTemplate 
} from '../types/manga';
import { renderMangaEffect } from '../utils/mangaShader';
import { 
  X, 
  Download, 
  Printer, 
  LayoutGrid, 
  Columns, 
  Layers, 
  Check,
  BookOpen
} from 'lucide-react';

interface TankobonPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  panels: MangaPanelData[];
  initialLayout?: PageLayoutTemplate;
}

export const TankobonPageModal: React.FC<TankobonPageModalProps> = ({
  isOpen,
  onClose,
  panels,
  initialLayout = '4-koma',
}) => {
  const [layout, setLayout] = useState<PageLayoutTemplate>(initialLayout);
  const [chapterTitle, setChapterTitle] = useState('Chapter 1: The Turning Point');
  const [japaneseSubtitle, setJapaneseSubtitle] = useState('第一話: 覚醒の刻');
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const pageContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayPanels = panels.slice(
    0,
    layout === '4-koma' ? 4 : layout === '3-panel-climax' ? 3 : layout === '2-panel-split' ? 2 : 6
  );

  const handleDownloadFullPage = () => {
    setIsExporting(true);

    // Render composite canvas of the entire tankobon page
    const canvas = document.createElement('canvas');
    // Standard B5 Tankobon ratio 1 : 1.414, high resolution 1600 x 2262
    const pageWidth = 1600;
    const pageHeight = 2262;
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background paper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    // Manga Crop & Register Bleed Marks
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    // Top-left crop mark
    ctx.beginPath();
    ctx.moveTo(30, 60); ctx.lineTo(60, 60); ctx.lineTo(60, 30);
    ctx.moveTo(pageWidth - 30, 60); ctx.lineTo(pageWidth - 60, 60); ctx.lineTo(pageWidth - 60, 30);
    ctx.stroke();

    // Chapter Header
    ctx.fillStyle = '#09090b';
    ctx.textAlign = 'center';
    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(chapterTitle, pageWidth / 2, 100);

    ctx.font = "bold 24px 'Noto Sans JP', sans-serif";
    ctx.fillText(japaneseSubtitle, pageWidth / 2, 140);

    // Margins
    const mx = 90;
    const my = 180;
    const contentW = pageWidth - mx * 2;
    const contentH = pageHeight - my - 120;

    const renderPanelSlot = (
      panel: MangaPanelData,
      x: number,
      y: number,
      w: number,
      h: number
    ): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = panel.originalImage;
        img.onload = () => {
          const panelCanvas = document.createElement('canvas');
          panelCanvas.width = Math.round(w);
          panelCanvas.height = Math.round(h);
          renderMangaEffect(img, panelCanvas, panel.settings);

          // Draw panel border
          ctx.save();
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#09090b';
          ctx.strokeRect(x, y, w, h);
          ctx.drawImage(panelCanvas, x, y, w, h);

          // Draw bubbles for this panel
          panel.bubbles.forEach((b) => {
            const bx = x + (b.x / 100) * w;
            const by = y + (b.y / 100) * h;
            const bw = 200;
            const bh = 100;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#09090b';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 16);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#09090b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = "bold 20px 'Noto Sans JP', sans-serif";
            ctx.fillText(b.text, bx, b.translation ? by - 10 : by);

            if (b.translation) {
              ctx.fillStyle = '#71717a';
              ctx.font = "600 12px 'Plus Jakarta Sans', sans-serif";
              ctx.fillText(b.translation, bx, by + 16);
            }
          });

          // Draw SFX for this panel
          panel.sfxItems.forEach((s) => {
            const sx = x + (s.x / 100) * w;
            const sy = y + (s.y / 100) * h;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate((s.rotation * Math.PI) / 180);
            ctx.scale(s.scale, s.scale);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = "900 48px 'Bangers', 'Mochiy Pop One', cursive, sans-serif";
            ctx.lineWidth = 8;
            ctx.strokeStyle = '#09090b';
            ctx.strokeText(s.text, 0, 0);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(s.text, 0, 0);
            ctx.restore();
          });

          ctx.restore();
          resolve();
        };
      });
    };

    // Calculate slots based on layout
    const promises: Promise<void>[] = [];
    const gutter = 24;

    if (layout === '4-koma') {
      const ph = (contentH - gutter * 3) / 4;
      displayPanels.forEach((p, idx) => {
        promises.push(renderPanelSlot(p, mx, my + idx * (ph + gutter), contentW, ph));
      });
    } else if (layout === '3-panel-climax') {
      const h1 = contentH * 0.28;
      const h2 = contentH * 0.28;
      const h3 = contentH * 0.44 - gutter * 2;
      if (displayPanels[0]) promises.push(renderPanelSlot(displayPanels[0], mx, my, contentW, h1));
      if (displayPanels[1]) promises.push(renderPanelSlot(displayPanels[1], mx, my + h1 + gutter, contentW, h2));
      if (displayPanels[2]) promises.push(renderPanelSlot(displayPanels[2], mx, my + h1 + h2 + gutter * 2, contentW, h3));
    } else if (layout === '2-panel-split') {
      const ph = (contentH - gutter) / 2;
      displayPanels.forEach((p, idx) => {
        promises.push(renderPanelSlot(p, mx, my + idx * (ph + gutter), contentW, ph));
      });
    } else {
      // 6-panel grid
      const pw = (contentW - gutter) / 2;
      const ph = (contentH - gutter * 2) / 3;
      displayPanels.forEach((p, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        promises.push(renderPanelSlot(p, mx + col * (pw + gutter), my + row * (ph + gutter), pw, ph));
      });
    }

    Promise.all(promises).then(() => {
      // Footer page number
      ctx.fillStyle = '#71717a';
      ctx.textAlign = 'center';
      ctx.font = "bold 16px 'Noto Sans JP', sans-serif";
      ctx.fillText('- 42 -', pageWidth / 2, pageHeight - 40);

      const link = document.createElement('a');
      link.download = `tankobon-page-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsExporting(false);
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">
              <span className="font-manga-jp">本</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Tankobon Manga Page Publisher
              </h2>
              <span className="text-xs text-zinc-500">
                Print-ready Japanese B5 comic book page composite
              </span>
            </div>
          </div>

          {/* Layout Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg text-xs font-medium">
            {[
              { id: '4-koma', label: '4-Koma Strip' },
              { id: '3-panel-climax', label: '3-Panel Climax' },
              { id: '2-panel-split', label: '2-Panel Duel' },
              { id: '6-panel-grid', label: '6-Panel Chapter' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLayout(item.id as any)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  layout === item.id
                    ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFullPage}
              disabled={isExporting}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Compositing...' : 'Download Tankobon PNG'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Manga Page Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-100 flex justify-center">
          <div
            ref={pageContainerRef}
            className="w-full max-w-xl bg-white shadow-xl border-4 border-zinc-950 p-6 flex flex-col gap-4 relative"
            style={{ minHeight: '800px' }}
          >
            {/* Traditional Manga Chapter Title */}
            <div className="text-center border-b-2 border-zinc-950 pb-3 flex flex-col gap-0.5">
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="text-center font-extrabold text-lg text-zinc-950 tracking-tight focus:outline-none hover:bg-zinc-50 rounded"
              />
              <input
                type="text"
                value={japaneseSubtitle}
                onChange={(e) => setJapaneseSubtitle(e.target.value)}
                className="text-center font-manga-jp font-bold text-sm text-zinc-600 tracking-wider focus:outline-none hover:bg-zinc-50 rounded"
              />
            </div>

            {/* Reading Direction indicator */}
            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
              <span>読書順: 右から左へ (READ RIGHT TO LEFT)</span>
              <span>VOL. 01 · CHAPTER 01</span>
            </div>

            {/* Panels Container */}
            <div
              className={`flex-1 grid gap-3 ${
                layout === '4-koma'
                  ? 'grid-cols-1 grid-rows-4'
                  : layout === '3-panel-climax'
                  ? 'grid-cols-1'
                  : layout === '2-panel-split'
                  ? 'grid-cols-1 grid-rows-2'
                  : 'grid-cols-2 grid-rows-3'
              }`}
            >
              {displayPanels.map((panel, idx) => (
                <div
                  key={panel.id}
                  className="relative border-4 border-zinc-950 overflow-hidden bg-zinc-900 aspect-video flex items-center justify-center shadow-xs"
                >
                  <img
                    src={panel.originalImage}
                    alt={`Panel ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter contrast-125 grayscale"
                  />

                  {/* Overlaid Speech Bubbles */}
                  {panel.bubbles.map((b) => (
                    <div
                      key={b.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 p-2 bg-white text-zinc-950 border-2 border-zinc-950 font-bold text-xs rounded-xl shadow-md text-center"
                      style={{ left: `${b.x}%`, top: `${b.y}%` }}
                    >
                      <span className="font-manga-jp block">{b.text}</span>
                      {b.translation && (
                        <span className="text-[9px] text-zinc-500 font-normal block mt-0.5">
                          {b.translation}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Overlaid SFX */}
                  {panel.sfxItems.map((s) => (
                    <div
                      key={s.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 font-manga-sfx text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale * 0.8})`,
                        WebkitTextStroke: '1.5px #000',
                      }}
                    >
                      {s.text}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Page Footer Number */}
            <div className="text-center text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-200">
              - 42 -
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
