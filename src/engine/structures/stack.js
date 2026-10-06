/**
 * @fileoverview Pure Stack data structure implementation (Array-backed & Linked-list backed).
 */

import { ERROR_CODES, STEP_TYPES, BIG_O } from '../types.js';
import { createError } from '../errors.js';

export function createStackStructure(id, name, { backing = 'array', capacity = 6, items = [] } = {}) {
  return {
    id,
    type: 'stack',
    name,
    backing, // 'array' | 'linkedlist'
    capacity: backing === 'array' ? capacity : Infinity,
    items: [...items], // bottom at index 0, top at index length-1
  };
}

export function stackPush(struct, value) {
  if (struct.backing === 'array' && struct.items.length >= struct.capacity) {
    return {
      error: createError(ERROR_CODES.STACK_OVERFLOW, `Stack Overflow: Exceeded maximum capacity (${struct.capacity})`),
      complexity: BIG_O.O_1,
    };
  }

  const nextItems = [...struct.items, value];
  const nextStruct = {
    ...struct,
    items: nextItems,
  };

  const steps = [
    { type: STEP_TYPES.CREATE, target: `${struct.id}[top]`, description: `Pushed ${value} onto stack (top is now index ${nextItems.length - 1})` },
  ];

  return {
    nextStruct,
    steps,
    result: value,
    complexity: BIG_O.O_1,
  };
}

export function stackPop(struct) {
  if (struct.items.length === 0) {
    return {
      error: createError(ERROR_CODES.STACK_UNDERFLOW, 'Stack Underflow: Cannot pop from an empty stack'),
      complexity: BIG_O.O_1,
    };
  }

  const poppedValue = struct.items[struct.items.length - 1];
  const nextItems = struct.items.slice(0, -1);
  const nextStruct = {
    ...struct,
    items: nextItems,
  };

  const steps = [
    { type: STEP_TYPES.DESTROY, target: `${struct.id}[top]`, description: `Popped ${poppedValue} from stack (top is now ${nextItems.length > 0 ? nextItems[nextItems.length - 1] : 'empty'})` },
  ];

  return {
    nextStruct,
    steps,
    result: poppedValue,
    complexity: BIG_O.O_1,
  };
}

export function stackPeek(struct) {
  if (struct.items.length === 0) {
    return {
      error: createError(ERROR_CODES.STACK_UNDERFLOW, 'Stack is empty; cannot peek'),
      complexity: BIG_O.O_1,
    };
  }

  const topValue = struct.items[struct.items.length - 1];
  const steps = [
    { type: STEP_TYPES.HIGHLIGHT, target: `${struct.id}[top]`, description: `Peek top element: ${topValue}` },
  ];

  return {
    steps,
    result: topValue,
    complexity: BIG_O.O_1,
  };
}

export function stackClear(struct) {
  return {
    nextStruct: {
      ...struct,
      items: [],
    },
    steps: [{ type: STEP_TYPES.DESTROY, target: struct.id, description: 'Cleared all stack elements.' }],
    result: true,
    complexity: BIG_O.O_1,
  };
}
