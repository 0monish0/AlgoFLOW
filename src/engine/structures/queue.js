/**
 * @fileoverview Pure Queue data structure implementation (Simple, Circular, Deque, Priority Queue).
 */

import { ERROR_CODES, STEP_TYPES, BIG_O } from '../types.js';
import { createError } from '../errors.js';

export function createQueueStructure(id, name, {
  queueType = 'simple', // 'simple' | 'circular' | 'deque' | 'priority'
  capacity = 6,
  minMax = 'min', // for priority queue: 'min' | 'max'
  items = [],
} = {}) {
  return {
    id,
    type: 'queue',
    name,
    queueType,
    capacity,
    minMax,
    items: [...items], // For simple: backing array. For circular: backing array. For priority: binary heap array.
    frontIndex: 0,
    rearIndex: items.length > 0 ? items.length - 1 : -1,
    size: items.length,
    falseFullWarning: false,
  };
}

export function queueEnqueue(struct, value) {
  const steps = [];

  // 1. SIMPLE QUEUE (Classic array-backed false-full demonstration)
  if (struct.queueType === 'simple') {
    if (struct.rearIndex >= struct.capacity - 1) {
      const isActuallyFull = struct.size >= struct.capacity;
      return {
        error: createError(
          ERROR_CODES.QUEUE_FULL,
          isActuallyFull
            ? `Queue is full (capacity ${struct.capacity}).`
            : `False-Full Detected: Rear reached capacity ${struct.capacity}, yet ${struct.frontIndex} slots at front are wasted! Switch to Circular Queue to fix.`
        ),
        complexity: BIG_O.O_1,
      };
    }

    const nextItems = [...struct.items];
    const newRear = struct.rearIndex + 1;
    nextItems[newRear] = value;

    steps.push({
      type: STEP_TYPES.CREATE,
      target: `${struct.id}[${newRear}]`,
      description: `Enqueued ${value} at rear index ${newRear}`,
    });

    const nextStruct = {
      ...struct,
      items: nextItems,
      rearIndex: newRear,
      size: struct.size + 1,
    };

    return { nextStruct, steps, result: value, complexity: BIG_O.O_1 };
  }

  // 2. CIRCULAR QUEUE
  if (struct.queueType === 'circular') {
    if (struct.size >= struct.capacity) {
      return {
        error: createError(ERROR_CODES.QUEUE_FULL, `Circular Queue is full (capacity ${struct.capacity})`),
        complexity: BIG_O.O_1,
      };
    }

    const nextItems = [...struct.items];
    // ensure buffer is size of capacity
    while (nextItems.length < struct.capacity) {
      nextItems.push(null);
    }

    const newRear = (struct.rearIndex + 1) % struct.capacity;
    nextItems[newRear] = value;

    steps.push({
      type: STEP_TYPES.CREATE,
      target: `${struct.id}[${newRear}]`,
      description: `Enqueued ${value} at (rear + 1) % capacity -> slot ${newRear}`,
    });

    const nextStruct = {
      ...struct,
      items: nextItems,
      rearIndex: newRear,
      size: struct.size + 1,
    };

    return { nextStruct, steps, result: value, complexity: BIG_O.O_1 };
  }

  // 3. DEQUE (Enqueue at rear)
  if (struct.queueType === 'deque') {
    return dequeAddRear(struct, value);
  }

  // 4. PRIORITY QUEUE (Binary Heap with Sift-Up)
  if (struct.queueType === 'priority') {
    if (struct.items.length >= struct.capacity) {
      return {
        error: createError(ERROR_CODES.QUEUE_FULL, `Priority Queue is full (capacity ${struct.capacity})`),
        complexity: BIG_O.O_LOG_N,
      };
    }

    const heap = [...struct.items, value];
    steps.push({
      type: STEP_TYPES.CREATE,
      target: `${struct.id}[${heap.length - 1}]`,
      description: `Inserted ${value} at leaf position index ${heap.length - 1}`,
    });

    // Sift-up
    let idx = heap.length - 1;
    const isMin = struct.minMax === 'min';

    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const shouldSwap = isMin ? heap[idx] < heap[parentIdx] : heap[idx] > heap[parentIdx];

      steps.push({
        type: STEP_TYPES.COMPARE,
        target: `${struct.id}[${idx}],${struct.id}[${parentIdx}]`,
        description: `Comparing child (${heap[idx]}) with parent (${heap[parentIdx]})`,
      });

      if (shouldSwap) {
        steps.push({
          type: STEP_TYPES.SWAP,
          target: `${struct.id}[${idx}],${struct.id}[${parentIdx}]`,
          description: `Sift-up: swapped child [${idx}] with parent [${parentIdx}]`,
        });
        const temp = heap[idx];
        heap[idx] = heap[parentIdx];
        heap[parentIdx] = temp;
        idx = parentIdx;
      } else {
        break;
      }
    }

    const nextStruct = {
      ...struct,
      items: heap,
      size: heap.length,
    };

    return { nextStruct, steps, result: value, complexity: BIG_O.O_LOG_N };
  }

  return { error: createError(ERROR_CODES.INVALID_OPERATION, 'Unknown queue type') };
}

export function queueDequeue(struct) {
  if (struct.size === 0 || (struct.items.length === 0 && struct.queueType === 'priority')) {
    return {
      error: createError(ERROR_CODES.QUEUE_EMPTY, 'Queue Underflow: Cannot dequeue from an empty queue'),
      complexity: BIG_O.O_1,
    };
  }

  const steps = [];

  // 1. SIMPLE QUEUE
  if (struct.queueType === 'simple') {
    const dequeued = struct.items[struct.frontIndex];
    const nextFront = struct.frontIndex + 1;
    const newSize = struct.size - 1;

    steps.push({
      type: STEP_TYPES.DESTROY,
      target: `${struct.id}[${struct.frontIndex}]`,
      description: `Dequeued ${dequeued} from front index ${struct.frontIndex}`,
    });

    const isWasted = nextFront > 0 && struct.rearIndex === struct.capacity - 1 && newSize < struct.capacity;

    const nextStruct = {
      ...struct,
      frontIndex: nextFront,
      size: newSize,
      falseFullWarning: isWasted,
    };

    return { nextStruct, steps, result: dequeued, complexity: BIG_O.O_1 };
  }

  // 2. CIRCULAR QUEUE
  if (struct.queueType === 'circular') {
    const dequeued = struct.items[struct.frontIndex];
    const nextItems = [...struct.items];
    nextItems[struct.frontIndex] = null;
    const nextFront = (struct.frontIndex + 1) % struct.capacity;

    steps.push({
      type: STEP_TYPES.DESTROY,
      target: `${struct.id}[${struct.frontIndex}]`,
      description: `Dequeued ${dequeued} from slot ${struct.frontIndex}. Front is now ${nextFront}`,
    });

    const nextStruct = {
      ...struct,
      items: nextItems,
      frontIndex: nextFront,
      size: struct.size - 1,
    };

    return { nextStruct, steps, result: dequeued, complexity: BIG_O.O_1 };
  }

  // 3. DEQUE
  if (struct.queueType === 'deque') {
    return dequeRemoveFront(struct);
  }

  // 4. PRIORITY QUEUE (Extract Root & Sift-Down)
  if (struct.queueType === 'priority') {
    const heap = [...struct.items];
    const rootVal = heap[0];

    if (heap.length === 1) {
      return {
        nextStruct: { ...struct, items: [], size: 0 },
        steps: [{ type: STEP_TYPES.DESTROY, target: `${struct.id}[0]`, description: `Removed root priority element: ${rootVal}` }],
        result: rootVal,
        complexity: BIG_O.O_LOG_N,
      };
    }

    const lastVal = heap.pop();
    heap[0] = lastVal;

    steps.push({
      type: STEP_TYPES.SWAP,
      target: `${struct.id}[0]`,
      description: `Replaced root with last element (${lastVal}), now sifting down`,
    });

    // Sift-down
    let idx = 0;
    const len = heap.length;
    const isMin = struct.minMax === 'min';

    while (true) {
      let candidateIdx = idx;
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;

      if (leftIdx < len) {
        if (isMin ? heap[leftIdx] < heap[candidateIdx] : heap[leftIdx] > heap[candidateIdx]) {
          candidateIdx = leftIdx;
        }
      }

      if (rightIdx < len) {
        if (isMin ? heap[rightIdx] < heap[candidateIdx] : heap[rightIdx] > heap[candidateIdx]) {
          candidateIdx = rightIdx;
        }
      }

      if (candidateIdx !== idx) {
        steps.push({
          type: STEP_TYPES.SWAP,
          target: `${struct.id}[${idx}],${struct.id}[${candidateIdx}]`,
          description: `Sift-down: swapped index [${idx}] with priority child [${candidateIdx}]`,
        });
        const temp = heap[idx];
        heap[idx] = heap[candidateIdx];
        heap[candidateIdx] = temp;
        idx = candidateIdx;
      } else {
        break;
      }
    }

    const nextStruct = {
      ...struct,
      items: heap,
      size: heap.length,
    };

    return { nextStruct, steps, result: rootVal, complexity: BIG_O.O_LOG_N };
  }

  return { error: createError(ERROR_CODES.INVALID_OPERATION, 'Unknown queue type') };
}

// ── Deque Operations ────────────────────────────────────────────────────────

export function dequeAddFront(struct, value) {
  if (struct.items.length >= struct.capacity) {
    return {
      error: createError(ERROR_CODES.QUEUE_FULL, `Deque capacity (${struct.capacity}) reached`),
      complexity: BIG_O.O_1,
    };
  }

  const nextItems = [value, ...struct.items];
  return {
    nextStruct: { ...struct, items: nextItems, size: nextItems.length },
    steps: [{ type: STEP_TYPES.CREATE, target: `${struct.id}[front]`, description: `Added ${value} to front of deque` }],
    result: value,
    complexity: BIG_O.O_1,
  };
}

export function dequeAddRear(struct, value) {
  if (struct.items.length >= struct.capacity) {
    return {
      error: createError(ERROR_CODES.QUEUE_FULL, `Deque capacity (${struct.capacity}) reached`),
      complexity: BIG_O.O_1,
    };
  }

  const nextItems = [...struct.items, value];
  return {
    nextStruct: { ...struct, items: nextItems, size: nextItems.length },
    steps: [{ type: STEP_TYPES.CREATE, target: `${struct.id}[rear]`, description: `Added ${value} to rear of deque` }],
    result: value,
    complexity: BIG_O.O_1,
  };
}

export function dequeRemoveFront(struct) {
  if (struct.items.length === 0) {
    return {
      error: createError(ERROR_CODES.QUEUE_EMPTY, 'Deque is empty; cannot remove from front'),
      complexity: BIG_O.O_1,
    };
  }

  const removed = struct.items[0];
  const nextItems = struct.items.slice(1);
  return {
    nextStruct: { ...struct, items: nextItems, size: nextItems.length },
    steps: [{ type: STEP_TYPES.DESTROY, target: `${struct.id}[front]`, description: `Removed ${removed} from front of deque` }],
    result: removed,
    complexity: BIG_O.O_1,
  };
}

export function dequeRemoveRear(struct) {
  if (struct.items.length === 0) {
    return {
      error: createError(ERROR_CODES.QUEUE_EMPTY, 'Deque is empty; cannot remove from rear'),
      complexity: BIG_O.O_1,
    };
  }

  const removed = struct.items[struct.items.length - 1];
  const nextItems = struct.items.slice(0, -1);
  return {
    nextStruct: { ...struct, items: nextItems, size: nextItems.length },
    steps: [{ type: STEP_TYPES.DESTROY, target: `${struct.id}[rear]`, description: `Removed ${removed} from rear of deque` }],
    result: removed,
    complexity: BIG_O.O_1,
  };
}

export function queueClear(struct) {
  return {
    nextStruct: {
      ...struct,
      items: [],
      size: 0,
      frontIndex: 0,
      rearIndex: -1,
      falseFullWarning: false,
    },
    steps: [{ type: STEP_TYPES.DESTROY, target: struct.id, description: 'Cleared all queue elements.' }],
    result: true,
    complexity: BIG_O.O_1,
  };
}
