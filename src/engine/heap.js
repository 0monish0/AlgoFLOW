/**
 * @fileoverview Heap memory manager, value/reference helpers, and reachability computation.
 */

export function isRef(val) {
  return typeof val === 'object' && val !== null && '$ref' in val;
}

export function makeRef(targetId) {
  return { $ref: targetId };
}

export function unwrapValue(val, heap) {
  if (isRef(val)) {
    const target = heap[val.$ref];
    return target ? target.value ?? target.data ?? target : null;
  }
  return val;
}

export function createHeap() {
  return {};
}

let nextIdCounter = 1;
export function generateHeapId(prefix = 'obj') {
  return `${prefix}_${Date.now().toString(36)}_${nextIdCounter++}`;
}

export function allocNode(heap, value, { next = null, prev = null } = {}) {
  const id = generateHeapId('node');
  heap[id] = {
    id,
    type: 'node',
    value,
    next,
    prev,
  };
  return id;
}

export function allocTreeNode(heap, value, { left = null, right = null, x = 0, y = 0 } = {}) {
  const id = generateHeapId('tree_node');
  heap[id] = {
    id,
    type: 'tree_node',
    value,
    left,
    right,
    x,
    y,
  };
  return id;
}

export function allocCell(heap, value, { index = 0, structureId = null } = {}) {
  const id = generateHeapId('cell');
  heap[id] = {
    id,
    type: 'cell',
    value,
    index,
    structureId,
  };
  return id;
}

/**
 * Computes reachability of all heap objects from structure entrypoints and named pointers.
 * Returns { reachable: Set<string>, garbage: Set<string>, dangling: Array<{ sourceId, targetId, path }> }
 */
export function computeReachability(heap, structures, namedPointers = {}) {
  const reachable = new Set();
  const queue = [];
  const dangling = [];

  // Helper to safely enqueue a reference or ID
  function visitRef(targetId, sourceInfo) {
    if (!targetId || targetId === 'NULL') return;
    if (isRef(targetId)) {
      targetId = targetId.$ref;
    }
    if (heap[targetId]) {
      if (!reachable.has(targetId)) {
        reachable.add(targetId);
        queue.push(targetId);
      }
    } else if (structures[targetId]) {
      // Points to another structure instance
      reachable.add(targetId);
    } else {
      dangling.push({
        sourceId: sourceInfo?.sourceId || 'unknown',
        targetId,
        path: sourceInfo?.path || '',
      });
    }
  }

  // 1. Enqueue roots from named pointers
  Object.entries(namedPointers).forEach(([name, ptr]) => {
    if (ptr && ptr.target) {
      visitRef(ptr.target, { sourceId: `ptr:${name}`, path: name });
    }
  });

  // 2. Enqueue roots from each structure instance
  Object.values(structures).forEach((struct) => {
    reachable.add(struct.id);
    switch (struct.type) {
      case 'linkedlist': {
        if (struct.head) visitRef(struct.head, { sourceId: struct.id, path: 'head' });
        if (struct.tail) visitRef(struct.tail, { sourceId: struct.id, path: 'tail' });
        break;
      }
      case 'tree': {
        if (struct.root) visitRef(struct.root, { sourceId: struct.id, path: 'root' });
        break;
      }
      case 'array':
      case 'stack':
      case 'queue': {
        if (Array.isArray(struct.items)) {
          struct.items.forEach((item, idx) => {
            if (isRef(item)) {
              visitRef(item.$ref, { sourceId: struct.id, path: `[${idx}]` });
            }
          });
        }
        break;
      }
      default:
        break;
    }
  });

  // 3. Traverse heap objects
  while (queue.length > 0) {
    const currId = queue.shift();
    const obj = heap[currId];
    if (!obj) continue;

    // Check inner value if it holds a reference
    if (isRef(obj.value)) {
      visitRef(obj.value.$ref, { sourceId: currId, path: 'value' });
    }

    if (obj.type === 'node') {
      if (obj.next) visitRef(obj.next, { sourceId: currId, path: 'next' });
      if (obj.prev) visitRef(obj.prev, { sourceId: currId, path: 'prev' });
    } else if (obj.type === 'tree_node') {
      if (obj.left) visitRef(obj.left, { sourceId: currId, path: 'left' });
      if (obj.right) visitRef(obj.right, { sourceId: currId, path: 'right' });
    }
  }

  // 4. Partition heap nodes into garbage
  const garbage = new Set();
  Object.keys(heap).forEach((id) => {
    if (!reachable.has(id)) {
      garbage.add(id);
    }
  });

  return { reachable, garbage, dangling };
}
