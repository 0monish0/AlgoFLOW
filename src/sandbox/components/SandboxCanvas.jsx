import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { SvgConnectorLayer } from './SvgConnectorLayer';
import { NodePrimitive } from './NodePrimitive';
import { PointerPrimitive } from './PointerPrimitive';
import { EdgeTraversalPopup } from './EdgeTraversalPopup';
import { ToolbarPalette } from './ToolbarPalette';
import { AlertCircle, RefreshCw, X, Link2, MousePointerClick } from 'lucide-react';

export const SandboxCanvas = ({ highlightedNodeId }) => {
  const {
    nodes,
    freePointers,
    evaluation,
    pan,
    setPan,
    zoom,
    setZoom,
    connectingSource,
    setConnectingSource,
    setSelectedEdge,
  } = useSandboxStore();

  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Canvas Pan & Selection Clearing
  const handleCanvasMouseDown = (e) => {
    if (
      e.target.closest('[data-node-id]') ||
      e.target.closest('[data-pointer-id]') ||
      e.target.closest('.socket-handle') ||
      e.target.closest('button') ||
      e.target.closest('.interactive-panel')
    ) {
      return;
    }

    // Dismiss edge traversal popup or connecting mode on empty canvas click
    setSelectedEdge(null);
    if (connectingSource) {
      setConnectingSource(null);
      return;
    }

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

    const handleMouseUp = () => {
      setIsPanning(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  // Canvas Wheel Zoom Handler
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom(zoom + delta);
    }
  };

  const totalNodes = Object.keys(nodes).length;
  const reachableCount = evaluation.reachableNodeIds.size;
  const orphanedCount = evaluation.orphanedNodeIds.size;
  const unattachedCount = evaluation.unattachedNodeIds.size;
  const totalPointers = Object.keys(freePointers).length;
  const isEmpty = totalNodes === 0 && totalPointers === 0;

  return (
    <div
      id="sandbox-canvas-viewport"
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none bg-[#F9F7F1] dark:bg-[#070D16] transition-colors ${
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Left Engineering HUD: Telemetry & Violations */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none">
        {/* Telemetry Bar */}
        {totalNodes > 0 && (
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-surface/90 backdrop-blur-md border border-border text-xs font-mono font-bold shadow-md pointer-events-auto">
            <span>Nodes: <strong className="text-primary">{totalNodes}</strong></span>
            <span className="text-border">|</span>
            <span className="text-sage-accent">Reachable: <strong>{reachableCount}</strong></span>
            {unattachedCount > 0 && (
              <>
                <span className="text-border">|</span>
                <span className="text-text-muted">Unattached: <strong>{unattachedCount}</strong></span>
              </>
            )}
            {orphanedCount > 0 && (
              <>
                <span className="text-border">|</span>
                <span className="text-amber-accent">Leaking: <strong>{orphanedCount}</strong></span>
              </>
            )}
          </div>
        )}

        {/* Violations */}
        {evaluation.violations.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-accent/15 border border-amber-accent/40 text-amber-accent text-xs font-mono font-bold shadow-sm backdrop-blur-md animate-in fade-in duration-150"
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{v.message}</span>
          </div>
        ))}

        {/* Live Cycle Detection Banner */}
        {evaluation.hasCycle && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage-accent/15 border border-sage-accent/40 text-sage-accent text-xs font-mono font-bold shadow-sm backdrop-blur-md">
            <RefreshCw size={14} className="animate-spin" />
            <span>Cycle Active: Pointer loop detected</span>
          </div>
        )}
      </div>

      {/* Empty State Onboarding Hint */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono text-center p-6 text-text-muted opacity-80">
          <div className="p-3 rounded-2xl bg-surface/80 border border-border/80 shadow-md mb-3 flex items-center justify-center">
            <MousePointerClick size={24} className="text-accent animate-bounce" />
          </div>
          <h2 className="text-sm font-bold text-primary mb-1">Canvas is Empty</h2>
          <p className="text-xs max-w-sm leading-relaxed text-text-muted">
            Click <strong>+ New Node</strong> or <strong>+ New Pointer</strong> below to begin constructing your linked list from scratch.
          </p>
        </div>
      )}

      {/* Active Connecting Mode Toast */}
      {connectingSource && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] border border-accent text-xs font-mono font-bold shadow-xl animate-in fade-in">
          <Link2 size={14} className="animate-pulse text-accent" />
          <span>Click any target Node to connect</span>
          <button
            onClick={() => setConnectingSource(null)}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-black/20 text-xs flex items-center gap-1 border border-current"
            title="Cancel connection"
          >
            <X size={12} />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Pannable & Zoomable Workspace Matrix */}
      <div
        className="absolute inset-0 w-full h-full origin-top-left will-change-transform"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
        }}
      >
        {/* Dynamic Live SVG Pointer Connectors Layer */}
        <SvgConnectorLayer />

        {/* Free Floating Pointers Layer */}
        {Object.values(freePointers).map((pointer) => (
          <PointerPrimitive key={pointer.id} pointer={pointer} />
        ))}

        {/* Nodes Layer (SHARP CORNERS ONLY ON NODES) */}
        {Object.values(nodes).map((node) => (
          <NodePrimitive
            key={node.id}
            node={node}
            isHighlighted={highlightedNodeId === node.id}
          />
        ))}

        {/* Selected Edge Traversal Popup */}
        <EdgeTraversalPopup />
      </div>

      {/* Floating Bottom Toolbar Palette */}
      <ToolbarPalette />
    </div>
  );
};
