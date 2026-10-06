/**
 * @fileoverview Java code generator from IR Program.
 * Produces a complete, compilable Java file with class Node and Main.main().
 */

/** @param {string} target */
const javaNull = (target) => (target === 'NULL' ? 'null' : target);

/**
 * @param {import('../ir/types.js').Program} program
 * @returns {string}
 */
export function generateJava(program) {
  const lines = [];

  const hasDoubly = program.some(
    (op) => op.op === 'setPrev' || (op.op === 'newNode' && op.nodeType === 'doubly')
  );

  // Boilerplate
  lines.push('class Node {');
  lines.push('    int data;');
  lines.push('    Node next;');
  if (hasDoubly) {
    lines.push('    Node prev;');
    lines.push('    Node(int data) {');
    lines.push('        this.data = data;');
    lines.push('        this.next = null;');
    lines.push('        this.prev = null;');
    lines.push('    }');
  } else {
    lines.push('    Node(int data) {');
    lines.push('        this.data = data;');
    lines.push('        this.next = null;');
    lines.push('    }');
  }
  lines.push('}');
  lines.push('');
  lines.push('public class Main {');
  lines.push('    public static void main(String[] args) {');

  const INDENT = '        ';
  const declared = new Set();

  for (const op of program) {
    switch (op.op) {
      case 'newNode':
        lines.push(`${INDENT}Node ${op.var} = new Node(${op.value});`);
        declared.add(op.var);
        break;

      case 'setNext':
        lines.push(`${INDENT}${op.node}.next = ${javaNull(op.target)};`);
        break;

      case 'setPrev':
        lines.push(`${INDENT}${op.node}.prev = ${javaNull(op.target)};`);
        break;

      case 'setHead':
        lines.push(`${INDENT}Node head = ${javaNull(op.target)};`);
        declared.add('head');
        break;

      case 'declarePointer':
      case 'assignPointer': {
        if (!declared.has(op.var)) {
          lines.push(`${INDENT}Node ${op.var} = ${javaNull(op.target)};`);
          declared.add(op.var);
        } else {
          lines.push(`${INDENT}${op.var} = ${javaNull(op.target)};`);
        }
        break;
      }

      case 'advance':
        lines.push(`${INDENT}${op.ptr} = ${op.ptr}.next;`);
        break;

      case 'setValue':
        lines.push(`${INDENT}${op.node}.data = ${op.value};`);
        break;

      case 'deleteNode':
        lines.push(`${INDENT}${op.var} = null;  // Java GC handles memory`);
        break;

      case 'createStructure':
        if (op.type === 'stack') lines.push(`${INDENT}Stack ${op.var} = new Stack(${op.config?.capacity || 6});`);
        else if (op.type === 'queue') lines.push(`${INDENT}Queue ${op.var} = new Queue(${op.config?.capacity || 6});`);
        else if (op.type === 'array') lines.push(`${INDENT}int[] ${op.var} = new int[${op.config?.capacity || 8}];`);
        else if (op.type === 'tree') lines.push(`${INDENT}BinarySearchTree ${op.var} = new BinarySearchTree();`);
        else lines.push(`${INDENT}LinkedList ${op.var} = new LinkedList();`);
        break;

      case 'call':
        lines.push(`${INDENT}${op.target}.${op.method}(${(op.args || []).map((a) => javaNull(a)).join(', ')});`);
        break;

      case 'setIndex':
        lines.push(`${INDENT}${op.target}[${op.index}] = ${javaNull(op.value)};`);
        break;

      default:
        break;
    }
  }

  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}
