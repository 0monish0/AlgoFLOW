/**
 * @fileoverview Main Universal DSA Engine.
 * Single source of truth managing the global heap, all structure instances,
 * named pointers, reachability analysis, command execution, step logs, and undo/redo.
 */

import { createHeap, computeReachability, makeRef } from './heap.js';
import { createArrayStructure, arrayGet, arraySet, arrayAppend, arrayInsert, arrayDelete, arrayPop, arraySearch, arrayBinarySearch, arraySwap, arraySort, arrayResize, arrayClear } from './structures/array.js';
import { createStackStructure, stackPush, stackPop, stackPeek, stackClear } from './structures/stack.js';
import { createQueueStructure, queueEnqueue, queueDequeue, dequeAddFront, dequeAddRear, dequeRemoveFront, dequeRemoveRear, queueClear } from './structures/queue.js';
import { createLinkedListStructure, listInsertHead, listInsertTail, listDeleteHead, listDeleteTail, listReverse, checkListInvariants } from './structures/linkedList.js';
import { createTreeStructure, treeInsertBST, treeSearchBST, treeDeleteBST, treeTraverse, getTreeMetrics } from './structures/tree.js';
import { extractFromStructure } from './crossStructure.js';
import { ERROR_CODES, BIG_O } from './types.js';
import { createError } from './errors.js';

const MAX_HISTORY = 40;

export function createEngineState() {
  const heap = createHeap();
  const structures = {};
  const namedPointers = {};
  const reachability = computeReachability(heap, structures, namedPointers);

  return {
    heap,
    structures,
    namedPointers,
    elementPositions: {},
    activeStructureId: null,
    operationLog: [],
    historyStack: [],
    futureStack: [],
    reachability,
    lastResult: null,
    lastComplexity: null,
    lastError: null,
  };
}

export class Engine {
  constructor(initialState = createEngineState()) {
    this.state = initialState;
    this.subscribers = new Set();
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    this.subscribers.forEach((fn) => fn(this.state));
  }

  saveSnapshot() {
    const snapshot = JSON.stringify({
      heap: this.state.heap,
      structures: this.state.structures,
      namedPointers: this.state.namedPointers,
      elementPositions: this.state.elementPositions || {},
      activeStructureId: this.state.activeStructureId,
      operationLog: this.state.operationLog,
    });

    this.state.historyStack = [...this.state.historyStack.slice(-MAX_HISTORY), snapshot];
    this.state.futureStack = [];
  }

  undo() {
    if (this.state.historyStack.length === 0) return false;
    const currSnapshot = JSON.stringify({
      heap: this.state.heap,
      structures: this.state.structures,
      namedPointers: this.state.namedPointers,
      elementPositions: this.state.elementPositions || {},
      activeStructureId: this.state.activeStructureId,
      operationLog: this.state.operationLog,
    });

    const prevSnapshot = this.state.historyStack[this.state.historyStack.length - 1];
    const newHistory = this.state.historyStack.slice(0, -1);

    try {
      const parsed = JSON.parse(prevSnapshot);
      const reachability = computeReachability(parsed.heap, parsed.structures, parsed.namedPointers);
      this.state = {
        ...this.state,
        heap: parsed.heap,
        structures: parsed.structures,
        namedPointers: parsed.namedPointers,
        elementPositions: parsed.elementPositions || {},
        activeStructureId: parsed.activeStructureId,
        operationLog: parsed.operationLog || [],
        historyStack: newHistory,
        futureStack: [currSnapshot, ...this.state.futureStack],
        reachability,
        lastError: null,
      };
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to undo', err);
      return false;
    }
  }

  redo() {
    if (this.state.futureStack.length === 0) return false;
    const currSnapshot = JSON.stringify({
      heap: this.state.heap,
      structures: this.state.structures,
      namedPointers: this.state.namedPointers,
      elementPositions: this.state.elementPositions || {},
      activeStructureId: this.state.activeStructureId,
      operationLog: this.state.operationLog,
    });

    const nextSnapshot = this.state.futureStack[0];
    const newFuture = this.state.futureStack.slice(1);

    try {
      const parsed = JSON.parse(nextSnapshot);
      const reachability = computeReachability(parsed.heap, parsed.structures, parsed.namedPointers);
      this.state = {
        ...this.state,
        heap: parsed.heap,
        structures: parsed.structures,
        namedPointers: parsed.namedPointers,
        elementPositions: parsed.elementPositions || {},
        activeStructureId: parsed.activeStructureId,
        operationLog: parsed.operationLog || [],
        historyStack: [...this.state.historyStack, currSnapshot],
        futureStack: newFuture,
        reachability,
        lastError: null,
      };
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to redo', err);
      return false;
    }
  }

  reset() {
    this.saveSnapshot();
    const clean = createEngineState();
    this.state = {
      ...clean,
      historyStack: this.state.historyStack, // Preserves undoability of reset!
    };
    this.notify();
  }

  /**
   * Dispatches and executes a typed command across any structure instance.
   */
  dispatch(command) {
    const { type, structId, args = {} } = command;
    const struct = this.state.structures[structId];

    if (!struct && !type.startsWith('structure.') && !type.startsWith('pointer.') && type !== 'transfer') {
      return { error: createError(ERROR_CODES.INVALID_OPERATION, `Structure ${structId} not found`) };
    }

    let opResult = null;
    const heap = { ...this.state.heap };

    // Structure Lifecycle Commands
    if (type === 'structure.create') {
      this.saveSnapshot();
      const { structureType, name, config, initialData = [] } = args;
      let newStruct;

      switch (structureType) {
        case 'array':
          newStruct = createArrayStructure(structId, name || 'arr', { ...config, items: initialData });
          break;
        case 'stack':
          newStruct = createStackStructure(structId, name || 'stack', { ...config, items: initialData });
          break;
        case 'queue':
          newStruct = createQueueStructure(structId, name || 'queue', { ...config, items: initialData });
          break;
        case 'linkedlist':
          newStruct = createLinkedListStructure(structId, name || 'list', config);
          if (initialData.length > 0) {
            initialData.forEach((val) => {
              newStruct = listInsertTail(newStruct, heap, val).nextStruct;
            });
          }
          break;
        case 'tree':
          newStruct = createTreeStructure(structId, name || 'tree', config);
          if (initialData.length > 0) {
            initialData.forEach((val) => {
              newStruct = treeInsertBST(newStruct, heap, val).nextStruct;
            });
          }
          break;
        default:
          return { error: createError(ERROR_CODES.INVALID_OPERATION, `Unknown structure type: ${structureType}`) };
      }

      this.state.structures = { ...this.state.structures, [structId]: newStruct };
      this.state.heap = heap;
      this.state.activeStructureId = structId;
      this.state.reachability = computeReachability(this.state.heap, this.state.structures, this.state.namedPointers);
      this.notify();
      return { success: true };
    }

    if (type === 'structure.delete') {
      this.saveSnapshot();
      const nextStructs = { ...this.state.structures };
      delete nextStructs[structId];
      this.state.structures = nextStructs;
      if (this.state.elementPositions) {
        const nextPositions = { ...this.state.elementPositions };
        delete nextPositions[structId];
        this.state.elementPositions = nextPositions;
      }
      this.state.reachability = computeReachability(this.state.heap, this.state.structures, this.state.namedPointers);
      this.notify();
      return { success: true };
    }

    if (type === 'element.setPosition') {
      this.state.elementPositions = {
        ...this.state.elementPositions,
        [args.id]: args.pos,
      };
      this.notify();
      return { success: true };
    }

    // Array Commands
    if (type === 'array.set') opResult = arraySet(struct, args.index, args.value);
    else if (type === 'array.get') opResult = arrayGet(struct, args.index);
    else if (type === 'array.append') opResult = arrayAppend(struct, args.value);
    else if (type === 'array.insert') opResult = arrayInsert(struct, args.index, args.value);
    else if (type === 'array.delete') opResult = arrayDelete(struct, args.index);
    else if (type === 'array.pop') opResult = arrayPop(struct);
    else if (type === 'array.search') opResult = arraySearch(struct, args.value);
    else if (type === 'array.binarySearch') opResult = arrayBinarySearch(struct, args.value);
    else if (type === 'array.swap') opResult = arraySwap(struct, args.i, args.j);
    else if (type === 'array.sort') opResult = arraySort(struct, args.algorithm);
    else if (type === 'array.resize') opResult = arrayResize(struct, args.capacity);
    else if (type === 'array.clear') opResult = arrayClear(struct);

    // Stack Commands
    else if (type === 'stack.push') opResult = stackPush(struct, args.value);
    else if (type === 'stack.pop') opResult = stackPop(struct);
    else if (type === 'stack.peek') opResult = stackPeek(struct);
    else if (type === 'stack.clear') opResult = stackClear(struct);

    // Queue Commands
    else if (type === 'queue.enqueue') opResult = queueEnqueue(struct, args.value);
    else if (type === 'queue.dequeue') opResult = queueDequeue(struct);
    else if (type === 'queue.addFront') opResult = dequeAddFront(struct, args.value);
    else if (type === 'queue.addRear') opResult = dequeAddRear(struct, args.value);
    else if (type === 'queue.removeFront') opResult = dequeRemoveFront(struct);
    else if (type === 'queue.removeRear') opResult = dequeRemoveRear(struct);
    else if (type === 'queue.clear') opResult = queueClear(struct);

    // Linked List Commands
    else if (type === 'list.insertHead') opResult = listInsertHead(struct, heap, args.value);
    else if (type === 'list.insertTail') opResult = listInsertTail(struct, heap, args.value);
    else if (type === 'list.deleteHead') opResult = listDeleteHead(struct, heap);
    else if (type === 'list.deleteTail') opResult = listDeleteTail(struct, heap);
    else if (type === 'list.reverse') opResult = listReverse(struct, heap);

    // Binary Tree Commands
    else if (type === 'tree.insert') opResult = treeInsertBST(struct, heap, args.value);
    else if (type === 'tree.search') opResult = treeSearchBST(struct, heap, args.value);
    else if (type === 'tree.delete') opResult = treeDeleteBST(struct, heap, args.value);
    else if (type === 'tree.traverse') opResult = treeTraverse(struct, heap, args.order);

    // Cross-Structure Transfer
    else if (type === 'transfer') {
      const sourceStruct = this.state.structures[args.sourceId];
      const targetStruct = this.state.structures[args.targetId];

      const extraction = extractFromStructure(sourceStruct, heap, args);
      if (extraction.error) {
        this.state.lastError = extraction.error;
        this.notify();
        return extraction;
      }

      this.saveSnapshot();
      // 1. Remove from source
      this.dispatch({
        type: `${sourceStruct.type}.${extraction.sourceOpName}`,
        structId: args.sourceId,
        args,
      });

      // 2. Add to target based on target structure type
      const targetOp = targetStruct.type === 'stack' ? 'stack.push'
        : targetStruct.type === 'queue' ? 'queue.enqueue'
        : targetStruct.type === 'array' ? 'array.append'
        : targetStruct.type === 'tree' ? 'tree.insert'
        : 'list.insertTail';

      return this.dispatch({
        type: targetOp,
        structId: args.targetId,
        args: { value: extraction.value },
      });
    }

    if (!opResult) {
      return { error: createError(ERROR_CODES.INVALID_OPERATION, `Unhandled command: ${type}`) };
    }

    if (opResult.error) {
      this.state.lastError = opResult.error;
      this.notify();
      return opResult;
    }

    // Commit state changes
    this.saveSnapshot();
    if (opResult.nextStruct) {
      this.state.structures = {
        ...this.state.structures,
        [structId]: opResult.nextStruct,
      };
    }
    this.state.heap = heap;
    this.state.lastResult = opResult.result;
    this.state.lastComplexity = opResult.complexity || BIG_O.O_1;
    this.state.lastError = null;

    // Log operation
    const logEntry = {
      timestamp: Date.now(),
      type,
      structName: struct.name,
      description: `${struct.name}.${type.split('.')[1]}(${Object.values(args).join(', ')}) -> ${opResult.result ?? 'done'}`,
      complexity: opResult.complexity,
    };
    this.state.operationLog = [logEntry, ...this.state.operationLog.slice(0, 50)];

    // Recompute reachability & garbage
    this.state.reachability = computeReachability(this.state.heap, this.state.structures, this.state.namedPointers);

    this.notify();
    return opResult;
  }
}
