/**
 * @fileoverview C++ code generator from IR Program.
 * Produces a complete, compilable C++ file with struct Node, new/delete, and main().
 */

/** @param {string} target */
const cppNull = (target) => (target === 'NULL' ? 'nullptr' : target);

/**
 * @param {import('../ir/types.js').Program} program
 * @returns {string}
 */
export function generateCpp(program) {
  const lines = [];

  const hasDoubly = program.some(
    (op) => op.op === 'setPrev' || (op.op === 'newNode' && op.nodeType === 'doubly')
  );

  lines.push('#include <iostream>');
  lines.push('#include <vector>');
  lines.push('using namespace std;');
  lines.push('');
  lines.push('struct Node {');
  lines.push('    int data;');
  lines.push('    Node* next;');
  if (hasDoubly) {
    lines.push('    Node* prev;');
    lines.push('    Node(int d) : data(d), next(nullptr), prev(nullptr) {}');
  } else {
    lines.push('    Node(int d) : data(d), next(nullptr) {}');
  }
  lines.push('};');
  lines.push('');
  lines.push('int main() {');

  const INDENT = '    ';
  const declared = new Set();

  for (const op of program) {
    switch (op.op) {
      case 'newNode':
        lines.push(`${INDENT}Node* ${op.var} = new Node(${op.value});`);
        declared.add(op.var);
        break;

      case 'setNext':
        lines.push(`${INDENT}${op.node}->next = ${cppNull(op.target)};`);
        break;

      case 'setPrev':
        lines.push(`${INDENT}${op.node}->prev = ${cppNull(op.target)};`);
        break;

      case 'setHead':
        lines.push(`${INDENT}Node* head = ${cppNull(op.target)};`);
        declared.add('head');
        break;

      case 'declarePointer':
      case 'assignPointer': {
        if (!declared.has(op.var)) {
          lines.push(`${INDENT}Node* ${op.var} = ${cppNull(op.target)};`);
          declared.add(op.var);
        } else {
          lines.push(`${INDENT}${op.var} = ${cppNull(op.target)};`);
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
        lines.push(`${INDENT}delete ${op.var};`);
        break;

      case 'createStructure':
        if (op.type === 'array') lines.push(`${INDENT}vector<int> ${op.var}(${op.config?.capacity || 8});`);
        else if (op.type === 'stack') lines.push(`${INDENT}vector<int> ${op.var}; // Stack`);
        else if (op.type === 'queue') lines.push(`${INDENT}vector<int> ${op.var}; // Queue`);
        break;

      case 'call':
        if (op.method === 'push' || op.method === 'enqueue') {
          lines.push(`${INDENT}${op.target}.push_back(${op.args.map((a) => cppNull(a)).join(', ')});`);
        } else if (op.method === 'pop') {
          lines.push(`${INDENT}${op.target}.pop_back();`);
        } else if (op.method === 'dequeue') {
          lines.push(`${INDENT}${op.target}.erase(${op.target}.begin());`);
        }
        break;

      case 'setIndex':
        lines.push(`${INDENT}${op.target}[${op.index}] = ${cppNull(op.value)};`);
        break;

      default:
        break;
    }
  }

  lines.push(`${INDENT}return 0;`);
  lines.push('}');
  return lines.join('\n');
}
