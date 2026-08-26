import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { X } from 'lucide-react';

export const NullToken = ({ nullToken }) => {
  const {
    updateNullPosition,
    deleteNullToken,
    connectingSource,
    connectSocket,
    setPointerTarget,
  } = useSandboxStore();

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, tokenX: 0, tokenY: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    e.stopPropagation();

    // If currently in click-to-connect mode, clicking NULL completes the connection!
    if (connectingSource) {
      if (connectingSource.sourceType === 'socket') {
        connectSocket(connectingSource.sourceId, connectingSource.socketType, 'NULL');
      } else if (connectingSource.sourceType === 'pointer') {
        setPointerTarget(connectingSource.sourceId, 'NULL');
      }
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

  const isConnecting = Boolean(connectingSource);

  return (
    <div
      data-null-id={nullToken.id}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${nullToken.position.x}px, ${nullToken.position.y}px, 0px)`,
      }}
      className="absolute select-none font-mono cursor-grab active:cursor-grabbing z-20 group will-change-transform"
      title={isConnecting ? 'Click to connect to NULL' : 'NULL Terminator (drag pointer here)'}
    >
      {/* Solid Rectangle Box for NULL Token (Matching #18181B) */}
      <div
        className={`relative flex items-center justify-between px-3.5 py-1.5 rounded-md bg-[#18181B] border border-dashed shadow-xl font-mono font-black text-xs text-white transition-all ${
          isConnecting
            ? 'border-emerald-400 ring-2 ring-emerald-400/40 cursor-pointer animate-pulse'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        <span>NULL</span>

        {/* Delete NULL Token Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNullToken(nullToken.id);
          }}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-text-muted hover:text-red-400 rounded-xs transition-opacity"
          title="Delete NULL token"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
};
