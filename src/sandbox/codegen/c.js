/**
 * @fileoverview C code generator from IR Program.
 * Produces a complete, compilable C file with struct Node, malloc, and main().
 */

/** @param {string} target */
const cNull = (target) => (target === 'NULL' ? 'NULL' : target);

/**
 * @param {import('../ir/types.js').Program} program
 * @returns {string}
 */
export function generateC(program) {
  const lines = [];

  const hasDoubly = program.some(
    (op) => op.op === 'setPrev' || (op.op === 'newNode' && op.nodeType === 'doubly')
  );

  // Boilerplate
  lines.push('#include <stdio.h>');
  lines.push('#include <stdlib.h>');
  lines.push('');
  lines.push('typedef struct Node {');
  lines.push('    int data;');
  lines.push('    struct Node* next;');
  if (hasDoubly) {
    lines.push('    struct Node* prev;');
  }
  lines.push('} Node;');
  lines.push('');
  lines.push('Node* createNode(int data) {');
  lines.push('    Node* node = (Node*)malloc(sizeof(Node));');
  lines.push('    node->data = data;');
  lines.push('    node->next = NULL;');
  if (hasDoubly) {
    lines.push('    node->prev = NULL;');
  }
  lines.push('    return node;');
  lines.push('}');
  lines.push('');
  lines.push('int main() {');

  const INDENT = '    ';

  // Collect pointer declarations for the main signature
  const pointerVars = new Set();
  for (const op of program) {
    if (op.op === 'declarePointer' || op.op === 'assignPointer' || op.op === 'setHead') {
      const label = op.op === 'setHead' ? 'head' : op.var;
      pointerVars.add(label);
    }
  }

  for (const op of program) {
    switch (op.op) {
      case 'newNode':
        lines.push(`${INDENT}Node* ${op.var} = createNode(${op.value});`);
        break;

      case 'setNext':
        lines.push(`${INDENT}${op.node}->next = ${cNull(op.target)};`);
        break;

      case 'setPrev':
        lines.push(`${INDENT}${op.node}->prev = ${cNull(op.target)};`);
        break;

      case 'setHead':
        lines.push(`${INDENT}Node* head = ${cNull(op.target)};`);
        break;

      case 'declarePointer':
      case 'assignPointer': {
        // First declaration uses Node*, subsequent are plain assignment
        const isFirstDecl = !pointerVars.has(`__decl_${op.var}`);
        pointerVars.add(`__decl_${op.var}`);
        if (isFirstDecl) {
          lines.push(`${INDENT}Node* ${op.var} = ${cNull(op.target)};`);
        } else {
          lines.push(`${INDENT}${op.var} = ${cNull(op.target)};`);
        }
        break;
      }

      case 'advance':
        lines.push(`${INDENT}${op.ptr} = ${op.ptr}->next;`);
        break;

      case 'setValue':
        lines.push(`${INDENT}${op.node}->data = ${op.value};`);
        break;

      case 'deleteNode':
        lines.push(`${INDENT}free(${op.var});`);
        lines.push(`${INDENT}${op.var} = NULL;`);
        break;

      case 'createStructure':
        if (op.type === 'stack') lines.push(`${INDENT}Stack ${op.var} = createStack(${op.config?.capacity || 6});`);
        else if (op.type === 'queue') lines.push(`${INDENT}Queue ${op.var} = createQueue(${op.config?.capacity || 6});`);
        else if (op.type === 'array') lines.push(`${INDENT}int ${op.var}[${op.config?.capacity || 8}];`);
        else if (op.type === 'tree') lines.push(`${INDENT}BinarySearchTree ${op.var} = createBST();`);
        else lines.push(`${INDENT}LinkedList ${op.var} = createLinkedList();`);
        break;

      case 'call':
        lines.push(`${INDENT}${op.method}(&${op.target}, ${(op.args || []).map((a) => cNull(a)).join(', ')});`);
        break;

      case 'setIndex':
        lines.push(`${INDENT}${op.target}[${op.index}] = ${cNull(op.value)};`);
        break;

      default:
        break;
    }
  }

  lines.push(`${INDENT}return 0;`);
  lines.push('}');

  return lines.join('\n');
}
