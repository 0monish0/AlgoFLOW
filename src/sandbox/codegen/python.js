/**
 * @fileoverview Python code generator from IR Program.
 * Produces a complete, runnable Python script.
 */

/** @param {string|number} target */
const pyNull = (target) => (target === 'NULL' ? 'None' : target);

/**
 * @param {import('../ir/types.js').Program} program
 * @returns {string}
 */
export function generatePython(program) {
  const lines = [];

  const hasDoubly = program.some(
    (op) => op.op === 'setPrev' || (op.op === 'newNode' && op.nodeType === 'doubly')
  );

  const hasNodes = program.some((op) => op.op === 'newNode');

  if (hasNodes || program.length === 0) {
    lines.push('class Node:');
    lines.push('    def __init__(self, data):');
    lines.push('        self.data = data');
    lines.push('        self.next = None');
    if (hasDoubly) {
      lines.push('        self.prev = None');
    }
    lines.push('');
    lines.push('');
  }

  // Track which variables are declared so we can use simple assignment
  const declared = new Set();

  for (const op of program) {
    switch (op.op) {
      case 'newNode':
        lines.push(`${op.var} = Node(${op.value})`);
        declared.add(op.var);
        break;

      case 'setNext':
        lines.push(`${op.node}.next = ${pyNull(op.target)}`);
        break;

      case 'setPrev':
        lines.push(`${op.node}.prev = ${pyNull(op.target)}`);
        break;

      case 'setHead':
        lines.push(`head = ${pyNull(op.target)}`);
        declared.add('head');
        break;

      case 'declarePointer':
      case 'assignPointer':
        lines.push(`${op.var} = ${pyNull(op.target)}`);
        declared.add(op.var);
        break;

      case 'advance':
        lines.push(`${op.ptr} = ${op.ptr}.next`);
        break;

      case 'setValue':
        lines.push(`${op.node}.data = ${op.value}`);
        break;

      case 'deleteNode':
        lines.push(`del ${op.var}  # Python GC handles memory`);
        break;

      case 'createStructure':
        if (op.type === 'stack') lines.push(`${op.var} = []  # Stack`);
        else if (op.type === 'queue') lines.push(`${op.var} = []  # Queue`);
        else if (op.type === 'array') lines.push(`${op.var} = [None] * ${op.config?.capacity || 8}`);
        else if (op.type === 'tree') lines.push(`${op.var} = None  # Root`);
        else lines.push(`${op.var} = []`);
        break;

      case 'call':
        if (op.method === 'push' || op.method === 'enqueue') {
          lines.push(`${op.target}.append(${op.args.map((a) => pyNull(a)).join(', ')})`);
        } else if (op.method === 'pop') {
          lines.push(`${op.target}.pop()`);
        } else if (op.method === 'dequeue') {
          lines.push(`${op.target}.pop(0)`);
        } else {
          lines.push(`${op.target}.${op.method}(${(op.args || []).map((a) => pyNull(a)).join(', ')})`);
        }
        break;

      case 'setIndex':
        lines.push(`${op.target}[${op.index}] = ${pyNull(op.value)}`);
        break;

      default:
        break;
    }
  }

  return lines.join('\n');
}
