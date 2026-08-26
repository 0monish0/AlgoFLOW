import React, { useState, useEffect } from 'react';
import { Film, Sparkles } from 'lucide-react';

export const TopicMediaCard = ({ slug, title, customGif }) => {
  const gifPath = customGif || `/gifs/${slug}.gif`;
  const [hasImage, setHasImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    setHasImage(false);

    // Preload to test if the GIF file exists in /public/gifs/
    const img = new Image();
    img.src = gifPath;
    img.onload = () => {
      setHasImage(true);
      setImageError(false);
    };
    img.onerror = () => {
      setHasImage(false);
      setImageError(true);
    };
  }, [gifPath]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border/80 dark:border-white/10 bg-surface/60 dark:bg-[#0E131B]/90 backdrop-blur-md shadow-xl transition-all duration-300 group">
      {/* Top Media Capsule Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border/60 dark:border-white/5 bg-base/40 text-2xs select-none">
        <div className="flex items-center gap-1.5 font-bold text-accent uppercase tracking-wider text-3xs">
          <Film size={12} className="animate-pulse" />
          <span>Visual Guide</span>
        </div>
        <span className="text-text-muted/70 font-mono text-3xs truncate max-w-[150px]">
          {slug}.gif
        </span>
      </div>

      {/* Main Media Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-black/40 flex items-center justify-center p-3">
        {hasImage && !imageError ? (
          <img
            src={gifPath}
            alt={`${title} visual guide`}
            className="w-full h-full object-contain rounded-lg shadow-md"
            loading="lazy"
          />
        ) : (
          /* Sleek Animated Placeholder */
          <div className="relative w-full h-full rounded-xl border border-dashed border-accent/40 dark:border-accent/30 bg-accent/5 dark:bg-accent/5 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            {/* Ambient Background Grid & Glow */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />

            {/* Pulsing Center Icon */}
            <div className="relative z-10 w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center mb-2.5 shadow-lg shadow-accent/10 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} className="text-accent animate-pulse" />
            </div>

            {/* Title & Instructions */}
            <div className="relative z-10 space-y-1 max-w-[260px]">
              <div className="text-xs font-bold text-primary dark:text-[#F3F4F6] tracking-tight">
                Animation Placeholder
              </div>
              <p className="text-3xs text-text-muted leading-tight font-normal">
                Place your GIF or animation at:
              </p>
              <div className="inline-block px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-accent font-mono text-3xs select-all">
                public/gifs/{slug}.gif
              </div>
            </div>

            {/* Supported Formats Pill */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-4xs text-text-muted/60 font-mono select-none">
              <span>GIF</span>
              <span>•</span>
              <span>WEBP</span>
              <span>•</span>
              <span>MP4</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
