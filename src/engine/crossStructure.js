/**
 * @fileoverview Cross-structure interactions, transfer dispatcher, references, and executable recipes.
 */

import { makeRef, isRef } from './heap.js';
import { ERROR_CODES, STEP_TYPES, BIG_O } from './types.js';
import { createError } from './errors.js';

/**
 * Validates whether an element can be extracted from source structure and performs the source extraction.
 * Returns { value, error, sourceOpName }
 */
export function extractFromStructure(struct, heap, { slotIndex, nodeId } = {}) {
  switch (struct.type) {
    case 'stack': {
      if (struct.items.length === 0) {
        return { error: createError(ERROR_CODES.STACK_UNDERFLOW, 'Stack is empty; cannot drag element.') };
      }
      // Stack only allows extracting from TOP (index length - 1)
      if (slotIndex !== undefined && slotIndex !== struct.items.length - 1) {
        return {
          error: createError(
            ERROR_CODES.INVALID_OPERATION,
            `LIFO Rule: Only the TOP of a stack (index [${struct.items.length - 1}]) can be popped. Accessing index [${slotIndex}] is prohibited!`
          ),
        };
      }
      const val = struct.items[struct.items.length - 1];
      return { value: val, sourceOpName: 'pop' };
    }

    case 'queue': {
      if (struct.size === 0) {
        return { error: createError(ERROR_CODES.QUEUE_EMPTY, 'Queue is empty; cannot drag element.') };
      }
      if (struct.queueType === 'deque' && slotIndex === struct.items.length - 1) {
        return { value: struct.items[struct.items.length - 1], sourceOpName: 'removeRear' };
      }
      // FIFO only allows extracting from FRONT
      if (slotIndex !== undefined && slotIndex !== (struct.queueType === 'circular' ? struct.frontIndex : 0)) {
        return {
          error: createError(
            ERROR_CODES.INVALID_OPERATION,
            'FIFO Rule: Only the FRONT of a queue can be dequeued. Accessing internal slots is prohibited!'
          ),
        };
      }
      const val = struct.queueType === 'circular' || struct.queueType === 'simple'
        ? struct.items[struct.frontIndex]
        : struct.items[0];
      return { value: val, sourceOpName: 'dequeue' };
    }

    case 'array': {
      if (slotIndex === undefined || slotIndex < 0 || slotIndex >= struct.items.length || struct.items[slotIndex] === null) {
        return { error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, 'No element at selected array index.') };
      }
      return { value: struct.items[slotIndex], sourceOpName: 'delete' };
    }

    case 'linkedlist': {
      if (!nodeId || !heap[nodeId]) {
        return { error: createError(ERROR_CODES.NULL_POINTER, 'Invalid node selected in linked list.') };
      }
      return { value: heap[nodeId].value, sourceOpName: 'deleteNode' };
    }

    case 'tree': {
      if (!nodeId || !heap[nodeId]) {
        return { error: createError(ERROR_CODES.NULL_POINTER, 'Invalid node selected in tree.') };
      }
      return { value: heap[nodeId].value, sourceOpName: 'deleteNode' };
    }

    default:
      return { error: createError(ERROR_CODES.INVALID_OPERATION, 'Unsupported source structure type.') };
  }
}

