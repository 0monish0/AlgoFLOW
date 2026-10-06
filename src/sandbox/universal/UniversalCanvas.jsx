/**
 * @fileoverview Universal Free-Form Canvas (Section 1–7 Redesign).
 * OPEN, NOT ENCLOSED. Elements sit directly on the dotted canvas without frames.
 * Renders SvgConnectorLayer, LinkedNodePrimitives, PointerTags, Arrays, Stacks, Queues.
 * No 'Complexity | Return: node_xxx' pill.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useUniversalStore } from './useUniversalStore';
import { SvgConnectorLayer } from './SvgConnectorLayer';
import { LinkedNodePrimitive } from './primitives/LinkedNodePrimitive';
import { PointerTag } from './primitives/PointerTag';
import { ArrayPrimitive } from './primitives/ArrayPrimitive';
import { StackPrimitive } from './primitives/StackPrimitive';
import { QueuePrimitive } from './primitives/QueuePrimitive';
import { MousePointerClick } from 'lucide-react';

export function UniversalCanvas() {
  const {
    nodes,
    pointers,
    structures,
    pan,
    setPan,
    zoom,
    setZoom,
    activeTool,
    setActiveTool,
    clearSelection,
    dispatch,
    transientReturn,
  } = useUniversalStore();

  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const downPosRef = useRef({ x: 0, y: 0 });

  // Native wheel listener for smooth cursor-centered zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const currentZoom = useUniversalStore.getState().zoom;
      const currentPan = useUniversalStore.getState().pan;

      const newZoom = Math.max(0.4, Math.min(2.0, currentZoom * factor));
      const canvasX = (mouseX - currentPan.x) / currentZoom;
      const canvasY = (mouseY - currentPan.y) / currentZoom;

      const newPanX = mouseX - canvasX * newZoom;
      const newPanY = mouseY - canvasY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoom, setPan]);

  // Spacebar pan listener
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;

    downPosRef.current = { x: e.clientX, y: e.clientY };

    const shouldPan = e.button === 1 || isSpacePressed || activeTool === 'select';
    if (shouldPan) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };

      const handleMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - panStartRef.current.x;
        const dy = moveEvent.clientY - panStartRef.current.y;
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      };

      const handleMouseUp = (upEvent) => {
        setIsPanning(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        const dist = Math.hypot(upEvent.clientX - downPosRef.current.x, upEvent.clientY - downPosRef.current.y);
        if (dist < 5) {
          if (activeTool !== 'select') {
            const rect = containerRef.current.getBoundingClientRect();
            const canvasX = (upEvent.clientX - rect.left - pan.x) / zoom;
            const canvasY = (upEvent.clientY - rect.top - pan.y) / zoom;

            handlePlaceTool(activeTool, { x: canvasX, y: canvasY });
            if (!upEvent.shiftKey) {
              setActiveTool('select');
            }
          } else {
            clearSelection();
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    } else {
      // Non-pan click in active placement mode
      const handleMouseUp = (upEvent) => {
        window.removeEventListener('mouseup', handleMouseUp);
        const dist = Math.hypot(upEvent.clientX - downPosRef.current.x, upEvent.clientY - downPosRef.current.y);
        if (dist < 5 && activeTool !== 'select') {
          const rect = containerRef.current.getBoundingClientRect();
          const canvasX = (upEvent.clientX - rect.left - pan.x) / zoom;
          const canvasY = (upEvent.clientY - rect.top - pan.y) / zoom;
          handlePlaceTool(activeTool, { x: canvasX, y: canvasY });
          if (!upEvent.shiftKey) {
            setActiveTool('select');
          }
        }
      };
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }
  };

  const handlePlaceTool = (tool, pos) => {
    if (tool === 'create_node') {
      dispatch({ type: 'node.create', pos: { x: pos.x - 28, y: pos.y - 28 } });
    } else if (tool === 'create_array') {
      dispatch({ type: 'array.create', pos: { x: pos.x - 100, y: pos.y - 26 } });
    } else if (tool === 'create_stack') {
      dispatch({ type: 'stack.create', pos: { x: pos.x - 30, y: pos.y - 60 } });
    } else if (tool === 'create_queue') {
      dispatch({ type: 'queue.create', pos: { x: pos.x - 100, y: pos.y - 26 } });
    } else if (tool.startsWith('pointer_')) {
      const ptrName = tool.replace('pointer_', '');
      dispatch({ type: 'pointer.create', name: ptrName, pos: { x: pos.x, y: pos.y } });
    }
  };

  const nodeList = Object.values(nodes);
  const pointerList = Object.values(pointers);
  const structList = Object.values(structures);
  const isEmpty = nodeList.length === 0 && pointerList.length === 0 && structList.length === 0;

  let cursorClass = 'cursor-default';
  if (isPanning) cursorClass = 'cursor-grabbing';
  else if (isSpacePressed) cursorClass = 'cursor-grab';
  else if (activeTool !== 'select') cursorClass = 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className={`relative w-full h-full overflow-hidden select-none bg-[#0a0a0b] transition-colors ${cursorClass}`}
      style={{
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1.2px, transparent 1.2px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* ── TRANSIENT RETURN VALUE TOOLTIP (Fades after 2s) ─────── */}
      {transientReturn && (
        <div
          style={{
            position: 'absolute',
            left: `${pan.x + transientReturn.position.x * zoom}px`,
            top: `${pan.y + transientReturn.position.y * zoom}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="px-3 py-1 rounded-full bg-[#18181b]/95 border border-emerald-500/60 text-emerald-400 font-mono font-bold text-xs shadow-2xl backdrop-blur-md z-40 animate-in fade-in slide-in-from-bottom-2 pointer-events-none"
        >
          Return: {String(transientReturn.value)}
        </div>
      )}

      {/* ── ACTIVE TOOL FLOATING HINT ────────────────────────────── */}
      {activeTool !== 'select' && (
        <div className="absolute top-4 right-6 z-10 px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/40 backdrop-blur-md font-mono text-2xs font-bold text-[#10b981] shadow-lg animate-in fade-in pointer-events-none">
          Click canvas to place • Shift+Click for multiple • Esc to cancel
        </div>
      )}

      {/* ── EMPTY CANVAS ONBOARDING NOTICE ───────────────────────── */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono text-center p-6 text-text-muted opacity-80">
          <div className="p-3 rounded-2xl bg-[#141416]/80 border border-white/10 shadow-md mb-3 flex items-center justify-center">
            <MousePointerClick size={24} className="text-[#10b981] animate-bounce" />
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Canvas is Empty</h2>
          <p className="text-xs max-w-sm leading-relaxed text-text-muted">
            Pick a structure below, then use Create to place something.
          </p>
        </div>
      )}

      {/* ── INFINITE WORKSPACE PLANE ─────────────────────────────── */}
      <div
        className="absolute inset-0 origin-top-left will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
        }}
      >
        <div className="relative w-full h-full pointer-events-auto">
          {/* SVG Connector layer for all arrows and stubs */}
          <SvgConnectorLayer />

          {/* Individual standalone Linked Nodes */}
          {nodeList.map((node) => (
            <LinkedNodePrimitive key={node.id} node={node} />
          ))}

          {/* Pointer tags */}
          {pointerList.map((ptr) => (
            <PointerTag key={ptr.id} pointer={ptr} />
          ))}

          {/* Array, Stack, Queue structures without enclosing frames */}
          {structList.map((struct) => {
            if (struct.type === 'array') {
              return <ArrayPrimitive key={struct.id} struct={struct} />;
            }
            if (struct.type === 'stack') {
              return <StackPrimitive key={struct.id} struct={struct} />;
            }
            if (struct.type === 'queue') {
              return <QueuePrimitive key={struct.id} struct={struct} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
