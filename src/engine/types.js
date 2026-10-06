/**
 * @fileoverview Type constants and definitions for the UI-independent engine layer.
 */

export const STRUCTURE_TYPES = {
  ARRAY: 'array',
  LINKED_LIST: 'linkedlist',
  STACK: 'stack',
  QUEUE: 'queue',
  TREE: 'tree',
};

export const ERROR_CODES = {
  STACK_OVERFLOW: 'StackOverflow',
  STACK_UNDERFLOW: 'StackUnderflow',
  QUEUE_FULL: 'QueueFull',
  QUEUE_EMPTY: 'QueueEmpty',
  INDEX_OUT_OF_BOUNDS: 'IndexOutOfBounds',
  NULL_POINTER: 'NullPointer',
  DANGLING_REFERENCE: 'DanglingReference',
  DUPLICATE_KEY: 'DuplicateKey',
  CYCLE_DETECTED: 'CycleDetected',
  INVARIANT_BROKEN: 'InvariantBroken',
  INVALID_OPERATION: 'InvalidOperation',
};

export const STEP_TYPES = {
  HIGHLIGHT: 'highlight',
  COMPARE: 'compare',
  MOVE: 'move',
  SWAP: 'swap',
  LINK: 'link',
  UNLINK: 'unlink',
  CREATE: 'create',
  DESTROY: 'destroy',
  VISIT: 'visit',
  ERROR: 'error',
};

export const BIG_O = {
  O_1: 'O(1)',
  O_LOG_N: 'O(log n)',
  O_N: 'O(n)',
  O_N_LOG_N: 'O(n log n)',
  O_N_2: 'O(n²)',
};
