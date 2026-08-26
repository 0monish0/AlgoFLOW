import React, { useState, useRef } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { X, AlertTriangle, ArrowUp } from 'lucide-react';
import { CONNECTED_COLOR } from '../core/graphModel';

export const NODE_RADIUS = 46;
export const NODE_DIAMETER = 92;

export const NodePrimitive = ({ node, isHighlighted = false }) => {
  const {
    updateNodeData,
    updateNodePosition,
    setNodeType,
    deleteNode,
    setActiveWire,
    connectSocket,
    disconnectSocket,
    setPointerTarget,
    deleteFreePointer,
    connectingSource,
    setConnectingSource,
    highlightedNodeId,
    evaluation,
    freePointers,
    activePointerId,
    setActivePointerId,
  } = useSandboxStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const isReachable = evaluation.reachableNodeIds.has(node.id);
  const isLeaking = node.status === 'leaking';
  const isTraversed = highlightedNodeId === node.id;

  const isDoubly = node.nodeType === 'doubly';
  const hasNext = node.sockets && node.sockets.next !== undefined;
  const hasPrev = isDoubly && node.sockets && node.sockets.prev !== undefined;

  const isNextConnected = Boolean(node.sockets?.next?.targetId);
  const isPrevConnected = Boolean(isDoubly && node.sockets?.prev?.targetId);

  const isConnectingFromSelf = connectingSource && connectingSource.sourceId === node.id;
  const isTargetForConnecting = connectingSource && connectingSource.sourceId !== node.id;

  // Attached traversal pointers targeting this node (EXCLUDING 'head' which uses link wire)
  const attachedPointers = Object.values(freePointers || {}).filter(
    (ptr) => ptr && ptr.targetId === node.id && ptr.label.toLowerCase() !== 'head'
  );

  // Dragging Node
  const handleMouseDown = (e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'SELECT' ||
      e.target.closest('.socket-handle') ||
      e.target.closest('.pointer-icon-badge') ||
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
      let candidateX = Math.round(dragStartRef.current.nodeX + dx);
      let candidateY = Math.round(dragStartRef.current.nodeY + dy);

      // Prevent overlapping with all other nodes (minimum center-to-center distance)
      const MIN_DIST = 104;
      const { nodes: allNodes } = useSandboxStore.getState();

      for (let iter = 0; iter < 3; iter++) {
        Object.values(allNodes || {}).forEach((other) => {
          if (!other || other.id === node.id || !other.position) return;
          const diffX = candidateX - other.position.x;
          const diffY = candidateY - other.position.y;
          const dist = Math.hypot(diffX, diffY);
          if (dist < MIN_DIST) {
            if (dist === 0) {
              candidateX = other.position.x + MIN_DIST;
            } else {
              const factor = MIN_DIST / dist;
              candidateX = other.position.x + diffX * factor;
              candidateY = other.position.y + diffY * factor;
            }
          }
        });
      }

      updateNodePosition(node.id, {
        x: Math.round(candidateX),
        y: Math.round(candidateY),
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

    let startX = node.position.x + NODE_DIAMETER;
    let startY = node.position.y + NODE_RADIUS;

    if (socketType === 'prev') {
      startX = node.position.x;
      startY = node.position.y + NODE_RADIUS;
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
        // If clicking on an already-connected socket, clicking unlinks it!
        const isConnected = socketType === 'prev' ? isPrevConnected : isNextConnected;
        if (isConnected) {
          disconnectSocket(node.id, socketType);
          return;
        }

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

      const { nodes: allNodes, nullTokens: allNulls } = useSandboxStore.getState();

      // 1. Check drop near any NULL token (generous snap threshold)
      let matchedNull = false;
      Object.values(allNulls || {}).forEach((nullTok) => {
        if (!nullTok.position) return;
        const dist = Math.hypot(dropCanvasX - (nullTok.position.x + 50), dropCanvasY - (nullTok.position.y + 22));
        if (dist < 80) {
          connectSocket(node.id, socketType, nullTok.id);
          matchedNull = true;
        }
      });

      if (!matchedNull) {
        // 2. Check drop near any target node
        let matchedNode = false;
        Object.values(allNodes).forEach((targetNode) => {
          if (!targetNode.position) return;
          const dist = Math.hypot(
            dropCanvasX - (targetNode.position.x + NODE_RADIUS),
            dropCanvasY - (targetNode.position.y + NODE_RADIUS)
          );
          if (dist < 75) {
            connectSocket(node.id, socketType, targetNode.id);
            matchedNode = true;
          }
        });

        if (!matchedNode) {
          // Releasing on empty canvas unlinks the socket
          disconnectSocket(node.id, socketType);
        }
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

  // Node Color:
  // - If connected in list chain: CONNECTED_COLOR (#10B981) with crisp black text
  // - If unattached / isolated: node.color with white text
  const solidBgColor = isReachable ? CONNECTED_COLOR : (node.color || '#0284C7');
  const textColor = isReachable ? '#000000' : '#FFFFFF';

  return (
    <div
      data-node-id={node.id}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0px) scale(${isDeleting ? 0.2 : 1})`,
        opacity: isDeleting ? 0 : isLeaking ? 0.5 : 1,
        transition: isDeleting
          ? 'transform 160ms cubic-bezier(0.4, 0, 0.2, 1), opacity 160ms ease-out'
          : 'none',
      }}
      className="absolute select-none font-mono cursor-grab active:cursor-grabbing z-20 group will-change-transform"
    >
      {/* Leak status indicator badge */}
      {isLeaking && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-3xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm">
            <AlertTriangle size={11} />
            <span>leaking</span>
          </span>
        </div>
      )}

      {/* Floating Delete Button at top right */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-40 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-150 cursor-pointer"
        title="Delete node"
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      {/* Circular Node Body (w-[92px] h-[92px] - scaled up for effortless dragging and interaction) */}
      <div
        className={`relative w-[92px] h-[92px] rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-200 border-2 border-white/20 ${
          isDoubly ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-[#080808]' : ''
        } ${
          isTraversed || isHighlighted
            ? 'ring-4 ring-white scale-105 animate-pulse'
            : isConnectingFromSelf
            ? 'ring-4 ring-white'
            : isTargetForConnecting
            ? 'ring-2 ring-white/60 hover:scale-105 cursor-pointer'
            : 'hover:scale-102'
        }`}
        style={{
          backgroundColor: solidBgColor,
          boxShadow: isReachable
            ? '0 0 16px rgba(16, 185, 129, 0.45), 0 2px 8px rgba(0, 0, 0, 0.5)'
            : `0 0 12px ${solidBgColor}35, 0 2px 6px rgba(0, 0, 0, 0.4)`,
        }}
      >
        {/* Top: Bold, Direct Singly / Doubly Label */}
        <button
          onClick={() => setNodeType(node.id, node.nodeType === 'doubly' ? 'singly' : 'doubly')}
          className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer select-none transition-transform whitespace-nowrap leading-none hover:scale-110"
          style={{ color: textColor }}
          title={`Click to toggle: Currently ${isDoubly ? 'Doubly Linked' : 'Singly Linked'}`}
        >
          {isDoubly ? 'DOUBLY' : 'SINGLY'}
        </button>

        {/* Node Payload Center Value */}
        <div className="pt-2.5">
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
              className="w-14 text-center bg-black/25 font-black text-base border-b-2 border-black outline-none font-mono py-0.5 rounded"
              style={{ color: textColor }}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg sm:text-xl font-black tracking-tight hover:scale-110 transition-transform font-mono drop-shadow-sm px-1.5 py-0.5 rounded"
              style={{ color: textColor }}
              title="Click to edit value"
            >
              {node.data}
            </button>
          )}
        </div>

        {/* Left Inbound Prev Socket Handle (ONLY IF DOUBLY LINKED) */}
        {hasPrev && (
          <div
            onMouseDown={(e) => handleSocketDragStart(e, 'prev')}
            title={isPrevConnected ? 'Prev connected: Click to unlink or drag' : 'Prev socket: Drag to connect'}
            className={`socket-handle absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#121212] border-2 ${
              isPrevConnected ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/40' : 'border-white'
            } flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform z-30 shadow-md`}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}

        {/* Right Outbound Next Socket Handle */}
        {hasNext && (
          <div
            onMouseDown={(e) => handleSocketDragStart(e, 'next')}
            title={isNextConnected ? 'Next connected: Click to unlink or drag' : 'Next socket: Drag to connect'}
            className={`socket-handle absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#121212] border-2 ${
              isNextConnected
                ? 'border-accent bg-accent/20 ring-2 ring-accent/40'
                : isConnectingFromSelf
                ? 'border-white ring-2 ring-white'
                : 'border-white'
            } flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform z-30 shadow-md`}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>

      {/* Traversal Pointer Logos Attached Directly Underneath Node */}
      {attachedPointers.length > 0 && (
        <div className="absolute top-[96px] left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
          {attachedPointers.map((ptr) => {
            const isSelected = activePointerId === ptr.id;
            const pointerColor = isSelected ? '#FFFFFF' : CONNECTED_COLOR;

            return (
              <div
                key={ptr.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePointerId(isSelected ? null : ptr.id);
                }}
                className="pointer-icon-badge relative flex flex-col items-center cursor-pointer group hover:scale-115 transition-transform"
                title={`Pointer "${ptr.label}" targeting node ${node.data}`}
              >
                {/* Small Red Circular Cross Delete Button on Hover / Active */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFreePointer(ptr.id);
                    setActivePointerId(null);
                  }}
                  className="absolute -top-1.5 -right-2 z-40 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-150 cursor-pointer"
                  title={`Delete pointer ${ptr.label}`}
                >
                  <X size={9} strokeWidth={3} />
                </button>

                {/* Crisp Upward-Pointing Arrow */}
                <ArrowUp
                  size={16}
                  strokeWidth={3}
                  className="transition-transform group-hover:-translate-y-0.5"
                  style={{ color: pointerColor }}
                />
                {/* Clean Pointer Label */}
                <span
                  className="text-xs font-mono font-black tracking-tight leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] px-1 py-0.5 rounded"
                  style={{ color: pointerColor }}
                >
                  {ptr.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
