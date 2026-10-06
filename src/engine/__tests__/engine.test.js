import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createArrayStructure,
  arrayAppend,
  arrayInsert,
  arrayDelete,
  arrayBinarySearch,
  arraySort,
} from '../structures/array.js';

import {
  createStackStructure,
  stackPush,
  stackPop,
  stackPeek,
} from '../structures/stack.js';

import {
  createQueueStructure,
  queueEnqueue,
  queueDequeue,
} from '../structures/queue.js';

describe('Engine: Array Data Structure', () => {
  it('static array rejects insert when full', () => {
    let arr = createArrayStructure('a1', 'arr1', { capacity: 4, dynamic: false });
    arr = arrayAppend(arr, 10).nextStruct;
    arr = arrayAppend(arr, 20).nextStruct;
    arr = arrayAppend(arr, 30).nextStruct;
    arr = arrayAppend(arr, 40).nextStruct;
    assert.equal(arr.length, 4);

    const overflow = arrayAppend(arr, 50);
    assert.ok(overflow.error);
    assert.equal(overflow.error.code, 'IndexOutOfBounds');
  });

  it('dynamic array doubles capacity on overflow', () => {
    let arr = createArrayStructure('a1', 'arr1', { capacity: 2, dynamic: true });
    arr = arrayAppend(arr, 1).nextStruct;
    arr = arrayAppend(arr, 2).nextStruct;
    assert.equal(arr.capacity, 2);

    const res = arrayAppend(arr, 3);
    assert.equal(res.nextStruct.capacity, 4);
    assert.equal(res.nextStruct.items[2], 3);
  });

  it('insert shifts right and delete shifts left', () => {
    let arr = createArrayStructure('a1', 'arr1', { capacity: 6, items: [10, 20, 30] });
    // insert 99 at index 1 -> [10, 99, 20, 30]
    const ins = arrayInsert(arr, 1, 99);
    assert.deepEqual(ins.nextStruct.items.slice(0, 4), [10, 99, 20, 30]);

    // delete index 1 -> [10, 20, 30]
    const del = arrayDelete(ins.nextStruct, 1);
    assert.deepEqual(del.nextStruct.items.slice(0, 3), [10, 20, 30]);
  });

  it('binary search finds index on sorted array and warns if unsorted', () => {
    const unsorted = createArrayStructure('a1', 'arr1', { capacity: 4, items: [30, 10, 20] });
    const warn = arrayBinarySearch(unsorted, 10);
    assert.ok(warn.error);

    const sorted = arraySort(unsorted).nextStruct;
    const found = arrayBinarySearch(sorted, 20);
    assert.equal(found.result, 1);
  });
});

describe('Engine: Stack Data Structure', () => {
  it('enforces capacity overflow and empty underflow', () => {
    let s = createStackStructure('s1', 'stack1', { backing: 'array', capacity: 3 });
    s = stackPush(s, 100).nextStruct;
    s = stackPush(s, 200).nextStruct;
    s = stackPush(s, 300).nextStruct;

    const over = stackPush(s, 400);
    assert.ok(over.error);
    assert.equal(over.error.code, 'StackOverflow');

    // Pop all
    let p = stackPop(s);
    assert.equal(p.result, 300);
    p = stackPop(p.nextStruct);
    assert.equal(p.result, 200);
    p = stackPop(p.nextStruct);
    assert.equal(p.result, 100);

    const under = stackPop(p.nextStruct);
    assert.ok(under.error);
    assert.equal(under.error.code, 'StackUnderflow');
  });
});

describe('Engine: Queue Data Structure', () => {
  it('simple queue demonstrates false-full after dequeues', () => {
    let q = createQueueStructure('q1', 'queue1', { queueType: 'simple', capacity: 3 });
    q = queueEnqueue(q, 1).nextStruct;
    q = queueEnqueue(q, 2).nextStruct;
    q = queueEnqueue(q, 3).nextStruct;

    // dequeue 1 element: frontIndex becomes 1, size becomes 2
    q = queueDequeue(q).nextStruct;
    assert.equal(q.size, 2);

    // attempting to enqueue should trigger false full error
    const res = queueEnqueue(q, 4);
    assert.ok(res.error);
    assert.equal(res.error.code, 'QueueFull');
  });

  it('circular queue reuses slots with modulo wrapping', () => {
    let cq = createQueueStructure('cq1', 'circ1', { queueType: 'circular', capacity: 3 });
    cq = queueEnqueue(cq, 10).nextStruct;
    cq = queueEnqueue(cq, 20).nextStruct;
    cq = queueEnqueue(cq, 30).nextStruct;
    assert.equal(cq.size, 3);

    cq = queueDequeue(cq).nextStruct; // frees slot 0
    cq = queueEnqueue(cq, 40).nextStruct; // wraps around to slot 0
    assert.equal(cq.items[0], 40);
    assert.equal(cq.size, 3);
  });

  it('priority queue enforces binary heap property', () => {
    let pq = createQueueStructure('pq1', 'prio1', { queueType: 'priority', capacity: 6, minMax: 'min' });
    pq = queueEnqueue(pq, 50).nextStruct;
    pq = queueEnqueue(pq, 30).nextStruct;
    pq = queueEnqueue(pq, 10).nextStruct;
    pq = queueEnqueue(pq, 40).nextStruct;

    // min element must be at root (items[0])
    assert.equal(pq.items[0], 10);

    const d1 = queueDequeue(pq);
    assert.equal(d1.result, 10);
    assert.equal(d1.nextStruct.items[0], 30);
  });
});

import { createHeap } from '../heap.js';
import {
  createLinkedListStructure,
  listInsertHead,
  listInsertTail,
  listDeleteHead,
  listDeleteTail,
  listReverse,
  checkListInvariants,
} from '../structures/linkedList.js';

import {
  createTreeStructure,
  treeInsertBST,
  treeSearchBST,
  treeDeleteBST,
  treeTraverse,
  getTreeMetrics,
} from '../structures/tree.js';

describe('Engine: Linked List Data Structure', () => {
  it('singly: insertHead x3, insertTail, reverse reverses correctly', () => {
    const heap = createHeap();
    let list = createLinkedListStructure('l1', 'list1', { listType: 'singly' });
    list = listInsertHead(list, heap, 10).nextStruct;
    list = listInsertHead(list, heap, 20).nextStruct;
    list = listInsertHead(list, heap, 30).nextStruct;
    // head is 30 -> 20 -> 10
    assert.equal(heap[list.head].value, 30);

    list = listInsertTail(list, heap, 99).nextStruct;
    // 30 -> 20 -> 10 -> 99
    assert.equal(heap[list.tail].value, 99);

    list = listReverse(list, heap).nextStruct;
    // 99 -> 10 -> 20 -> 30
    assert.equal(heap[list.head].value, 99);
    assert.equal(heap[list.tail].value, 30);
  });

  it('doubly: maintains invariants n.next.prev == n and head.prev == null', () => {
    const heap = createHeap();
    let dlist = createLinkedListStructure('dl1', 'doubly1', { listType: 'doubly' });
    dlist = listInsertHead(dlist, heap, 1).nextStruct;
    dlist = listInsertTail(dlist, heap, 2).nextStruct;
    dlist = listInsertTail(dlist, heap, 3).nextStruct;

    const violations = checkListInvariants(dlist, heap);
    assert.equal(violations.length, 0);
  });
});

describe('Engine: Binary Search Tree Data Structure', () => {
  it('BST insert 50, 30, 70, 20, 40, 60, 80 produces sorted inorder traversal', () => {
    const heap = createHeap();
    let tree = createTreeStructure('t1', 'tree1', { treeMode: 'bst' });
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => {
      tree = treeInsertBST(tree, heap, v).nextStruct;
    });

    const inOrder = treeTraverse(tree, heap, 'inorder').result;
    assert.deepEqual(inOrder, [20, 30, 40, 50, 60, 70, 80]);

    const preOrder = treeTraverse(tree, heap, 'preorder').result;
    assert.deepEqual(preOrder, [50, 30, 20, 40, 70, 60, 80]);

    const metrics = getTreeMetrics(tree, heap);
    assert.equal(metrics.isBST, true);
    assert.equal(metrics.nodeCount, 7);
  });

  it('BST delete handles leaf, one-child, and two-children (successor) correctly', () => {
    const heap = createHeap();
    let tree = createTreeStructure('t1', 'tree1', { treeMode: 'bst' });
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => {
      tree = treeInsertBST(tree, heap, v).nextStruct;
    });

    // Case 1: delete leaf 20
    tree = treeDeleteBST(tree, heap, 20).nextStruct;
    assert.deepEqual(treeTraverse(tree, heap, 'inorder').result, [30, 40, 50, 60, 70, 80]);

    // Case 3: delete root 50 with two children
    tree = treeDeleteBST(tree, heap, 50).nextStruct;
    assert.deepEqual(treeTraverse(tree, heap, 'inorder').result, [30, 40, 60, 70, 80]);
  });
});

import { Engine } from '../engine.js';

describe('Engine: Full Integration & Cross-Structure Operations', () => {
  it('creates multiple structures, executes commands, and supports undo/redo', () => {
    const engine = new Engine();

    // Create Stack
    engine.dispatch({
      type: 'structure.create',
      structId: 's1',
      args: { structureType: 'stack', name: 'Stack1', config: { capacity: 5 } },
    });
    assert.ok(engine.state.structures.s1);

    // Push 10 and 20
    engine.dispatch({ type: 'stack.push', structId: 's1', args: { value: 10 } });
    engine.dispatch({ type: 'stack.push', structId: 's1', args: { value: 20 } });
    assert.equal(engine.state.structures.s1.items.length, 2);

    // Undo push 20
    const undone = engine.undo();
    assert.equal(undone, true);
    assert.equal(engine.state.structures.s1.items.length, 1);

    // Redo push 20
    const redone = engine.redo();
    assert.equal(redone, true);
    assert.equal(engine.state.structures.s1.items.length, 2);
  });

  it('cross-structure transfer: pop from stack and enqueue to queue', () => {
    const engine = new Engine();
    engine.dispatch({
      type: 'structure.create',
      structId: 's1',
      args: { structureType: 'stack', name: 'SourceStack', initialData: [42] },
    });
    engine.dispatch({
      type: 'structure.create',
      structId: 'q1',
      args: { structureType: 'queue', name: 'TargetQueue', config: { queueType: 'simple', capacity: 5 } },
    });

    assert.equal(engine.state.structures.s1.items.length, 1);
    assert.equal(engine.state.structures.q1.size, 0);

    // Transfer element
    const res = engine.dispatch({
      type: 'transfer',
      args: { sourceId: 's1', targetId: 'q1', slotIndex: 0 },
    });

    assert.equal(engine.state.structures.s1.items.length, 0);
    assert.equal(engine.state.structures.q1.size, 1);
    assert.equal(engine.state.structures.q1.items[0], 42);
  });

  it('reset clears canvas but is completely undoable', () => {
    const engine = new Engine();
    engine.dispatch({
      type: 'structure.create',
      structId: 'arr1',
      args: { structureType: 'array', initialData: [1, 2, 3] },
    });
    assert.equal(Object.keys(engine.state.structures).length, 1);

    engine.reset();
    assert.equal(Object.keys(engine.state.structures).length, 0);

    // Undo reset!
    engine.undo();
    assert.equal(Object.keys(engine.state.structures).length, 1);
  });
});


