import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { AmbientParticleField } from './AmbientParticleField';

export const SortingRace = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0" style={{ perspective: '1000px' }}>
      {/* 3D Depth Layer */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-0 opacity-100">
          <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
            <ambientLight intensity={1} />
            <AmbientParticleField />
          </Canvas>
        </div>
      )}
    </div>
  );
};
