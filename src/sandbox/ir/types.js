/**
 * @fileoverview Language-agnostic Intermediate Representation (IR) for
 * Linked List programs. This is the single source of truth shared between
 * the canvas state and the code editor.
 */

/**
 * @typedef {'newNode' | 'setHead' | 'declarePointer' | 'assignPointer' | 'setNext' | 'setValue' | 'deleteNode' | 'advance'} OpType
 */

/**
 * @typedef {Object} NewNodeOp
 * @property {'newNode'} op
 * @property {string} var   - variable name, e.g. 'n1'
 * @property {number|string} value - node data value
 */

/**
 * @typedef {Object} SetHeadOp
 * @property {'setHead'} op
 * @property {string} target - variable name or 'NULL'
 */

/**
 * @typedef {Object} DeclarePointerOp
 * @property {'declarePointer'} op
 * @property {string} var    - pointer label, e.g. 'head', 'curr'
 * @property {string} target - variable name or 'NULL'
 */

/**
 * @typedef {Object} AssignPointerOp
 * @property {'assignPointer'} op
 * @property {string} var    - pointer label
 * @property {string} target - variable name or 'NULL'
 */

/**
 * @typedef {Object} SetNextOp
 * @property {'setNext'} op
 * @property {string} node   - source variable name
 * @property {string} target - target variable name or 'NULL'
 */

/**
 * @typedef {Object} SetValueOp
 * @property {'setValue'} op
 * @property {string} node  - variable name
 * @property {number|string} value
 */

/**
 * @typedef {Object} DeleteNodeOp
 * @property {'deleteNode'} op
 * @property {string} var - variable name
 */

/**
 * @typedef {Object} AdvanceOp
 * @property {'advance'} op
 * @property {string} ptr - pointer label to advance (ptr = ptr.next)
 */

/**
 * @typedef {Object} CreateStructureOp
 * @property {'createStructure'} op
 * @property {'array'|'linkedlist'|'stack'|'queue'|'tree'} type
 * @property {string} var - variable identifier, e.g. 's1', 'arr'
 * @property {Object} [config]
 */

/**
 * @typedef {Object} CallOp
 * @property {'call'} op
 * @property {string} target - target instance, e.g. 's1', 'list'
 * @property {string} method - method name, e.g. 'push', 'enqueue', 'insert'
 * @property {Array<any>} args
 */

/**
 * @typedef {Object} SetIndexOp
 * @property {'setIndex'} op
 * @property {string} target - array variable
 * @property {number} index
 * @property {any} value
 */

/**
 * @typedef {NewNodeOp | SetHeadOp | DeclarePointerOp | AssignPointerOp | SetNextOp | SetValueOp | DeleteNodeOp | AdvanceOp | CreateStructureOp | CallOp | SetIndexOp} Op
 */

/**
 * @typedef {Op[]} Program
 */

/**
 * @typedef {'python' | 'c' | 'cpp' | 'java'} Language
 */

/**
 * @typedef {Object} ParseError
 * @property {number} line   - 1-indexed line number
 * @property {string} message
 * @property {'error' | 'warning'} severity
 */

export const LANGUAGES = /** @type {Language[]} */ (['python', 'c', 'cpp', 'java']);
export const LANGUAGE_LABELS = { python: 'Python', c: 'C', cpp: 'C++', java: 'Java' };
