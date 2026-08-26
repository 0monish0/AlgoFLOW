import React, { useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { NODE_DIAMETER, NODE_RADIUS } from './NodePrimitive';
import { POINTER_WIDTH, POINTER_HEIGHT } from './PointerPrimitive';
import { NULL_WIDTH, NULL_HEIGHT } from './NullToken';
import { CONNECTED_COLOR } from '../core/graphModel';
import { isNullTarget } from '../core/evaluator';

export const SvgConnectorLayer = () => {
  const {
    nodes,
    freePointers,
    nullTokens,
    activeWire,
    disconnectSocket,
    setPointerTarget,
    evaluation,
  } = useSandboxStore();

  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  // Exact midpoint on cubic Bezier curve at t = 0.5
  const getBezierMidpoint = (x0, y0, x1, y1, x2, y2, x3, y3) => {
    const midX = 0.125 * x0 + 0.375 * x1 + 0.375 * x2 + 0.125 * x3;
    const midY = 0.125 * y0 + 0.375 * y1 + 0.375 * y2 + 0.125 * y3;
    return { midX, midY };
  };

  // Professional, smooth Bézier curve generator with correct entry tangents
  const computeSmoothCurve = ({
    sourceX,
    sourceY,
    targetNode,
    targetNull,
    socketType = 'next',
    isFreePointer = false,
  }) => {
    // -------------------------------------------------------------
    // 1. Target is a NULL Token Box
    // -------------------------------------------------------------
    if (targetNull && targetNull.position) {
      const nullLeftX = targetNull.position.x;
      const nullRightX = targetNull.position.x + NULL_WIDTH;
      const nullCx = targetNull.position.x + NULL_WIDTH / 2;
      const nullCy = targetNull.position.y + NULL_HEIGHT / 2;
      const nullTopY = targetNull.position.y;
      const nullBottomY = targetNull.position.y + NULL_HEIGHT;

      let endX = nullLeftX;
      let endY = nullCy;
      let c1X = sourceX + 40;
      let c1Y = sourceY;
      let c2X = nullLeftX - 40;
      let c2Y = nullCy;

      // Case A: Source is to the left of NULL (standard forward entry from left)
      if (sourceX <= nullLeftX - 12) {
        endX = nullLeftX;
        endY = nullCy;
        const dx = Math.max(35, Math.abs(endX - sourceX) * 0.45);
        c1X = sourceX + (socketType === 'prev' ? -dx : dx);
        c1Y = sourceY;
        c2X = endX - dx;
        c2Y = endY;
      }
      // Case B: NULL is directly above / below source
      else if (Math.abs(sourceX - nullCx) < 70 && sourceY > nullBottomY + 15) {
        endX = nullCx;
        endY = nullBottomY;
        const dy = Math.max(35, Math.abs(sourceY - endY) * 0.4);
        c1X = sourceX + 35;
        c1Y = sourceY;
        c2X = endX;
        c2Y = endY + dy;
      }
      // Case C: Source is to the right of NULL (enters from the right face)
      else if (sourceX >= nullRightX + 10) {
        endX = nullRightX;
        endY = nullCy;
        const dx = Math.max(40, Math.abs(sourceX - endX) * 0.35);
        const arcY = Math.min(sourceY, endY) - 25;
        c1X = sourceX + (socketType === 'prev' ? -dx : dx);
        c1Y = arcY;
        c2X = endX + dx;
        c2Y = endY;
      }
      // Case D: Default gentle loop to left face
      else {
        endX = nullLeftX;
        endY = nullCy;
        const arcDist = 45;
        c1X = sourceX + 45;
        c1Y = sourceY - arcDist;
        c2X = endX - 45;
        c2Y = endY;
      }

      const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
      return {
        path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
        midX,
        midY,
      };
    }

    if (!targetNode || !targetNode.position) {
      return null;
    }

    const cx2 = targetNode.position.x + NODE_RADIUS;
    const cy2 = targetNode.position.y + NODE_RADIUS;
    const nodeLeftX = targetNode.position.x;
    const nodeRightX = targetNode.position.x + NODE_DIAMETER;
    const nodeTopY = targetNode.position.y;
    const nodeBottomY = targetNode.position.y + NODE_DIAMETER;

    // -------------------------------------------------------------
    // 2. Free pointer (HEAD / ptr) targeting live node
    // -------------------------------------------------------------
    if (isFreePointer) {
      let endX = nodeLeftX;
      let endY = cy2;
      let c1X = sourceX + 35;
      let c1Y = sourceY;
      let c2X = nodeLeftX - 35;
      let c2Y = cy2;

      // Pointer is to the left of the node
      if (sourceX <= nodeLeftX - 10) {
        endX = nodeLeftX;
        endY = cy2;
        const dx = Math.max(30, (endX - sourceX) * 0.45);
        c1X = sourceX + dx;
        c1Y = sourceY;
        c2X = endX - dx;
        c2Y = endY;
      }
      // Pointer is to the right / above / below node
      else {
        if (sourceY <= cy2) {
          endX = cx2;
          endY = nodeTopY;
          c1X = sourceX + 35;
          c1Y = sourceY + 25;
          c2X = endX;
          c2Y = endY - 35;
        } else {
          endX = cx2;
          endY = nodeBottomY;
          c1X = sourceX + 35;
          c1Y = sourceY - 25;
          c2X = endX;
          c2Y = endY + 35;
        }
      }

      const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
      return {
        path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
        midX,
        midY,
      };
    }

    // -------------------------------------------------------------
    // 3. Self-Loop (node points to itself)
    // -------------------------------------------------------------
    if (targetNode.id === targetNode.selfId) {
      const loopRadius = 45;
      const endX = cx2;
      const endY = nodeTopY;
      const c1X = sourceX + loopRadius;
      const c1Y = sourceY - loopRadius;
      const c2X = cx2 + 25;
      const c2Y = nodeTopY - loopRadius * 1.5;

      const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
      return {
        path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
        midX,
        midY,
      };
    }

    // -------------------------------------------------------------
    // 4. Standard Next Socket Flow
    // -------------------------------------------------------------
    if (socketType === 'next') {
      // Case A: Target is to the right (Normal forward flow)
      if (sourceX <= nodeLeftX - 10) {
        const endX = nodeLeftX;
        const endY = cy2;
        const dx = Math.max(35, (endX - sourceX) * 0.45);
        const c1X = sourceX + dx;
        const c1Y = sourceY;
        const c2X = endX - dx;
        const c2Y = endY;

        const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
        return {
          path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
          midX,
          midY,
        };
      }

      // Case B: Backward cycle (target node is to the left)
      if (sourceY >= cy2) {
        // Arc over the top
        const endX = cx2;
        const endY = nodeTopY;
        const arcDist = Math.max(50, Math.abs(sourceX - cx2) * 0.25);
        const arcY = Math.min(sourceY, endY) - arcDist;
        const c1X = sourceX + 55;
        const c1Y = arcY;
        const c2X = endX;
        const c2Y = arcY;

        const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
        return {
          path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
          midX,
          midY,
        };
      } else {
        // Arc under the bottom
        const endX = cx2;
        const endY = nodeBottomY;
        const arcDist = Math.max(50, Math.abs(sourceX - cx2) * 0.25);
        const arcY = Math.max(sourceY, endY) + arcDist;
        const c1X = sourceX + 55;
        const c1Y = arcY;
        const c2X = endX;
        const c2Y = arcY;

        const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
        return {
          path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
          midX,
          midY,
        };
      }
    }

    // -------------------------------------------------------------
    // 5. Doubly Linked Prev Socket Flow
    // -------------------------------------------------------------
    if (socketType === 'prev') {
      // Prev socket connects from Left of source node to predecessor
      if (sourceX >= nodeRightX + 10) {
        const endX = nodeRightX;
        const endY = cy2;
        const dx = Math.max(35, (sourceX - endX) * 0.45);
        const sag = Math.min(30, 16 + dx * 0.08); // Downward sag to clearly separate next & prev wires
        const c1X = sourceX - dx;
        const c1Y = sourceY + sag;
        const c2X = endX + dx;
        const c2Y = endY + sag;

        const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
        return {
          path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
          midX,
          midY,
        };
      } else {
        // Predecessor is to the right (forward prev loop)
        const endX = cx2;
        const endY = nodeBottomY;
        const arcY = Math.max(sourceY, endY) + 50;
        const c1X = sourceX - 45;
        const c1Y = arcY;
        const c2X = endX;
        const c2Y = arcY;

        const { midX, midY } = getBezierMidpoint(sourceX, sourceY, c1X, c1Y, c2X, c2Y, endX, endY);
        return {
          path: `M ${sourceX} ${sourceY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`,
          midX,
          midY,
        };
      }
    }

    return null;
  };

  const edgesToRender = [];

  // 1. Render Free Pointers (Head always gets its wire; other pointers only when targeting NULL)
  Object.values(freePointers || {}).forEach((fp) => {
    if (!fp || !fp.position) return;

    const isHead = fp.label.toLowerCase() === 'head';
    const isTargetingNode = Boolean(fp.targetId && nodes[fp.targetId]);
    const isTargetingNull = isNullTarget(fp.targetId, nullTokens);

    // Other pointers targeting a live node are attached directly beneath the node
    if (isTargetingNode && !isHead) return;

    const startX = fp.position.x + POINTER_WIDTH - 12;
    const startY = fp.position.y + POINTER_HEIGHT / 2;

    if (isTargetingNode && isHead) {
      const targetNode = nodes[fp.targetId];
      const curve = computeSmoothCurve({
        sourceX: startX,
        sourceY: startY,
        targetNode,
        isFreePointer: true,
      });

      if (curve) {
        edgesToRender.push({
          id: `edge-${fp.id}`,
          sourceId: fp.id,
          sourceType: 'pointer',
          targetId: fp.targetId,
          path: curve.path,
          midX: curve.midX,
          midY: curve.midY,
          isReachable: true,
        });
      }
    } else if (isTargetingNull) {
      const targetNull = nullTokens[fp.targetId] || Object.values(nullTokens || {})[0] || {
        position: { x: startX + 100, y: startY - 10 },
      };
      const curve = computeSmoothCurve({
        sourceX: startX,
        sourceY: startY,
        targetNull,
        isFreePointer: true,
      });

      if (curve) {
        edgesToRender.push({
          id: `edge-${fp.id}`,
          sourceId: fp.id,
          sourceType: 'pointer',
          targetId: fp.targetId,
          path: curve.path,
          midX: curve.midX,
          midY: curve.midY,
          isReachable: false,
        });
      }
    }
  });

  // 2. Render all Node Sockets (Next & Prev)
  Object.values(nodes || {}).forEach((node) => {
    if (!node || !node.sockets || !node.position) return;

    Object.entries(node.sockets).forEach(([socketType, edge]) => {
      if (!edge || !edge.targetId) return;

      let sourceX = node.position.x + NODE_DIAMETER;
      let sourceY = node.position.y + NODE_RADIUS;

      if (socketType === 'prev') {
        sourceX = node.position.x;
        sourceY = node.position.y + NODE_RADIUS;
      }

      let curve = null;

      if (isNullTarget(edge.targetId, nullTokens)) {
        const targetNull = nullTokens[edge.targetId] || Object.values(nullTokens || {})[0] || {
          position: { x: sourceX + 90, y: sourceY - 10 },
        };
        curve = computeSmoothCurve({
          sourceX,
          sourceY,
          targetNull,
          socketType,
        });
      } else if (nodes[edge.targetId] && nodes[edge.targetId].position) {
        const targetNode = { ...nodes[edge.targetId], selfId: node.id };
        curve = computeSmoothCurve({
          sourceX,
          sourceY,
          targetNode,
          socketType,
        });
      } else {
        return;
      }

      if (!curve) return;

      const isReachable = evaluation.reachableNodeIds.has(node.id);

      edgesToRender.push({
        id: `edge-${node.id}-${socketType}`,
        sourceId: node.id,
        sourceType: 'socket',
        socketType,
        targetId: edge.targetId,
        path: curve.path,
        midX: curve.midX,
        midY: curve.midY,
        isReachable,
      });
    });
  });

  const handleDisconnect = (edge) => {
    if (edge.sourceType === 'socket') {
      disconnectSocket(edge.sourceId, edge.socketType);
    } else if (edge.sourceType === 'pointer') {
      setPointerTarget(edge.sourceId, null);
    }
    setHoveredEdgeId(null);
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
      <defs>
        {/* Crisp Triangular Arrowhead Markers (No glow on links) */}
        <marker
          id="arrow-green"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3.5, 0 7" fill={CONNECTED_COLOR} />
        </marker>

        <marker
          id="arrow-white"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 8 3.5, 0 7" fill="#94A3B8" />
        </marker>
      </defs>

      {/* 1. Static Graph Edges */}
      {edgesToRender.map((edge) => {
        const isReachable = edge.isReachable;
        const strokeColor = isReachable ? CONNECTED_COLOR : '#94A3B8';
        const markerUrl = isReachable ? 'url(#arrow-green)' : 'url(#arrow-white)';
        const isHovered = hoveredEdgeId === edge.id;

        return (
          <g
            key={edge.id}
            className="pointer-events-auto cursor-pointer"
            onMouseEnter={() => setHoveredEdgeId(edge.id)}
            onMouseLeave={() => setHoveredEdgeId(null)}
          >
            {/* Wide transparent stroke for reliable hover and click targeting */}
            <path
              d={edge.path}
              fill="none"
              stroke="transparent"
              strokeWidth="38"
              onClick={() => handleDisconnect(edge)}
            />

            {/* Main Visual Edge Line (Clean & crisp without glow) */}
            <path
              d={edge.path}
              fill="none"
              stroke={isHovered ? '#EF4444' : strokeColor}
              strokeWidth={isHovered ? 3.5 : 2.5}
              markerEnd={isHovered ? '' : markerUrl}
              className="transition-colors duration-150"
            />

            {/* Cut / Unlink Button Pill (Large, crisp SVG Scissors icon + Bold Cut text) */}
            {isHovered && (
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  handleDisconnect(edge);
                }}
                className="cursor-pointer hover:scale-115 transition-transform"
                transform={`translate(${edge.midX}, ${edge.midY})`}
              >
                {/* Pill Container */}
                <rect
                  x="-38"
                  y="-16"
                  width="76"
                  height="32"
                  rx="8"
                  fill="#18181B"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                  className="drop-shadow-2xl"
                />

                {/* Crisp Vector Scissors Icon */}
                <g transform="translate(-27, -8) scale(0.68)">
                  <circle cx="6" cy="6" r="3.2" fill="none" stroke="#EF4444" strokeWidth="2.2" />
                  <circle cx="6" cy="18" r="3.2" fill="none" stroke="#EF4444" strokeWidth="2.2" />
                  <line x1="20" y1="4" x2="8.12" y2="15.88" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="14.47" y1="14.48" x2="20" y2="20" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="8.12" y1="8.12" x2="12" y2="12" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
                </g>

                {/* Bold Label */}
                <text
                  x="8"
                  y="4.5"
                  textAnchor="middle"
                  fill="#EF4444"
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  Cut
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* 2. Dynamic Wire During Live Drag Interaction (No glow) */}
      {activeWire && (() => {
        const dx = activeWire.cursorX - activeWire.startX;
        const dy = activeWire.cursorY - activeWire.startY;
        const cDist = Math.max(35, Math.hypot(dx, dy) * 0.35);
        const srcDirX = activeWire.socketType === 'prev' ? -1 : 1;
        const c1X = activeWire.startX + srcDirX * cDist;
        const c1Y = activeWire.startY;
        const c2X = activeWire.cursorX - (dx >= 0 ? 1 : -1) * (cDist * 0.5);
        const c2Y = activeWire.cursorY - (dy >= 0 ? 1 : -1) * (Math.abs(dy) * 0.2);
        const path = `M ${activeWire.startX} ${activeWire.startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${activeWire.cursorX} ${activeWire.cursorY}`;

        return (
          <path
            d={path}
            fill="none"
            stroke={CONNECTED_COLOR}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            markerEnd="url(#arrow-green)"
            className="animate-pulse"
          />
        );
      })()}
    </svg>
  );
};
