/**
 * @fileoverview Pure Binary Tree & BST data structure engine.
 * Includes tidy tree layout, 3-case BST deletion, traversals, and metrics.
 */

import { ERROR_CODES, STEP_TYPES, BIG_O } from '../types.js';
import { createError } from '../errors.js';
import { allocTreeNode } from '../heap.js';

export function createTreeStructure(id, name, {
  treeMode = 'bst', // 'bst' | 'generic'
  allowDuplicates = false,
  root = null,
} = {}) {
  return {
    id,
    type: 'tree',
    name,
    treeMode,
    allowDuplicates,
    root,
    size: 0,
    selectedNodeId: null,
  };
}

export function treeInsertBST(struct, heap, value) {
  const steps = [];

  if (!struct.root) {
    const rootId = allocTreeNode(heap, value);
    steps.push({
      type: STEP_TYPES.CREATE,
      target: rootId,
      description: `Created root node with value ${value}`,
    });
    const nextStruct = { ...struct, root: rootId, size: 1 };
    computeTidyTreeLayout(nextStruct, heap);
    return { nextStruct, steps, result: rootId, complexity: BIG_O.O_1 };
  }

  let currId = struct.root;
  let parentId = null;
  let isLeftChild = false;

  while (currId && heap[currId]) {
    const currNode = heap[currId];
    parentId = currId;

    steps.push({
      type: STEP_TYPES.COMPARE,
      target: currId,
      description: `Comparing insert value ${value} with node ${currNode.value}`,
    });

    if (value === currNode.value && !struct.allowDuplicates) {
      return {
        error: createError(ERROR_CODES.DUPLICATE_KEY, `Duplicate key: ${value} already exists in BST`),
        complexity: BIG_O.O_LOG_N,
      };
    }

    if (value < currNode.value) {
      steps.push({ type: STEP_TYPES.VISIT, target: currId, description: `${value} < ${currNode.value}: navigating LEFT` });
      currId = currNode.left;
      isLeftChild = true;
    } else {
      steps.push({ type: STEP_TYPES.VISIT, target: currId, description: `${value} >= ${currNode.value}: navigating RIGHT` });
      currId = currNode.right;
      isLeftChild = false;
    }
  }

  const newNodeId = allocTreeNode(heap, value);
  steps.push({
    type: STEP_TYPES.CREATE,
    target: newNodeId,
    description: `Allocated new leaf node [${value}]`,
  });

  if (isLeftChild) {
    heap[parentId].left = newNodeId;
    steps.push({ type: STEP_TYPES.LINK, target: `${parentId}.left`, description: `Attached as left child of [${heap[parentId].value}]` });
  } else {
    heap[parentId].right = newNodeId;
    steps.push({ type: STEP_TYPES.LINK, target: `${parentId}.right`, description: `Attached as right child of [${heap[parentId].value}]` });
  }

  const nextStruct = { ...struct, size: struct.size + 1 };
  computeTidyTreeLayout(nextStruct, heap);

  return { nextStruct, steps, result: newNodeId, complexity: BIG_O.O_LOG_N };
}

export function treeSearchBST(struct, heap, value) {
  const steps = [];
  let currId = struct.root;
  let found = false;

  while (currId && heap[currId]) {
    const node = heap[currId];
    steps.push({
      type: STEP_TYPES.COMPARE,
      target: currId,
      description: `Comparing target ${value} with node [${node.value}]`,
    });

    if (node.value === value) {
      found = true;
      steps.push({ type: STEP_TYPES.HIGHLIGHT, target: currId, description: `Match found at node [${node.value}]!` });
      break;
    }

    if (value < node.value) {
      currId = node.left;
    } else {
      currId = node.right;
    }
  }

  return {
    steps,
    result: found ? currId : null,
    complexity: BIG_O.O_LOG_N,
  };
}

export function treeDeleteBST(struct, heap, value) {
  const steps = [];

  function deleteRec(nodeId, val) {
    if (!nodeId || !heap[nodeId]) {
      return null;
    }

    const node = heap[nodeId];
    steps.push({ type: STEP_TYPES.COMPARE, target: nodeId, description: `Looking for [${val}] to delete, at node [${node.value}]` });

    if (val < node.value) {
      node.left = deleteRec(node.left, val);
      return nodeId;
    } else if (val > node.value) {
      node.right = deleteRec(node.right, val);
      return nodeId;
    } else {
      // Node found! Handle 3 cases
      // Case 1: Leaf node (no children)
      if (!node.left && !node.right) {
        steps.push({ type: STEP_TYPES.DESTROY, target: nodeId, description: `Case 1 (Leaf): Deleted node [${node.value}] directly` });
        delete heap[nodeId];
        return null;
      }

      // Case 2: One child
      if (!node.left) {
        steps.push({ type: STEP_TYPES.MOVE, target: node.right, description: `Case 2 (Single Right Child): Promoted child [${heap[node.right].value}]` });
        const rightChild = node.right;
        delete heap[nodeId];
        return rightChild;
      } else if (!node.right) {
        steps.push({ type: STEP_TYPES.MOVE, target: node.left, description: `Case 2 (Single Left Child): Promoted child [${heap[node.left].value}]` });
        const leftChild = node.left;
        delete heap[nodeId];
        return leftChild;
      }

      // Case 3: Two children (Find Inorder Successor in right subtree)
      steps.push({
        type: STEP_TYPES.VISIT,
        target: node.right,
        description: `Case 3 (Two Children): Searching for Inorder Successor in right subtree...`,
      });

      let succId = node.right;
      while (heap[succId] && heap[succId].left) {
        succId = heap[succId].left;
      }

      const succVal = heap[succId].value;
      steps.push({
        type: STEP_TYPES.SWAP,
        target: `${nodeId},${succId}`,
        description: `Found Inorder Successor [${succVal}]. Copying value to [${node.value}] and recursively deleting successor.`,
      });

      node.value = succVal;
      node.right = deleteRec(node.right, succVal);
      return nodeId;
    }
  }

  const newRoot = deleteRec(struct.root, value);
  const nextStruct = {
    ...struct,
    root: newRoot,
    size: Math.max(0, struct.size - 1),
  };

  computeTidyTreeLayout(nextStruct, heap);
  return { nextStruct, steps, result: true, complexity: BIG_O.O_LOG_N };
}

// ── Traversals ──────────────────────────────────────────────────────────────

export function treeTraverse(struct, heap, order = 'inorder') {
  const result = [];
  const steps = [];

  function inorder(id) {
    if (!id || !heap[id]) return;
    inorder(heap[id].left);
    result.push(heap[id].value);
    steps.push({ type: STEP_TYPES.VISIT, target: id, description: `Visited [${heap[id].value}]` });
    inorder(heap[id].right);
  }

  function preorder(id) {
    if (!id || !heap[id]) return;
    result.push(heap[id].value);
    steps.push({ type: STEP_TYPES.VISIT, target: id, description: `Visited [${heap[id].value}]` });
    preorder(heap[id].left);
    preorder(heap[id].right);
  }

  function postorder(id) {
    if (!id || !heap[id]) return;
    postorder(heap[id].left);
    postorder(heap[id].right);
    result.push(heap[id].value);
    steps.push({ type: STEP_TYPES.VISIT, target: id, description: `Visited [${heap[id].value}]` });
  }

  function levelorder(rootId) {
    if (!rootId || !heap[rootId]) return;
    const q = [rootId];
    while (q.length > 0) {
      const curr = q.shift();
      const node = heap[curr];
      result.push(node.value);
      steps.push({ type: STEP_TYPES.VISIT, target: curr, description: `Visited [${node.value}] via Level-Order` });
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
  }

  switch (order) {
    case 'inorder':
      inorder(struct.root);
      break;
    case 'preorder':
      preorder(struct.root);
      break;
    case 'postorder':
      postorder(struct.root);
      break;
    case 'levelorder':
      levelorder(struct.root);
      break;
    default:
      inorder(struct.root);
  }

  return { result, steps, complexity: BIG_O.O_N };
}

// ── Tree Metrics & Tidy Layout ──────────────────────────────────────────────

export function getTreeMetrics(struct, heap) {
  if (!struct.root || !heap[struct.root]) {
    return { height: 0, nodeCount: 0, leafCount: 0, isBST: true, isBalanced: true };
  }

  let nodeCount = 0;
  let leafCount = 0;
  let isBalanced = true;

  function getHeight(id) {
    if (!id || !heap[id]) return 0;
    nodeCount++;
    const node = heap[id];
    if (!node.left && !node.right) leafCount++;

    const leftH = getHeight(node.left);
    const rightH = getHeight(node.right);

    if (Math.abs(leftH - rightH) > 1) isBalanced = false;
    return 1 + Math.max(leftH, rightH);
  }

  const height = getHeight(struct.root);
  const { result: inOrderVals } = treeTraverse(struct, heap, 'inorder');
  let isBST = true;
  for (let i = 1; i < inOrderVals.length; i++) {
    if (inOrderVals[i] < inOrderVals[i - 1]) {
      isBST = false;
      break;
    }
  }

  return { height, nodeCount, leafCount, isBST, isBalanced };
}

/**
 * Computes aesthetic, tidy 2D coordinates for all tree nodes centered above children.
 */
export function computeTidyTreeLayout(struct, heap, startX = 0, startY = 40) {
  if (!struct.root || !heap[struct.root]) return;

  const LEVEL_HEIGHT = 70;
  const MIN_NODE_SEP = 46;
  let currentLeafX = startX;

  function assignX(nodeId, depth) {
    if (!nodeId || !heap[nodeId]) return;
    const node = heap[nodeId];

    if (!node.left && !node.right) {
      node.x = currentLeafX;
      node.y = startY + depth * LEVEL_HEIGHT;
      currentLeafX += MIN_NODE_SEP;
      return;
    }

    if (node.left) assignX(node.left, depth + 1);
    if (node.right) assignX(node.right, depth + 1);

    const leftX = node.left && heap[node.left] ? heap[node.left].x : null;
    const rightX = node.right && heap[node.right] ? heap[node.right].x : null;

    if (leftX !== null && rightX !== null) {
      node.x = (leftX + rightX) / 2;
    } else if (leftX !== null) {
      node.x = leftX + MIN_NODE_SEP / 2;
    } else if (rightX !== null) {
      node.x = rightX - MIN_NODE_SEP / 2;
    }

    node.y = startY + depth * LEVEL_HEIGHT;
  }

  assignX(struct.root, 0);
}
