import React, { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../lib/gsap';

const NUM_NODES = 7;
const ACTIVE_COLOR = '#10B981';
const MUTED_BG = '#374151'; // Solid slate-700
const ACTIVE_BG = '#059669'; // Solid emerald-600

// Hardcoded scattered positions to look "random not straight"
const nodesData = [
  { left: 0, top: 120, cx: 24, cy: 144 },
  { left: 70, top: 30, cx: 94, cy: 54 },
  { left: 150, top: 100, cx: 174, cy: 124 },
  { left: 60, top: 220, cx: 84, cy: 244 },
  { left: 140, top: 250, cx: 164, cy: 274 },
  { left: 30, top: 320, cx: 54, cy: 344 },
  { left: 130, top: 380, cx: 154, cy: 404 },
];

// Pre-calculate path lengths for strokeDasharray
const getPathLength = (p1, p2) => Math.hypot(p2.cx - p1.cx, p2.cy - p1.cy);

export const LinkedListBuilder = () => {
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const arrowsRef = useRef([]);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(() => {
    if (shouldReduceMotion) return;

    gsap.set(nodesRef.current, { opacity: 0, scale: 0.5, backgroundColor: MUTED_BG });
    gsap.set(arrowsRef.current, { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1 });

    nodesData.forEach((node, i) => {
      // 1. Node pops in
      tl.to(nodesRef.current[i], {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.7)'
      });

      // Pulse active color
      tl.to(nodesRef.current[i], {
        backgroundColor: ACTIVE_BG,
        duration: 0.15
      }).to(nodesRef.current[i], {
        backgroundColor: MUTED_BG,
        duration: 0.3
      }, "+=0.1");

      // 2. Draw line to next node
      if (i < NUM_NODES - 1) {
        const lineLen = getPathLength(node, nodesData[i+1]);
        gsap.set(arrowsRef.current[i], { strokeDasharray: lineLen, strokeDashoffset: lineLen });

        tl.to(arrowsRef.current[i], { opacity: 1, duration: 0.01 });
        tl.to(arrowsRef.current[i], {
          strokeDashoffset: 0,
          duration: 0.3,
          ease: 'power2.inOut'
        }, "-=0.2");
      }

      tl.to({}, { duration: 0.2 }); // small pause
    });

    // Hold
    tl.to({}, { duration: 2.0 });

    // Dissolve
    tl.to([nodesRef.current, arrowsRef.current], {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'power2.inOut',
      stagger: 0.05
    });

    const handleMouseEnter = () => {
      gsap.to(tl, { timeScale: 0, duration: 0.3 });
      gsap.to(nodesRef.current, { filter: 'brightness(1.4)', duration: 0.3 });
    };
    
    const handleMouseLeave = () => {
      gsap.to(tl, { timeScale: 1, duration: 0.3 });
      gsap.to(nodesRef.current, { filter: 'brightness(1)', duration: 0.3 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      tl.kill();
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, { scope: containerRef, dependencies: [shouldReduceMotion] });

  if (shouldReduceMotion) return null;

  return (
    <div 
      ref={containerRef}
      className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-[200px] h-[450px] z-10 opacity-70 cursor-default"
    >
      {/* SVG Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {nodesData.map((node, i) => {
          if (i === NUM_NODES - 1) return null;
          const next = nodesData[i+1];
          return (
            <path
              key={`line-${i}`}
              ref={el => arrowsRef.current[i] = el}
              d={`M ${node.cx} ${node.cy} L ${next.cx} ${next.cy}`}
              stroke={ACTIVE_COLOR}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodesData.map((node, i) => (
        <div 
          key={`node-${i}`}
          ref={el => nodesRef.current[i] = el}
          className="absolute w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center text-xs font-mono text-white/70 shadow-lg"
          style={{ 
            left: node.left, 
            top: node.top, 
            backgroundColor: MUTED_BG,
            zIndex: 10 
          }}
        >
          {i}
        </div>
      ))}
    </div>
  );
};
