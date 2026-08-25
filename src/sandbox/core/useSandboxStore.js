import { create } from 'zustand';
import { createNode, createFreePointer, getInitialGraph } from './graphModel';
import { evaluateGraph } from './evaluator';

const MAX_HISTORY = 30;

export const useSandboxStore = create((set, get) => {
  const initial = getInitialGraph();
  const initialEval = evaluateGraph(initial.nodes, initial.freePointers);

  return {
    mode: 'free', // 'free' | 'guided'

    nodes: initial.nodes,
    freePointers: initial.freePointers,
    evaluation: initialEval,

    activeLessonId: null,
    currentStepIndex: 0,

    historyStack: [],
    futureStack: [],

    pan: { x: 0, y: 0 },
    zoom: 1,

    // Active wire drag gesture state
    activeWire: null, // { sourceId, sourceType: 'socket'|'pointer', socketType, startX, startY, cursorX, cursorY }

    // Selected edge for traversal controls popup
    selectedEdge: null, // { sourceId, sourceType, targetId, socketType, x, y }

    // Highlighted node (for traversal step jump)
    highlightedNodeId: null,

    // Connect mode (when a socket/pointer is clicked rather than dragged)
    connectingSource: null, // { sourceId, sourceType, socketType }

    setConnectingSource: (connectingSource) => set({ connectingSource }),
    setSelectedEdge: (selectedEdge) => set({ selectedEdge }),
    setHighlightedNodeId: (highlightedNodeId) => set({ highlightedNodeId }),

    // Snapshot History Stack
    saveSnapshot: () => {
      const { nodes, freePointers, historyStack } = get();
      const snapshot = JSON.stringify({ nodes, freePointers });
      set({
        historyStack: [...historyStack.slice(-MAX_HISTORY), snapshot],
        futureStack: [],
      });
    },

    undo: () => {
      const { historyStack, futureStack, nodes, freePointers } = get();
      if (historyStack.length === 0) return;

      const prev = historyStack[historyStack.length - 1];
      const newHistory = historyStack.slice(0, -1);
      const curr = JSON.stringify({ nodes, freePointers });

      try {
        const parsed = JSON.parse(prev);
        const evalResult = evaluateGraph(parsed.nodes, parsed.freePointers);
        set({
          nodes: parsed.nodes,
          freePointers: parsed.freePointers,
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
      const { futureStack, historyStack, nodes, freePointers } = get();
      if (futureStack.length === 0) return;

      const next = futureStack[0];
      const newFuture = futureStack.slice(1);
      const curr = JSON.stringify({ nodes, freePointers });

      try {
        const parsed = JSON.parse(next);
        const evalResult = evaluateGraph(parsed.nodes, parsed.freePointers);
        set({
          nodes: parsed.nodes,
          freePointers: parsed.freePointers,
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

    // Node Actions
    addNode: (data = 10, position, nodeType = 'singly') => {
      get().saveSnapshot();
      const { nodes, freePointers } = get();
      const nodePos = position || {
        x: 320 + Math.random() * 80,
        y: 220 + Math.random() * 60,
      };
      const newNode = createNode(data, nodePos, nodeType);

      const nextNodes = { ...nodes, [newNode.id]: newNode };
      const evalResult = evaluateGraph(nextNodes, freePointers);
      set({ nodes: nextNodes, evaluation: evalResult });
      get().scheduleLeakCollection();
      return newNode.id;
    },

    updateNodeData: (id, data) => {
      const { nodes, freePointers } = get();
      if (!nodes[id]) return;
      get().saveSnapshot();

      const nextNodes = {
        ...nodes,
        [id]: { ...nodes[id], data },
      };
      const evalResult = evaluateGraph(nextNodes, freePointers);
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
      const { nodes, freePointers } = get();
      const node = nodes[id];
      if (!node) return;

      const nextSockets = { ...node.sockets };
      if (nodeType === 'doubly' && !nextSockets.prev) {
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

      const evalResult = evaluateGraph(nextNodes, freePointers);
      set({ nodes: nextNodes, evaluation: evalResult, selectedEdge: null });
      get().scheduleLeakCollection();
    },

    deleteNode: (id) => {
      get().saveSnapshot();
      const { nodes, freePointers } = get();
      if (!nodes[id]) return;

      const nextNodes = { ...nodes };
      delete nextNodes[id];

      // Update free pointers that were targeting this node
      const nextFreePointers = { ...freePointers };
      Object.keys(nextFreePointers).forEach((pKey) => {
        if (nextFreePointers[pKey].targetId === id) {
          nextFreePointers[pKey] = { ...nextFreePointers[pKey], targetId: null };
        }
      });

      const evalResult = evaluateGraph(nextNodes, nextFreePointers);
      set({
        nodes: nextNodes,
        freePointers: nextFreePointers,
        evaluation: evalResult,
        selectedEdge: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    // Free Pointer Actions
    addFreePointer: (label = 'ptr', position) => {
      get().saveSnapshot();
      const { freePointers, nodes } = get();
      const ptrPos = position || {
        x: 160 + Math.random() * 40,
        y: 180 + Math.random() * 40,
      };
      const newPtr = createFreePointer(label, null, ptrPos);

      const nextPointers = { ...freePointers, [newPtr.id]: newPtr };
      const evalResult = evaluateGraph(nodes, nextPointers);
      set({ freePointers: nextPointers, evaluation: evalResult });
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
      const { freePointers, nodes } = get();
      if (!freePointers[id]) return;

      const nextPointers = {
        ...freePointers,
        [id]: { ...freePointers[id], targetId },
      };

      const evalResult = evaluateGraph(nodes, nextPointers);
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
      const { freePointers, nodes } = get();
      if (!freePointers[id]) return;

      const nextPointers = { ...freePointers };
      delete nextPointers[id];

      const evalResult = evaluateGraph(nodes, nextPointers);
      set({
        freePointers: nextPointers,
        evaluation: evalResult,
        selectedEdge: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    // Socket Connections
    connectSocket: (sourceNodeId, socketType, targetId) => {
      get().saveSnapshot();
      const { nodes, freePointers } = get();
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

      const evalResult = evaluateGraph(nextNodes, freePointers);
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
      const { nodes, freePointers } = get();
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

      const evalResult = evaluateGraph(nextNodes, freePointers);
      set({
        nodes: nextNodes,
        evaluation: evalResult,
        selectedEdge: null,
        connectingSource: null,
      });
      get().scheduleLeakCollection();
    },

    // Traversal Action (Simulates ptr = ptr->next)
    followEdge: (targetId) => {
      if (!targetId || targetId === 'NULL') return;
      set({ highlightedNodeId: targetId });
      setTimeout(() => {
        set({ highlightedNodeId: null, selectedEdge: null });
      }, 1000);
    },

    // Core GC simulation: Transition from reachable -> unreachable triggers 1.8s grace period, then actual removal
    scheduleLeakCollection: () => {
      const { nodes, evaluation, freePointers } = get();
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
          // Node was previously reachable and has now lost all paths
          if (node.status !== 'leaking') {
            updatedNodes[id] = {
              ...node,
              status: 'leaking',
              leakStartedAt: now,
            };
            changed = true;
          }
        } else {
          // Unattached (never yet reached)
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
          const reEval = evaluateGraph(cleanedNodes, current.freePointers);
          set({ nodes: cleanedNodes, evaluation: reEval });
          // Cascading leak check
          get().scheduleLeakCollection();
        }
      }, 1850);
    },

    resetCanvas: () => {
      const initial = getInitialGraph();
      const evalResult = evaluateGraph(initial.nodes, initial.freePointers);
      set({
        nodes: initial.nodes,
        freePointers: initial.freePointers,
        evaluation: evalResult,
        historyStack: [],
        futureStack: [],
        activeLessonId: null,
        currentStepIndex: 0,
        activeWire: null,
        selectedEdge: null,
        connectingSource: null,
      });
    },
  };
});
