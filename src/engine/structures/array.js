/**
 * @fileoverview Pure Array data structure implementation (static & dynamic).
 */

import { ERROR_CODES, STEP_TYPES, BIG_O } from '../types.js';
import { createError } from '../errors.js';

export function createArrayStructure(id, name, { capacity = 8, dynamic = false, items = [] } = {}) {
  const initialItems = Array(capacity).fill(null);
  for (let i = 0; i < Math.min(items.length, capacity); i++) {
    initialItems[i] = items[i];
  }

  return {
    id,
    type: 'array',
    name,
    capacity,
    dynamic,
    items: initialItems,
    length: items.filter((x) => x !== null && x !== undefined).length,
    markers: {}, // e.g. { i: 0, j: 2 }
  };
}

export function arrayGet(struct, index) {
  if (index < 0 || index >= struct.capacity) {
    return {
      error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `Index ${index} out of bounds for capacity ${struct.capacity}`),
      complexity: BIG_O.O_1,
    };
  }

  const val = struct.items[index];
  const steps = [
    { type: STEP_TYPES.HIGHLIGHT, target: `${struct.id}[${index}]`, description: `Read slot [${index}] -> ${val ?? 'empty'}` },
  ];

  return {
    steps,
    result: val,
    complexity: BIG_O.O_1,
  };
}

export function arraySet(struct, index, value) {
  if (index < 0 || index >= struct.capacity) {
    return {
      error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `Index ${index} out of bounds for capacity ${struct.capacity}`),
      complexity: BIG_O.O_1,
    };
  }

  const nextItems = [...struct.items];
  const wasNull = nextItems[index] === null;
  nextItems[index] = value;
  const newLength = wasNull && value !== null ? struct.length + 1 : (!wasNull && value === null ? Math.max(0, struct.length - 1) : struct.length);

  const nextStruct = {
    ...struct,
    items: nextItems,
    length: newLength,
  };

  const steps = [
    { type: STEP_TYPES.HIGHLIGHT, target: `${struct.id}[${index}]`, description: `Set slot [${index}] = ${value}` },
  ];

  return {
    nextStruct,
    steps,
    result: value,
    complexity: BIG_O.O_1,
  };
}

export function arrayAppend(struct, value) {
  const currentLength = struct.items.filter((x) => x !== null).length;

  if (currentLength >= struct.capacity) {
    if (!struct.dynamic) {
      return {
        error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `Array capacity (${struct.capacity}) exceeded. Toggle Dynamic Array to auto-grow.`),
        complexity: BIG_O.O_1,
      };
    }

    // Dynamic 2x reallocation
    const newCapacity = struct.capacity * 2;
    const newItems = Array(newCapacity).fill(null);
    for (let i = 0; i < struct.capacity; i++) {
      newItems[i] = struct.items[i];
    }
    newItems[currentLength] = value;

    const nextStruct = {
      ...struct,
      capacity: newCapacity,
      items: newItems,
      length: currentLength + 1,
    };

    const steps = [
      { type: STEP_TYPES.CREATE, target: struct.id, description: `Capacity full (${struct.capacity}). Doubling capacity to ${newCapacity}!` },
      { type: STEP_TYPES.MOVE, target: struct.id, description: `Copied ${currentLength} elements to newly allocated array buffer.` },
      { type: STEP_TYPES.HIGHLIGHT, target: `${struct.id}[${currentLength}]`, description: `Appended ${value} at index ${currentLength}` },
    ];

    return {
      nextStruct,
      steps,
      result: value,
      complexity: 'O(n) worst / O(1) amortized',
    };
  }

  // Find first null slot or currentLength
  let insertIndex = currentLength;
  const nextItems = [...struct.items];
  nextItems[insertIndex] = value;

  const nextStruct = {
    ...struct,
    items: nextItems,
    length: currentLength + 1,
  };

  const steps = [
    { type: STEP_TYPES.HIGHLIGHT, target: `${struct.id}[${insertIndex}]`, description: `Appended ${value} at index [${insertIndex}]` },
  ];

  return {
    nextStruct,
    steps,
    result: value,
    complexity: BIG_O.O_1,
  };
}

export function arrayInsert(struct, index, value) {
  if (index < 0 || index > struct.length) {
    return {
      error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `Cannot insert at index ${index}. Valid insertion indices: 0..${struct.length}`),
      complexity: BIG_O.O_N,
    };
  }

  let nextCapacity = struct.capacity;
  let items = [...struct.items];
  const steps = [];

  if (struct.length >= struct.capacity) {
    if (!struct.dynamic) {
      return {
        error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `Array capacity (${struct.capacity}) full. Cannot insert without overflow.`),
        complexity: BIG_O.O_N,
      };
    }
    nextCapacity = struct.capacity * 2;
    items = [...items, ...Array(struct.capacity).fill(null)];
    steps.push({ type: STEP_TYPES.CREATE, target: struct.id, description: `Dynamic resize: expanded to capacity ${nextCapacity}` });
  }

  // Shift elements right from struct.length - 1 down to index
  for (let i = struct.length; i > index; i--) {
    items[i] = items[i - 1];
    steps.push({
      type: STEP_TYPES.MOVE,
      target: `${struct.id}[${i}]`,
      description: `Shifted [${i - 1}] (${items[i]}) -> [${i}]`,
    });
  }

  items[index] = value;
  steps.push({
    type: STEP_TYPES.HIGHLIGHT,
    target: `${struct.id}[${index}]`,
    description: `Inserted ${value} at index [${index}]`,
  });

  const nextStruct = {
    ...struct,
    capacity: nextCapacity,
    items,
    length: struct.length + 1,
  };

  return {
    nextStruct,
    steps,
    result: value,
    complexity: BIG_O.O_N,
  };
}

export function arrayDelete(struct, index) {
  if (index < 0 || index >= struct.length || struct.items[index] === null) {
    return {
      error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `No valid element to delete at index ${index}`),
      complexity: BIG_O.O_N,
    };
  }

  const deletedVal = struct.items[index];
  const items = [...struct.items];
  const steps = [
    { type: STEP_TYPES.DESTROY, target: `${struct.id}[${index}]`, description: `Removed element ${deletedVal} at index [${index}]` },
  ];

  // Shift left towards index
  for (let i = index; i < struct.length - 1; i++) {
    items[i] = items[i + 1];
    steps.push({
      type: STEP_TYPES.MOVE,
      target: `${struct.id}[${i}]`,
      description: `Shifted [${i + 1}] (${items[i]}) -> [${i}]`,
    });
  }
  items[struct.length - 1] = null;

  const nextStruct = {
    ...struct,
    items,
    length: Math.max(0, struct.length - 1),
  };

  return {
    nextStruct,
    steps,
    result: deletedVal,
    complexity: BIG_O.O_N,
  };
}

export function arrayPop(struct) {
  if (struct.length === 0) {
    return {
      error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, 'Array is empty; cannot pop.'),
      complexity: BIG_O.O_1,
    };
  }
  return arrayDelete(struct, struct.length - 1);
}

export function arraySearch(struct, value) {
  const steps = [];
  let foundIndex = -1;

  for (let i = 0; i < struct.length; i++) {
    const curr = struct.items[i];
    steps.push({
      type: STEP_TYPES.COMPARE,
      target: `${struct.id}[${i}]`,
      description: `Comparing [${i}] (${curr}) with target ${value}`,
    });
    if (curr === value) {
      foundIndex = i;
      steps.push({
        type: STEP_TYPES.HIGHLIGHT,
        target: `${struct.id}[${i}]`,
        description: `Found match at index [${i}]!`,
      });
      break;
    }
  }

  if (foundIndex === -1) {
    steps.push({
      type: STEP_TYPES.VISIT,
      target: struct.id,
      description: `Value ${value} not found in array.`,
    });
  }

  return {
    steps,
    result: foundIndex,
    complexity: BIG_O.O_N,
  };
}

export function arrayBinarySearch(struct, value) {
  // Verify if sorted
  const activeItems = struct.items.slice(0, struct.length);
  for (let i = 1; i < activeItems.length; i++) {
    if (activeItems[i] < activeItems[i - 1]) {
      return {
        error: createError(ERROR_CODES.INVALID_OPERATION, 'Binary search requires a sorted array. Sort the array first!'),
        complexity: BIG_O.O_LOG_N,
      };
    }
  }

  const steps = [];
  let low = 0;
  let high = struct.length - 1;
  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = activeItems[mid];

    steps.push({
      type: STEP_TYPES.COMPARE,
      target: `${struct.id}[${mid}]`,
      description: `Low: ${low}, Mid: ${mid} (${midVal}), High: ${high}. Comparing with target ${value}`,
    });

    if (midVal === value) {
      foundIndex = mid;
      steps.push({
        type: STEP_TYPES.HIGHLIGHT,
        target: `${struct.id}[${mid}]`,
        description: `Found match at index [${mid}]!`,
      });
      break;
    } else if (midVal < value) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return {
    steps,
    result: foundIndex,
    complexity: BIG_O.O_LOG_N,
  };
}

export function arraySwap(struct, i, j) {
  if (i < 0 || i >= struct.capacity || j < 0 || j >= struct.capacity) {
    return {
      error: createError(ERROR_CODES.INDEX_OUT_OF_BOUNDS, `Indices ${i}, ${j} must be within bounds 0..${struct.capacity - 1}`),
      complexity: BIG_O.O_1,
    };
  }

  const nextItems = [...struct.items];
  const temp = nextItems[i];
  nextItems[i] = nextItems[j];
  nextItems[j] = temp;

  const steps = [
    { type: STEP_TYPES.SWAP, target: `${struct.id}[${i}],${struct.id}[${j}]`, description: `Swapped [${i}] (${temp}) with [${j}] (${nextItems[i]})` },
  ];

  return {
    nextStruct: { ...struct, items: nextItems },
    steps,
    result: true,
    complexity: BIG_O.O_1,
  };
}

export function arraySort(struct, algorithm = 'bubble') {
  const items = [...struct.items];
  const n = struct.length;
  const steps = [];

  if (algorithm === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          type: STEP_TYPES.COMPARE,
          target: `${struct.id}[${j}],${struct.id}[${j + 1}]`,
          description: `Compare [${j}] (${items[j]}) > [${j + 1}] (${items[j + 1]})`,
        });
        if (items[j] > items[j + 1]) {
          const temp = items[j];
          items[j] = items[j + 1];
          items[j + 1] = temp;
          steps.push({
            type: STEP_TYPES.SWAP,
            target: `${struct.id}[${j}],${struct.id}[${j + 1}]`,
            description: `Swapped [${j}] and [${j + 1}]`,
          });
        }
      }
    }
  } else if (algorithm === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        steps.push({
          type: STEP_TYPES.COMPARE,
          target: `${struct.id}[${j}],${struct.id}[${minIdx}]`,
          description: `Compare [${j}] (${items[j]}) < min [${minIdx}] (${items[minIdx]})`,
        });
        if (items[j] < items[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        const temp = items[i];
        items[i] = items[minIdx];
        items[minIdx] = temp;
        steps.push({
          type: STEP_TYPES.SWAP,
          target: `${struct.id}[${i}],${struct.id}[${minIdx}]`,
          description: `Swapped [${i}] with minimum element at [${minIdx}]`,
        });
      }
    }
  }

  return {
    nextStruct: { ...struct, items },
    steps,
    result: true,
    complexity: BIG_O.O_N_2,
  };
}

export function arrayResize(struct, newCapacity) {
  if (newCapacity < 1 || newCapacity > 32) {
    return {
      error: createError(ERROR_CODES.INVALID_OPERATION, 'Capacity must be between 1 and 32.'),
      complexity: BIG_O.O_N,
    };
  }

  const nextItems = Array(newCapacity).fill(null);
  for (let i = 0; i < Math.min(struct.items.length, newCapacity); i++) {
    nextItems[i] = struct.items[i];
  }

  return {
    nextStruct: {
      ...struct,
      capacity: newCapacity,
      items: nextItems,
      length: nextItems.filter((x) => x !== null).length,
    },
    steps: [{ type: STEP_TYPES.MOVE, target: struct.id, description: `Resized array capacity to ${newCapacity}` }],
    result: newCapacity,
    complexity: BIG_O.O_N,
  };
}

export function arrayClear(struct) {
  return {
    nextStruct: {
      ...struct,
      items: Array(struct.capacity).fill(null),
      length: 0,
      markers: {},
    },
    steps: [{ type: STEP_TYPES.DESTROY, target: struct.id, description: 'Cleared all array elements.' }],
    result: true,
    complexity: BIG_O.O_1,
  };
}
