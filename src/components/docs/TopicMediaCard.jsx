import React, { useState } from 'react';

// Explicit mapping of verified media assets in /public/gifs/
export const TOPIC_MEDIA_MAP = {
  'anatomy-of-a-node': [
    { label: 'Anatomy', src: '/gifs/anatomy-of-a-node.png', alt: 'Anatomy of a Node' },
  ],
  'traversal': [
    { label: 'Traversal', src: '/gifs/traversaL.gif', alt: 'Linked List Traversal' },
  ],
  'insertion-head-middle-tail': [
    { label: 'Beginning', src: '/gifs/insertion_begining.gif', alt: 'Insertion at Beginning' },
    { label: 'Middle', src: '/gifs/insertion_middle.gif', alt: 'Insertion in Middle' },
    { label: 'End', src: '/gifs/insertion_end.gif', alt: 'Insertion at End' },
  ],
  'deletion-why-you-need-previous': [
    { label: 'Deletion', src: '/gifs/deletion-why-you-need-previous.gif', alt: 'Deletion - Why You Need Previous' },
  ],
  'types-doubly-and-circular': [
    { label: 'Doubly & Circular', src: '/gifs/insertion-deletion-doubly-circular.gif', alt: 'Doubly and Circular Linked Lists' },
  ],
  'insertion-deletion-doubly-circular': [
    { label: 'Doubly & Circular', src: '/gifs/insertion-deletion-doubly-circular.gif', alt: 'Doubly and Circular Linked Lists' },
  ],
  'fast-and-slow-pointers-the-essence': [
    { label: 'Fast & Slow', src: '/gifs/fast-and-slow-pointers-the-essence.gif', alt: 'Fast and Slow Pointers' },
  ],
  'implementations-of-the-list-adt': [
    { label: 'List ADT Implementations', src: '/gifs/implementations-of-the-list-adt.gif', alt: 'Implementations of the List ADT' },
  ],
};

export const TopicMediaCard = ({ slug, title, customGif, media }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Determine media items list
  let mediaList = [];
  if (Array.isArray(media) && media.length > 0) {
    mediaList = media.map((item) =>
      typeof item === 'string' ? { label: 'Visual', src: item, alt: title } : item
    );
  } else if (customGif) {
    mediaList = [{ label: 'Visual', src: customGif, alt: title }];
  } else if (slug && TOPIC_MEDIA_MAP[slug]) {
    mediaList = TOPIC_MEDIA_MAP[slug];
  }

  // Preload all media in the list eagerly on mount/update so they render instantly
  React.useEffect(() => {
    if (mediaList && mediaList.length > 0) {
      mediaList.forEach((item) => {
        const img = new Image();
        img.src = item.src;
      });
    }
  }, [slug, mediaList]);

  // If no media is assigned for this topic, render nothing (no placeholders, no boxes)
  if (!mediaList || mediaList.length === 0) {
    return null;
  }

  const safeIndex = activeIndex < mediaList.length ? activeIndex : 0;
  const currentItem = mediaList[safeIndex];

  return (
    <div className="w-full select-none flex flex-col gap-3">
      {/* Multi-GIF Tab Switcher (Only shown if page has more than 1 GIF) */}
      {mediaList.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface/90 dark:bg-[#141414]/90 border border-border/60 dark:border-white/10 w-fit shadow-xs">
          {mediaList.map((item, idx) => (
            <button
              key={item.label || idx}
              onClick={() => setActiveIndex(idx)}
              className={`px-3.5 py-1.5 rounded-md text-3xs font-mono font-bold transition-all ${
                safeIndex === idx
                  ? 'bg-accent text-black shadow-xs scale-102'
                  : 'text-text-muted hover:text-primary hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Pure borderless, boxless GIF/PNG Media Image (20% Larger & Eager High-Priority Loading) */}
      <div className="w-full overflow-hidden rounded-2xl">
        <img
          key={currentItem.src}
          src={currentItem.src}
          alt={currentItem.alt || title || 'Topic visual'}
          className="w-full h-auto object-contain rounded-2xl shadow-xl transition-transform duration-200"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </div>
  );
};

