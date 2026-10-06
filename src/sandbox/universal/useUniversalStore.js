/**
 * @fileoverview Single unified state store for the Free-Form DSA Canvas.
 * Manages nodes, pointers, structures, canvas matrix, and unified dispatch(command).
 */

import { create } from 'zustand';

const MAX_HISTORY = 40;
let uidCounter = 0;
const genId = (p) => `${p}_${Date.now().toString(36)}_${++uidCounter}`;

export const useUniversalStore = create((set, get) => ({
  // ── Primitives on Canvas ──────────────────────────────────────────────
  // nodes: { [id]: { id, varName, value, nodeType: 'singly'|'doubly', next: id|'NULL'|null, prev: id|'NULL'|null, position: {x,y} } }
  nodes: {},
  // pointers: { [id]: { id, name: 'head'|'tail'|'curr'|custom, targetId: id|null, isExplicitNull: bool, position: {x,y} } }
  pointers: {},
  // structures: { [id]: { id, varName, type: 'array'|'stack'|'queue'|'tree', items: [], capacity: number, isDynamic: bool, position: {x,y} } }
  structures: {},

  // ── Selection & Active Gestures ───────────────────────────────────────
  selectedId: null,
  setSelectedId: (selectedId) => set({ selectedId }),
  clearSelection: () => set({ selectedId: null }),

  // Transient return value tooltip: { value, position: {x, y}, id }
  transientReturn: null,
  setTransientReturn: (ret) => {
    set({ transientReturn: ret });
    if (ret) {
      setTimeout(() => {
        if (get().transientReturn?.id === ret.id) {
          set({ transientReturn: null });
        }
      }, 2000);
    }
  },

  // Active wire rubber-band gesture: { sourceId, port: 'next'|'prev'|'left'|'right', cursorX, cursorY }
  activeWire: null,
  setActiveWire: (activeWire) => set({ activeWire }),

  // Dragging pointer tag gesture: { pointerId, cursorX, cursorY }
  activePointerDrag: null,
  setActivePointerDrag: (activePointerDrag) => set({ activePointerDrag }),

  // Candidate target node hovered while dragging wire or pointer
  hoveredTargetId: null,
  setHoveredTargetId: (hoveredTargetId) => set({ hoveredTargetId }),

  // ── Canvas Navigation ─────────────────────────────────────────────────
  pan: { x: 0, y: 0 },
  zoom: 1,
  setPan: (pan) => set({ pan }),
  setZoom: (zoom) => set({ zoom: Math.max(0.4, Math.min(2.0, zoom)) }),

  // ── Dock & Tool Controls ──────────────────────────────────────────────
  activeStructureType: 'linkedlist', // 'linkedlist' | 'array' | 'stack' | 'queue' | 'tree'
  setActiveStructureType: (type) => set({ activeStructureType: type, activeTool: 'select' }),

  activeTool: 'select',
  setActiveTool: (activeTool) => set({ activeTool }),

  nodeTypeToggle: 'singly', // 'singly' | 'doubly'
  setNodeTypeToggle: (nodeTypeToggle) => set({ nodeTypeToggle }),

  sharedValueInput: '10',
  setSharedValueInput: (sharedValueInput) => set({ sharedValueInput }),
  nextAutoInt: 10,
  getNextValue: () => {
    const current = get().sharedValueInput;
    if (current && current.trim()) {
      const num = Number(current);
      if (!isNaN(num)) {
        set({ nextAutoInt: num + 10, sharedValueInput: String(num + 10) });
        return num;
      }
      return current.trim();
    }
    const auto = get().nextAutoInt;
    set({ nextAutoInt: auto + 10, sharedValueInput: String(auto + 10) });
    return auto;
  },

  playbackSpeed: 1,
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  treeModeToggle: 'bst',
  setTreeModeToggle: (treeModeToggle) => set({ treeModeToggle }),

  deleteSelected: () => get().dispatch({ type: 'delete.selected' }),

  placePrimitive: (type, pos, options = {}) => {
    const cfg = options.config || options || {};
    if (type === 'linkedlist' || type === 'node') {
      return get().dispatch({
        type: 'node.create',
        pos,
        nodeType: cfg.nodeType || get().nodeTypeToggle || 'singly',
        value: cfg.value !== undefined ? cfg.value : get().getNextValue(),
      });
    } else if (type === 'pointer') {
      return get().dispatch({
        type: 'pointer.create',
        name: cfg.label || cfg.name || 'ptr',
        pos,
        targetId: cfg.targetId || (cfg.label === 'NULL' ? 'NULL' : null),
      });
    } else if (type === 'array') {
      return get().dispatch({
        type: 'array.create',
        pos,
        capacity: cfg.capacity || 8,
        isDynamic: cfg.dynamic || false,
      });
    } else if (type === 'stack') {
      return get().dispatch({
        type: 'stack.create',
        pos,
        capacity: cfg.capacity || 6,
      });
    } else if (type === 'queue') {
      return get().dispatch({
        type: 'queue.create',
        pos,
        capacity: cfg.capacity || 6,
      });
    }
  },

  // ── History (Undo / Redo) ─────────────────────────────────────────────
  historyStack: [],
  futureStack: [],
  canUndo: false,
  canRedo: false,

  saveSnapshot: () => {
    const { nodes, pointers, structures, historyStack } = get();
    const snap = JSON.stringify({ nodes, pointers, structures });
    const newHistory = [...historyStack.slice(-MAX_HISTORY), snap];
    set({
      historyStack: newHistory,
      futureStack: [],
      canUndo: newHistory.length > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { historyStack, futureStack, nodes, pointers, structures } = get();
    if (historyStack.length === 0) return false;
    const currentSnap = JSON.stringify({ nodes, pointers, structures });
    const prevSnap = historyStack[historyStack.length - 1];
    const newHistory = historyStack.slice(0, -1);
    const newFuture = [currentSnap, ...futureStack];
    try {
      const parsed = JSON.parse(prevSnap);
      set({
        nodes: parsed.nodes || {},
        pointers: parsed.pointers || {},
        structures: parsed.structures || {},
        historyStack: newHistory,
        futureStack: newFuture,
        canUndo: newHistory.length > 0,
        canRedo: newFuture.length > 0,
        selectedId: null,
      });
      return true;
    } catch {
      return false;
    }
  },

  redo: () => {
    const { historyStack, futureStack, nodes, pointers, structures } = get();
    if (futureStack.length === 0) return false;
    const currentSnap = JSON.stringify({ nodes, pointers, structures });
    const nextSnap = futureStack[0];
    const newFuture = futureStack.slice(1);
    const newHistory = [...historyStack, currentSnap];
    try {
      const parsed = JSON.parse(nextSnap);
      set({
        nodes: parsed.nodes || {},
        pointers: parsed.pointers || {},
        structures: parsed.structures || {},
        historyStack: newHistory,
        futureStack: newFuture,
        canUndo: newHistory.length > 0,
        canRedo: newFuture.length > 0,
        selectedId: null,
      });
      return true;
    } catch {
      return false;
    }
  },

  reset: () => {
    get().saveSnapshot();
    set({
      nodes: {},
      pointers: {},
      structures: {},
      selectedId: null,
      transientReturn: null,
      nextAutoInt: 10,
      sharedValueInput: '10',
      canUndo: true,
      canRedo: false,
    });
  },

  // ── Unified Dispatch Function ─────────────────────────────────────────
  dispatch: (command) => {
    const { type, ...args } = command;

    // Movement gestures only update coordinates — no history snapshot or code statements
    if (type === 'node.move') {
      const { id, pos } = args;
      set((state) => {
        if (!state.nodes[id]) return state;
        return {
          nodes: {
            ...state.nodes,
            [id]: { ...state.nodes[id], position: pos },
          },
        };
      });
      return;
    }

    if (type === 'pointer.move') {
      const { id, pos } = args;
      set((state) => {
        if (!state.pointers[id]) return state;
        return {
          pointers: {
            ...state.pointers,
            [id]: { ...state.pointers[id], position: pos },
          },
        };
      });
      return;
    }

    if (type === 'structure.move') {
      const { id, pos } = args;
      set((state) => {
        if (!state.structures[id]) return state;
        return {
          structures: {
            ...state.structures,
            [id]: { ...state.structures[id], position: pos },
          },
        };
      });
      return;
    }

    // All other modifying actions save snapshot
    get().saveSnapshot();

    switch (type) {
      case 'node.create': {
        const { value, nodeType, pos, varName: customVarName } = args;
        const currentNodes = Object.values(get().nodes);
        const newId = genId('n');
        const varName = customVarName || `n${currentNodes.length + 1}`;
        const nodeTypeVal = nodeType || get().nodeTypeToggle || 'singly';

        const centerPos = pos || {
          x: (-get().pan.x + window.innerWidth / 2) / get().zoom - 28,
          y: (-get().pan.y + window.innerHeight / 2) / get().zoom - 28,
        };

        const newNode = {
          id: newId,
          varName,
          value: value !== undefined ? value : get().getNextValue(),
          nodeType: nodeTypeVal,
          next: null,
          prev: null,
          position: centerPos,
        };

        set((state) => ({
          nodes: { ...state.nodes, [newId]: newNode },
          selectedId: newId,
        }));
        return newId;
      }

      case 'node.connect': {
        const { sourceId, port = 'next', targetId } = args;
        set((state) => {
          const src = state.nodes[sourceId];
          if (!src) return state;
          return {
            nodes: {
              ...state.nodes,
              [sourceId]: { ...src, [port]: targetId },
            },
          };
        });
        break;
      }

      case 'node.disconnect': {
        const { sourceId, port = 'next' } = args;
        set((state) => {
          const src = state.nodes[sourceId];
          if (!src) return state;
          return {
            nodes: {
              ...state.nodes,
              [sourceId]: { ...src, [port]: 'NULL' },
            },
          };
        });
        break;
      }

      case 'node.setValue': {
        const { id, value } = args;
        set((state) => {
          const n = state.nodes[id];
          if (!n) return state;
          return {
            nodes: {
              ...state.nodes,
              [id]: { ...n, value },
            },
          };
        });
        break;
      }

      case 'node.setType': {
        const { id, nodeType } = args;
        set((state) => {
          const n = state.nodes[id];
          if (!n) return state;
          return {
            nodes: {
              ...state.nodes,
              [id]: {
                ...n,
                nodeType,
                prev: nodeType === 'singly' ? null : n.prev,
              },
            },
          };
        });
        break;
      }

      case 'node.delete': {
        const { id } = args;
        set((state) => {
          const nextNodes = { ...state.nodes };
          delete nextNodes[id];

          // Clean up dangling next/prev references
          Object.keys(nextNodes).forEach((k) => {
            if (nextNodes[k].next === id) nextNodes[k].next = null;
            if (nextNodes[k].prev === id) nextNodes[k].prev = null;
          });

          // Clean up dangling pointers
          const nextPointers = { ...state.pointers };
          Object.keys(nextPointers).forEach((pId) => {
            if (nextPointers[pId].targetId === id) {
              nextPointers[pId] = { ...nextPointers[pId], targetId: null };
            }
          });

          return {
            nodes: nextNodes,
            pointers: nextPointers,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        });
        break;
      }

      case 'pointer.create': {
        const { name, targetId = null, pos } = args;
        const ptrId = genId(`ptr_${name}`);
        const centerPos = pos || {
          x: (-get().pan.x + window.innerWidth / 2) / get().zoom,
          y: (-get().pan.y + window.innerHeight / 2) / get().zoom - 50,
        };

        const newPtr = {
          id: ptrId,
          name,
          targetId: targetId === 'NULL' ? null : targetId,
          isExplicitNull: targetId === 'NULL',
          position: centerPos,
        };

        set((state) => ({
          pointers: { ...state.pointers, [ptrId]: newPtr },
          selectedId: ptrId,
        }));
        return ptrId;
      }

      case 'pointer.assign': {
        const { id, targetId } = args;
        set((state) => {
          const p = state.pointers[id];
          if (!p) return state;
          return {
            pointers: {
              ...state.pointers,
              [id]: {
                ...p,
                targetId: targetId === 'NULL' ? null : targetId,
                isExplicitNull: targetId === 'NULL',
              },
            },
          };
        });
        break;
      }

      case 'pointer.advance': {
        const { id, port = 'next' } = args;
        const p = get().pointers[id];
        if (!p || !p.targetId) {
          return { error: 'NullPointer', message: `${p?.name || 'Pointer'} is NULL, cannot read ${port}` };
        }
        const targetNode = get().nodes[p.targetId];
        if (!targetNode || !targetNode[port] || targetNode[port] === 'NULL') {
          return { error: 'NullPointer', message: `${p.name}.${port} is NULL, cannot read ${port}` };
        }
        set((state) => ({
          pointers: {
            ...state.pointers,
            [id]: {
              ...state.pointers[id],
              targetId: targetNode[port],
              isExplicitNull: false,
            },
          },
        }));
        break;
      }

      case 'pointer.delete': {
        const { id } = args;
        set((state) => {
          const nextPtrs = { ...state.pointers };
          delete nextPtrs[id];
          return {
            pointers: nextPtrs,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        });
        break;
      }

      case 'array.create': {
        const { capacity = 8, isDynamic = false, items = [], pos } = args;
        const arrId = genId('arr');
        const centerPos = pos || {
          x: (-get().pan.x + window.innerWidth / 2) / get().zoom - 150,
          y: (-get().pan.y + window.innerHeight / 2) / get().zoom - 30,
        };

        const initialItems = items.length > 0 ? items : [get().getNextValue(), null, null, null];

        const newStruct = {
          id: arrId,
          varName: `arr${Object.keys(get().structures).length + 1}`,
          type: 'array',
          capacity,
          isDynamic,
          items: initialItems,
          pointers: [{ name: 'i', index: 0 }],
          position: centerPos,
        };

        set((state) => ({
          structures: { ...state.structures, [arrId]: newStruct },
          selectedId: arrId,
        }));
        return arrId;
      }

      case 'array.set': {
        const { id, index, value } = args;
        set((state) => {
          const arr = state.structures[id];
          if (!arr) return state;
          const nextItems = [...arr.items];
          nextItems[index] = value;
          return {
            structures: {
              ...state.structures,
              [id]: { ...arr, items: nextItems },
            },
          };
        });
        break;
      }

      case 'array.insert': {
        const { id, index, value } = args;
        set((state) => {
          const arr = state.structures[id];
          if (!arr) return state;
          const nextItems = [...arr.items];
          nextItems.splice(index, 0, value);
          return {
            structures: {
              ...state.structures,
              [id]: { ...arr, items: nextItems },
            },
          };
        });
        break;
      }

      case 'array.delete': {
        const { id, index } = args;
        set((state) => {
          const arr = state.structures[id];
          if (!arr) return state;
          const nextItems = [...arr.items];
          nextItems.splice(index, 1);
          return {
            structures: {
              ...state.structures,
              [id]: { ...arr, items: nextItems },
            },
          };
        });
        break;
      }

      case 'stack.create': {
        const { capacity = 6, items = [], pos } = args;
        const stackId = genId('stack');
        const centerPos = pos || {
          x: (-get().pan.x + window.innerWidth / 2) / get().zoom - 30,
          y: (-get().pan.y + window.innerHeight / 2) / get().zoom + 60,
        };

        const initialItems = items.length > 0 ? items : [get().getNextValue()];

        const newStruct = {
          id: stackId,
          varName: `s${Object.keys(get().structures).length + 1}`,
          type: 'stack',
          capacity,
          items: initialItems,
          position: centerPos,
        };

        set((state) => ({
          structures: { ...state.structures, [stackId]: newStruct },
          selectedId: stackId,
        }));
        return stackId;
      }

      case 'stack.push': {
        const { id, value } = args;
        const val = value !== undefined ? value : get().getNextValue();
        set((state) => {
          const s = state.structures[id];
          if (!s) return state;
          return {
            structures: {
              ...state.structures,
              [id]: { ...s, items: [...s.items, val] },
            },
          };
        });
        break;
      }

      case 'stack.pop': {
        const { id } = args;
        const s = get().structures[id];
        if (!s || s.items.length === 0) return null;
        const popped = s.items[s.items.length - 1];
        set((state) => ({
          structures: {
            ...state.structures,
            [id]: { ...s, items: s.items.slice(0, -1) },
          },
        }));
        get().setTransientReturn({
          value: popped,
          position: { x: s.position.x, y: s.position.y - 40 },
          id: Date.now(),
        });
        return popped;
      }

      case 'queue.create': {
        const { capacity = 6, items = [], pos } = args;
        const queueId = genId('queue');
        const centerPos = pos || {
          x: (-get().pan.x + window.innerWidth / 2) / get().zoom - 100,
          y: (-get().pan.y + window.innerHeight / 2) / get().zoom - 30,
        };

        const initialItems = items.length > 0 ? items : [get().getNextValue()];

        const newStruct = {
          id: queueId,
          varName: `q${Object.keys(get().structures).length + 1}`,
          type: 'queue',
          capacity,
          items: initialItems,
          position: centerPos,
        };

        set((state) => ({
          structures: { ...state.structures, [queueId]: newStruct },
          selectedId: queueId,
        }));
        return queueId;
      }

      case 'queue.enqueue': {
        const { id, value } = args;
        const val = value !== undefined ? value : get().getNextValue();
        set((state) => {
          const q = state.structures[id];
          if (!q) return state;
          return {
            structures: {
              ...state.structures,
              [id]: { ...q, items: [...q.items, val] },
            },
          };
        });
        break;
      }

      case 'queue.dequeue': {
        const { id } = args;
        const q = get().structures[id];
        if (!q || q.items.length === 0) return null;
        const dequeued = q.items[0];
        set((state) => ({
          structures: {
            ...state.structures,
            [id]: { ...q, items: q.items.slice(1) },
          },
        }));
        get().setTransientReturn({
          value: dequeued,
          position: { x: q.position.x - 40, y: q.position.y },
          id: Date.now(),
        });
        return dequeued;
      }

      case 'structure.delete': {
        const { id } = args;
        set((state) => {
          const nextStructs = { ...state.structures };
          delete nextStructs[id];
          return {
            structures: nextStructs,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        });
        break;
      }

      case 'delete.selected': {
        const sel = get().selectedId;
        if (!sel) return;
        if (get().nodes[sel]) get().dispatch({ type: 'node.delete', id: sel });
        else if (get().pointers[sel]) get().dispatch({ type: 'pointer.delete', id: sel });
        else if (get().structures[sel]) get().dispatch({ type: 'structure.delete', id: sel });
        break;
      }

      default:
        break;
    }
  },
}));
