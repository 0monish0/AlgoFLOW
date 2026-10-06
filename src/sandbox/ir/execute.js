/**
 * @fileoverview Executes an IR Program to produce canvas state
 * { nodes, freePointers, nullTokens }.
 *
 * Existing node positions are PRESERVED when the var name already exists.
 * New nodes are auto-laid-out left-to-right at y=300.
 */

import { createNode, createFreePointer, createNullToken } from '../core/graphModel.js';

const LAYOUT_START_X = 180;
const LAYOUT_GAP_X = 220;
const LAYOUT_Y = 300;

/**
 * @param {import('./types.js').Program} program
 * @param {{ nodes?: Object, freePointers?: Object, nullTokens?: Object }} [existing]
 *   Pass the current canvas state to preserve node positions.
 * @returns {{ nodes: Object, freePointers: Object, nullTokens: Object }}
 */
export function executeProgram(program, existing = {}) {
  const nodes = {};
  const freePointers = {};
  const nullTokens = {};

  // Lookup: varName → nodeId (built as we process newNode ops)
  const varToNodeId = {};
  // Lookup: existing varName → existing nodeId (to preserve positions)
  const existingVarToNodeId = buildExistingVarMap(existing.nodes || {});

  // Track how many nodes have been placed (for auto-layout)
  let autoLayoutCount = 0;

  for (const op of program) {
    switch (op.op) {
      case 'newNode': {
        // Re-use existing node id to preserve position & color
        const existingId = existingVarToNodeId[op.var];
        const existingNode = existingId && existing.nodes?.[existingId];

        let position;
        if (existingNode) {
          position = existingNode.position;
        } else {
          position = {
            x: LAYOUT_START_X + autoLayoutCount * LAYOUT_GAP_X,
            y: LAYOUT_Y,
          };
        }
        autoLayoutCount++;

        const newNode = existingNode
          ? { ...existingNode, data: String(op.value) }
          : createNode(op.value, position, 'singly');

        nodes[newNode.id] = newNode;
        varToNodeId[op.var] = newNode.id;
        break;
      }

      case 'setNext': {
        const sourceId = varToNodeId[op.node];
        if (!sourceId || !nodes[sourceId]) break;

        let targetId = resolveTargetId(op.target, varToNodeId, nullTokens);
        if (op.target === 'NULL') {
          // Ensure a null token exists
          if (Object.keys(nullTokens).length === 0) {
            const nt = createNullToken({
              x: LAYOUT_START_X + autoLayoutCount * LAYOUT_GAP_X + 60,
              y: LAYOUT_Y + 20,
            });
            nullTokens[nt.id] = nt;
            targetId = nt.id;
          } else {
            targetId = Object.keys(nullTokens)[0];
          }
        }

        nodes[sourceId] = {
          ...nodes[sourceId],
          next: targetId,
          sockets: {
            ...nodes[sourceId].sockets,
            next: targetId ? { targetId } : null,
          },
        };
        break;
      }

      case 'setPrev': {
        const sourceId = varToNodeId[op.node];
        if (!sourceId || !nodes[sourceId]) break;

        let targetId = resolveTargetId(op.target, varToNodeId, nullTokens);
        nodes[sourceId] = {
          ...nodes[sourceId],
          nodeType: 'doubly',
          prev: targetId,
          sockets: {
            ...nodes[sourceId].sockets,
            prev: targetId ? { targetId } : null,
          },
        };
        break;
      }

      case 'setHead':
      case 'declarePointer':
      case 'assignPointer': {
        const label = op.op === 'setHead' ? 'head' : op.var;
        let targetId = null;

        if (op.target === 'NULL') {
          if (Object.keys(nullTokens).length === 0) {
            const nt = createNullToken({
              x: LAYOUT_START_X + autoLayoutCount * LAYOUT_GAP_X + 60,
              y: LAYOUT_Y + 20,
            });
            nullTokens[nt.id] = nt;
            targetId = nt.id;
          } else {
            targetId = Object.keys(nullTokens)[0];
          }
        } else if (op.target) {
          targetId = varToNodeId[op.target] || null;
        }

        // Re-use existing pointer for the same label (preserve position)
        const existingPtr = findExistingPointer(label, existing.freePointers || {});
        const ptr = existingPtr
          ? { ...existingPtr, targetId }
          : createFreePointer(label, targetId, {
              x: (targetId && nodes[targetId]
                ? nodes[targetId].position.x - 90
                : LAYOUT_START_X - 90),
              y: LAYOUT_Y - 20,
            });

        freePointers[ptr.id] = { ...ptr, targetId };
        break;
      }

      case 'advance': {
        // ptr = ptr.next — find the pointer and advance its target
        const ptr = findExistingPointerInBuilt(op.ptr, freePointers);
        if (!ptr) break;

        const currentTargetId = ptr.targetId;
        if (!currentTargetId || !nodes[currentTargetId]) break;

        const nextTargetId = nodes[currentTargetId].sockets?.next?.targetId;
        if (!nextTargetId) break;

        freePointers[ptr.id] = { ...ptr, targetId: nextTargetId };
        break;
      }

      case 'setValue': {
        const nodeId = varToNodeId[op.node];
        if (!nodeId || !nodes[nodeId]) break;
        nodes[nodeId] = { ...nodes[nodeId], data: String(op.value) };
        break;
      }

      case 'deleteNode': {
        const nodeId = varToNodeId[op.node];
        if (!nodeId) break;
        delete nodes[nodeId];
        delete varToNodeId[op.node];
        break;
      }

      default:
        break;
    }
  }

  return { nodes, freePointers, nullTokens };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a map of varName → nodeId from existing canvas nodes.
 * We infer var names by sorting existing nodes left-to-right (same algorithm as canvasToIR).
 */
function buildExistingVarMap(nodes) {
  const sorted = Object.values(nodes).sort((a, b) => {
    if (Math.abs(a.position.x - b.position.x) < 10) return a.position.y - b.position.y;
    return a.position.x - b.position.x;
  });
  const map = {};
  sorted.forEach((node, i) => {
    map[`n${i + 1}`] = node.id;
  });
  return map;
}

function resolveTargetId(target, varToNodeId, nullTokens) {
  if (!target || target === 'NULL') return null;
  return varToNodeId[target] || null;
}

function findExistingPointer(label, freePointers) {
  return Object.values(freePointers).find((p) => p.label === label) || null;
}

function findExistingPointerInBuilt(label, freePointers) {
  return Object.values(freePointers).find((p) => p.label === label) || null;
}
