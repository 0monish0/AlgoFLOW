import React, { useRef, useState, useEffect } from 'react';

// Photos loaded from public/gallery/ folder (matching user's uploaded images)
const GALLERY_IMAGES = [
  { id: 1, src: '/gallery/pexels-giuseppe-didio-64079575-8168570.jpg', alt: 'Abstract algorithmic art' },
  { id: 2, src: '/gallery/pexels-googledeepmind-17484970.jpg', alt: 'DeepMind neural and computational structures' },
  { id: 3, src: '/gallery/pexels-googledeepmind-25626431.jpg', alt: 'Geometric data and network geometry' },
  { id: 4, src: '/gallery/pexels-markusspiske-965345.jpg', alt: 'Matrix code and data architecture' },
  { id: 5, src: '/gallery/pexels-peaky-31343288.jpg', alt: 'Modern technology and computational design' },
];

export const CurvedImageCarousel = () => {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Repeat items for seamless continuous looping
  const items = [
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
  ];

  // 35% scaled-down dimensions with tight contiguous spacing
  const CARD_WIDTH = 220;
  const CARD_GAP = -50;
  const STRIDE = CARD_WIDTH + CARD_GAP; // 170px stride
  const LOOP_LENGTH = GALLERY_IMAGES.length * STRIDE; // 5 * 170 = 850px

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

      // Continuous horizontal travel speed (smooth 42px/sec, slows on hover)
      const speed = isHovered ? 14 : 42;
      setOffset((prev) => {
        const next = prev + (speed * delta) / 1000;
        return next >= LOOP_LENGTH ? next - LOOP_LENGTH : next;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, LOOP_LENGTH]);

  const centerX = containerWidth / 2;
  const radius = containerWidth * 0.46;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden select-none pt-10 sm:pt-16 pb-8 sm:pb-12"
      style={{
        perspective: '1000px',
        perspectiveOrigin: '50% 40%',
      }}
    >
      {/* Left & Right Soft Vignette Fade Gradients */}
      <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-36 lg:w-48 bg-gradient-to-r from-base via-base/80 to-transparent z-30 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-36 lg:w-48 bg-gradient-to-l from-base via-base/80 to-transparent z-30 pointer-events-none" />

      {/* 35% Scaled Curved Panoramic Filmstrip Stage */}
      <div
        className="relative w-full h-[270px] sm:h-[290px] md:h-[310px] flex items-center justify-center"
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
          if (absNormX > 2.0) return null;

          // Inverted Amphitheater / Wraparound Curve Geometry:
          // 1. Smaller in the middle (0.78x), larger on both sides (up to 1.20x)
          const scale = Math.min(1.22, 0.78 + Math.pow(absNormX, 1.25) * 0.40);
          // 2. Middle recedes back (-70px), sides come forward (+50px)
          const translateZ = -70 + Math.pow(absNormX, 1.3) * 120;
          // 3. Middle dips, sides rise gracefully
          const translateY = 20 - Math.pow(normX, 2) * 20;
          // 4. Inward amphitheater yaw rotation
          const rotateY = normX * 22;
          // 5. Dynamic tangential roll
          const rotateZ = -normX * 4.5;
          // 6. Crisp full opacity across the panorama
          const opacity = Math.max(0.45, 1 - Math.pow(Math.max(0, absNormX - 1.2), 2) * 0.8);

          return (
            <div
              key={`${img.id}-${index}`}
              className="absolute top-1/2 left-0 -mt-[135px] sm:-mt-[145px] overflow-hidden shadow-2xl border-[2px] border-white dark:border-white bg-[#0A0A0A] group cursor-pointer"
              style={{
                width: `${CARD_WIDTH}px`,
                height: '270px',
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
                zIndex: Math.round(50 + absNormX * 50),
                willChange: 'transform, opacity',
                transition: 'box-shadow 200ms ease',
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover grayscale contrast-[1.18] brightness-[0.94] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 pointer-events-none"
                loading="lazy"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-35 group-hover:opacity-5 transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
