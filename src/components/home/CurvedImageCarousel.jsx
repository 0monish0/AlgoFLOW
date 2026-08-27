import React, { useRef, useState, useEffect } from 'react';

// Photos loaded from public/gallery/ folder (Transparent Backgrounds)
const GALLERY_IMAGES = [
  { id: 1, src: '/gallery/392cf408ba0887f854a028a252428fcb-nobg.png', alt: 'Abstract mathematical code and data structures' },
  { id: 2, src: '/gallery/5a8b7e54a83d31a5dc80986959cd343c-nobg.png', alt: 'Algorithmic networks and neural topology' },
  { id: 3, src: '/gallery/ccd435211b4466ac3575571f2726166b-nobg.png', alt: 'Computational graphics and matrix flows' },
  { id: 4, src: '/gallery/contemporary-art-nobg.png', alt: 'Contemporary digital algorithmic artwork' },
  { id: 5, src: '/gallery/gallery-graphic-1-nobg.png', alt: 'Algorithmic geometry and code topology' },
  { id: 6, src: '/gallery/gallery-graphic-2-nobg.png', alt: 'Computational graph systems and data flow' },
  { id: 7, src: '/gallery/gallery-graphic-3-nobg.png', alt: 'Neural data connections and lattice visualization' },
  { id: 8, src: '/gallery/gallery-graphic-4-nobg.png', alt: 'Algorithmic interface and hierarchy mapping' },
  { id: 9, src: '/gallery/particle-wave-nobg.png', alt: 'Particle wave simulation dynamics' },
];

export const CurvedImageCarousel = () => {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Repeat items for seamless continuous looping
  const items = [
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
  ];

  // Natural dimensions matching reference image with clean 12px gaps
  const CARD_WIDTH = 260;
  const CARD_HEIGHT = 290;
  const CARD_GAP = 12;
  const STRIDE = CARD_WIDTH + CARD_GAP;
  const LOOP_LENGTH = GALLERY_IMAGES.length * STRIDE; 

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Smooth continuous requestAnimationFrame loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Constant horizontal travel speed (smooth 34px/sec)
      const speed = 34;
      setOffset((prev) => {
        const next = prev + (speed * delta) / 1000;
        return next >= LOOP_LENGTH ? next - LOOP_LENGTH : next;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [LOOP_LENGTH]);

  const centerX = containerWidth / 2;
  const radius = Math.max(480, containerWidth * 0.44);

  // Preload all gallery images immediately on mount so they are cached in memory
  useEffect(() => {
    GALLERY_IMAGES.forEach((img) => {
      const preloadImg = new Image();
      preloadImg.src = img.src;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none pt-8 sm:pt-14 pb-8 sm:pb-12 pointer-events-none"
      style={{
        perspective: '1100px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* Left & Right Soft Vignette Fade Gradients */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 lg:w-56 bg-gradient-to-r from-base via-base/80 to-transparent z-30 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 lg:w-56 bg-gradient-to-l from-base via-base/80 to-transparent z-30 pointer-events-none" />

      {/* Panoramic Cylindrical Filmstrip Stage */}
      <div
        className="relative w-full h-[320px] sm:h-[350px] md:h-[380px] flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {items.map((img, index) => {
          // Calculate item's raw x coordinate
          let itemX = index * STRIDE - offset;

          // Normalize itemX so it wraps symmetrically around the center
          const totalWidth = items.length * STRIDE;
          while (itemX - centerX < -totalWidth / 2) itemX += totalWidth;
          while (itemX - centerX > totalWidth / 2) itemX -= totalWidth;

          // Normalized distance from center (-1.5 to +1.5)
          const normX = (itemX - centerX + CARD_WIDTH / 2) / (radius || 1);
          const absNormX = Math.abs(normX);

          // Only render cards reasonably close to the viewport
          if (absNormX > 2.1) return null;

          // Curved Panoramic Horizon Geometry:
          // 1. Smaller center (0.86x), gracefully expanding sides (up to 1.18x)
          const scale = Math.min(1.20, 0.86 + Math.pow(absNormX, 1.3) * 0.32);
          // 2. Smooth cylindrical forward curve for flanks
          const translateZ = (1 - Math.cos(normX * 0.75)) * 90;
          // 3. Top upward arch and bottom smile curve
          const translateY = Math.pow(normX, 2) * -12;
          // 4. Inward panoramic cylinder yaw
          const rotateY = normX * 20;
          // 5. Subtle tangential tilt
          const rotateZ = -normX * 3.0;
          // 6. Natural fade near extreme edges
          const opacity = Math.max(0.35, 1 - Math.pow(Math.max(0, absNormX - 1.25), 2) * 1.2);

          return (
            <div
              key={`${img.id}-${index}`}
              className="absolute top-1/2 left-0 -mt-[145px] sm:-mt-[160px] overflow-hidden bg-transparent pointer-events-none select-none flex items-center justify-center"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: `
                  translateX(${itemX}px)
                  translateY(${translateY}px)
                  translateZ(${translateZ}px)
                  rotateY(${rotateY}deg)
                  rotateZ(${rotateZ}deg)
                  scale(${scale})
                `,
                transformStyle: 'preserve-3d',
                opacity,
                zIndex: Math.round(50 + absNormX * 40),
                willChange: 'transform, opacity',
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-contain mix-blend-screen pointer-events-none select-none"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(58%) sepia(35%) saturate(1400%) hue-rotate(114deg) brightness(92%) contrast(88%) drop-shadow(0 0 12px rgba(16,185,129,0.22))',
                  opacity: 0.88,
                }}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
