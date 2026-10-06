import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { canvasToIR } from '../ir/canvasToIR.js';
import { generatePython } from '../codegen/python.js';
import { generateCpp } from '../codegen/cpp.js';
import { generateC } from '../codegen/c.js';
import { generateJava } from '../codegen/java.js';
import { parsePython } from '../parser/python.js';
import { parseCpp } from '../parser/cpp.js';
import { executeProgram } from '../ir/execute.js';

describe('Bidirectional Code Sync', () => {
  it('generates expected textbook Python for 3 singly nodes, connections, and head tag', () => {
    const nodes = {
      n1: { id: 'n1', varName: 'n1', value: 10, nodeType: 'singly', next: 'n2', position: { x: 100, y: 200 } },
      n2: { id: 'n2', varName: 'n2', value: 20, nodeType: 'singly', next: 'n3', position: { x: 250, y: 200 } },
      n3: { id: 'n3', varName: 'n3', value: 30, nodeType: 'singly', next: 'NULL', position: { x: 400, y: 200 } },
    };
    const pointers = {
      p1: { id: 'p1', name: 'head', targetId: 'n1' },
    };

    const program = canvasToIR(nodes, pointers);
    const pyCode = generatePython(program);

    assert.ok(pyCode.includes('n1 = Node(10)'));
    assert.ok(pyCode.includes('n2 = Node(20)'));
    assert.ok(pyCode.includes('n3 = Node(30)'));
    assert.ok(pyCode.includes('n1.next = n2'));
    assert.ok(pyCode.includes('n2.next = n3'));
    assert.ok(pyCode.includes('n3.next = None'));
    assert.ok(pyCode.includes('head = n1'));
  });

  it('generates expected C++ for nodes and pointers', () => {
    const nodes = {
      n1: { id: 'n1', varName: 'n1', value: 10, nodeType: 'singly', next: 'n2', position: { x: 100, y: 200 } },
      n2: { id: 'n2', varName: 'n2', value: 20, nodeType: 'singly', next: null, position: { x: 250, y: 200 } },
    };
    const pointers = {
      p1: { id: 'p1', name: 'head', targetId: 'n1' },
    };

    const program = canvasToIR(nodes, pointers);
    const cppCode = generateCpp(program);

    assert.ok(cppCode.includes('Node* n1 = new Node(10);'));
    assert.ok(cppCode.includes('Node* n2 = new Node(20);'));
    assert.ok(cppCode.includes('n1->next = n2;'));
    assert.ok(cppCode.includes('Node* head = n1;'));
  });

  it('round-trips Python code: canvas -> python -> parse -> identical canvas state', () => {
    const originalNodes = {
      n1: { id: 'n1', varName: 'n1', value: 10, nodeType: 'singly', next: 'n2', position: { x: 100, y: 200 } },
      n2: { id: 'n2', varName: 'n2', value: 20, nodeType: 'singly', next: 'n3', position: { x: 250, y: 200 } },
      n3: { id: 'n3', varName: 'n3', value: 30, nodeType: 'singly', next: 'NULL', position: { x: 400, y: 200 } },
    };
    const originalPointers = {
      p1: { id: 'p1', name: 'head', targetId: 'n1' },
    };

    const program = canvasToIR(originalNodes, originalPointers);
    const pyCode = generatePython(program);

    const { program: parsedProgram, errors } = parsePython(pyCode);
    const hardErrors = errors.filter((e) => e.severity === 'error');
    assert.equal(hardErrors.length, 0, 'No hard syntax errors');

    const reconstructed = executeProgram(parsedProgram, { nodes: originalNodes });
    const reconstructedNodes = Object.values(reconstructed.nodes);
    assert.equal(reconstructedNodes.length, 3);
    assert.equal(reconstructedNodes[0].data, '10');
    assert.equal(reconstructedNodes[1].data, '20');
    assert.equal(reconstructedNodes[2].data, '30');
  });

  it('supports doubly linked list prev pointer in Python and C++', () => {
    const nodes = {
      n1: { id: 'n1', varName: 'n1', value: 10, nodeType: 'doubly', next: 'n2', prev: null, position: { x: 100, y: 200 } },
      n2: { id: 'n2', varName: 'n2', value: 20, nodeType: 'doubly', next: null, prev: 'n1', position: { x: 250, y: 200 } },
    };
    const program = canvasToIR(nodes, {});
    const pyCode = generatePython(program);
    assert.ok(pyCode.includes('self.prev = None'));
    assert.ok(pyCode.includes('n2.prev = n1'));

    const cppCode = generateCpp(program);
    assert.ok(cppCode.includes('Node* prev;'));
    assert.ok(cppCode.includes('n2->prev = n1;'));
  });
});
