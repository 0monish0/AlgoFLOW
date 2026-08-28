import React, { useEffect } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';

export const ComplexityBadge = ({ text, pulseId }) => {
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (pulseId > 0 && !shouldReduceMotion) {
      controls.start({
        scale: [1, 1.08, 1],
        opacity: [0.8, 1, 0.8],
        transition: { duration: 0.15, ease: "easeOut" }
      });
    }
  }, [pulseId, controls, shouldReduceMotion]);

  return (
    <motion.div
      animate={controls}
      className="text-[11px] font-mono text-accent bg-[#1a1a1a] border border-accent/30 rounded-full px-2 py-0.5 ml-2 shadow-sm whitespace-nowrap"
    >
      {text}
    </motion.div>
  );
};
