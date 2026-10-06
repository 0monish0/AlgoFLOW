/**
 * @fileoverview Python → IR parser.
 * Handles the supported subset with simple line-pattern regex matching.
 * NO eval, NO runtime execution.
 */

/**
 * @param {string} text
 * @returns {{ program: import('../ir/types.js').Program, errors: import('../ir/types.js').ParseError[] }}
 */
export function parsePython(text) {
  /** @type {import('../ir/types.js').Program} */
  const program = [];
  /** @type {import('../ir/types.js').ParseError[]} */
  const errors = [];

  const lines = text.split('\n');

  // Patterns
  const reClassNode = /^class\s+Node\s*:/;
  const reDefInit = /^\s*def\s+__init__/;
  const reSelf = /^\s*self\./;
  // n1 = Node(10)  OR  n1 = Node("abc")
  const reNewNode = /^(\w+)\s*=\s*Node\(\s*(['"]?)(.+?)\2\s*\)\s*(?:#.*)?$/;
  // n1.next = n2   OR  n1.next = None
  const reSetNext = /^(\w+)\.next\s*=\s*(\w+)\s*(?:#.*)?$/;
  // n1.prev = n2   OR  n1.prev = None
  const reSetPrev = /^(\w+)\.prev\s*=\s*(\w+)\s*(?:#.*)?$/;
  // curr = curr.next
  const reAdvance = /^(\w+)\s*=\s*(\w+)\.next\s*(?:#.*)?$/;
  // n1.data = 42
  const reSetValue = /^(\w+)\.data\s*=\s*(.+?)\s*(?:#.*)?$/;
  // del n1
  const reDelete = /^del\s+(\w+)\s*(?:#.*)?$/;
  // arr1 = [None] * 8  OR  s1 = []  OR  q1 = []
  const reStructDecl = /^(\w+)\s*=\s*(?:\[None\]\s*\*\s*(\d+)|\[\]|Stack\(\)|Queue\(\))\s*(?:#\s*(Stack|Queue|Array)?)?$/i;
  // arr[0] = 42
  const reSetIndex = /^(\w+)\[(\d+)\]\s*=\s*(.+?)\s*(?:#.*)?$/;
  // s1.append(5) or s1.push(5) or q1.enqueue(5)
  const reCall = /^(\w+)\.(\w+)\((.*?)\)\s*(?:#.*)?$/;
  // head = n1  OR  curr = None
  const rePtrAssign = /^(\w+)\s*=\s*(\w+)\s*(?:#.*)?$/;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNum = i + 1;

    if (!line || line.startsWith('#')) continue;
    if (reClassNode.test(line)) continue;
    if (reDefInit.test(line)) continue;
    if (reSelf.test(line)) continue;
    if (line.startsWith('pass')) continue;

    // advance: curr = curr.next
    let m = reAdvance.exec(line);
    if (m) {
      program.push({ op: 'advance', ptr: m[1] });
      continue;
    }

    // method call: s1.append(5) or s1.push(5)
    m = reCall.exec(line);
    if (m && m[2] !== 'next' && m[2] !== 'prev' && m[2] !== 'data') {
      const target = m[1];
      const method = m[2];
      const args = m[3] ? m[3].split(',').map((s) => parseValue(s.trim())) : [];
      program.push({ op: 'call', target, method, args });
      continue;
    }

    // indexed assignment: arr[0] = 42
    m = reSetIndex.exec(line);
    if (m) {
      program.push({ op: 'setIndex', target: m[1], index: Number(m[2]), value: parseValue(m[3]) });
      continue;
    }

    // structure declaration
    m = reStructDecl.exec(line);
    if (m) {
      const varName = m[1];
      const commentHint = (m[3] || '').toLowerCase();
      let structType = 'array';
      if (commentHint === 'stack' || varName.startsWith('s')) structType = 'stack';
      else if (commentHint === 'queue' || varName.startsWith('q')) structType = 'queue';
      program.push({
        op: 'createStructure',
        type: structType,
        var: varName,
        config: { capacity: m[2] ? Number(m[2]) : 8 },
      });
      continue;
    }

    // newNode: n1 = Node(10)
    m = reNewNode.exec(line);
    if (m) {
      const val = parseValue(m[3]);
      program.push({ op: 'newNode', var: m[1], value: val });
      continue;
    }

    // setNext: n1.next = n2 OR n1.next = None
    m = reSetNext.exec(line);
    if (m) {
      const target = m[2] === 'None' ? 'NULL' : m[2];
      program.push({ op: 'setNext', node: m[1], target });
      continue;
    }

    // setPrev: n1.prev = n2 OR n1.prev = None
    m = reSetPrev.exec(line);
    if (m) {
      const target = m[2] === 'None' ? 'NULL' : m[2];
      program.push({ op: 'setPrev', node: m[1], target });
      continue;
    }

    // setValue: n1.data = 42
    m = reSetValue.exec(line);
    if (m) {
      program.push({ op: 'setValue', node: m[1], value: parseValue(m[2]) });
      continue;
    }

    // del n1
    m = reDelete.exec(line);
    if (m) {
      program.push({ op: 'deleteNode', var: m[1] });
      continue;
    }

    // generic pointer assign: head = n1
    m = rePtrAssign.exec(line);
    if (m) {
      const lhs = m[1];
      const rhs = m[2];
      const target = rhs === 'None' ? 'NULL' : rhs;
      program.push({ op: 'declarePointer', var: lhs, target });
      continue;
    }

    // Anything else — soft warning
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
  const s = raw.trim().replace(/^['"]|['"]$/g, '');
  const n = Number(s);
  return isNaN(n) ? s : n;
}
