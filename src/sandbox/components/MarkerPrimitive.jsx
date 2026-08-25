import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { Compass } from 'lucide-react';

export const MarkerPrimitive = ({ marker, isHighlighted = false }) => {
  const { updateMarkerPosition, setMarkerTarget, nodes } = useSandboxStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, markerX: 0, markerY: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    const { zoom } = useSandboxStore.getState();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      markerX: marker.position.x,
      markerY: marker.position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - dragStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / zoom;
      updateMarkerPosition(marker.id, {
        x: Math.round(dragStartRef.current.markerX + dx),
        y: Math.round(dragStartRef.current.markerY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const { nodes: allNodes, markers: allMarkers } = useSandboxStore.getState();
      const currentMarker = allMarkers[marker.id];
      if (!currentMarker) return;

      const markerCenterX = currentMarker.position.x + 35;
      const markerCenterY = currentMarker.position.y + 15;

      // Find nearest node within snap radius (95px)
      let nearestNode = null;
      let minDistance = 95;

      Object.values(allNodes).forEach((targetNode) => {
        if (!targetNode.position) return;
        const nodeCenterX = targetNode.position.x + 65;
        const nodeCenterY = targetNode.position.y + 26;
        const dist = Math.hypot(markerCenterX - nodeCenterX, markerCenterY - nodeCenterY);

        if (dist < minDistance) {
          minDistance = dist;
          nearestNode = targetNode;
        }
      });

      if (nearestNode) {
        setMarkerTarget(marker.id, nearestNode.id);
        updateMarkerPosition(marker.id, {
          x: nearestNode.position.x + 25,
          y: nearestNode.position.y - 45,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  const label = marker.type.toUpperCase();
  const isAttached = Boolean(marker.targetNodeId && nodes[marker.targetNodeId]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${marker.position.x}px, ${marker.position.y}px, 0px)`,
      }}
      className={`absolute select-none font-mono cursor-grab active:cursor-grabbing z-30 group will-change-transform ${
        isHighlighted ? 'ring-2 ring-accent/60 animate-pulse' : ''
      }`}
      title="Drag onto any node to bind root reference"
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold shadow-md border transition-all ${
          isAttached
            ? 'bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] border-white/20'
            : 'bg-amber-accent text-white border-amber-300 animate-pulse'
        }`}
      >
        <Compass size={12} className={isAttached ? 'text-accent dark:text-[#0A2540]' : 'text-white'} />
        <span>{label}</span>
        {!isAttached && (
          <span className="text-3xs font-normal opacity-90">(drop on node)</span>
        )}
      </div>
    </div>
  );
};
