/**
 * Graph data model primitives for the Unified Linked List Sandbox.
 */

export const createNode = (data = 10, position = { x: 300, y: 220 }, nodeType = 'singly') => {
  const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const sockets = {
    next: null,
  };

  if (nodeType === 'doubly') {
    sockets.prev = null;
  }

  return {
    id,
    data: String(data),
    position,
    nodeType, // 'singly' | 'doubly'
    sockets,
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
