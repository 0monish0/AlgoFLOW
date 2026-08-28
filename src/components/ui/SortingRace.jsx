import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Canvas, useFrame } from '@react-three/fiber';
import { ComplexityBadge } from './ComplexityBadge';
import { LinkedListBuilder } from './LinkedListBuilder';
import { BinarySearchTree3D } from './BinarySearchTree3D';
import { AmbientParticleField } from './AmbientParticleField';
import {
  getBubbleSortSteps,
  getQuickSortSteps,
  getMergeSortSteps
} from '../../utils/sortingAlgorithms';

const DEFAULT_COLOR = '#4b5563';
const ACTIVE_COLOR = '#10B981';
const ACTIVE_SHADOW = '0 0 12px rgba(16, 185, 129, 0.6)';
const COMPLETE_COLOR = '#10B981';

const generateArray = (size, type) => {
  if (type === 'random') return Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
  if (type === 'reversed') return Array.from({ length: size }, (_, i) => 90 - (i * (80 / size)));
  if (type === 'nearlySorted') {
    const arr = Array.from({ length: size }, (_, i) => 10 + (i * (80 / size)));
    for(let i = 0; i < size / 5; i++) {
      const idx1 = Math.floor(Math.random() * size);
      const idx2 = Math.floor(Math.random() * size);
      const temp = arr[idx1];
      arr[idx1] = arr[idx2];
      arr[idx2] = temp;
    }
    return arr;
  }
  if (type === 'fewUnique') {
    const uniques = [20, 50, 80];
    return Array.from({ length: size }, () => uniques[Math.floor(Math.random() * uniques.length)]);
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
};

// --- Step 3 & 4: GSAP Bar Visualizer ---
const SortVisualizer = ({
  algorithmName,
  complexityText,
  getStepsFn,
  initialArray
}) => {
  const containerRef = useRef(null);
  const barsRef = useRef([]);
  const counterRef = useRef(null);
  
  const [pulseId, setPulseId] = useState(0);

  // Core Timeline
  useGSAP(() => {
    let comparisons = 0;
    if (counterRef.current) counterRef.current.innerText = `comparisons: 0`;
    setPulseId(0);

    barsRef.current.forEach((bar, idx) => {
      if (bar) {
        gsap.set(bar, { 
          scaleY: initialArray[idx] / 100, 
          backgroundColor: DEFAULT_COLOR, 
          boxShadow: 'none',
          transformOrigin: 'bottom',
          y: 0 // Reset quickTo y from previous runs
        });
      }
    });

    const steps = getStepsFn([...initialArray]);
    const tl = gsap.timeline();

    steps.forEach((step) => {
      const { type, indices, arrayState } = step;

      if (type === 'compare') {
        tl.add(() => {
          comparisons++;
          if (counterRef.current) counterRef.current.innerText = `comparisons: ${comparisons}`;
          setPulseId(p => p + 1);
        }, "+=0.12");
        
        tl.to(indices.map(i => barsRef.current[i]), {
          backgroundColor: ACTIVE_COLOR,
          boxShadow: ACTIVE_SHADOW,
          duration: 0.2
        });
        tl.to(indices.map(i => barsRef.current[i]), {
          backgroundColor: DEFAULT_COLOR,
          boxShadow: 'none',
          duration: 0.2
        });
      } else if (type === 'swap') {
        indices.forEach(i => {
          tl.to(barsRef.current[i], {
            scaleY: arrayState[i] / 100,
            duration: 0.2
          }, "<");
        });
      } else if (type === 'done') {
        tl.to(barsRef.current, {
          backgroundColor: COMPLETE_COLOR,
          boxShadow: ACTIVE_SHADOW,
          duration: 0.5,
          stagger: 0.02
        });
      }
    });

    tl.eventCallback('onComplete', () => {
      gsap.delayedCall(1.5, () => {
        tl.restart();
      });
    });

    return () => tl.kill();
  }, { dependencies: [initialArray, getStepsFn], scope: containerRef });

  // Cursor Reactive Lift
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    if (shouldReduceMotion || !barsRef.current.length) return;

    const yToRefs = barsRef.current.map(bar => 
      gsap.quickTo(bar, 'y', { duration: 0.4, ease: 'power3.out' })
    );

    const handleMouseMove = (e) => {
      const cursorX = e.clientX;
      const cursorY = e.clientY;

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const barCenterX = rect.left + rect.width / 2;
        const barCenterY = rect.top + rect.height / 2;
        const distance = Math.hypot(cursorX - barCenterX, cursorY - barCenterY);
        
        if (distance < 150) {
          const lift = -8 * (1 - distance / 150);
          yToRefs[i](lift);
        } else {
          yToRefs[i](0);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion, initialArray]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-end w-full h-[25vh] sm:h-[30vh] max-h-[250px] opacity-40 transition-opacity hover:opacity-80 relative visualizer-container pointer-events-auto">
      <div className="flex items-end justify-center w-full h-full gap-[2px] sm:gap-1 px-4 mb-3" style={{ perspective: '800px' }}>
        {initialArray.map((_, i) => (
          <div
            key={i}
            ref={el => barsRef.current[i] = el}
            className="w-full rounded-t-sm will-change-transform"
            style={{ backgroundColor: DEFAULT_COLOR, height: '100%', scale: '1 0.1', transformOrigin: 'bottom' }}
          />
        ))}
      </div>
      

    </div>
  );
};

// --- Step 5: Controls ---
const SortingControls = ({ config, setConfig }) => {
  const presets = [
    { id: 'random', label: 'Random' },
    { id: 'nearlySorted', label: 'Nearly Sorted' },
    { id: 'reversed', label: 'Reversed' },
    { id: 'fewUnique', label: 'Few Unique' }
  ];
  const sizes = [15, 25, 40];

  return (
    <motion.div 
      initial={{ opacity: 0.2 }}
      whileHover={{ opacity: 1, scale: 1.02 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 z-50 shadow-2xl"
    >
      <div className="flex gap-2">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => setConfig(prev => ({ ...prev, preset: preset.id }))}
            className={`relative px-3 py-1.5 text-[11px] font-mono rounded-lg transition-colors z-10 ${
              config.preset === preset.id ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {config.preset === preset.id && (
              <motion.div
                layoutId="activePresetBg"
                className="absolute inset-0 bg-accent rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {preset.label}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-gray-500">SIZE:</span>
        <div className="flex gap-1">
          {sizes.map(s => (
            <button
              key={s}
              onClick={() => setConfig(prev => ({ ...prev, size: s }))}
              className={`px-2 py-1 text-[10px] font-mono rounded border ${
                config.size === s 
                  ? 'border-accent text-accent bg-accent/10' 
                  : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// (ThreeDepthLayer removed, replaced by AmbientParticleField)


export const SortingRace = () => {
  const [config, setConfig] = useState({ size: 24, preset: 'random' });
  const [baseArray, setBaseArray] = useState(() => generateArray(config.size, config.preset));
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setBaseArray(generateArray(config.size, config.preset));
  }, [config]);

  // --- Step 6: Scroll Morph (GSAP ScrollTrigger) ---
  useGSAP(() => {
    if (shouldReduceMotion) return; // Fall back to default CSS scrolling

    // Apply a 3D tilt and morph as we scroll down past the hero
    gsap.to('.visualizer-container', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 100,
      scale: 0.8,
      rotationX: 30, // 3D tilt
      opacity: 0,
      stagger: 0.1, // Slight stagger between the 3 visualizers as they fall away
      ease: 'power1.inOut'
    });
  }, { scope: containerRef, dependencies: [shouldReduceMotion] });

  const visualizers = [
    { name: 'BUBBLE SORT', complexity: 'O(n²)', getSteps: getBubbleSortSteps },
    { name: 'QUICK SORT', complexity: 'O(n log n)', getSteps: getQuickSortSteps },
    { name: 'MERGE SORT', complexity: 'O(n log n)', getSteps: getMergeSortSteps },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 flex flex-col justify-end pb-32" style={{ perspective: '1000px' }}>
      
      {/* 3D Depth Layer */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-0 opacity-100">
          <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
            <ambientLight intensity={1} />
            <AmbientParticleField />
          </Canvas>
        </div>
      )}

      {/* Margin Visualizers */}
      <LinkedListBuilder />
      <BinarySearchTree3D />

      {/* The actual sorting visualizers (z-10) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
        {visualizers.map((vis) => (
          <SortVisualizer
            key={vis.name}
            algorithmName={vis.name}
            complexityText={vis.complexity}
            getStepsFn={vis.getSteps}
            initialArray={baseArray}
          />
        ))}
      </div>




    </div>
  );
};
