/**
 * Pure graph evaluator for the Unified Linked List Sandbox.
 * Walks reachability from every active free pointer across node sockets,
 * verifies bidirectional doubly link invariants, and tracks memory decay.
 */

export const evaluateGraph = (nodes = {}, freePointers = {}, nullTokens = {}) => {
  const reachableNodeIds = new Set();
  const orphanedNodeIds = new Set();
  const unattachedNodeIds = new Set();
  const danglingEdges = [];
  const cycleNodeIds = new Set();
  let hasCycle = false;
  const traversalOrder = [];
  const violations = [];

  const allNodeIds = Object.keys(nodes);

  // 1. Gather all aimed free pointer root targets
  const entryPoints = [];
  Object.values(freePointers).forEach((fp) => {
    if (fp && fp.targetId) {
      if (fp.targetId === 'NULL') {
        // Points to NULL (valid terminator)
      } else if (nodes[fp.targetId]) {
        entryPoints.push(fp.targetId);
      } else {
        danglingEdges.push({
          sourceId: fp.id,
          sourceType: 'pointer',
          label: fp.label,
          missingTargetId: fp.targetId,
        });
      }
    }
  });

  // 2. BFS / DFS Reachability Walk from all live entry pointers
  entryPoints.forEach((startNodeId) => {
    const queue = [startNodeId];
    const visitedInWalk = new Set();

    while (queue.length > 0) {
      const currId = queue.shift();
      if (!currId || !nodes[currId]) continue;

      reachableNodeIds.add(currId);
      if (!traversalOrder.includes(currId)) {
        traversalOrder.push(currId);
      }

      if (visitedInWalk.has(currId)) {
        hasCycle = true;
        cycleNodeIds.add(currId);
        continue;
      }
      visitedInWalk.add(currId);

      const node = nodes[currId];
      if (!node || !node.sockets) continue;

      // Next socket
      if (node.sockets.next && node.sockets.next.targetId && node.sockets.next.targetId !== 'NULL') {
        const targetId = node.sockets.next.targetId;
        if (nodes[targetId]) {
          if (!visitedInWalk.has(targetId)) {
            queue.push(targetId);
          } else {
            hasCycle = true;
            cycleNodeIds.add(targetId);
          }
        }
      }

      // Prev socket (if Doubly)
      if (node.nodeType === 'doubly' && node.sockets.prev && node.sockets.prev.targetId && node.sockets.prev.targetId !== 'NULL') {
        const targetId = node.sockets.prev.targetId;
        if (nodes[targetId]) {
          if (!visitedInWalk.has(targetId)) {
            queue.push(targetId);
          }
        }
      }
    }
  });

  // 3. Partition remaining nodes into 'unattached' (never yet reached) vs 'orphaned' (lost reachability)
  allNodeIds.forEach((id) => {
    const node = nodes[id];
    if (!node) return;

    if (!reachableNodeIds.has(id)) {
      if (node.hasEverBeenReachable) {
        orphanedNodeIds.add(id);
      } else {
        unattachedNodeIds.add(id);
      }
    }
  });

  // 4. Check for dangling sockets & bidirectional doubly link consistency
  allNodeIds.forEach((nodeId) => {
    const node = nodes[nodeId];
    if (!node || !node.sockets) return;

    // Check Next Socket
    if (node.sockets.next && node.sockets.next.targetId && node.sockets.next.targetId !== 'NULL') {
      const targetId = node.sockets.next.targetId;
      const targetNode = nodes[targetId];

      if (!targetNode) {
        danglingEdges.push({
          sourceId: nodeId,
          sourceType: 'socket',
          socketType: 'next',
          missingTargetId: targetId,
        });
      } else {
        // If target node is Doubly, check if target.prev points back to this node
        if (targetNode.nodeType === 'doubly' && node.nodeType === 'doubly') {
          if (targetNode.sockets?.prev?.targetId !== nodeId) {
            violations.push({
              id: `doubly-inconsistent-${nodeId}-${targetId}`,
              message: `Asymmetry: [${node.data}].next points to [${targetNode.data}], but [${targetNode.data}].prev does not point back to [${node.data}].`,
              severity: 'info',
            });
          }
        }
      }
    }

    // Check Prev Socket
    if (node.nodeType === 'doubly' && node.sockets.prev && node.sockets.prev.targetId && node.sockets.prev.targetId !== 'NULL') {
      const targetId = node.sockets.prev.targetId;
      if (!nodes[targetId]) {
        danglingEdges.push({
          sourceId: nodeId,
          sourceType: 'socket',
          socketType: 'prev',
          missingTargetId: targetId,
        });
      }
    }
  });

  if (danglingEdges.length > 0) {
    violations.push({
      id: 'dangling-edges',
      message: `${danglingEdges.length} dangling pointer(s) pointing to deleted memory.`,
      severity: 'warning',
    });
  }

  return {
    reachableNodeIds,
    orphanedNodeIds,
    unattachedNodeIds,
    danglingEdges,
    hasCycle,
    cycleNodeIds,
    traversalOrder,
    violations,
  };
};
