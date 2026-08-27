import React from 'react';

export const AsciiForestBackground = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none flex items-center justify-center bg-[#080808]"
      aria-hidden="true"
    >
      {/* 
        The user provided an exact image of an ASCII tree to use 
        as the background instead of raw text characters.
      */}
      <img
        src="/ascii-tree-bg.png"
        alt="ASCII Tree Background"
        className="w-full h-full object-cover sm:object-contain opacity-70 mix-blend-lighten relative z-0"
      />
      {/* Dot Grid Overlay over the image */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
