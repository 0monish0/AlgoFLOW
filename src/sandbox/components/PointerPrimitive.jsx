import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { X, Navigation } from 'lucide-react';

export const PointerPrimitive = ({ pointer, isHighlighted = false }) => {
  const {
    updatePointerPosition,
    updatePointerLabel,
    setPointerTarget,
    deleteFreePointer,
    setActiveWire,
    connectingSource,
    setConnectingSource,
  } = useSandboxStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, ptrX: 0, ptrY: 0 });

  const isConnectingFromSelf = connectingSource && connectingSource.sourceId === pointer.id;

  // Drag Pointer Origin Point
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.closest('.pointer-handle') || e.target.closest('button')) {
      return;
    }
    e.stopPropagation();
    setIsDragging(true);
    const { zoom } = useSandboxStore.getState();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ptrX: pointer.position.x,
      ptrY: pointer.position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - dragStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / zoom;
      updatePointerPosition(pointer.id, {
        x: Math.round(dragStartRef.current.ptrX + dx),
        y: Math.round(dragStartRef.current.ptrY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  // Drag Arrowhead to Node or NULL
  const handleArrowDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = pointer.position.x + 60;
    const startY = pointer.position.y + 14;

    const canvasEl = document.getElementById('sandbox-canvas-viewport');
    const canvasRect = canvasEl ? canvasEl.getBoundingClientRect() : { left: 0, top: 0 };

    setActiveWire({
      sourceId: pointer.id,
      sourceType: 'pointer',
      startX,
      startY,
      cursorX: startX,
      cursorY: startY,
    });

    let hasDragged = false;

    const handlePointerMove = (moveEvent) => {
      hasDragged = true;
      const currentZoom = useSandboxStore.getState().zoom;
      const currentPan = useSandboxStore.getState().pan;
      const canvasX = (moveEvent.clientX - canvasRect.left - currentPan.x) / currentZoom;
      const canvasY = (moveEvent.clientY - canvasRect.top - currentPan.y) / currentZoom;

      setActiveWire({
        sourceId: pointer.id,
        sourceType: 'pointer',
        startX,
        startY,
        cursorX: canvasX,
        cursorY: canvasY,
      });
    };

    const handlePointerUp = (upEvent) => {
      window.removeEventListener('mousemove', handlePointerMove);

      if (!hasDragged) {
        setActiveWire(null);
        if (isConnectingFromSelf) {
          setConnectingSource(null);
        } else {
          setConnectingSource({ sourceId: pointer.id, sourceType: 'pointer' });
        }
        return;
      }

      const currentZoom = useSandboxStore.getState().zoom;
      const currentPan = useSandboxStore.getState().pan;
      const dropCanvasX = (upEvent.clientX - canvasRect.left - currentPan.x) / currentZoom;
      const dropCanvasY = (upEvent.clientY - canvasRect.top - currentPan.y) / currentZoom;

      const { nodes: allNodes } = useSandboxStore.getState();

      // Check drop near any node
      let matchedNode = false;
      Object.values(allNodes).forEach((targetNode) => {
        if (!targetNode.position) return;
        const dist = Math.hypot(dropCanvasX - (targetNode.position.x + 65), dropCanvasY - (targetNode.position.y + 26));
        if (dist < 95) {
          setPointerTarget(pointer.id, targetNode.id);
          matchedNode = true;
        }
      });

      if (!matchedNode) {
        // Drop on empty canvas disconnects/unaims
        setPointerTarget(pointer.id, null);
      }

      setActiveWire(null);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp, { once: true });
  };

  const isAimed = Boolean(pointer.targetId);

  return (
    <div
      data-pointer-id={pointer.id}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${pointer.position.x}px, ${pointer.position.y}px, 0px)`,
      }}
      className={`absolute select-none font-mono cursor-grab active:cursor-grabbing z-30 group will-change-transform ${
        isHighlighted ? 'ring-2 ring-accent/60' : ''
      }`}
      title="Free Pointer (drag handle to point at any node)"
    >
      <div className="relative flex items-center bg-surface border border-border rounded-xl shadow-md p-1 pr-1.5 gap-1.5 transition-all">
        {/* Pointer Label (Editable) */}
        <div className="pl-1.5">
          {isEditing ? (
            <input
              type="text"
              value={pointer.label}
              onChange={(e) => updatePointerLabel(pointer.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              className="w-16 px-1 py-0.5 text-xs font-bold font-mono bg-base text-primary border border-accent outline-none rounded"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-extrabold text-primary hover:text-accent font-mono transition-colors tracking-tight"
              title="Click to rename pointer (e.g. head, curr, temp)"
            >
              {pointer.label}
            </button>
          )}
        </div>

        {/* Arrowhead Draggable Handle */}
        <div
          onMouseDown={handleArrowDragStart}
          title="Drag arrow to target node"
          className={`pointer-handle w-5 h-5 rounded-lg flex items-center justify-center cursor-crosshair transition-all ${
            isAimed
              ? 'bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722]'
              : 'bg-base border border-dashed border-border text-text-muted hover:border-accent hover:text-text'
          }`}
        >
          <Navigation size={11} className="rotate-45" />
        </div>

        {/* Delete Pointer Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteFreePointer(pointer.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-red-500 rounded transition-opacity"
          title="Delete pointer"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
