import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../lib/gsap';
import { ComplexityBadge } from './ComplexityBadge';

const ACTIVE_COLOR = '#10B981';

// Hardcoded BST structure for 7 nodes
const treeNodes = [
  { id: 0, pos: [0, 2, 0], parent: null },
  { id: 1, pos: [-1.5, 0.5, 0], parent: 0 },
  { id: 2, pos: [1.5, 0.5, 0], parent: 0 },
  { id: 3, pos: [-2.25, -1, 0], parent: 1 },
  { id: 4, pos: [-0.75, -1, 0], parent: 1 },
  { id: 5, pos: [0.75, -1, 0], parent: 2 },
  { id: 6, pos: [2.25, -1, 0], parent: 2 },
];

const TreeModel = ({ isHovered, setPulseId }) => {
  const groupRef = useRef();
  const nodesRef = useRef([]);
  const linesRef = useRef([]);
  const materialsRef = useRef([]);

  // Auto-rotation (speeds up on hover)
  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetSpeed = isHovered ? 0.8 : 0.2;
      groupRef.current.rotation.y += delta * targetSpeed;
    }
    
    // Smoothly transition emissive intensity on hover
    materialsRef.current.forEach(mat => {
      if (mat) {
        const targetIntensity = isHovered ? 2.0 : 0.8;
        mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * 0.1;
      }
    });
  });

  useGSAP(() => {
    // Initial setup
    gsap.set(nodesRef.current.map(r => r.scale), { x: 0, y: 0, z: 0 });
    gsap.set(nodesRef.current.map(r => r.position), { y: "+=1" }); // Start slightly higher for drop-in
    gsap.set(linesRef.current.map(r => r.scale), { x: 0, y: 0, z: 0 }); // Hide lines

    const tl = gsap.timeline({ repeat: -1 });

    treeNodes.forEach((node, i) => {
      // 1. Drop and scale node
      tl.to(nodesRef.current[i].scale, {
        x: 1, y: 1, z: 1,
        duration: 0.3,
        ease: 'back.out(1.5)'
      });
      tl.to(nodesRef.current[i].position, {
        y: node.pos[1],
        duration: 0.3,
        ease: 'power2.out'
      }, "<");

      // Trigger UI badge pulse
      tl.add(() => setPulseId(p => p + 1), "<");

      // 2. Draw line from parent if it exists
      if (node.parent !== null) {
        // Find line index (i - 1 because root has no line)
        const lineIdx = i - 1;
        tl.to(linesRef.current[lineIdx].scale, {
          x: 1, y: 1, z: 1,
          duration: 0.2,
          ease: 'power1.inOut'
        });
      }

      tl.to({}, { duration: 0.3 }); // Pause between nodes
    });

    tl.to({}, { duration: 2.0 }); // Hold full tree

    // Fade/scale out
    tl.to([nodesRef.current.map(r => r.scale), linesRef.current.map(r => r.scale)], {
      x: 0, y: 0, z: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    });

    return () => tl.kill();
  }, { scope: groupRef });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {treeNodes.map((node, i) => (
        <React.Fragment key={node.id}>
          {/* Node */}
          <Sphere 
            ref={el => nodesRef.current[i] = el} 
            args={[0.25, 16, 16]} 
            position={[node.pos[0], node.pos[1] + 1, node.pos[2]]} // Initial offset for GSAP to animate down
          >
            <meshStandardMaterial 
              ref={el => materialsRef.current[i] = el}
              color={ACTIVE_COLOR} 
              emissive={ACTIVE_COLOR}
              emissiveIntensity={0.8}
              toneMapped={false}
            />
          </Sphere>
          
          {/* Branch to Parent */}
          {node.parent !== null && (
            <group ref={el => linesRef.current[i-1] = el} position={treeNodes[node.parent].pos}>
              <Line
                points={[
                  [0, 0, 0], // Start at parent (local 0,0,0)
                  [node.pos[0] - treeNodes[node.parent].pos[0], node.pos[1] - treeNodes[node.parent].pos[1], node.pos[2] - treeNodes[node.parent].pos[2]] // End at child
                ]}
                color={ACTIVE_COLOR}
                lineWidth={2}
                transparent
                opacity={0.5}
              />
            </group>
          )}
        </React.Fragment>
      ))}
    </group>
  );
};

export const BinarySearchTree3D = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseId, setPulseId] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef();

  if (shouldReduceMotion) return null;

  return (
    <div 
      ref={containerRef}
      className="hidden lg:flex absolute right-8 top-[35%] -translate-y-1/2 flex-col items-center z-10 cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-[300px] h-[350px] mb-4 opacity-70 transition-opacity duration-300 hover:opacity-100">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <TreeModel isHovered={isHovered} setPulseId={setPulseId} />
        </Canvas>
      </div>
    </div>
  );
};
