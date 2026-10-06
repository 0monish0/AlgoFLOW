/**
 * @fileoverview Pure Linked List data structure engine (Singly, Doubly, Circular, Circular Doubly).
 * Operates on the shared heap for node allocations.
 */

import { ERROR_CODES, STEP_TYPES, BIG_O } from '../types.js';
import { createError } from '../errors.js';
import { allocNode } from '../heap.js';

export function createLinkedListStructure(id, name, {
  listType = 'singly', // 'singly' | 'doubly' | 'circular' | 'circular_doubly'
  trackTail = true,
  head = null,
  tail = null,
} = {}) {
  return {
    id,
    type: 'linkedlist',
    name,
    listType,
    trackTail,
    head,
    tail,
    size: 0,
    freeformMode: false,
  };
}

export function listInsertHead(struct, heap, value) {
  const newNodeId = allocNode(heap, value, {
    next: struct.head,
    prev: null,
  });

  const steps = [
    { type: STEP_TYPES.CREATE, target: newNodeId, description: `Allocated new node [${value}]` },
  ];

  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';

  if (!struct.head) {
    // Empty list
    if (isCircular) {
      heap[newNodeId].next = newNodeId;
      if (isDoubly) heap[newNodeId].prev = newNodeId;
    }

    const nextStruct = {
      ...struct,
      head: newNodeId,
      tail: newNodeId,
      size: 1,
    };

    steps.push({
      type: STEP_TYPES.LINK,
      target: `${struct.id}.head`,
      description: `Set head (and tail) to new node [${value}]`,
    });

    return { nextStruct, steps, result: newNodeId, complexity: BIG_O.O_1 };
  }

  // Non-empty list
  steps.push({
    type: STEP_TYPES.LINK,
    target: `${newNodeId}.next`,
    description: `Set new node.next -> current head [${heap[struct.head].value}]`,
  });

  if (isDoubly) {
    heap[struct.head].prev = newNodeId;
    steps.push({
      type: STEP_TYPES.LINK,
      target: `${struct.head}.prev`,
      description: `Set current head.prev -> new node [${value}]`,
    });
  }

  let nextTail = struct.tail;
  if (isCircular) {
    if (nextTail && heap[nextTail]) {
      heap[nextTail].next = newNodeId;
      if (isDoubly) heap[newNodeId].prev = nextTail;
      steps.push({
        type: STEP_TYPES.LINK,
        target: `${nextTail}.next`,
        description: `Updated circular tail.next -> new head [${value}]`,
      });
    }
  }

  const nextStruct = {
    ...struct,
    head: newNodeId,
    tail: nextTail || struct.tail,
    size: struct.size + 1,
  };

  steps.push({
    type: STEP_TYPES.LINK,
    target: `${struct.id}.head`,
    description: `Updated head pointer to [${value}]`,
  });

  return { nextStruct, steps, result: newNodeId, complexity: BIG_O.O_1 };
}

export function listInsertTail(struct, heap, value) {
  if (!struct.head) {
    return listInsertHead(struct, heap, value);
  }

  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';

  const newNodeId = allocNode(heap, value, {
    next: isCircular ? struct.head : null,
    prev: null,
  });

  const steps = [
    { type: STEP_TYPES.CREATE, target: newNodeId, description: `Allocated new node [${value}]` },
  ];

  let currentTail = struct.tail;
  let traversalCost = BIG_O.O_1;

  if (!currentTail || !heap[currentTail]) {
    // Traverse from head to find tail
    traversalCost = BIG_O.O_N;
    let curr = struct.head;
    while (heap[curr] && heap[curr].next && heap[curr].next !== struct.head) {
      steps.push({ type: STEP_TYPES.VISIT, target: curr, description: `Traversing towards tail... visiting [${heap[curr].value}]` });
      curr = heap[curr].next;
    }
    currentTail = curr;
  }

  if (heap[currentTail]) {
    heap[currentTail].next = newNodeId;
    steps.push({
      type: STEP_TYPES.LINK,
      target: `${currentTail}.next`,
      description: `Set old tail.next -> new node [${value}]`,
    });

    if (isDoubly) {
      heap[newNodeId].prev = currentTail;
      steps.push({
        type: STEP_TYPES.LINK,
        target: `${newNodeId}.prev`,
        description: `Set new node.prev -> old tail [${heap[currentTail].value}]`,
      });
    }

    if (isCircular) {
      heap[newNodeId].next = struct.head;
      if (isDoubly && heap[struct.head]) {
        heap[struct.head].prev = newNodeId;
      }
      steps.push({
        type: STEP_TYPES.LINK,
        target: `${newNodeId}.next`,
        description: `Set circular link: new tail.next -> head [${heap[struct.head].value}]`,
      });
    }
  }

  const nextStruct = {
    ...struct,
    tail: newNodeId,
    size: struct.size + 1,
  };

  return { nextStruct, steps, result: newNodeId, complexity: struct.trackTail ? BIG_O.O_1 : traversalCost };
}

export function listDeleteHead(struct, heap) {
  if (!struct.head) {
    return {
      error: createError(ERROR_CODES.NULL_POINTER, 'Cannot delete from empty linked list'),
      complexity: BIG_O.O_1,
    };
  }

  const oldHead = struct.head;
  const oldHeadVal = heap[oldHead]?.value;
  const nextHead = heap[oldHead]?.next;
  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';

  const steps = [
    { type: STEP_TYPES.DESTROY, target: oldHead, description: `Deleting head node [${oldHeadVal}]` },
  ];

  if (oldHead === nextHead || !nextHead || struct.size <= 1) {
    // Only 1 node
    delete heap[oldHead];
    return {
      nextStruct: { ...struct, head: null, tail: null, size: 0 },
      steps,
      result: oldHeadVal,
      complexity: BIG_O.O_1,
    };
  }

  delete heap[oldHead];

  if (heap[nextHead]) {
    if (isDoubly) {
      heap[nextHead].prev = isCircular && struct.tail ? struct.tail : null;
    }
  }

  if (isCircular && struct.tail && heap[struct.tail]) {
    heap[struct.tail].next = nextHead;
  }

  const nextStruct = {
    ...struct,
    head: nextHead,
    size: Math.max(0, struct.size - 1),
  };

  steps.push({
    type: STEP_TYPES.LINK,
    target: `${struct.id}.head`,
    description: `Updated head pointer to [${heap[nextHead]?.value}]`,
  });

  return { nextStruct, steps, result: oldHeadVal, complexity: BIG_O.O_1 };
}

export function listDeleteTail(struct, heap) {
  if (!struct.head) {
    return {
      error: createError(ERROR_CODES.NULL_POINTER, 'Cannot delete from empty linked list'),
      complexity: BIG_O.O_1,
    };
  }

  if (struct.head === struct.tail || struct.size <= 1) {
    return listDeleteHead(struct, heap);
  }

  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';
  const steps = [];

  let oldTail = struct.tail;
  let newTail = null;

  if (isDoubly && oldTail && heap[oldTail]?.prev) {
    newTail = heap[oldTail].prev;
  } else {
    // Traverse from head
    let curr = struct.head;
    while (heap[curr] && heap[curr].next && heap[curr].next !== oldTail && heap[curr].next !== struct.head) {
      curr = heap[curr].next;
    }
    newTail = curr;
  }

  const deletedVal = heap[oldTail]?.value;
  delete heap[oldTail];

  if (heap[newTail]) {
    heap[newTail].next = isCircular ? struct.head : null;
    if (isCircular && isDoubly && heap[struct.head]) {
      heap[struct.head].prev = newTail;
    }
  }

  steps.push({
    type: STEP_TYPES.DESTROY,
    target: oldTail,
    description: `Deleted tail node [${deletedVal}]. New tail is [${heap[newTail]?.value}]`,
  });

  const nextStruct = {
    ...struct,
    tail: newTail,
    size: Math.max(0, struct.size - 1),
  };

  return {
    nextStruct,
    steps,
    result: deletedVal,
    complexity: isDoubly && struct.trackTail ? BIG_O.O_1 : BIG_O.O_N,
  };
}

export function listReverse(struct, heap) {
  if (!struct.head || struct.size <= 1) {
    return { nextStruct: struct, steps: [], result: true, complexity: BIG_O.O_1 };
  }

  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';
  const steps = [];

  let prev = isCircular ? struct.tail : null;
  let curr = struct.head;
  const initialHead = struct.head;

  do {
    const nextNode = heap[curr]?.next;
    steps.push({
      type: STEP_TYPES.VISIT,
      target: curr,
      description: `Reversing links at node [${heap[curr]?.value}]`,
    });

    if (heap[curr]) {
      heap[curr].next = prev;
      if (isDoubly) {
        heap[curr].prev = nextNode;
      }
    }

    prev = curr;
    curr = nextNode;
  } while (curr && curr !== initialHead && curr !== 'NULL');

  const nextStruct = {
    ...struct,
    head: struct.tail,
    tail: struct.head,
  };

  steps.push({
    type: STEP_TYPES.LINK,
    target: `${struct.id}.head`,
    description: `Reverse complete. Swapped head and tail.`,
  });

  return { nextStruct, steps, result: true, complexity: BIG_O.O_N };
}

export function checkListInvariants(struct, heap) {
  const violations = [];
  if (!struct.head) return violations;

  const isDoubly = struct.listType === 'doubly' || struct.listType === 'circular_doubly';
  const isCircular = struct.listType === 'circular' || struct.listType === 'circular_doubly';

  // Head prev check
  if (isDoubly && !isCircular) {
    if (heap[struct.head]?.prev !== null) {
      violations.push(`Invariant broken: head.prev is not NULL (points to ${heap[struct.head]?.prev})`);
    }
  }

  // Traversal consistency
  let curr = struct.head;
  const visited = new Set();

  while (curr && !visited.has(curr)) {
    visited.add(curr);
    const node = heap[curr];
    if (!node) break;

    if (isDoubly && node.next && node.next !== struct.head) {
      const nextNode = heap[node.next];
      if (nextNode && nextNode.prev !== curr) {
        violations.push(`Asymmetry broken: [${node.value}].next -> [${nextNode.value}], but next.prev does not point back.`);
      }
    }

    curr = node.next;
    if (isCircular && curr === struct.head) break;
  }

  return violations;
}
