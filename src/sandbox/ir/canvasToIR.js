/**
 * @fileoverview Converts the canvas state (nodes, pointers, structures)
 * into a language-agnostic IR Program.
 */

/**
 * Determines a stable variable name for a node based on its sort order (left-to-right).
 * Returns a map from nodeId → varName (n1, n2, n3, ...).
 *
 * @param {Object} nodes
 * @returns {Map<string, string>}
 */
export function buildVarMap(nodes) {
  const sorted = Object.values(nodes || {}).sort((a, b) => {
    const ax = a.position?.x ?? 0;
    const bx = b.position?.x ?? 0;
    const ay = a.position?.y ?? 0;
    const by = b.position?.y ?? 0;
    if (Math.abs(ax - bx) < 10) return ay - by;
    return ax - bx;
  });

  const map = new Map();
  sorted.forEach((node, i) => {
    map.set(node.id, node.varName || `n${i + 1}`);
  });
  return map;
}

/**
 * Converts canvas state to an IR Program.
 *
 * @param {Object} nodes
 * @param {Object} pointers
 * @param {Object} [structures]
 * @returns {import('./types.js').Program}
 */
export function canvasToIR(nodes = {}, pointers = {}, structures = {}) {
  /** @type {import('./types.js').Program} */
  const program = [];

  const varMap = buildVarMap(nodes);

  // Helper: resolve a targetId to a variable name or 'NULL'
  const resolveTarget = (targetId) => {
    if (!targetId) return null;
    if (targetId === 'NULL' || String(targetId).startsWith('null-')) {
      return 'NULL';
    }
    return varMap.get(targetId) || null;
  };

  // 1. newNode ops — one per node, in left-to-right order
  const sortedNodes = Object.values(nodes || {}).sort((a, b) => {
    const ax = a.position?.x ?? 0;
    const bx = b.position?.x ?? 0;
    const ay = a.position?.y ?? 0;
    const by = b.position?.y ?? 0;
    if (Math.abs(ax - bx) < 10) return ay - by;
    return ax - bx;
  });

  for (const node of sortedNodes) {
    const varName = varMap.get(node.id);
    const val = node.value !== undefined ? node.value : node.data;
    const numVal = isNaN(Number(val)) ? val : Number(val);
    program.push({
      op: 'newNode',
      var: varName,
      value: numVal,
      nodeType: node.nodeType || node.type || 'singly',
    });
  }

  // 2. setNext and setPrev ops
  for (const node of sortedNodes) {
    const nextTargetId = node.next !== undefined ? node.next : node.sockets?.next?.targetId;
    if (nextTargetId) {
      const target = resolveTarget(nextTargetId);
      if (target !== null) {
        program.push({
          op: 'setNext',
          node: varMap.get(node.id),
          target,
        });
      }
    }

    const prevTargetId = node.prev !== undefined ? node.prev : node.sockets?.prev?.targetId;
    if (prevTargetId) {
      const target = resolveTarget(prevTargetId);
      if (target !== null) {
        program.push({
          op: 'setPrev',
          node: varMap.get(node.id),
          target,
        });
      }
    }
  }

  // 3. Pointer ops (head, curr, tail, custom)
  // Sort: head first, then tail, then curr, then others alphabetically
  const ptrOrder = (name) => {
    if (name === 'head') return 0;
    if (name === 'tail') return 1;
    if (name === 'curr') return 2;
    return 3;
  };

  const sortedPtrs = Object.values(pointers || {}).sort(
    (a, b) => {
      const nameA = a.name || a.label || '';
      const nameB = b.name || b.label || '';
      return ptrOrder(nameA) - ptrOrder(nameB) || nameA.localeCompare(nameB);
    }
  );

  for (const ptr of sortedPtrs) {
    const ptrName = ptr.name || ptr.label;
    if (!ptrName) continue;
    if (!ptr.targetId && !ptr.isExplicitNull) continue;

    const target = ptr.isExplicitNull ? 'NULL' : resolveTarget(ptr.targetId);
    if (target === null) continue;

    program.push({
      op: 'declarePointer',
      var: ptrName,
      target,
    });
  }

  // 4. Structures (Array, Stack, Queue)
  for (const struct of Object.values(structures || {})) {
    const sVar = struct.varName || struct.name || struct.id;
    if (struct.type === 'array') {
      program.push({
        op: 'createStructure',
        type: 'array',
        var: sVar,
        config: { capacity: struct.capacity || 8 },
      });
      (struct.items || []).forEach((item, idx) => {
        if (item !== null && item !== undefined) {
          program.push({
            op: 'setIndex',
            target: sVar,
            index: idx,
            value: item,
          });
        }
      });
    } else if (struct.type === 'stack') {
      program.push({
        op: 'createStructure',
        type: 'stack',
        var: sVar,
        config: { capacity: struct.capacity || 6 },
      });
      (struct.items || []).forEach((item) => {
        if (item !== null && item !== undefined) {
          program.push({
            op: 'call',
            target: sVar,
            method: 'push',
            args: [item],
          });
        }
      });
    } else if (struct.type === 'queue') {
      program.push({
        op: 'createStructure',
        type: 'queue',
        var: sVar,
        config: { capacity: struct.capacity || 6 },
      });
      (struct.items || []).forEach((item) => {
        if (item !== null && item !== undefined) {
          program.push({
            op: 'call',
            target: sVar,
            method: 'enqueue',
            args: [item],
          });
        }
      });
    }
  }

  return program;
}
