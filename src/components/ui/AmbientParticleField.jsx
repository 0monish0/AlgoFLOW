import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

export const AmbientParticleField = () => {
  const meshRef = useRef();
  const pointsRef = useRef();
  const shouldReduceMotion = useReducedMotion();

  // --- 1. Cubes Geometry ---
  const numParticles = 500;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const [particles, colorArray] = useMemo(() => {
    const mintColor = new THREE.Color('#10B981'); 
    const greyColor = new THREE.Color('#4b5563'); 
    
    const parts = [];
    const colArray = new Float32Array(numParticles * 3);
    
    for (let i = 0; i < numParticles; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 30 - 10;
      
      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;

      const dx = (Math.random() - 0.5) * 0.2;
      const dy = (Math.random() - 0.5) * 0.2;
      const dz = (Math.random() - 0.5) * 0.2;
      
      parts.push({ x, y, z, baseX: x, baseY: y, rx, ry, rz, dx, dy, dz });

      const isMint = Math.random() > 0.8;
      const c = isMint ? mintColor : greyColor;
      colArray[i * 3] = c.r;
      colArray[i * 3 + 1] = c.g;
      colArray[i * 3 + 2] = c.b;
    }
    
    return [parts, colArray];
  }, []);

  // --- 2. Dots Geometry ---
  const [dotPositions, dotColors] = useMemo(() => {
    const numDots = 1000;
    const pos = new Float32Array(numDots * 3);
    const col = new Float32Array(numDots * 3);
    
    const mintColor = new THREE.Color('#10B981');
    const greyColor = new THREE.Color('#4b5563');
    
    for (let i = 0; i < numDots; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
      
      const isMint = Math.random() > 0.8;
      const c = isMint ? mintColor : greyColor;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (shouldReduceMotion) return;
    
    const mouseX = state.pointer.x * 20;
    const mouseY = state.pointer.y * 20;

    // Animate Cubes
    if (meshRef.current) {
      particles.forEach((p, i) => {
        p.rx += p.dx * delta;
        p.ry += p.dy * delta;
        p.rz += p.dz * delta;
        
        const floatingY = Math.sin(state.clock.elapsedTime * 0.5 + p.baseX) * 0.5;
        
        let targetX = p.baseX;
        let targetY = p.baseY + floatingY;

        const dx = p.baseX - mouseX;
        const dy = p.baseY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 4 && dist > 0) {
          const force = (4 - dist) / 4;
          targetX += (dx / dist) * force * 3;
          targetY += (dy / dist) * force * 3;
        }

        p.x += (targetX - p.x) * 0.05;
        p.y += (targetY - p.y) * 0.05;

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rx, p.ry, p.rz);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate Dots
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
      
      const targetX = state.pointer.x * 1.5;
      const targetY = state.pointer.y * 1.5;
      
      pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.02;
      pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.02;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[null, null, numParticles]}>
        <boxGeometry args={[0.7, 0.7, 0.7]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colorArray, 3]}
          />
        </boxGeometry>
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={0.2}
          depthWrite={false}
          roughness={0.8}
          metalness={0.2}
        />
      </instancedMesh>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dotPositions.length / 3}
            array={dotPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={dotColors.length / 3}
            array={dotColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.3}
          sizeAttenuation
        />
      </points>
    </>
  );
};
