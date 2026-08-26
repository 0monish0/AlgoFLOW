import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { SvgConnectorLayer } from './SvgConnectorLayer';
import { NodePrimitive } from './NodePrimitive';
import { PointerPrimitive } from './PointerPrimitive';
import { NullToken } from './NullToken';
import { EdgeTraversalPopup } from './EdgeTraversalPopup';
import { PointerControllerHud } from './PointerControllerHud';
import { ToolbarPalette } from './ToolbarPalette';
import { AlertCircle, RefreshCw, X, Link2, MousePointerClick } from 'lucide-react';

export const SandboxCanvas = ({ highlightedNodeId }) => {
  const {
    nodes,
    freePointers,
    nullTokens,
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
      e.target.closest('[data-null-id]') ||
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
  const totalNulls = Object.keys(nullTokens || {}).length;
  const isEmpty = totalNodes === 0 && totalPointers === 0 && totalNulls === 0;

  return (
    <div
      id="sandbox-canvas-viewport"
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none bg-[#F9F7F1] dark:bg-[#080808] transition-colors ${
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Left Engineering HUD: Telemetry & Violations (Shifted well below navbar) */}
      <div className="absolute top-20 left-6 sm:left-8 z-30 flex flex-col gap-2 max-w-md pointer-events-none">
        {/* Telemetry Bar */}
        {totalNodes > 0 && (
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#141414]/90 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white shadow-lg pointer-events-auto">
            <span>Nodes: <strong className="text-white">{totalNodes}</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400">Reachable: <strong>{reachableCount}</strong></span>
            {unattachedCount > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-text-muted">Unattached: <strong>{unattachedCount}</strong></span>
              </>
            )}
            {orphanedCount > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-amber-400">Leaking: <strong>{orphanedCount}</strong></span>
              </>
            )}
          </div>
        )}

        {/* Violations */}
        {evaluation.violations.map((v) => (
          <div
            key={v.id}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold shadow-lg animate-in fade-in duration-150 pointer-events-auto ${
              v.severity === 'info'
                ? 'bg-[#FDFBF7] border-emerald-300 text-emerald-800'
                : 'bg-[#FDFBF7] border-amber-300 text-amber-900'
            }`}
          >
            <AlertCircle size={14} className={v.severity === 'info' ? 'text-emerald-600 shrink-0' : 'text-amber-600 shrink-0'} />
            <span>{v.message}</span>
          </div>
        ))}

        {/* Live Cycle Detection Banner */}
        {evaluation.hasCycle && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDFBF7] border border-emerald-300 text-emerald-900 text-xs font-mono font-bold shadow-lg animate-in fade-in pointer-events-auto">
            <RefreshCw size={14} className="animate-spin text-emerald-600 shrink-0" />
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
            Click <strong>+ New Node</strong> or <strong>+ Head</strong> below to begin constructing your linked list.
          </p>
        </div>
      )}

      {/* Active Connecting Mode Toast - Floating Capsule below Navbar */}
      {connectingSource && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-[#18181B]/95 backdrop-blur-xl border border-accent/40 text-xs font-mono font-bold text-white shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
          <Link2 size={14} className="animate-pulse text-accent shrink-0" />
          <span>Click any target Node or NULL to complete connection</span>
          <button
            onClick={() => setConnectingSource(null)}
            className="px-2 py-0.5 rounded-full hover:bg-white/10 text-xs flex items-center gap-1 text-text-muted hover:text-white border border-white/20 transition-colors"
            title="Cancel connection"
          >
            <X size={11} />
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

        {/* NULL Tokens Layer */}
        {Object.values(nullTokens || {}).map((nullToken) => (
          <NullToken key={nullToken.id} nullToken={nullToken} />
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

      {/* Game-like Pointer Controller HUD */}
      <PointerControllerHud />

      {/* Floating Bottom Toolbar Palette */}
      <ToolbarPalette />
    </div>
  );
};
