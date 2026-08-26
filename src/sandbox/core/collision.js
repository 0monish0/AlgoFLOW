import { NODE_DIAMETER } from '../components/NodePrimitive';
import { POINTER_WIDTH, POINTER_HEIGHT } from '../components/PointerPrimitive';
import { NULL_WIDTH, NULL_HEIGHT } from '../components/NullToken';

const GAP = 12;

export const getItemBounds = (item, type) => {
  if (type === 'node') {
    return {
      x: item.position.x,
      y: item.position.y,
      width: NODE_DIAMETER,
      height: NODE_DIAMETER,
    };
  }
  if (type === 'pointer') {
    return {
      x: item.position.x,
      y: item.position.y,
      width: POINTER_WIDTH,
      height: POINTER_HEIGHT,
    };
  }
  if (type === 'null') {
    return {
      x: item.position.x,
      y: item.position.y,
      width: NULL_WIDTH,
      height: NULL_HEIGHT,
    };
  }
  return { x: item.position.x, y: item.position.y, width: 80, height: 40 };
};

/**
 * Universal 2D collision resolution for all sandbox elements (Nodes, Pointers/HEAD, NULL tokens).
 * Ensures that no element on the canvas can ever penetrate or overlap any other element.
 *
 * @param {string} movingId - ID of item being moved/spawned
 * @param {'node'|'pointer'|'null'} movingType - Type of item being moved
 * @param {{x: number, y: number}} candidatePos - Proposed (x, y) coordinates
 * @param {{nodes: Object, freePointers: Object, nullTokens: Object}} allElements - Current graph state
 * @returns {{x: number, y: number}} Collision-free (x, y) coordinates
 */
export const resolveCanvasCollision = (
  movingId,
  movingType,
  candidatePos,
  { nodes = {}, freePointers = {}, nullTokens = {} }
) => {
  let { x, y } = candidatePos;
  const selfBounds = getItemBounds({ position: { x, y } }, movingType);
  const hwA = selfBounds.width / 2;
  const hhA = selfBounds.height / 2;

  // Gather all other active obstacles on the canvas
  const obstacles = [];

  Object.values(nodes || {}).forEach((n) => {
    if (!n || n.id === movingId || !n.position) return;
    obstacles.push(getItemBounds(n, 'node'));
  });

  Object.values(freePointers || {}).forEach((p) => {
    if (!p || p.id === movingId || !p.position) return;
    // If pointer is targeting a live node and is not HEAD, it is attached beneath the node
    const isHead = p.label?.toLowerCase() === 'head';
    const isTargetingLiveNode = Boolean(p.targetId && nodes[p.targetId]);
    if (isTargetingLiveNode && !isHead) return;

    obstacles.push(getItemBounds(p, 'pointer'));
  });

  Object.values(nullTokens || {}).forEach((nt) => {
    if (!nt || nt.id === movingId || !nt.position) return;
    obstacles.push(getItemBounds(nt, 'null'));
  });

  // Iterative relaxation to resolve compound collisions in dense layouts
  for (let iter = 0; iter < 4; iter++) {
    let hadCollision = false;

    for (const obs of obstacles) {
      const hwB = obs.width / 2;
      const hhB = obs.height / 2;
      const minDx = hwA + hwB + GAP;
      const minDy = hhA + hhB + GAP;

      const cxA = x + hwA;
      const cyA = y + hhA;
      const cxB = obs.x + hwB;
      const cyB = obs.y + hhB;

      let dx = cxA - cxB;
      let dy = cyA - cyB;

      const normX = dx / minDx;
      const normY = dy / minDy;
      const dist = Math.hypot(normX, normY);

      if (dist < 1) {
        hadCollision = true;
        if (dist === 0) {
          dx = minDx;
          dy = 0;
        } else {
          const scale = 1 / dist;
          dx = normX * scale * minDx;
          dy = normY * scale * minDy;
        }
        x = cxB + dx - hwA;
        y = cyB + dy - hhA;
      }
    }

    if (!hadCollision) break;
  }

  return { x: Math.round(x), y: Math.round(y) };
};
