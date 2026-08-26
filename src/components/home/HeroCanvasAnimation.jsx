import React, { useEffect, useRef } from 'react';

export const HeroCanvasAnimation = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = 1000);
    const height = (canvas.height = 500);

    // Particles moving along data paths
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Data packets streaming along circuit tracks
    const pulses = [
      { startX: 200, startY: 340, endX: 450, endY: 220, progress: 0, speed: 0.006 },
      { startX: 450, startY: 220, endX: 620, endY: 260, progress: 0.3, speed: 0.008 },
      { startX: 620, startY: 260, endX: 840, endY: 280, progress: 0.6, speed: 0.007 },
      { startX: 300, startY: 380, endX: 450, endY: 220, progress: 0.5, speed: 0.005 },
      { startX: 450, startY: 220, endX: 520, endY: 140, progress: 0.2, speed: 0.009 },
      { startX: 520, startY: 140, endX: 780, endY: 180, progress: 0.7, speed: 0.006 },
    ];

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.02;

      const isDark = theme === 'dark';

      // 1. Draw glowing data packets traveling along lines
      pulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const curX = p.startX + (p.endX - p.startX) * p.progress;
        const curY = p.startY + (p.endY - p.startY) * p.progress;

        const gradient = ctx.createRadialGradient(curX, curY, 0, curX, curY, 18);
        if (isDark) {
          // Dark Mode: Coordinated clean slate-blue pulses
          gradient.addColorStop(0, 'rgba(56, 112, 147, 0.9)');
          gradient.addColorStop(0.4, 'rgba(56, 112, 147, 0.4)');
          gradient.addColorStop(1, 'rgba(56, 112, 147, 0)');
        } else {
          // Light Mode: Cyan glowing pulses
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
          gradient.addColorStop(0.4, 'rgba(56, 189, 248, 0.45)');
          gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(curX, curY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Core bright spark
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw ambient floating particles
      particles.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.pulse += 0.03;

        if (pt.x < 0) pt.x = width;
        if (pt.x > width) pt.x = 0;
        if (pt.y < 0) pt.y = height;
        if (pt.y > height) pt.y = 0;

        const curAlpha = (Math.sin(pt.pulse) * 0.3 + 0.7) * (isDark ? 0.45 : 0.65);
        ctx.fillStyle = isDark
          ? `rgba(56, 112, 147, ${curAlpha})`
          : `rgba(56, 189, 248, ${curAlpha})`;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Central node pulsing energy ring
      const centerX = 425;
      const centerY = 225;
      const ringRadius = 24 + Math.sin(t * 2) * 6;
      const ringAlpha = (Math.sin(t * 2) * 0.25 + 0.45) * (isDark ? 0.55 : 0.85);

      ctx.strokeStyle = isDark
        ? `rgba(56, 112, 147, ${ringAlpha})`
        : `rgba(56, 189, 248, ${ringAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={500}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen z-10"
    />
  );
};

