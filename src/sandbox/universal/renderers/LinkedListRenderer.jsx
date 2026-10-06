import React from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { isRef } from '../../../engine/heap';
import { checkListInvariants } from '../../../engine/structures/linkedList';
import { ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export function LinkedListRenderer({ struct }) {
  const { heap, setDragSource, dispatch, reachability } = useUniversalStore();

  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';

  // Traverse list nodes to build ordered array
  const nodes = [];
  const visited = new Set();
  let curr = struct.head;

  while (curr && !visited.has(curr) && curr !== 'NULL') {
    visited.add(curr);
    const node = heap[curr];
    if (node) {
      nodes.push(node);
      curr = node.next;
      if (isCircular && curr === struct.head) break;
    } else {
      break;
    }
  }

  const invariants = checkListInvariants(struct, heap);

  const handleDragStart = (e, node) => {
    setDragSource({ structId: struct.id, nodeId: node.id, value: node.value });
    e.dataTransfer.setData('text/plain', JSON.stringify({ structId: struct.id, nodeId: node.id }));
  };

  const handleDropList = (e) => {
    e.preventDefault();
    const sourceData = useUniversalStore.getState().dragSource;
    if (!sourceData) return;

    if (sourceData.structId !== struct.id) {
      dispatch({
        type: 'transfer',
        args: {
          sourceId: sourceData.structId,
          targetId: struct.id,
          slotIndex: sourceData.slotIndex,
          nodeId: sourceData.nodeId,
        },
      });
    }
    setDragSource(null);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropList}
      className="flex flex-col items-center gap-3 p-3 select-none"
    >
      {/* Metrics Header */}
      <div className="flex items-center gap-4 text-2xs font-mono text-text-muted">
        <span>Nodes: <strong className="text-white">{nodes.length}</strong></span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-3xs font-bold text-gray-300 capitalize">
          {struct.listType.replace('_', ' ')}
        </span>
        {struct.trackTail && struct.tail && (
          <span>Tail: <strong className="text-cyan-400">[{heap[struct.tail]?.value}]</strong></span>
        )}
      </div>

      {/* Invariants Broken Warning Chip */}
      {invariants.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-3xs font-mono font-bold animate-in fade-in">
          <AlertCircle size={12} className="shrink-0" />
          <span>{invariants[0]}</span>
        </div>
      )}

      {/* Nodes Row Viewport */}
      <div className="flex items-center gap-3 overflow-x-auto p-4 bg-black/40 border border-white/10 rounded-2xl max-w-full">
        {/* Head Marker */}
        <div className="flex flex-col items-center gap-1">
          <span className="px-2 py-0.5 rounded-full bg-white text-black font-extrabold text-3xs shadow-sm">HEAD</span>
          <ArrowRight size={14} className="text-white" />
        </div>

        {nodes.length === 0 ? (
          <div className="py-4 px-6 text-3xs font-mono text-text-muted text-center opacity-60">
            Empty List (NULL)
          </div>
        ) : (
          nodes.map((node, idx) => {
            const isHead = node.id === struct.head;
            const isTail = node.id === struct.tail;
            const isGarbage = reachability?.garbage?.has(node.id);
            const displayVal = isRef(node.value) ? `Ref(${node.value.$ref.slice(0, 5)})` : String(node.value);

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, node)}
                  className={`relative flex items-center border-2 rounded-xl bg-surface/90 shadow-md font-mono transition-all cursor-grab hover:scale-105 active:scale-95 ${
                    isGarbage
                      ? 'border-dashed border-red-500/50 bg-red-950/20 opacity-50'
                      : isHead
                      ? 'border-accent shadow-accent/20'
                      : 'border-white/20'
                  }`}
                  title={`Node [${node.value}] (Drag to transfer)`}
                >
                  {/* Garbage Badge */}
                  {isGarbage && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-red-500/30 border border-red-500/60 text-red-300 text-3xs font-bold">
                      garbage
                    </span>
                  )}

                  {/* Prev Socket (if Doubly) */}
                  {isDoubly && (
                    <div className="px-2 py-2 border-r border-white/10 text-3xs text-text-muted flex items-center justify-center">
                      <ArrowLeft size={10} className="text-amber-400" />
                    </div>
                  )}

                  {/* Value Cell */}
                  <div className="px-3.5 py-2 font-bold text-xs text-white min-w-[36px] text-center">
                    {displayVal}
                  </div>

                  {/* Next Socket */}
                  <div className="px-2 py-2 border-l border-white/10 text-3xs text-text-muted flex items-center justify-center">
                    <ArrowRight size={10} className="text-accent" />
                  </div>
                </div>

                {/* Arrow Connector to next */}
                {idx < nodes.length - 1 ? (
                  <div className="flex items-center gap-0.5 text-accent">
                    {isDoubly && <ArrowLeft size={12} className="text-amber-400" />}
                    <div className="w-5 h-0.5 bg-accent/60" />
                    <ArrowRight size={12} className="text-accent" />
                  </div>
                ) : isCircular ? (
                  /* Curved back arrow indicator */
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-950/40 border border-cyan-400/40 text-cyan-300 text-3xs font-mono font-bold">
                    <RefreshCw size={11} className="animate-spin text-cyan-400" />
                    <span>tail.next ➔ head</span>
                  </div>
                ) : (
                  /* Terminal NULL */
                  <div className="px-2 py-1 rounded-md border border-dashed border-white/20 text-3xs font-mono text-text-muted font-bold">
                    NULL
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
