import React, { useRef, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { X } from 'lucide-react';

export const NULL_WIDTH = 100;
export const NULL_HEIGHT = 44;

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

    // If currently in click-to-connect mode, clicking NULL completes the connection to this specific NULL token!
    if (connectingSource) {
      if (connectingSource.sourceType === 'socket') {
        connectSocket(connectingSource.sourceId, connectingSource.socketType, nullToken.id);
      } else if (connectingSource.sourceType === 'pointer') {
        setPointerTarget(connectingSource.sourceId, nullToken.id);
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
      title={isConnecting ? 'Click to connect to this NULL terminator' : 'NULL Terminator (drag or connect here)'}
    >
      {/* Solid Rectangle Box for NULL Token (Size scaled up for comfortable grabbing) */}
      <div
        className={`relative flex items-center justify-between px-5 py-2.5 rounded-xl bg-[#18181B] border-2 border-dashed shadow-xl font-mono font-black text-sm text-white transition-all ${
          isConnecting
            ? 'border-emerald-400 cursor-pointer scale-105'
            : 'border-white/25 hover:border-white/50 hover:scale-105'
        }`}
      >
        <span className="tracking-widest">NULL</span>

        {/* Delete NULL Token Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNullToken(nullToken.id);
          }}
          className="opacity-0 group-hover:opacity-100 ml-2.5 p-1 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
          title="Delete NULL token"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
