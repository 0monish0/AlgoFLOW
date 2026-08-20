export const referenceTopics = {
  'complexity-cheat-sheet': {
    slug: 'complexity-cheat-sheet',
    title: 'Complexity Cheat Sheet — All Structures & Operations',
    category: 'Reference',
    summary: 'A unified lookup matrix of time and space complexities across Array Lists, Singly Linked Lists, Doubly Linked Lists, and Circular Lists.',
    lead: 'Quick-reference master comparison table for algorithm selection and systems design trade-off evaluation.',
    sections: [
      {
        id: 'master-cheat-sheet-table',
        title: 'Master Asymptotic Matrix',
        content: `| Data Structure | Access ($i$-th) | Insert (Head) | Insert (Tail) | Insert ($k$-th) | Delete (Head) | Delete (Tail) | Delete ($k$-th) | Search | Space Overhead |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Array List** | $\\mathbf{O(1)}$ | $O(n)$ | $\\mathbf{O(1)}^*$ | $O(n)$ | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $0\\% - 50\\%$ spare capacity |
| **Singly Linked** | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $O(n)$ | 1 ptr / node (8B) |
| **Singly w/ Tail** | $O(n)$ | $\\mathbf{O(1)}$ | $\\mathbf{O(1)}$ | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $O(n)$ | 1 ptr / node (8B) |
| **Doubly Linked** | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $O(n)$ | 2 ptrs / node (16B) |
| **Doubly w/ Tail** | $O(n)$ | $\\mathbf{O(1)}$ | $\\mathbf{O(1)}$ | $O(n)$ | $\\mathbf{O(1)}$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | 2 ptrs / node (16B) |
| **Circular List** | $O(n)$ | $\\mathbf{O(1)}$ | $\\mathbf{O(1)}$ | $O(n)$ | $\\mathbf{O(1)}$ | $O(n)$ | $O(n)$ | $O(n)$ | 1-2 ptrs / node |

\\* Amortized time complexity.`
      }
    ],
    code: {
      c: `/* Master Complexity Overview */`,
      cpp: `// Master Complexity Overview`,
      python: `"""Master Complexity Overview"""`,
      java: `/** Master Complexity Overview */`
    },
    complexity: [
      { operation: 'Array List Random Access', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Linked List Head Mutation', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    ],
    relatedSlugs: ['comparison-linked-vs-array', 'complexity-array-list', 'complexity-linked-list', 'glossary']
  },

  'glossary': {
    slug: 'glossary',
    title: 'Glossary of Terms',
    category: 'Reference',
    summary: 'Authoritative computer science and systems definitions for memory structures, algorithmic notation, and list terminology.',
    lead: 'Precise definitions for core concepts referenced throughout the ADT List and Linked List documentation.',
    sections: [
      {
        id: 'alphabetical-glossary',
        title: 'Core Terms & Definitions',
        content: `### Abstract Data Type (ADT)
A mathematical model for data types where the type is defined exclusively by its behavioral specification and operations, rather than by its memory layout or representation.

### Amortized Analysis
A method of analyzing algorithms that guarantees the average performance of each operation over a worst-case sequence of operations (e.g. geometric dynamic array expansions).

### Cache Line
The unit of data transfer between the CPU cache and main memory (typically 64 bytes on modern x86/ARM CPUs). Contiguous array layouts maximize cache line utilization.

### Doubly Linked List
A linked list in which each node holds two pointer fields: one linking to its successor (\`next\`) and one to its predecessor (\`prev\`).

### Head
The pointer or reference to the first node in a linked list. If the list is empty, \`head == NULL\`.

### Invariant
A logical condition or assertion that remains true throughout the lifetime of a data structure or loop execution (e.g. \`size >= 0\`).

### Node
The fundamental atomic building block of linked data structures, containing an element value (payload) and one or more reference pointers.

### Pointer Chasing
The performance penalty incurred when traversing scattered, non-contiguous heap pointers where each memory dereference depends on the previous address, preventing CPU instruction-level parallelism.

### RAII (Resource Acquisition Is Initialization)
A C++ programming idiom where resource lifecycle (such as heap allocations) is bound to object lifetime via constructors and destructors.

### Sentinel Node (Dummy Node)
An empty dummy node inserted at the boundary of a linked list to eliminate special conditional edge-case handling for empty lists, head insertions, or tail deletions.

### Tail
The pointer or reference to the terminal node in a linked list whose \`next\` pointer is \`NULL\` (or points to head in a circular list).`
      }
    ],
    code: {
      c: `/* Glossary reference */`,
      cpp: `// Glossary reference`,
      python: `"""Glossary reference"""`,
      java: `/** Glossary reference */`
    },
    complexity: [],
    relatedSlugs: ['intro-to-adts', 'complexity-cheat-sheet', 'linked-list-overview']
  }
};
