import React from 'react';
import { motion } from 'framer-motion';

// Photos loaded from public/gallery/ folder
// Drop any photos (photo1.jpg, photo2.jpg, ...) into public/gallery/ to customize
const GALLERY_IMAGES = [
  { id: 1, src: '/gallery/photo1.jpg', alt: 'Developer coding on laptop during commute' },
  { id: 2, src: '/gallery/photo2.jpg', alt: 'Students collaborating over algorithm visualizations' },
  { id: 3, src: '/gallery/photo3.jpg', alt: 'Software developer focused on multi-display setup' },
  { id: 4, src: '/gallery/photo4.jpg', alt: 'Team brainstorming data structures in tech lab' },
  { id: 5, src: '/gallery/photo5.jpg', alt: 'Computer science lecture on algorithmic graph complexity' },
];

export const CurvedImageCarousel = () => {
  // Duplicate array for seamless infinite looping
  const seamlessImages = [
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
  ];

  return (
    <div className="relative w-full overflow-hidden select-none pt-2 pb-6 sm:pb-10">
      {/* 3D Cylindrical Horizon Wrapper */}
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        <div className="relative w-full flex overflow-hidden">
          {/* Left & Right Soft Vignette Fade Gradients */}
          <div className="absolute top-0 bottom-0 left-0 w-28 sm:w-56 lg:w-72 bg-gradient-to-r from-base via-base/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-28 sm:w-56 lg:w-72 bg-gradient-to-l from-base via-base/80 to-transparent z-20 pointer-events-none" />

          {/* Smooth Continuous Moving Filmstrip with 3D Arc Tilt */}
          <motion.div
            className="flex items-center gap-4 sm:gap-6 shrink-0 py-4"
            animate={{
              x: ['0%', '-50%'],
            }}
            transition={{
              duration: 36,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              willChange: 'transform',
              transformStyle: 'preserve-3d',
              transform: 'perspective(1200px) rotateX(-5deg)',
            }}
          >
            {seamlessImages.map((img, index) => (
              <div
                key={`${img.id}-${index}`}
                className="relative w-52 sm:w-64 md:w-72 lg:w-80 h-72 sm:h-88 md:h-[360px] lg:h-[390px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 shrink-0 bg-[#121212] group transition-all duration-300 hover:scale-[1.03] hover:border-accent/40"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover grayscale contrast-[1.12] brightness-[0.92] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

