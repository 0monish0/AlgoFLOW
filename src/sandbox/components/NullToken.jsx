import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';

export const NullToken = ({ nullToken }) => {
  const { updateNullPosition, connectingSocket, connectSocket } = useSandboxStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, tokenX: 0, tokenY: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();

    // If currently in click-to-connect mode, clicking NULL connects the active socket to NULL!
    if (connectingSocket) {
      connectSocket(connectingSocket.sourceNodeId, connectingSocket.socketType, 'NULL');
      return;
    }

    setIsDragging(true);
    const { zoom } = useSandboxStore.getState();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tokenX: nullToken.position.x,
      tokenY: nullToken.position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - dragStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / zoom;
      updateNullPosition(nullToken.id, {
        x: Math.round(dragStartRef.current.tokenX + dx),
        y: Math.round(dragStartRef.current.tokenY + dy),
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

  const isConnecting = Boolean(connectingSocket);

  return (
    <div
      data-null-id={nullToken.id}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${nullToken.position.x}px, ${nullToken.position.y}px, 0px)`,
      }}
      className="absolute select-none font-mono cursor-grab active:cursor-grabbing z-20 will-change-transform"
      title={isConnecting ? 'Click to connect pointer to NULL' : 'NULL Terminator (drop outgoing pointer here)'}
    >
      <div
        className={`px-3.5 py-1.5 rounded-lg border-2 border-dashed font-mono font-bold text-xs shadow-2xs transition-all ${
          isConnecting
            ? 'border-accent bg-accent/20 text-text ring-2 ring-accent/40 cursor-pointer animate-pulse'
            : 'border-border bg-base/50 text-text-muted hover:border-accent hover:text-text'
        }`}
      >
        NULL
      </div>
    </div>
  );
};
