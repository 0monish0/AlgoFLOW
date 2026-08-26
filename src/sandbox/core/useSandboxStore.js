import { create } from 'zustand';
import { createNode, createFreePointer, createNullToken, getInitialGraph } from './graphModel';
import { evaluateGraph } from './evaluator';

const MAX_HISTORY = 30;

// Helper to calculate canvas coordinates for the center of the current screen viewport
const getViewportCenter = (pan, zoom) => {
  let vpWidth = 1000;
  let vpHeight = 700;
  if (typeof document !== 'undefined') {
    const el = document.getElementById('sandbox-canvas-viewport');
    if (el) {
      vpWidth = el.clientWidth || 1000;
      vpHeight = el.clientHeight || 700;
    } else if (typeof window !== 'undefined') {
      vpWidth = window.innerWidth;
      vpHeight = window.innerHeight;
    }
  }
  const currentPan = pan || { x: 0, y: 0 };
  const currentZoom = zoom || 1;
  return {
    x: (-currentPan.x + vpWidth / 2) / currentZoom,
    y: (-currentPan.y + vpHeight / 2) / currentZoom,
  };
};

export const useSandboxStore = create((set, get) => {
  const initial = getInitialGraph();
  const initialEval = evaluateGraph(initial.nodes, initial.freePointers, initial.nullTokens);

  return {
    mode: 'free', // 'free' | 'guided'

    nodes: initial.nodes,
    freePointers: initial.freePointers,
    nullTokens: initial.nullTokens,
    evaluation: initialEval,

    activeLessonId: null,
    currentStepIndex: 0,

    historyStack: [],
    futureStack: [],

    pan: { x: 0, y: 0 },
    zoom: 1,

    // Active pointer selected for game-like stepper controller
    activePointerId: null,

    // Active wire drag gesture state
    activeWire: null,

    // Selected edge for traversal controls popup
    selectedEdge: null,

    // Highlighted node (for traversal step jump)
    highlightedNodeId: null,

    // Connect mode (when a socket/pointer is clicked rather than dragged)
    connectingSource: null,

    // Current structure type for multi-sandbox support
    structureType: 'linked-list',
    setStructure: (structureType) => set({ structureType }),

    setActivePointerId: (activePointerId) => set({ activePointerId }),
    setConnectingSource: (connectingSource) => set({ connectingSource }),
    setSelectedEdge: (selectedEdge) => set({ selectedEdge }),
    setHighlightedNodeId: (highlightedNodeId) => set({ highlightedNodeId }),

    // Snapshot History Stack
    saveSnapshot: () => {
      const { nodes, freePointers, nullTokens, historyStack } = get();
      const snapshot = JSON.stringify({ nodes, freePointers, nullTokens });
      set({
        historyStack: [...historyStack.slice(-MAX_HISTORY), snapshot],
        futureStack: [],
      });
    },

    undo: () => {
      const { historyStack, futureStack, nodes, freePointers, nullTokens } = get();
      if (historyStack.length === 0) return;

      const prev = historyStack[historyStack.length - 1];
      const newHistory = historyStack.slice(0, -1);
      const curr = JSON.stringify({ nodes, freePointers, nullTokens });

      try {
        const parsed = JSON.parse(prev);
        const evalResult = evaluateGraph(parsed.nodes, parsed.freePointers, parsed.nullTokens);
        set({
          nodes: parsed.nodes,
          freePointers: parsed.freePointers,
          nullTokens: parsed.nullTokens || {},
          historyStack: newHistory,
          futureStack: [curr, ...futureStack],
          evaluation: evalResult,
          connectingSource: null,
          activeWire: null,
          selectedEdge: null,
        });
      } catch (err) {
        console.error('Failed to undo snapshot', err);
      }
    },

    redo: () => {
      const { futureStack, historyStack, nodes, freePointers, nullTokens } = get();
      if (futureStack.length === 0) return;

      const next = futureStack[0];
      const newFuture = futureStack.slice(1);
      const curr = JSON.stringify({ nodes, freePointers, nullTokens });

      try {
        const parsed = JSON.parse(next);
        const evalResult = evaluateGraph(parsed.nodes, parsed.freePointers, parsed.nullTokens);
        set({
          nodes: parsed.nodes,
          freePointers: parsed.freePointers,
          nullTokens: parsed.nullTokens || {},
          historyStack: [...historyStack, curr],
          futureStack: newFuture,
          evaluation: evalResult,
          connectingSource: null,
          activeWire: null,
          selectedEdge: null,
        });
      } catch (err) {
        console.error('Failed to redo snapshot', err);
      }
    },

    setMode: (mode) => set({ mode }),

    setLesson: (lessonId, stepIndex = 0) => {
      set({ activeLessonId: lessonId, currentStepIndex: stepIndex, mode: 'guided' });
    },

    setStepIndex: (index) => set({ currentStepIndex: index }),

    setPan: (pan) => set({ pan }),
    setZoom: (zoom) => set({ zoom: Math.max(0.4, Math.min(2.2, zoom)) }),

    setActiveWire: (activeWire) => set({ activeWire }),

    // Node Actions (Spawns right in current viewport if position not specified)
    addNode: (data = 10, position, nodeType = 'singly') => {
      get().saveSnapshot();
      const { nodes, freePointers, nullTokens, pan, zoom } = get();
      let nodePos = position;
      if (!nodePos) {
        const center = getViewportCenter(pan, zoom);
        nodePos = {
          x: Math.round(center.x - 46 + (Math.random() - 0.5) * 60),
          y: Math.round(center.y - 46 + (Math.random() - 0.5) * 60),
        };
      }
      const newNode = createNode(data, nodePos, nodeType);

      const nextNodes = { ...nodes, [newNode.id]: newNode };
      const evalResult = evaluateGraph(nextNodes, freePointers, nullTokens);
      set({ nodes: nextNodes, evaluation: evalResult });
      get().scheduleLeakCollection();
      return newNode.id;
    },

    updateNodeData: (id, data) => {
      const { nodes, freePointers, nullTokens } = get();
      if (!nodes[id]) return;
      get().saveSnapshot();

      const nextNodes = {
        ...nodes,
        [id]: { ...nodes[id], data },
      };
      const evalResult = evaluateGraph(nextNodes, freePointers, nullTokens);
      set({ nodes: nextNodes, evaluation: evalResult });
    },

    updateNodePosition: (id, position) => {
      const { nodes } = get();
      if (!nodes[id]) return;
      set({
        nodes: {
          ...nodes,
          [id]: { ...nodes[id], position },
        },
      });
    },

    setNodeType: (id, nodeType) => {
      get().saveSnapshot();
      const { nodes, freePointers, nullTokens } = get();
      const node = nodes[id];
      if (!node) return;

      const nextSockets = { ...node.sockets };
      if (nodeType === 'doubly' && nextSockets.prev === undefined) {
        nextSockets.prev = null;
      } else if (nodeType === 'singly' && nextSockets.prev !== undefined) {
        delete nextSockets.prev;
      }

      const nextNodes = {
        ...nodes,
        [id]: {
          ...node,
          nodeType,
          sockets: nextSockets,
        },
      };

      const evalResult = evaluateGraph(nextNodes, freePointers, nullTokens);
      set({ nodes: nextNodes, evaluation: evalResult, selectedEdge: null });
      get().scheduleLeakCollection();
    },

    deleteNode: (id) => {
      get().saveSnapshot();
      const { nodes, freePointers, nullTokens } = get();
      if (!nodes[id]) return;

      const nextNodes = { ...nodes };
      delete nextNodes[id];

      // Update free pointers targeting this node to null
      const nextFreePointers = { ...freePointers };
      Object.keys(nextFreePointers).forEach((pKey) => {
        if (nextFreePointers[pKey].targetId === id) {
          nextFreePointers[pKey] = { ...nextFreePointers[pKey], targetId: null };
        }
      });

      const evalResult = evaluateGraph(nextNodes, nextFreePointers, nullTokens);
      set({
        nodes: nextNodes,
        freePointers: nextFreePointers,
        evaluation: evalResult,
        selectedEdge: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    // NULL Token Actions (Spawns right in current viewport if position not specified)
    addNullToken: (position) => {
      get().saveSnapshot();
      const { nullTokens, nodes, freePointers, pan, zoom } = get();
      let tokenPos = position;
      if (!tokenPos) {
        const center = getViewportCenter(pan, zoom);
        tokenPos = {
          x: Math.round(center.x + 120 + (Math.random() - 0.5) * 40),
          y: Math.round(center.y - 22 + (Math.random() - 0.5) * 40),
        };
      }
      const newNull = createNullToken(tokenPos);
      const nextNulls = { ...nullTokens, [newNull.id]: newNull };
      const evalResult = evaluateGraph(nodes, freePointers, nextNulls);
      set({ nullTokens: nextNulls, evaluation: evalResult });
      return newNull.id;
    },

    updateNullPosition: (id, position) => {
      const { nullTokens } = get();
      if (!nullTokens[id]) return;
      set({
        nullTokens: {
          ...nullTokens,
          [id]: { ...nullTokens[id], position },
        },
      });
    },

    deleteNullToken: (id) => {
      get().saveSnapshot();
      const { nullTokens, nodes, freePointers } = get();
      if (!nullTokens[id]) return;

      const nextNulls = { ...nullTokens };
      delete nextNulls[id];

      // Disconnect any sockets referencing this specific NULL token
      const nextNodes = { ...nodes };
      Object.keys(nextNodes).forEach((nId) => {
        const node = nextNodes[nId];
        if (node && node.sockets) {
          const nextSockets = { ...node.sockets };
          let changed = false;
          if (nextSockets.next?.targetId === id) {
            nextSockets.next = null;
            changed = true;
          }
          if (nextSockets.prev?.targetId === id) {
            nextSockets.prev = null;
            changed = true;
          }
          if (changed) {
            nextNodes[nId] = { ...node, sockets: nextSockets };
          }
        }
      });

      // Disconnect any free pointers targeting this specific NULL token
      const nextPointers = { ...freePointers };
      Object.keys(nextPointers).forEach((pId) => {
        if (nextPointers[pId]?.targetId === id) {
          nextPointers[pId] = { ...nextPointers[pId], targetId: null };
        }
      });

      const evalResult = evaluateGraph(nextNodes, nextPointers, nextNulls);
      set({
        nullTokens: nextNulls,
        nodes: nextNodes,
        freePointers: nextPointers,
        evaluation: evalResult,
        selectedEdge: null,
      });
      get().scheduleLeakCollection();
    },

    // Free Pointer Actions (Spawns right in current viewport if position not specified)
    addFreePointer: (label = 'ptr', position, targetId = null) => {
      get().saveSnapshot();
      const { freePointers, nodes, nullTokens, pan, zoom } = get();
      let ptrPos = position;
      if (!ptrPos) {
        const center = getViewportCenter(pan, zoom);
        ptrPos = {
          x: Math.round(center.x - 180 + (Math.random() - 0.5) * 40),
          y: Math.round(center.y - 21 + (Math.random() - 0.5) * 40),
        };
      }
      const newPtr = createFreePointer(label, targetId, ptrPos);

      const nextPointers = { ...freePointers, [newPtr.id]: newPtr };
      const evalResult = evaluateGraph(nodes, nextPointers, nullTokens);
      set({ freePointers: nextPointers, evaluation: evalResult, activePointerId: newPtr.id });
      get().scheduleLeakCollection();
      return newPtr.id;
    },

    updatePointerLabel: (id, label) => {
      const { freePointers } = get();
      if (!freePointers[id]) return;
      get().saveSnapshot();

      const nextPointers = {
        ...freePointers,
        [id]: { ...freePointers[id], label },
      };
      set({ freePointers: nextPointers });
    },

    updatePointerPosition: (id, position) => {
      const { freePointers } = get();
      if (!freePointers[id]) return;
      set({
        freePointers: {
          ...freePointers,
          [id]: { ...freePointers[id], position },
        },
      });
    },

    setPointerTarget: (id, targetId) => {
      get().saveSnapshot();
      const { freePointers, nodes, nullTokens } = get();
      if (!freePointers[id]) return;

      const nextPointers = {
        ...freePointers,
        [id]: { ...freePointers[id], targetId },
      };

      const evalResult = evaluateGraph(nodes, nextPointers, nullTokens);
      set({
        freePointers: nextPointers,
        evaluation: evalResult,
        activeWire: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    deleteFreePointer: (id) => {
      get().saveSnapshot();
      const { freePointers, nodes, nullTokens, activePointerId } = get();
      if (!freePointers[id]) return;

      const nextPointers = { ...freePointers };
      delete nextPointers[id];

      const evalResult = evaluateGraph(nodes, nextPointers, nullTokens);
      set({
        freePointers: nextPointers,
        evaluation: evalResult,
        selectedEdge: null,
        connectingSource: null,
        activePointerId: activePointerId === id ? null : activePointerId,
      });
      get().scheduleLeakCollection();
    },

    // Interactive Game-like Stepper Controls (Simulates ptr = ptr->next / ptr = ptr->prev)
    stepPointerForward: (ptrId) => {
      const { freePointers, nodes, nullTokens } = get();
      const ptr = freePointers[ptrId];
      if (!ptr || !ptr.targetId || ptr.targetId === 'NULL' || String(ptr.targetId).startsWith('null-')) return;

      const currNode = nodes[ptr.targetId];
      if (!currNode || !currNode.sockets || !currNode.sockets.next) return;

      const nextTargetId = currNode.sockets.next.targetId;
      if (!nextTargetId) return;

      get().saveSnapshot();

      const isTargetNull = nextTargetId === 'NULL' || String(nextTargetId).startsWith('null-') || Boolean(nullTokens[nextTargetId]);

      let nextPos = { ...ptr.position };
      if (isTargetNull) {
        const nullTok = nullTokens[nextTargetId] || Object.values(nullTokens)[0];
        if (nullTok) {
          nextPos = { x: nullTok.position.x - 70, y: nullTok.position.y - 10 };
        }
      } else if (nodes[nextTargetId]) {
        nextPos = {
          x: nodes[nextTargetId].position.x - 70,
          y: nodes[nextTargetId].position.y - 10,
        };
      }

      const updatedPointers = {
        ...freePointers,
        [ptrId]: {
          ...ptr,
          targetId: nextTargetId,
          position: nextPos,
        },
      };

      const evalResult = evaluateGraph(nodes, updatedPointers, nullTokens);
      set({
        freePointers: updatedPointers,
        evaluation: evalResult,
        highlightedNodeId: !isTargetNull ? nextTargetId : null,
      });

      setTimeout(() => {
        set({ highlightedNodeId: null });
      }, 700);
      get().scheduleLeakCollection();
    },

    stepPointerBackward: (ptrId) => {
      const { freePointers, nodes, nullTokens } = get();
      const ptr = freePointers[ptrId];
      if (!ptr || !ptr.targetId || ptr.targetId === 'NULL' || String(ptr.targetId).startsWith('null-')) return;

      const currNode = nodes[ptr.targetId];
      if (!currNode || currNode.nodeType !== 'doubly' || !currNode.sockets?.prev) return;

      const prevTargetId = currNode.sockets.prev.targetId;
      if (!prevTargetId || prevTargetId === 'NULL' || String(prevTargetId).startsWith('null-')) return;

      get().saveSnapshot();

      let nextPos = { ...ptr.position };
      if (nodes[prevTargetId]) {
        nextPos = {
          x: nodes[prevTargetId].position.x - 70,
          y: nodes[prevTargetId].position.y - 10,
        };
      }

      const updatedPointers = {
        ...freePointers,
        [ptrId]: {
          ...ptr,
          targetId: prevTargetId,
          position: nextPos,
        },
      };

      const evalResult = evaluateGraph(nodes, updatedPointers, nullTokens);
      set({
        freePointers: updatedPointers,
        evaluation: evalResult,
        highlightedNodeId: prevTargetId,
      });

      setTimeout(() => {
        set({ highlightedNodeId: null });
      }, 700);
      get().scheduleLeakCollection();
    },

    // Socket Connections
    connectSocket: (sourceNodeId, socketType, targetId) => {
      get().saveSnapshot();
      const { nodes, freePointers, nullTokens } = get();
      const sourceNode = nodes[sourceNodeId];
      if (!sourceNode) return;

      const nextNodes = {
        ...nodes,
        [sourceNodeId]: {
          ...sourceNode,
          sockets: {
            ...sourceNode.sockets,
            [socketType]: { targetId },
          },
        },
      };

      const evalResult = evaluateGraph(nextNodes, freePointers, nullTokens);
      set({
        nodes: nextNodes,
        evaluation: evalResult,
        activeWire: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    disconnectSocket: (sourceNodeId, socketType) => {
      get().saveSnapshot();
      const { nodes, freePointers, nullTokens } = get();
      const sourceNode = nodes[sourceNodeId];
      if (!sourceNode) return;

      const nextNodes = {
        ...nodes,
        [sourceNodeId]: {
          ...sourceNode,
          sockets: {
            ...sourceNode.sockets,
            [socketType]: null,
          },
        },
      };

      const evalResult = evaluateGraph(nextNodes, freePointers, nullTokens);
      set({
        nodes: nextNodes,
        evaluation: evalResult,
        selectedEdge: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    // Traversal Action (Simulates ptr = ptr->next on edge click)
    followEdge: (targetId) => {
      if (!targetId || targetId === 'NULL') return;
      set({ highlightedNodeId: targetId });
      setTimeout(() => {
        set({ highlightedNodeId: null, selectedEdge: null });
      }, 1000);
    },

    // Core GC simulation: Transition from reachable -> unreachable triggers 1.8s grace period
    scheduleLeakCollection: () => {
      const { nodes, evaluation, freePointers, nullTokens } = get();
      const now = Date.now();

      let changed = false;
      const updatedNodes = { ...nodes };

      Object.keys(updatedNodes).forEach((id) => {
        const node = updatedNodes[id];
        if (!node) return;

        const isReachable = evaluation.reachableNodeIds.has(id);
        const isOrphaned = evaluation.orphanedNodeIds.has(id);

        if (isReachable) {
          if (!node.hasEverBeenReachable || node.status !== 'reachable') {
            updatedNodes[id] = {
              ...node,
              status: 'reachable',
              hasEverBeenReachable: true,
              leakStartedAt: null,
            };
            changed = true;
          }
        } else if (isOrphaned) {
          if (node.status !== 'leaking') {
            updatedNodes[id] = {
              ...node,
              status: 'leaking',
              leakStartedAt: now,
            };
            changed = true;
          }
        } else {
          if (node.status !== 'unattached') {
            updatedNodes[id] = {
              ...node,
              status: 'unattached',
              leakStartedAt: null,
            };
            changed = true;
          }
        }
      });

      if (changed) {
        set({ nodes: updatedNodes });
      }

      // Schedule removal of leaking nodes after 1800ms
      setTimeout(() => {
        const current = get();
        const currentNow = Date.now();
        const cleanedNodes = { ...current.nodes };
        let didRemove = false;

        Object.keys(cleanedNodes).forEach((id) => {
          const node = cleanedNodes[id];
          if (
            node &&
            node.status === 'leaking' &&
            node.leakStartedAt &&
            currentNow - node.leakStartedAt >= 1700 &&
            current.evaluation.orphanedNodeIds.has(id)
          ) {
            delete cleanedNodes[id];
            didRemove = true;
          }
        });

        if (didRemove) {
          const reEval = evaluateGraph(cleanedNodes, current.freePointers, current.nullTokens);
          set({ nodes: cleanedNodes, evaluation: reEval });
          get().scheduleLeakCollection();
        }
      }, 1850);
    },

    resetCanvas: () => {
      const initial = getInitialGraph();
      const evalResult = evaluateGraph(initial.nodes, initial.freePointers, initial.nullTokens);
      set({
        nodes: initial.nodes,
        freePointers: initial.freePointers,
        nullTokens: initial.nullTokens,
        evaluation: evalResult,
        historyStack: [],
        futureStack: [],
        activeLessonId: null,
        currentStepIndex: 0,
        activeWire: null,
        selectedEdge: null,
        connectingSource: null,
        activePointerId: null,
      });
    },
  };
});
