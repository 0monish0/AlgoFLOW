import React from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { ArrowRight, ArrowLeft, Unlink, X } from 'lucide-react';

export const EdgeTraversalPopup = () => {
  const {
    selectedEdge,
    setSelectedEdge,
    followEdge,
    disconnectSocket,
    setPointerTarget,
    nodes,
  } = useSandboxStore();

  if (!selectedEdge) return null;

  const { sourceId, sourceType, socketType, targetId, x, y } = selectedEdge;
  const sourceNode = sourceType === 'socket' ? nodes[sourceId] : null;
  const isDoubly = sourceNode?.nodeType === 'doubly';

  const handleDisconnect = () => {
    if (sourceType === 'socket') {
      disconnectSocket(sourceId, socketType);
    } else if (sourceType === 'pointer') {
      setPointerTarget(sourceId, null);
    }
    setSelectedEdge(null);
  };

  const handleFollowNext = () => {
    followEdge(targetId);
  };

  const handleFollowPrev = () => {
    if (sourceNode?.sockets?.prev?.targetId) {
      followEdge(sourceNode.sockets.prev.targetId);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -120%)',
      }}
      className="absolute z-50 flex items-center gap-1.5 p-1.5 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-2xl font-mono text-xs select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* If Doubly Linked: Show Both Forward and Prev Traversal Controls */}
      {isDoubly && sourceType === 'socket' ? (
        <>
          {sourceNode?.sockets?.prev?.targetId && (
            <button
              onClick={handleFollowPrev}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-base hover:bg-accent/15 border border-border text-2xs font-bold text-sage-accent transition-colors"
              title="Follow PREV pointer backward (ptr = ptr->prev)"
            >
              <ArrowLeft size={11} />
              <span>Prev</span>
            </button>
          )}

          <button
            onClick={handleFollowNext}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] text-2xs font-bold transition-opacity hover:opacity-90 shadow-2xs"
            title="Follow NEXT pointer forward (ptr = ptr->next)"
          >
            <span>Forward (next)</span>
            <ArrowRight size={11} />
          </button>
        </>
      ) : (
        /* Singly Node or Free Pointer: Single Follow control */
        <button
          onClick={handleFollowNext}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] text-xs font-bold transition-opacity hover:opacity-90 shadow-2xs"
          title="Simulate pointer traversal (ptr = ptr->next)"
        >
          <span>Follow</span>
          <ArrowRight size={12} />
        </button>
      )}

      {/* Disconnect Action */}
      <button
        onClick={handleDisconnect}
        className="p-1 rounded-lg text-text-muted hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        title="Disconnect edge"
      >
        <Unlink size={13} />
      </button>

      {/* Close Popup */}
      <button
        onClick={() => setSelectedEdge(null)}
        className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
};
