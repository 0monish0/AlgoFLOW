export const navigationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      { slug: 'intro-to-adts', title: 'Introduction to ADTs' },
      { slug: 'how-to-use', title: 'How to Use This Reference' },
      { slug: 'big-o-primer', title: 'Complexity Notation — A Big-O Primer' },
    ],
  },
  {
    id: 'adt-list',
    title: 'Abstract Data Type: List',
    items: [
      { slug: 'adt-list-contract', title: 'ADT List — Definition & Contract' },
      { slug: 'array-list-impl', title: 'Array-Based List Implementation' },
      { slug: 'array-list-operations', title: 'Operations (Insert, Delete, Access, Search)' },
      { slug: 'complexity-array-list', title: 'Complexity Analysis — Array List' },
    ],
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    items: [
      { slug: 'linked-list-overview', title: 'Linked List — Overview' },
      {
        id: 'singly-linked-list-group',
        title: 'Singly Linked List',
        isSubGroup: true,
        children: [
          { slug: 'singly-linked-list-structure', title: 'Structure & Node Definition' },
          { slug: 'singly-linked-list-insertion', title: 'Insertion (head / tail / at index)' },
          { slug: 'singly-linked-list-deletion', title: 'Deletion (head / tail / at index)' },
          { slug: 'singly-linked-list-traversal', title: 'Traversal' },
          { slug: 'singly-linked-list-search', title: 'Search' },
          { slug: 'singly-linked-list-reverse', title: 'Reverse (Iterative & Recursive)' },
        ],
      },
      {
        id: 'doubly-linked-list-group',
        title: 'Doubly Linked List',
        isSubGroup: true,
        children: [
          { slug: 'doubly-linked-list-structure', title: 'Structure & Node Definition' },
          { slug: 'doubly-linked-list-insertion', title: 'Insertion' },
          { slug: 'doubly-linked-list-deletion', title: 'Deletion' },
          { slug: 'doubly-linked-list-traversal', title: 'Traversal (Forward & Backward)' },
        ],
      },
      {
        id: 'circular-linked-list-group',
        title: 'Circular Linked List',
        isSubGroup: true,
        children: [
          { slug: 'circular-linked-list', title: 'Singly & Doubly Circular Lists' },
        ],
      },
      { slug: 'comparison-linked-vs-array', title: 'Linked List vs. Array List — Comparison' },
      { slug: 'complexity-linked-list', title: 'Complexity Analysis — Linked List' },
      { slug: 'applications-use-cases', title: 'Applications & Use Cases' },
    ],
  },
];
