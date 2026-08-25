/**
 * Guided Lesson catalog for the Unified Linked List Sandbox.
 * Evaluates live graph state starting from a blank canvas.
 */

export const linkedListLessons = [
  {
    id: 'sll-build-first-list',
    title: '1. Build Your First Linked List',
    summary: 'Start from scratch: create a node, create a head pointer, and connect them.',
    steps: [
      {
        instruction: 'Click "+ New Node" in the bottom palette to spawn your first node.',
        check: ({ nodes }) => Object.keys(nodes).length >= 1,
      },
      {
        instruction: 'Click "+ New Pointer" to spawn a free pointer on the canvas.',
        check: ({ freePointers }) => Object.keys(freePointers).length >= 1,
      },
      {
        instruction: 'Double-click the pointer label to rename it to "head".',
        check: ({ freePointers }) => Object.values(freePointers).some((p) => p.label.toLowerCase() === 'head'),
      },
      {
        instruction: 'Drag the arrowhead of your "head" pointer and connect it to your node.',
        check: ({ evaluation }) => evaluation.reachableNodeIds.size >= 1,
      },
      {
        instruction: 'Add a second node and drag the first node’s NEXT socket to point to it.',
        check: ({ evaluation }) => evaluation.reachableNodeIds.size >= 2,
      },
    ],
  },
  {
    id: 'sll-insert-middle',
    title: '2. Insert in the Middle',
    summary: 'Splice a new node into an existing chain without orphaning downstream memory.',
    steps: [
      {
        instruction: 'Click "+ New Node" to create a new node (notice it begins safely in the calm "unattached" state).',
        check: ({ nodes }) => Object.keys(nodes).length >= 3,
      },
      {
        instruction: 'First, connect the new node’s NEXT socket to the downstream successor node.',
        check: ({ nodes }) => {
          const all = Object.values(nodes);
          return all.some((n) => n.sockets?.next?.targetId);
        },
      },
      {
        instruction: 'Now rewire the predecessor node’s NEXT socket to point to your new node.',
        check: ({ evaluation }) => evaluation.reachableNodeIds.size >= 3 && evaluation.orphanedNodeIds.size === 0,
      },
    ],
  },
  {
    id: 'sll-delete-middle',
    title: '3. Delete a Middle Node (Garbage Collection)',
    summary: 'Bypass a node by re-pointing the predecessor, and observe it leak and disappear.',
    steps: [
      {
        instruction: 'Rewire the first node’s NEXT pointer to bypass the middle node and point directly to the third node.',
        check: ({ evaluation }) => evaluation.orphanedNodeIds.size >= 1 || evaluation.reachableNodeIds.size === 2,
      },
      {
        instruction: 'Watch the bypassed node enter the "unreachable (leaking)" state and get cleanly removed from memory!',
        check: ({ nodes, evaluation }) => Object.keys(nodes).length <= 2 && evaluation.orphanedNodeIds.size === 0,
      },
    ],
  },
  {
    id: 'dll-build-doubly',
    title: '4. Build a Doubly Linked Node',
    summary: 'Switch a node to Doubly linked to unlock two-way NEXT and PREV traversal.',
    steps: [
      {
        instruction: 'Change the dropdown on a node from "Singly" to "Doubly" (notice the PREV socket appears).',
        check: ({ nodes }) => Object.values(nodes).some((n) => n.nodeType === 'doubly'),
      },
      {
        instruction: 'Wire the PREV socket of the second node backward to point to the first node.',
        check: ({ nodes }) => {
          return Object.values(nodes).some((n) => n.nodeType === 'doubly' && n.sockets?.prev?.targetId);
        },
      },
      {
        instruction: 'Click on the node’s arrow to test the "Forward (next)" and "Prev" two-way traversal controls!',
        check: () => true,
      },
    ],
  },
];
