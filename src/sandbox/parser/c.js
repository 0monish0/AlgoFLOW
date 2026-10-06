/**
 * @fileoverview C → IR parser.
 * Recognises the supported subset of C linked-list patterns.
 * NO eval, NO compiler invocation.
 */

/**
 * @param {string} text
 * @returns {{ program: import('../ir/types.js').Program, errors: import('../ir/types.js').ParseError[] }}
 */
export function parseC(text) {
  /** @type {import('../ir/types.js').Program} */
  const program = [];
  /** @type {import('../ir/types.js').ParseError[]} */
  const errors = [];

  // Remove block comments first
  const cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = cleaned.split('\n');

  // Patterns
  // Node* n1 = createNode(10);
  const reCreateNode1 = /^Node\s*\*\s*(\w+)\s*=\s*createNode\(\s*(\d+)\s*\)\s*;/;
  // Node* n1 = (Node*)malloc(sizeof(Node));
  const reMalloc = /^Node\s*\*\s*(\w+)\s*=\s*\(Node\s*\*\s*\)\s*malloc\s*\(/;
  // n1->data = 10;
  const reSetDataArrow = /^(\w+)\s*->\s*data\s*=\s*(.+?)\s*;/;
  // n1->next = n2;  OR  n1->next = NULL;
  const reSetNextArrow = /^(\w+)\s*->\s*next\s*=\s*(\w+)\s*;/;
  // Node* head = n1;  OR  Node* curr = NULL;
  const reDeclPtr = /^Node\s*\*\s*(\w+)\s*=\s*(\w+)\s*;/;
  // head = n1;  OR  curr = curr->next;
  const reAssign = /^(\w+)\s*=\s*(\w+)\s*;/;
  // curr = curr->next;
  const reAdvance = /^(\w+)\s*=\s*(\w+)\s*->\s*next\s*;/;
  // free(n1);
  const reFree = /^free\s*\(\s*(\w+)\s*\)\s*;/;

  // Skip lines
  const reBoilerplate = [
    /^#include/,
    /^typedef\s+struct/,
    /^}\s*(Node)?\s*;/,
    /^struct\s+Node/,
    /^Node\s*\*\s*createNode\s*\(/,
    /^int\s+main\s*\(/,
    /^\s*\{/,
    /^\s*\}/,
    /^int\s+data\s*;/,
    /^struct\s+Node\s*\*\s*next/,
    /^Node\s*\*\s*next\s*;/,
    /^Node\s*\*\s*node\s*=/,
    /^node->/,
    /^return\s+/,
    /^return\s+0/,
  ];

  // Track which pointer vars have been declared
  const declaredPtrs = new Set();
  // Track pending malloc var (for two-line malloc + data assignment)
  let pendingMallocVar = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim().replace(/\/\/.*$/, '').trim();
    const lineNum = i + 1;

    if (!line) continue;
    if (reBoilerplate.some((re) => re.test(line))) continue;

    // If we have a pending malloc var, look for ->data = value
    if (pendingMallocVar) {
      const m = reSetDataArrow.exec(line);
      if (m && m[1] === pendingMallocVar) {
        // update the last newNode op's value
        const last = program[program.length - 1];
        if (last && last.op === 'newNode' && last.var === pendingMallocVar) {
          last.value = parseValue(m[2]);
        }
        pendingMallocVar = null;
        continue;
      }
      pendingMallocVar = null;
    }

    // advance: curr = curr->next;
    let m = reAdvance.exec(line);
    if (m) {
      program.push({ op: 'advance', ptr: m[1] });
      continue;
    }

    // Node* n1 = createNode(10);
    m = reCreateNode1.exec(line);
    if (m) {
      program.push({ op: 'newNode', var: m[1], value: parseValue(m[2]) });
      continue;
    }

    // Node* n1 = (Node*)malloc(...)
    m = reMalloc.exec(line);
    if (m) {
      program.push({ op: 'newNode', var: m[1], value: 0 });
      pendingMallocVar = m[1];
      continue;
    }

    // n1->next = n2;
    m = reSetNextArrow.exec(line);
    if (m) {
      const target = m[2] === 'NULL' ? 'NULL' : m[2];
      program.push({ op: 'setNext', node: m[1], target });
      continue;
    }

    // n1->data = value;
    m = reSetDataArrow.exec(line);
    if (m) {
      program.push({ op: 'setValue', node: m[1], value: parseValue(m[2]) });
      continue;
    }

    // free(n1);
    m = reFree.exec(line);
    if (m) {
      program.push({ op: 'deleteNode', var: m[1] });
      continue;
    }

    // Node* head = n1;
    m = reDeclPtr.exec(line);
    if (m) {
      const target = m[2] === 'NULL' ? 'NULL' : m[2];
      declaredPtrs.add(m[1]);
      program.push({ op: 'declarePointer', var: m[1], target });
      continue;
    }

    // head = n1;
    m = reAssign.exec(line);
    if (m) {
      const lhs = m[1];
      const rhs = m[2];
      const target = rhs === 'NULL' ? 'NULL' : rhs;
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
