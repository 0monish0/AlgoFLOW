import React, { useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { NODE_DIAMETER, NODE_RADIUS } from './NodePrimitive';
import { CONNECTED_COLOR } from '../core/graphModel';

export const SvgConnectorLayer = () => {
  const {
    nodes,
    freePointers,
    nullTokens,
    activeWire,
    setSelectedEdge,
    disconnectSocket,
    setPointerTarget,
    evaluation,
  } = useSandboxStore();

  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  // Flawless, professional Bézier curve generator for graph nodes and pointers
  const computeSmoothCurve = ({
    sourceX,
    sourceY,
    targetNode,
    targetNull,
    socketType = 'next',
    isFreePointer = false,
  }) => {
    // 1. Target is NULL Token
    if (targetNull) {
      const targetX = targetNull.position.x;
      const targetY = targetNull.position.y + 16;
      const dx = Math.max(35, Math.abs(targetX - sourceX) * 0.45);

      return {
        path: `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`,
        midX: (sourceX + targetX) / 2,
        midY: (sourceY + targetY) / 2,
      };
    }

    // 2. Free pointer targeting live node
    if (isFreePointer && targetNode) {
      const cx2 = targetNode.position.x + NODE_RADIUS;
      const cy2 = targetNode.position.y + NODE_RADIUS;
      const endX = targetNode.position.x;
      const endY = cy2;
      const dx = Math.max(30, Math.abs(endX - sourceX) * 0.4);

      return {
        path: `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${endX - dx} ${endY}, ${endX} ${endY}`,
        midX: (sourceX + endX) / 2,
        midY: (sourceY + endY) / 2,
      };
    }

    if (!targetNode) {
      return null;
    }

    const cx2 = targetNode.position.x + NODE_RADIUS;
    const cy2 = targetNode.position.y + NODE_RADIUS;

    // 3. Self-Loop (node points to itself)
    if (targetNode.id === targetNode.selfId) {
      const loopRadius = 35;
      return {
        path: `M ${sourceX} ${sourceY} C ${sourceX + loopRadius} ${sourceY - loopRadius}, ${sourceX - loopRadius} ${sourceY - loopRadius * 1.6}, ${cx2} ${cy2 - NODE_RADIUS}`,
        midX: sourceX + 15,
        midY: sourceY - loopRadius * 1.2,
      };
    }

    // 4. Standard Next Socket Flow
    if (socketType === 'next') {
      const dxRel = cx2 - sourceX;
      const dyRel = cy2 - sourceY;

      // Case A: Target is to the right (Normal forward flow)
      if (dxRel >= 20) {
        const targetX = targetNode.position.x;
        const targetY = cy2;
        const curveDist = Math.max(35, (targetX - sourceX) * 0.45);

        return {
          path: `M ${sourceX} ${sourceY} C ${sourceX + curveDist} ${sourceY}, ${targetX - curveDist} ${targetY}, ${targetX} ${targetY}`,
          midX: (sourceX + targetX) / 2,
          midY: (sourceY + targetY) / 2,
        };
      }

      // Case B: Target is directly below or down-left (Vertical / downward cascade flow)
      if (dyRel > 30) {
        const targetX = cx2;
        const targetY = targetNode.position.y;
        const bendOffset = Math.max(30, Math.min(70, dyRel * 0.35));

        return {
          path: `M ${sourceX} ${sourceY} C ${sourceX + bendOffset} ${sourceY}, ${targetX} ${targetY - bendOffset}, ${targetX} ${targetY}`,
          midX: (sourceX + targetX) / 2 + 15,
          midY: (sourceY + targetY) / 2,
        };
      }

      // Case C: Target is directly above or up-left (Vertical / upward cascade flow)
      if (dyRel < -30) {
        const targetX = cx2;
        const targetY = targetNode.position.y + NODE_DIAMETER;
        const bendOffset = Math.max(30, Math.min(70, Math.abs(dyRel) * 0.35));

        return {
          path: `M ${sourceX} ${sourceY} C ${sourceX + bendOffset} ${sourceY}, ${targetX} ${targetY + bendOffset}, ${targetX} ${targetY}`,
          midX: (sourceX + targetX) / 2 + 15,
          midY: (sourceY + targetY) / 2,
        };
      }

      // Case D: Target is directly to the left (Loop backward)
      const targetX = targetNode.position.x + NODE_DIAMETER;
      const targetY = cy2;
      const arcHeight = Math.min(sourceY, targetY) - 50;

      return {
        path: `M ${sourceX} ${sourceY} C ${sourceX + 45} ${arcHeight}, ${targetX - 45} ${arcHeight}, ${targetX} ${targetY}`,
        midX: (sourceX + targetX) / 2,
        midY: arcHeight + 10,
      };
    }

    // 5. Doubly Linked Prev Socket Flow
    if (socketType === 'prev') {
      const targetX = targetNode.position.x + NODE_DIAMETER;
      const targetY = cy2;
      const dx = Math.max(35, Math.abs(targetX - sourceX) * 0.45);
      const dyOffset = Math.max(sourceY, targetY) + 40;

      return {
        path: `M ${sourceX} ${sourceY} C ${sourceX - 35} ${dyOffset}, ${targetX + 35} ${dyOffset}, ${targetX} ${targetY}`,
        midX: (sourceX + targetX) / 2,
        midY: dyOffset - 10,
      };
    }

    return null;
  };

  const edgesToRender = [];

  // 1. Render Free Pointers (Head always gets its wire; other pointers only when targeting NULL)
  Object.values(freePointers || {}).forEach((fp) => {
    if (!fp || !fp.position) return;

    const isHead = fp.label.toLowerCase() === 'head';
    const isTargetingNode = Boolean(fp.targetId && nodes[fp.targetId]);

    // Other pointers targeting a live node are attached directly beneath the node
    if (isTargetingNode && !isHead) return;

    const startX = fp.position.x + 85;
    const startY = fp.position.y + 17;

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
    } else if (fp.targetId === 'NULL') {
      const targetNull = Object.values(nullTokens || {})[0] || { position: { x: startX + 80, y: startY } };
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
          targetId: 'NULL',
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

      if (edge.targetId === 'NULL') {
        const targetNull = Object.values(nullTokens || {})[0] || { position: { x: sourceX + 80, y: sourceY } };
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
        // Unlinked socket / non-existent target: DO NOT render any edge or cut button!
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
        {/* Soft Theme Glow */}
        <filter id="soft-glow-green" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={CONNECTED_COLOR} floodOpacity="0.4" />
        </filter>

        {/* Arrowhead Markers */}
        <marker
          id="arrow-green"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 1 1 L 7 4 L 1 7 Z" fill={CONNECTED_COLOR} />
        </marker>

        <marker
          id="arrow-white"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#94A3B8" />
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
              strokeWidth="36"
              onClick={() => handleDisconnect(edge)}
            />

            {/* Main Visual Edge Line */}
            <path
              d={edge.path}
              fill="none"
              stroke={isHovered ? '#EF4444' : strokeColor}
              strokeWidth={isHovered ? 3.5 : 2.5}
              markerEnd={isHovered ? '' : markerUrl}
              filter={isReachable && !isHovered ? 'url(#soft-glow-green)' : 'none'}
              className="transition-colors duration-150"
            />

            {/* Cut / Unlink Button Pill (Rock-solid, zero flicker) */}
            {isHovered && (
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  handleDisconnect(edge);
                }}
                className="cursor-pointer hover:scale-115 transition-transform"
                transform={`translate(${edge.midX}, ${edge.midY})`}
              >
                {/* Cut badge background pill */}
                <rect
                  x="-28"
                  y="-12"
                  width="56"
                  height="24"
                  rx="6"
                  fill="#18181B"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  className="drop-shadow-xl"
                />
                {/* Scissor / Cut Text & Icon */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#EF4444"
                  fontSize="11"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  ✂ Cut
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* 2. Dynamic Wire During Live Drag Interaction */}
      {activeWire && (
        <path
          d={`M ${activeWire.startX} ${activeWire.startY} C ${activeWire.startX + Math.max(30, (activeWire.cursorX - activeWire.startX) * 0.4)} ${activeWire.startY}, ${activeWire.cursorX - Math.max(30, (activeWire.cursorX - activeWire.startX) * 0.4)} ${activeWire.cursorY}, ${activeWire.cursorX} ${activeWire.cursorY}`}
          fill="none"
          stroke={CONNECTED_COLOR}
          strokeWidth="2.5"
          strokeDasharray="6 4"
          markerEnd="url(#arrow-green)"
          filter="url(#soft-glow-green)"
          className="animate-pulse"
        />
      )}
    </svg>
  );
};
