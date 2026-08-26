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

  // 35% scaled-down dimensions (220px x 270px)
  const CARD_WIDTH = 220;
  const CARD_GAP = 10;
  const STRIDE = CARD_WIDTH + CARD_GAP;
  const LOOP_LENGTH = GALLERY_IMAGES.length * STRIDE; // 5 * 230 = 1150px

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

          // Panoramic Arc Curve Geometry (35% scaled):
          const translateY = Math.pow(normX, 2) * 20;
          const rotateZ = normX * 6.0;
          const rotateY = -normX * 20;
          const translateZ = 30 - Math.pow(absNormX, 2) * 50;
          const scale = Math.max(0.85, 1.05 - Math.pow(absNormX, 1.4) * 0.16);
          const opacity = Math.max(0.4, 1 - Math.pow(absNormX, 3) * 0.5);

          return (
            <div
              key={`${img.id}-${index}`}
              className="absolute top-1/2 left-0 -mt-[135px] sm:-mt-[145px] overflow-hidden shadow-xl border-[2px] border-white dark:border-white bg-[#0A0A0A] group cursor-pointer"
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
                zIndex: Math.round(100 - absNormX * 40),
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
