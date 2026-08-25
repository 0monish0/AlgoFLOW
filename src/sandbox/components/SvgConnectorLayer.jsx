import React from 'react';
import { useSandboxStore } from '../core/useSandboxStore';

export const SvgConnectorLayer = () => {
  const {
    nodes,
    freePointers,
    activeWire,
    setSelectedEdge,
  } = useSandboxStore();

  const NODE_WIDTH = 136;
  const HALF_HEIGHT = 28;

  // Helper to calculate smooth cubic Bézier curve between 2 points
  const computeBezierPath = (x1, y1, x2, y2, isPrev = false, isLoop = false) => {
    if (isLoop) {
      const midY = Math.min(y1, y2) - 75;
      return `M ${x1} ${y1} C ${x1 + 50} ${midY}, ${x2 - 50} ${midY}, ${x2} ${y2}`;
    }

    if (isPrev) {
      const midY = Math.max(y1, y2) + 45;
      return `M ${x1} ${y1} C ${x1 - 35} ${midY}, ${x2 + 35} ${midY}, ${x2} ${y2}`;
    }

    const dx = Math.max(30, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  const edgesToRender = [];

  // 1. Render all Free Pointers
  Object.values(freePointers).forEach((fp) => {
    if (!fp || !fp.position) return;

    const startX = fp.position.x + 60;
    const startY = fp.position.y + 14;

    if (fp.targetId && fp.targetId !== 'NULL') {
      if (nodes[fp.targetId] && nodes[fp.targetId].position) {
        const targetNode = nodes[fp.targetId];
        const endX = targetNode.position.x;
        const endY = targetNode.position.y + HALF_HEIGHT;

        edgesToRender.push({
          id: `edge-${fp.id}`,
          sourceId: fp.id,
          sourceType: 'pointer',
          targetId: fp.targetId,
          path: computeBezierPath(startX, startY, endX, endY),
          midX: (startX + endX) / 2,
          midY: (startY + endY) / 2,
          isDangling: false,
        });
      } else {
        // Dangling pointer
        edgesToRender.push({
          id: `edge-${fp.id}`,
          sourceId: fp.id,
          sourceType: 'pointer',
          targetId: fp.targetId,
          path: computeBezierPath(startX, startY, startX + 70, startY + 25),
          midX: startX + 35,
          midY: startY + 12,
          isDangling: true,
          targetX: startX + 70,
          targetY: startY + 25,
        });
      }
    }
  });

  // 2. Render all Node Sockets (Next & Prev)
  Object.values(nodes).forEach((node) => {
    if (!node || !node.sockets || !node.position) return;

    Object.entries(node.sockets).forEach(([socketType, edge]) => {
      if (!edge || !edge.targetId) return;

      let sourceX = node.position.x + NODE_WIDTH;
      let sourceY = node.position.y + HALF_HEIGHT;

      if (socketType === 'prev') {
        sourceX = node.position.x;
        sourceY = node.position.y + HALF_HEIGHT;
      }

      let isDangling = false;
      let isLoop = false;
      let targetX = sourceX + 60;
      let targetY = sourceY;

      if (nodes[edge.targetId] && nodes[edge.targetId].position) {
        const targetNode = nodes[edge.targetId];
        if (socketType === 'prev') {
          targetX = targetNode.position.x + NODE_WIDTH;
          targetY = targetNode.position.y + HALF_HEIGHT;
        } else {
          targetX = targetNode.position.x;
          targetY = targetNode.position.y + HALF_HEIGHT;
        }

        if (targetNode.position.x <= node.position.x && socketType === 'next') {
          isLoop = true;
        }
      } else {
        isDangling = true;
        targetX = sourceX + 70;
        targetY = sourceY + 25;
      }

      edgesToRender.push({
        id: `edge-${node.id}-${socketType}`,
        sourceId: node.id,
        sourceType: 'socket',
        socketType,
        targetId: edge.targetId,
        path: computeBezierPath(sourceX, sourceY, targetX, targetY, socketType === 'prev', isLoop),
        midX: (sourceX + targetX) / 2,
        midY: (sourceY + targetY) / 2,
        isDangling,
        targetX,
        targetY,
      });
    });
  });

  const handleEdgeClick = (e, edge) => {
    e.stopPropagation();
    setSelectedEdge({
      sourceId: edge.sourceId,
      sourceType: edge.sourceType,
      socketType: edge.socketType,
      targetId: edge.targetId,
      x: edge.midX,
      y: edge.midY,
    });
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
      <defs>
        {/* Standard Arrowhead */}
        <marker
          id="arrow-head-primary"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-primary)" />
        </marker>

        {/* Accent Arrowhead */}
        <marker
          id="arrow-head-accent"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-accent)" />
        </marker>

        {/* Warning Arrowhead */}
        <marker
          id="arrow-head-warning"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-amber-accent)" />
        </marker>

        {/* Prev Arrowhead */}
        <marker
          id="arrow-head-prev"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-sage-accent)" />
        </marker>
      </defs>

      {/* Render All Established Edges */}
      {edgesToRender.map((edge) => {
        if (edge.isDangling) {
          return (
            <g key={edge.id} className="pointer-events-auto cursor-pointer" onClick={(e) => handleEdgeClick(e, edge)}>
              <path
                d={edge.path}
                stroke="var(--color-amber-accent)"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                fill="none"
                markerEnd="url(#arrow-head-warning)"
              />
              <text
                x={edge.targetX + 8}
                y={edge.targetY + 4}
                fill="var(--color-amber-accent)"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                [Dangling]
              </text>
            </g>
          );
        }

        const strokeColor =
          edge.socketType === 'prev'
            ? 'var(--color-sage-accent)'
            : 'var(--color-primary)';
        const markerEnd =
          edge.socketType === 'prev'
            ? 'url(#arrow-head-prev)'
            : 'url(#arrow-head-primary)';

        return (
          <g key={edge.id} className="pointer-events-auto cursor-pointer group" onClick={(e) => handleEdgeClick(e, edge)}>
            {/* Wider transparent hit area for easy clicking */}
            <path
              d={edge.path}
              stroke="transparent"
              strokeWidth="14"
              fill="none"
            />
            <path
              d={edge.path}
              stroke={strokeColor}
              strokeWidth="2"
              fill="none"
              markerEnd={markerEnd}
              className="group-hover:stroke-accent transition-colors"
            />
          </g>
        );
      })}

      {/* Active Drawing Pointer Wire */}
      {activeWire && (
        <path
          d={computeBezierPath(
            activeWire.startX,
            activeWire.startY,
            activeWire.cursorX,
            activeWire.cursorY,
            activeWire.socketType === 'prev'
          )}
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          fill="none"
          markerEnd="url(#arrow-head-accent)"
        />
      )}
    </svg>
  );
};
