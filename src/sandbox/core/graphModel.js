/**
 * Graph data model primitives for the Unified Linked List Sandbox.
 */

// Refined, balanced color palette for unattached nodes
export const NODE_PALETTE = [
  '#0284C7', // Sky Blue
  '#7C3AED', // Muted Purple
  '#DB2777', // Soft Rose/Pink
  '#2563EB', // Royal Blue
  '#D97706', // Warm Amber
  '#4F46E5', // Indigo
  '#E11D48', // Crimson Rose
  '#0D9488', // Balanced Teal
];

// Unified brand theme accent color matching navbar & entire app (Modern Emerald #10B981)
export const CONNECTED_COLOR = '#10B981';

export const createNode = (data = 10, position = { x: 300, y: 220 }, nodeType = 'singly') => {
  const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const sockets = {
    next: null,
  };

  if (nodeType === 'doubly') {
    sockets.prev = null;
  }

  const randomColor = NODE_PALETTE[Math.floor(Math.random() * NODE_PALETTE.length)];

  return {
    id,
    data: String(data),
    position,
    nodeType, // 'singly' | 'doubly'
    sockets,
    color: randomColor,
    status: 'unattached', // 'unattached' | 'reachable' | 'leaking' | 'collected'
    hasEverBeenReachable: false,
    leakStartedAt: null,
  };
};

export const createFreePointer = (label = 'ptr', targetId = null, position = { x: 140, y: 220 }) => {
  const id = `ptr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  return {
    id,
    label,
    targetId, // nodeId | 'NULL' | null
    position,
  };
};

export const createNullToken = (position = { x: 680, y: 220 }) => {
  const id = `null-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  return {
    id,
    position,
  };
};

/**
 * Initial empty canvas graph for the unified sandbox.
 */
export const getInitialGraph = () => {
  return {
    nodes: {},
    freePointers: {},
    nullTokens: {},
  };
};
