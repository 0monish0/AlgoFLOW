import React, { useState, useRef } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { X, AlertTriangle, ChevronDown } from 'lucide-react';

export const NodePrimitive = ({ node, isHighlighted = false }) => {
  const {
    updateNodeData,
    updateNodePosition,
    setNodeType,
    deleteNode,
    setActiveWire,
    connectSocket,
    setPointerTarget,
    connectingSource,
    setConnectingSource,
    highlightedNodeId,
    evaluation,
  } = useSandboxStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const isReachable = evaluation.reachableNodeIds.has(node.id);
  const isOrphaned = evaluation.orphanedNodeIds.has(node.id);
  const isLeaking = node.status === 'leaking';
  const isUnattached = node.status === 'unattached';
  const isTraversed = highlightedNodeId === node.id;

  const isDoubly = node.nodeType === 'doubly';
  const hasNext = node.sockets && node.sockets.next !== undefined;
  const hasPrev = isDoubly && node.sockets && node.sockets.prev !== undefined;

  const isConnectingFromSelf = connectingSource && connectingSource.sourceId === node.id;
  const isTargetForConnecting = connectingSource && connectingSource.sourceId !== node.id;

  // Zero-delay Node Dragging Handler
  const handleMouseDown = (e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'SELECT' ||
      e.target.closest('.socket-handle') ||
      e.target.closest('button')
    ) {
      return;
    }
    e.stopPropagation();

    // If currently in click-to-connect mode and clicked on this node, connect!
    if (isTargetForConnecting) {
      if (connectingSource.sourceType === 'socket') {
        connectSocket(connectingSource.sourceId, connectingSource.socketType, node.id);
      } else if (connectingSource.sourceType === 'pointer') {
        setPointerTarget(connectingSource.sourceId, node.id);
      }
      return;
    }

    setIsDragging(true);
    const { zoom } = useSandboxStore.getState();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - dragStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / zoom;
      updateNodePosition(node.id, {
        x: Math.round(dragStartRef.current.nodeX + dx),
        y: Math.round(dragStartRef.current.nodeY + dy),
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

  // Socket Wire Dragging Start
  const handleSocketDragStart = (e, socketType) => {
    e.stopPropagation();
    e.preventDefault();

    const NODE_WIDTH = 136;
    const HALF_HEIGHT = 28;

    let startX = node.position.x + NODE_WIDTH;
    let startY = node.position.y + HALF_HEIGHT;

    if (socketType === 'prev') {
      startX = node.position.x;
      startY = node.position.y + HALF_HEIGHT;
    }

    const canvasEl = document.getElementById('sandbox-canvas-viewport');
    const canvasRect = canvasEl ? canvasEl.getBoundingClientRect() : { left: 0, top: 0 };

    setActiveWire({
      sourceId: node.id,
      sourceType: 'socket',
      socketType,
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
        sourceId: node.id,
        sourceType: 'socket',
        socketType,
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
          setConnectingSource({ sourceId: node.id, sourceType: 'socket', socketType });
        }
        return;
      }

      const currentZoom = useSandboxStore.getState().zoom;
      const currentPan = useSandboxStore.getState().pan;
      const dropCanvasX = (upEvent.clientX - canvasRect.left - currentPan.x) / currentZoom;
      const dropCanvasY = (upEvent.clientY - canvasRect.top - currentPan.y) / currentZoom;

      const { nodes: allNodes } = useSandboxStore.getState();

      let matchedNode = false;
      Object.values(allNodes).forEach((targetNode) => {
        if (!targetNode.position) return;
        const dist = Math.hypot(dropCanvasX - (targetNode.position.x + 68), dropCanvasY - (targetNode.position.y + 28));
        if (dist < 95) {
          connectSocket(node.id, socketType, targetNode.id);
          matchedNode = true;
        }
      });

      if (!matchedNode) {
        // Disconnect or unhook pointer on drop to empty space
        connectSocket(node.id, socketType, null);
      }

      setActiveWire(null);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp, { once: true });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      deleteNode(node.id);
    }, 160);
  };

  // State-driven border styling and tags (Unattached, Reachable, Leaking)
  let borderStyle = 'border-2 border-border';
  let badge = null;

  if (isTraversed) {
    borderStyle = 'border-2 border-accent ring-4 ring-accent/50 animate-pulse';
  } else if (isHighlighted) {
    borderStyle = 'border-2 border-accent ring-2 ring-accent/40 animate-pulse';
  } else if (isConnectingFromSelf) {
    borderStyle = 'border-2 border-accent ring-2 ring-accent';
  } else if (isTargetForConnecting) {
    borderStyle = 'border-2 border-accent hover:ring-2 hover:ring-accent/40 cursor-pointer';
  } else if (isLeaking) {
    borderStyle = 'border-2 border-amber-accent/90 border-dashed';
    badge = (
      <div className="absolute -top-6 left-0 right-0 flex justify-center pointer-events-none">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-3xs font-mono font-bold bg-amber-accent/20 text-amber-accent border border-amber-accent/40">
          <AlertTriangle size={10} />
          <span>unreachable (leaking)</span>
        </span>
      </div>
    );
  } else if (isUnattached) {
    // Calm, low-emphasis dashed border in default color
    borderStyle = 'border-2 border-dashed border-border/80';
  }

  return (
    <div
      data-node-id={node.id}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0px) scale(${isDeleting ? 0.2 : 1}) rotate(${isDeleting ? '10deg' : '0deg'})`,
        opacity: isDeleting ? 0 : isLeaking ? 0.45 : 1,
        transition: isDeleting
          ? 'transform 160ms cubic-bezier(0.4, 0, 0.2, 1), opacity 160ms ease-out'
          : 'none',
      }}
      className="absolute select-none font-mono cursor-grab active:cursor-grabbing z-20 group will-change-transform"
    >
      {/* Leak status indicator badge */}
      {badge}

      {/* Floating Delete Button at top right corner */}
      <button
        onClick={handleDelete}
        className="absolute -top-2.5 -right-2.5 z-40 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-150 cursor-pointer"
        title="Delete node"
      >
        <X size={11} strokeWidth={3} />
      </button>

      {/* Main Node Body (SHARP CORNERS ONLY ON NODE BODY) */}
      <div
        className={`relative flex flex-col justify-between min-w-[136px] h-[56px] bg-surface rounded-none ${borderStyle} shadow-md overflow-visible p-1`}
      >
        {/* Top bar on node: Type dropdown (Singly / Doubly) */}
        <div className="flex items-center justify-between px-1 text-3xs text-text-muted">
          <select
            value={node.nodeType || 'singly'}
            onChange={(e) => setNodeType(node.id, e.target.value)}
            className="bg-transparent text-text-muted hover:text-text font-bold text-3xs outline-none cursor-pointer"
          >
            <option value="singly">Singly</option>
            <option value="doubly">Doubly</option>
          </select>

          {isUnattached && (
            <span className="text-3xs text-text-muted/70">(unattached)</span>
          )}
        </div>

        {/* Left Inbound & Prev Socket (if Doubly) */}
        {hasPrev && (
          <div
            onMouseDown={(e) => handleSocketDragStart(e, 'prev')}
            title="Prev socket (drag or click to connect)"
            className="socket-handle absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-surface border-2 border-sage-accent flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform z-30 shadow-xs"
          >
            <div className="w-1.5 h-1.5 bg-sage-accent" />
          </div>
        )}

        {/* Node Payload Center Data */}
        <div className="flex-1 flex items-center justify-center px-3">
          {isEditing ? (
            <input
              type="text"
              value={node.data}
              onChange={(e) => updateNodeData(node.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              className="w-16 text-center bg-base text-text font-bold text-sm border border-accent outline-none font-mono py-0.5"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-extrabold text-primary hover:text-accent tracking-tight transition-colors font-mono"
              title="Click to edit value"
            >
              {node.data}
            </button>
          )}
        </div>

        {/* Right Outbound Next Socket */}
        {hasNext && (
          <div
            onMouseDown={(e) => handleSocketDragStart(e, 'next')}
            title="Next socket (drag or click to connect)"
            className={`socket-handle absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-surface border-2 ${
              isConnectingFromSelf ? 'border-accent bg-accent/20 ring-2 ring-accent' : 'border-accent'
            } flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform z-30 shadow-xs`}
          >
            <div className="w-1.5 h-1.5 bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
};
