/**
 * @fileoverview High-precision SVG connector layer for the Free-Form Canvas.
 * Renders smooth curved Beziers for next (solid emerald), prev (dashed amber),
 * self-loops, parallel doubly offset curves, null stubs (∅), and interactive rubber-band wires.
 */

import React, { useState } from 'react';
import { useUniversalStore } from './useUniversalStore';
import { X } from 'lucide-react';

const NODE_RADIUS = 28; // 56px circle diameter

export function SvgConnectorLayer() {
  const {
    nodes,
    pointers,
    activeWire,
    dispatch,
    selectedId,
    hoveredTargetId,
  } = useUniversalStore();

  const [hoveredEdge, setHoveredEdge] = useState(null); // { sourceId, port }

  // Midpoint on cubic Bezier
  const getBezierMidpoint = (x0, y0, x1, y1, x2, y2, x3, y3) => ({
    x: 0.125 * x0 + 0.375 * x1 + 0.375 * x2 + 0.125 * x3,
    y: 0.125 * y0 + 0.375 * y1 + 0.375 * y2 + 0.125 * y3,
  });

  // Calculate curve between two nodes
  const calculateEdgePath = (srcNode, tgtNode, port, isDoublyPair = false) => {
    const srcCenter = { x: srcNode.position.x + 28, y: srcNode.position.y + 28 };
    const tgtCenter = { x: tgtNode.position.x + 28, y: tgtNode.position.y + 28 };

    // Self-loop
    if (srcNode.id === tgtNode.id) {
      const topX = srcCenter.x;
      const topY = srcCenter.y - 28;
      const path = `M ${topX + 14} ${topY + 4} C ${topX + 45} ${topY - 45}, ${topX - 45} ${topY - 45}, ${topX - 14} ${topY + 4}`;
      const mid = { x: topX, y: topY - 38 };
      return { path, mid };
    }

    // Source port position
    let sx = port === 'prev' ? srcNode.position.x : srcNode.position.x + 56;
    let sy = srcCenter.y;

    // Vector to target center
    const dx = tgtCenter.x - sx;
    const dy = tgtCenter.y - sy;
    const dist = Math.max(1, Math.hypot(dx, dy));

    // End point at target rim (radius 28px)
    let ex = tgtCenter.x - (dx / dist) * NODE_RADIUS;
    let ey = tgtCenter.y - (dy / dist) * NODE_RADIUS;

    // Curve control points
    const curveOffset = Math.min(120, Math.max(40, dist * 0.4));
    let c1x = port === 'prev' ? sx - curveOffset : sx + curveOffset;
    let c1y = sy;
    let c2x = ex - (dx / dist) * curveOffset * 0.5;
    let c2y = ey - (dy / dist) * curveOffset * 0.5;

    // Parallel offset if both nodes are connected to each other (doubly pair)
    if (isDoublyPair) {
      const offsetAmt = port === 'next' ? -14 : 14;
      c1y += offsetAmt;
      c2y += offsetAmt;
      sy += offsetAmt * 0.5;
      ey += offsetAmt * 0.5;
    }

    const path = `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
    const mid = getBezierMidpoint(sx, sy, c1x, c1y, c2x, c2y, ex, ey);

    return { path, mid };
  };

  const edgeElements = [];
  const nodeList = Object.values(nodes);

  nodeList.forEach((src) => {
    // ── NEXT EDGE ──────────────────────────────────────────
    if (src.next && src.next !== 'NULL') {
      const tgt = nodes[src.next];
      if (tgt) {
        const isDoublyPair = tgt.prev === src.id;
        const { path, mid } = calculateEdgePath(src, tgt, 'next', isDoublyPair);
        const edgeKey = `${src.id}-next-${tgt.id}`;
        const isHovered = hoveredEdge?.key === edgeKey;

        edgeElements.push(
          <g key={edgeKey} className="group cursor-pointer">
            {/* Wide invisible hit area for hovering */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              onMouseEnter={() => setHoveredEdge({ key: edgeKey, sourceId: src.id, port: 'next', mid })}
              onMouseLeave={() => setHoveredEdge(null)}
            />

            {/* Glowing background on hover */}
            {isHovered && (
              <path
                d={path}
                fill="none"
                stroke="#10b981"
                strokeWidth={5}
                strokeOpacity={0.3}
              />
            )}

            {/* Core Arrow Curve */}
            <path
              d={path}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              markerEnd="url(#arrowhead-emerald)"
              className="transition-all duration-150"
            />

            {/* Cut / Disconnect Button (Floating X at midpoint) */}
            {isHovered && (
              <g
                transform={`translate(${mid.x - 10}, ${mid.y - 10})`}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'node.disconnect', sourceId: src.id, port: 'next' });
                  setHoveredEdge(null);
                }}
                className="cursor-pointer"
              >
                <circle r={10} cx={10} cy={10} fill="#ef4444" className="shadow-lg hover:scale-110 transition-transform" />
                <path d="M 6 6 L 14 14 M 14 6 L 6 14" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      }
    }

    // ── PREV EDGE (Doubly only) ─────────────────────────────
    if (src.nodeType === 'doubly' && src.prev && src.prev !== 'NULL') {
      const tgt = nodes[src.prev];
      if (tgt) {
        const isDoublyPair = tgt.next === src.id;
        const { path, mid } = calculateEdgePath(src, tgt, 'prev', isDoublyPair);
        const edgeKey = `${src.id}-prev-${tgt.id}`;
        const isHovered = hoveredEdge?.key === edgeKey;

        edgeElements.push(
          <g key={edgeKey} className="group cursor-pointer">
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              onMouseEnter={() => setHoveredEdge({ key: edgeKey, sourceId: src.id, port: 'prev', mid })}
              onMouseLeave={() => setHoveredEdge(null)}
            />
            {isHovered && (
              <path
                d={path}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={5}
                strokeOpacity={0.3}
              />
            )}
            <path
              d={path}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6,4"
              markerEnd="url(#arrowhead-amber)"
              className="transition-all duration-150"
            />
            {isHovered && (
              <g
                transform={`translate(${mid.x - 10}, ${mid.y - 10})`}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'node.disconnect', sourceId: src.id, port: 'prev' });
                  setHoveredEdge(null);
                }}
                className="cursor-pointer"
              >
                <circle r={10} cx={10} cy={10} fill="#ef4444" className="shadow-lg hover:scale-110 transition-transform" />
                <path d="M 6 6 L 14 14 M 14 6 L 6 14" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      }
    }

    // ── NULL STUBS (∅) ──────────────────────────────────────
    // If next is not connected or explicitly NULL, show small ∅ stub at right port
    if (!src.next || src.next === 'NULL') {
      const px = src.position.x + 56;
      const py = src.position.y + 28;
      edgeElements.push(
        <g
          key={`${src.id}-null-stub-next`}
          onClick={() => dispatch({ type: 'node.disconnect', sourceId: src.id, port: 'next' })}
          className="group cursor-pointer"
        >
          {/* Small 14px horizontal line extending out */}
          <line
            x1={px}
            y1={py}
            x2={px + 14}
            y2={py}
            stroke="#52525b"
            strokeWidth={1.5}
            className="group-hover:stroke-emerald-400 transition-colors"
          />
          {/* Ground / ∅ Glyph */}
          <text
            x={px + 17}
            y={py + 4}
            fill="#71717a"
            fontSize="12"
            fontFamily="monospace"
            className="group-hover:fill-emerald-400 font-bold select-none transition-colors"
          >
            ∅
          </text>
        </g>
      );
    }

    // If doubly and prev is not connected, show small ∅ stub at left port
    if (src.nodeType === 'doubly' && (!src.prev || src.prev === 'NULL')) {
      const px = src.position.x;
      const py = src.position.y + 28;
      edgeElements.push(
        <g
          key={`${src.id}-null-stub-prev`}
          onClick={() => dispatch({ type: 'node.disconnect', sourceId: src.id, port: 'prev' })}
          className="group cursor-pointer"
        >
          <line
            x1={px}
            y1={py}
            x2={px - 14}
            y2={py}
            stroke="#52525b"
            strokeWidth={1.5}
            className="group-hover:stroke-amber-400 transition-colors"
          />
          <text
            x={px - 26}
            y={py + 4}
            fill="#71717a"
            fontSize="12"
            fontFamily="monospace"
            className="group-hover:fill-amber-400 font-bold select-none transition-colors"
          >
            ∅
          </text>
        </g>
      );
    }
  });

  // ── ACTIVE WIRE RUBBER-BANDING ────────────────────────────
  let activeWireElement = null;
  if (activeWire && nodes[activeWire.sourceId]) {
    const src = nodes[activeWire.sourceId];
    const sx = activeWire.port === 'prev' ? src.position.x : src.position.x + 56;
    const sy = src.position.y + 28;
    const ex = activeWire.cursorX;
    const ey = activeWire.cursorY;

    const dx = ex - sx;
    const dy = ey - sy;
    const curveOffset = Math.min(100, Math.max(30, Math.hypot(dx, dy) * 0.4));
    const c1x = activeWire.port === 'prev' ? sx - curveOffset : sx + curveOffset;
    const c1y = sy;
    const c2x = ex - (dx > 0 ? curveOffset * 0.5 : -curveOffset * 0.5);
    const c2y = ey;

    const color = activeWire.port === 'prev' ? '#f59e0b' : '#10b981';
    const marker = activeWire.port === 'prev' ? 'url(#arrowhead-amber)' : 'url(#arrowhead-emerald)';

    activeWireElement = (
      <g className="pointer-events-none">
        <path
          d={`M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={activeWire.port === 'prev' ? '6,4' : undefined}
          markerEnd={marker}
          className="animate-pulse"
        />
      </g>
    );
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
      <defs>
        {/* Emerald Arrowhead Marker */}
        <marker
          id="arrowhead-emerald"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 1 L 7 4 L 0 7 z" fill="#10b981" />
        </marker>

        {/* Amber Arrowhead Marker */}
        <marker
          id="arrowhead-amber"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 1 L 7 4 L 0 7 z" fill="#f59e0b" />
        </marker>

        {/* Violet Arrowhead Marker */}
        <marker
          id="arrowhead-violet"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 1 L 7 4 L 0 7 z" fill="#a78bfa" />
        </marker>
      </defs>

      {/* Render All Canvas Edges & Stubs */}
      <g className="pointer-events-auto">{edgeElements}</g>

      {/* Rubber-band dragging arrow */}
      {activeWireElement}
    </svg>
  );
}
