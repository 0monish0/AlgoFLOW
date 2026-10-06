import React from 'react';
import { useUniversalStore } from '../useUniversalStore';
import { isRef } from '../../../engine/heap';
import { getTreeMetrics, computeTidyTreeLayout } from '../../../engine/structures/tree';

export function TreeRenderer({ struct }) {
  const { heap, setDragSource, dispatch } = useUniversalStore();

  computeTidyTreeLayout(struct, heap, 120, 30);
  const metrics = getTreeMetrics(struct, heap);

  // Collect all nodes and SVG links
  const treeNodes = [];
  const links = [];

  function collectNodes(id) {
    if (!id || !heap[id]) return;
    const node = heap[id];
    treeNodes.push(node);

    if (node.left && heap[node.left]) {
      links.push({ from: node, to: heap[node.left] });
      collectNodes(node.left);
    }
    if (node.right && heap[node.right]) {
      links.push({ from: node, to: heap[node.right] });
      collectNodes(node.right);
    }
  }

  collectNodes(struct.root);

  const handleDragStart = (e, node) => {
    setDragSource({ structId: struct.id, nodeId: node.id, value: node.value });
    e.dataTransfer.setData('text/plain', JSON.stringify({ structId: struct.id, nodeId: node.id }));
  };

  const handleDropTree = (e) => {
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
      onDrop={handleDropTree}
      className="flex flex-col items-center gap-3 p-3 select-none"
    >
      {/* Tree Metrics Header */}
      <div className="flex items-center gap-3 text-2xs font-mono text-text-muted">
        <span>Nodes: <strong className="text-white">{metrics.nodeCount}</strong></span>
        <span>Height: <strong className="text-accent">{metrics.height}</strong></span>
        <span>Leaves: <strong className="text-white">{metrics.leafCount}</strong></span>
        <span className={`px-2 py-0.5 rounded-full text-3xs font-bold border ${
          metrics.isBST ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          {metrics.isBST ? 'Valid BST ✓' : 'Generic Tree'}
        </span>
      </div>

      {/* Hierarchical Tree Canvas Viewport */}
      <div className="relative min-w-[320px] min-h-[220px] max-w-full overflow-auto bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-center">
        {treeNodes.length === 0 ? (
          <div className="py-6 px-8 text-3xs font-mono text-text-muted text-center opacity-60">
            Empty Tree (Drop or insert items)
          </div>
        ) : (
          <div className="relative w-[360px] h-[220px]">
            {/* SVG Connecting Branches */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((link, idx) => (
                <line
                  key={idx}
                  x1={link.from.x + 18}
                  y1={link.from.y + 18}
                  x2={link.to.x + 18}
                  y2={link.to.y + 18}
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Tree Nodes */}
            {treeNodes.map((node) => {
              const displayVal = isRef(node.value) ? `Ref(${node.value.$ref.slice(0, 4)})` : String(node.value);

              return (
                <div
                  key={node.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                  }}
                  className="w-9 h-9 rounded-full border-2 border-accent bg-[#141414] text-white flex items-center justify-center font-mono font-extrabold text-xs shadow-md transition-all cursor-grab hover:scale-110 active:scale-95 hover:border-emerald-300 z-10"
                  title={`Node [${node.value}] (Drag to transfer)`}
                >
                  {displayVal}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
