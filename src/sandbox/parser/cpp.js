/**
 * @fileoverview C++ → IR parser.
 * Recognises the supported subset of C++ linked-list patterns.
 * NO eval, NO compiler invocation.
 */

/**
 * @param {string} text
 * @returns {{ program: import('../ir/types.js').Program, errors: import('../ir/types.js').ParseError[] }}
 */
export function parseCpp(text) {
  /** @type {import('../ir/types.js').Program} */
  const program = [];
  /** @type {import('../ir/types.js').ParseError[]} */
  const errors = [];

  // Remove block comments first
  const cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = cleaned.split('\n');

  // Patterns
  // Node* n1 = new Node(10);
  const reNewNode = /^Node\s*\*\s*(\w+)\s*=\s*new\s+Node\s*\(\s*(\d+)\s*\)\s*;/;
  // n1->next = n2;  OR  n1->next = nullptr;
  const reSetNextArrow = /^(\w+)\s*->\s*next\s*=\s*(\w+)\s*;/;
  // n1->prev = n2;  OR  n1->prev = nullptr;
  const reSetPrevArrow = /^(\w+)\s*->\s*prev\s*=\s*(\w+)\s*;/;
  // n1->data = 42;
  const reSetDataArrow = /^(\w+)\s*->\s*data\s*=\s*(.+?)\s*;/;
  // Node* head = n1;
  const reDeclPtr = /^Node\s*\*\s*(\w+)\s*=\s*(\w+)\s*;/;
  // curr = curr->next;
  const reAdvance = /^(\w+)\s*=\s*(\w+)\s*->\s*next\s*;/;
  // head = n1;
  const reAssign = /^(\w+)\s*=\s*(\w+)\s*;/;
  // delete n1;
  const reDelete = /^delete\s+(\w+)\s*;/;

  const reBoilerplate = [
    /^#include/,
    /^using\s+namespace/,
    /^struct\s+Node/,
    /^}\s*;?/,
    /^int\s+data\s*;/,
    /^Node\s*\*\s*next\s*;/,
    /^Node\s*\(int\s+d\)/,
    /^int\s+main\s*\(/,
    /^\s*\{/,
    /^return\s+/,
    /^\s*\}/,
    /^:\s*data\s*\(/,
  ];

  const declaredPtrs = new Set();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim().replace(/\/\/.*$/, '').trim();
    const lineNum = i + 1;

    if (!line) continue;
    if (reBoilerplate.some((re) => re.test(line))) continue;

    // advance: curr = curr->next;
    let m = reAdvance.exec(line);
    if (m) {
      program.push({ op: 'advance', ptr: m[1] });
      continue;
    }

    // Node* n1 = new Node(10);
    m = reNewNode.exec(line);
    if (m) {
      program.push({ op: 'newNode', var: m[1], value: parseValue(m[2]) });
      continue;
    }

    // n1->next = n2;
    m = reSetNextArrow.exec(line);
    if (m) {
      const target = m[2] === 'nullptr' || m[2] === 'NULL' ? 'NULL' : m[2];
      program.push({ op: 'setNext', node: m[1], target });
      continue;
    }

    // n1->prev = n2;
    m = reSetPrevArrow.exec(line);
    if (m) {
      const target = m[2] === 'nullptr' || m[2] === 'NULL' ? 'NULL' : m[2];
      program.push({ op: 'setPrev', node: m[1], target });
      continue;
    }

    // n1->data = 42;
    m = reSetDataArrow.exec(line);
    if (m) {
      program.push({ op: 'setValue', node: m[1], value: parseValue(m[2]) });
      continue;
    }

    // delete n1;
    m = reDelete.exec(line);
    if (m) {
      program.push({ op: 'deleteNode', var: m[1] });
      continue;
    }

    // Node* head = n1;
    m = reDeclPtr.exec(line);
    if (m) {
      const target = m[2] === 'nullptr' || m[2] === 'NULL' ? 'NULL' : m[2];
      declaredPtrs.add(m[1]);
      program.push({ op: 'declarePointer', var: m[1], target });
      continue;
    }

    // head = n1;
    m = reAssign.exec(line);
    if (m) {
      const lhs = m[1];
      const rhs = m[2];
      const target = rhs === 'nullptr' || rhs === 'NULL' ? 'NULL' : rhs;
      program.push({
        op: declaredPtrs.has(lhs) ? 'assignPointer' : 'declarePointer',
        var: lhs,
        target,
      });
      continue;
    }

    errors.push({
      line: lineNum,
      message: `Line ${lineNum}: not visualizable — "${line.substring(0, 40)}"`,
      severity: 'warning',
    });
  }

  return { program, errors };
}

/** @param {string} raw */
function parseValue(raw) {
  const s = raw.trim().replace(/;$/, '').trim();
  const n = Number(s);
  return isNaN(n) ? s : n;
}
