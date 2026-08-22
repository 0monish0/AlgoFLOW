export const linkedListTopics = {
  'why-a-linked-list': {
    slug: 'why-a-linked-list',
    title: 'Why a Linked List?',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The motivation for node-linked chains: pointer-based dynamic growth without contiguous reallocations.',
    lead: 'When operating in constrained memory or systems where prepending elements ($O(1)$) and pointer stability are paramount, Linked Lists eliminate the contiguous reallocation penalties of dynamic arrays.',
    sections: [
      {
        id: 'dynamic-non-contiguous-allocation',
        title: 'Dynamic Non-Contiguous Allocation',
        content: `Unlike arrays that demand a single contiguous slab of virtual address space, a Linked List allocates nodes independently on the Heap whenever elements are inserted.
- **Instant Growth**: Adding a node requires only allocating a single node structure and swinging a pointer.
- **Zero Shift Insertion at Head**: Prepending an element is strictly $O(1)$ (assign \`new_node->next = head; head = new_node\`).
- **Pointer Stability**: Existing node addresses remain valid indefinitely throughout insertions and deletions elsewhere in the chain.`
      }
    ],
    code: {
      c: `/* Linked List Head Insertion in C */
typedef struct Node {
    int data;
    struct Node* next;
} Node;

void push_front(Node** head_ref, int new_data) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    new_node->data = new_data;
    new_node->next = *head_ref; // O(1) pointer assignment
    *head_ref = new_node;
}`,
      cpp: `// C++ Head Insertion
void pushFront(Node*& head, int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;
}`,
      python: `# Python Head Prepend
def prepend(head: Node | None, val: int) -> Node:
    new_node = Node(val)
    new_node.next = head
    return new_node`,
      java: `public static Node prepend(Node head, int val) {
    Node newNode = new Node(val);
    newNode.next = head;
    return newNode;
}`
    }
  },

  'anatomy-of-a-node': {
    slug: 'anatomy-of-a-node',
    title: 'Anatomy of a Node',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'Payloads, pointers, self-referential structures, and memory footprint breakdown.',
    lead: 'A node is the atomic building block of a linked data structure. It encapsulates a data payload alongside one or more pointer references to adjacent nodes in memory.',
    sections: [
      {
        id: 'self-referential-structs',
        title: 'Self-Referential Structs & Memory Sizing',
        content: `In C/C++, a struct cannot contain an instance of itself (which would require infinite size), but it can contain a **pointer** to its own type:
\`\`\`c
struct Node {
    int data;          // 4 bytes payload
    // 4 bytes compiler padding
    struct Node* next; // 8 bytes pointer (64-bit architecture)
}; // Total: 16 bytes per node
\`\`\`
On a 64-bit machine, storing a 4-byte integer in a linked node consumes 16 bytes of RAM (a 300% pointer/padding overhead ratio).`
      }
    ],
    code: {
      c: `/* Node definition in C */
typedef struct Node {
    int val;
    struct Node* next;
} Node;`,
      cpp: `// Generic Node in C++
template <typename T>
struct Node {
    T val;
    Node<T>* next;
    Node(const T& v) : val(v), next(nullptr) {}
};`,
      python: `class Node:
    __slots__ = ['val', 'next']
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`,
      java: `public class Node<T> {
    public T val;
    public Node<T> next;
    public Node(T val) {
        this.val = val;
        this.next = null;
    }
}`
    }
  },

  'traversal': {
    slug: 'traversal',
    title: 'Traversal',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'Iterative vs recursive traversal patterns, pointer marching, and loop invariants.',
    lead: 'Traversal is the fundamental linear scan mechanism in linked lists. Because nodes are non-contiguous, random indexing is impossible: to reach index $k$, we must march sequentially from head through $k$ pointers.',
    sections: [
      {
        id: 'pointer-marching-mechanics',
        title: 'Pointer Marching Mechanics',
        content: `To traverse a linked list safely:
1. Initialize a traversing pointer \`curr = head\`.
2. Execute a \`while (curr != NULL)\` loop.
3. Access payload \`curr->data\`.
4. Advance via \`curr = curr->next\`.
5. When \`curr == NULL\`, traversal has reached the end-of-list sentinel.`
      }
    ],
    code: {
      c: `/* Safe Traversal in C */
void traverse_print(const Node* head) {
    const Node* curr = head;
    while (curr != NULL) {
        printf("[%d] -> ", curr->val);
        curr = curr->next;
    }
    printf("NULL\n");
}`,
      cpp: `// C++ Traversal
void printList(const Node* head) {
    for (const Node* curr = head; curr != nullptr; curr = curr->next) {
        std::cout << curr->val << " -> ";
    }
    std::cout << "nullptr\n";
}`,
      python: `# Python Traversal Generator
def traverse(head: Node | None):
    curr = head
    while curr:
        yield curr.val
        curr = curr.next`,
      java: `public static void printList(Node head) {
    Node curr = head;
    while (curr != null) {
        System.out.print(curr.val + " -> ");
        curr = curr.next;
    }
    System.out.println("null");
}`
    }
  },

  'insertion-head-middle-tail': {
    slug: 'insertion-head-middle-tail',
    title: 'Insertion: Head, Middle, & Tail',
    folder: '03-linked-list',
    category: '03-linked-list',
    interactiveVisualizer: 'sll-insertion',
    summary: 'Step-by-step pointer reassignment mechanics for inserting at head, middle position, and tail.',
    lead: 'Inserting a node requires precise pointer sequencing: first link the new node forward to the successor, and only then link the predecessor to the new node to prevent orphan memory disconnections.',
    sections: [
      {
        id: 'insertion-at-head',
        title: '1. Insert at Head ($O(1)$)',
        content: `\`\`\`c
new_node->next = head;
head = new_node;
\`\`\``
      },
      {
        id: 'insertion-at-middle',
        title: '2. Insert After Given Node ($O(1)$ given pointer / $O(N)$ by index)',
        content: `\`\`\`c
// Invariant: Must connect new_node before severing prev->next!
new_node->next = prev->next;
prev->next = new_node;
\`\`\``
      }
    ],
    code: {
      c: `/* Insertion operations in C */
Node* insert_head(Node* head, int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    n->val = val;
    n->next = head;
    return n;
}

void insert_after(Node* prev_node, int val) {
    if (!prev_node) return;
    Node* n = (Node*)malloc(sizeof(Node));
    n->val = val;
    n->next = prev_node->next;
    prev_node->next = n;
}`,
      cpp: `// C++ Insertion
void insertAfter(Node* prev, int val) {
    if (!prev) return;
    Node* n = new Node(val);
    n->next = prev->next;
    prev->next = n;
}`,
      python: `def insert_after(prev: Node, val: int) -> None:
    if not prev:
        return
    n = Node(val, prev.next)
    prev.next = n`,
      java: `public static void insertAfter(Node prev, int val) {
    if (prev == null) return;
    Node n = new Node(val);
    n.next = prev.next;
    prev.next = n;
}`
    }
  },

  'deletion-why-you-need-previous': {
    slug: 'deletion-why-you-need-previous',
    title: 'Deletion: Why You Need Previous',
    folder: '03-linked-list',
    category: '03-linked-list',
    interactiveVisualizer: 'sll-deletion',
    summary: 'Understanding why singly linked deletion requires a reference to the predecessor node to bridge pointer gaps.',
    lead: 'In a Singly Linked List, links are unidirectional. To remove node $X$, its predecessor must redirect its \`next\` pointer directly to $X\\to\\text{next}$. Because $X$ cannot look backward, deletion requires tracking \`prev\`.',
    sections: [
      {
        id: 'deletion-mechanics',
        title: 'Deletion Mechanics and Freeing Memory',
        content: `1. Locate predecessor \`prev\` where \`prev->next == target\`.
2. Bridge the pointer: \`prev->next = target->next\`.
3. In C/C++, immediately call \`free(target)\` or \`delete target\` to prevent memory leaks.`
      }
    ],
    code: {
      c: `/* Deleting target node by value in C */
Node* delete_node(Node* head, int target_val) {
    if (!head) return NULL;
    if (head->val == target_val) {
        Node* new_head = head->next;
        free(head);
        return new_head;
    }
    
    Node* curr = head;
    while (curr->next && curr->next->val != target_val) {
        curr = curr->next;
    }
    
    if (curr->next) {
        Node* target = curr->next;
        curr->next = target->next;
        free(target);
    }
    return head;
}`,
      cpp: `// C++ Deletion
Node* deleteNode(Node* head, int targetVal) {
    if (!head) return nullptr;
    if (head->val == targetVal) {
        Node* next = head->next;
        delete head;
        return next;
    }
    Node* curr = head;
    while (curr->next && curr->next->val != targetVal) curr = curr->next;
    if (curr->next) {
        Node* target = curr->next;
        curr->next = target->next;
        delete target;
    }
    return head;
}`,
      python: `def delete_node(head: Node | None, target_val: int) -> Node | None:
    if not head: return None
    if head.val == target_val: return head.next
    curr = head
    while curr.next and curr.next.val != target_val:
        curr = curr.next
    if curr.next:
        curr.next = curr.next.next
    return head`,
      java: `public static Node deleteNode(Node head, int targetVal) {
    if (head == null) return null;
    if (head.val == targetVal) return head.next;
    Node curr = head;
    while (curr.next != null && curr.next.val != targetVal) {
        curr = curr.next;
    }
    if (curr.next != null) {
        curr.next = curr.next.next;
    }
    return head;
}`
    }
  },

  'types-doubly-and-circular': {
    slug: 'types-doubly-and-circular',
    title: 'Types: Doubly & Circular',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'Bidirectional links in Doubly Linked Lists and ring topology in Circular Linked Lists.',
    lead: 'By adding backward pointers (\`prev\`) or looping tail back to head, Doubly and Circular linked lists enable bidirectional traversal, $O(1)$ symmetric deletion, and cyclic ring buffers.',
    sections: [
      {
        id: 'doubly-linked-list-advantages',
        title: 'Doubly Linked List (DLL)',
        content: `Each node holds two pointers: \`next\` and \`prev\`.
- **Bidirectional Traversal**: Traverse forward from head or backward from tail.
- **Symmetric $O(1)$ Deletion**: Given a pointer to node $X$, delete it directly in $O(1)$ without scanning for predecessor:
\`\`\`c
X->prev->next = X->next;
X->next->prev = X->prev;
free(X);
\`\`\``
      },
      {
        id: 'circular-linked-list-advantages',
        title: 'Circular Linked List (CLL)',
        content: `In a circular list, the last node's \`next\` pointer points back to \`head\` (and \`head->prev\` points to \`tail\` in a circular DLL).
- Used in Round-Robin CPU schedulers, audio buffer looping, and turn-based games.`
      }
    ],
    code: {
      c: `/* Doubly Linked Node in C */
typedef struct DNode {
    int val;
    struct DNode* prev;
    struct DNode* next;
} DNode;`,
      cpp: `// Doubly Linked Node in C++
struct DNode {
    int val;
    DNode* prev;
    DNode* next;
    DNode(int v) : val(v), prev(nullptr), next(nullptr) {}
};`,
      python: `class DNode:
    def __init__(self, val=0):
        self.val = val
        self.prev = None
        self.next = None`,
      java: `public class DNode {
    public int val;
    public DNode prev;
    public DNode next;
    public DNode(int val) { this.val = val; }
}`
    }
  },

  'insertion-deletion-doubly-circular': {
    slug: 'insertion-deletion-doubly-circular',
    title: 'Insertion & Deletion (Doubly/Circular)',
    folder: '03-linked-list',
    category: '03-linked-list',
    interactiveVisualizer: 'dll-insertion',
    summary: 'Pointer wiring protocols for 4-pointer mutations in Doubly Linked Lists and ring preservation in Circular Lists.',
    lead: 'Manipulating Doubly Linked Lists requires updating 4 pointers per insertion and 2 pointers per deletion. Sentinel dummy head/tail nodes eliminate all null checks.',
    sections: [
      {
        id: 'the-sentinel-dummy-pattern',
        title: 'The Sentinel (Dummy Node) Pattern',
        content: `By introducing persistent \`dummy_head\` and \`dummy_tail\` nodes that never hold payload:
- Head insertion and middle insertion execute identical code.
- Deletions never require special-casing \`head == NULL\` or \`tail == NULL\`.
- All nodes always have valid, non-null \`prev\` and \`next\` neighbors.`
      }
    ],
    code: {
      c: `/* DLL Insertion using Sentinel nodes */
void dll_insert_before(DNode* target, int val) {
    DNode* n = (DNode*)malloc(sizeof(DNode));
    n->val = val;
    n->next = target;
    n->prev = target->prev;
    target->prev->next = n;
    target->prev = n;
}`,
      cpp: `// C++ DLL Splice
void insertBefore(DNode* target, int val) {
    DNode* n = new DNode(val);
    n->next = target;
    n->prev = target->prev;
    target->prev->next = n;
    target->prev = n;
}`,
      python: `def insert_before(target: DNode, val: int) -> DNode:
    n = DNode(val)
    n.next = target
    n.prev = target.prev
    target.prev.next = n
    target.prev = n
    return n`,
      java: `public static void insertBefore(DNode target, int val) {
    DNode n = new DNode(val);
    n.next = target;
    n.prev = target.prev;
    target.prev.next = n;
    target.prev = n;
}`
    }
  },

  'fast-and-slow-pointers-the-essence': {
    slug: 'fast-and-slow-pointers-the-essence',
    title: 'Fast & Slow Pointers: The Essence',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: "Floyd's Tortoise and Hare algorithm for cycle detection, middle node finding, and mathematical convergence proofs.",
    lead: 'By advancing two pointers at differing velocities (Slow: 1 step/iteration, Fast: 2 steps/iteration), we can find list midpoints in a single pass and detect cyclic loops in $O(N)$ time with $O(1)$ space.',
    sections: [
      {
        id: 'middle-of-list-in-one-pass',
        title: '1. Finding Middle in One Pass',
        content: `When \`fast\` moves twice as fast as \`slow\`:
- When \`fast\` reaches the end of an $N$-element list, \`slow\` has traveled exactly $N/2$ steps, pointing directly to the middle node!`
      },
      {
        id: 'cycle-detection-proof',
        title: "2. Floyd's Cycle Detection Proof",
        content: `If a cycle exists of length $C$:
- Once both enter the cycle, each step decreases the relative distance between Fast and Slow by 1 modulo $C$.
- Therefore, Fast is mathematically guaranteed to catch Slow in at most $C$ steps ($O(N)$ time).`
      }
    ],
    code: {
      c: `/* Fast & Slow Pointer Middle Finder in C */
Node* find_middle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;       /* 1 step */
        fast = fast->next->next; /* 2 steps */
    }
    return slow;
}`,
      cpp: `// C++ Floyd's Cycle Detection
bool hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      python: `def has_cycle(head: Node | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      java: `public static boolean hasCycle(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`
    }
  },

  'array-vs-linked-list-side-by-side': {
    slug: 'array-vs-linked-list-side-by-side',
    title: 'Array vs. Linked List: Side by Side',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'Comprehensive head-to-head complexity comparison across indexing, searching, boundary mutation, and memory footprints.',
    lead: 'A rigorous comparative analysis evaluating dynamic arrays and linked lists across time complexity, memory overhead, and hardware mechanical sympathy.',
    sections: [
      {
        id: 'side-by-side-comparison-matrix',
        title: 'Side-by-Side Comparison Matrix',
        content: `| Metric / Operation | Dynamic Array (\`ArrayList\`) | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **Index Access \`get(i)\`** | **$O(1)$** | $O(N)$ | $O(N)$ |
| **Search (Unsorted)** | $O(N)$ | $O(N)$ | $O(N)$ |
| **Insert at Head** | $O(N)$ (shift elements) | **$O(1)$** | **$O(1)$** |
| **Insert at Tail** | **Amortized $O(1)$** | **$O(1)$** (with tail ptr) | **$O(1)$** |
| **Insert at Index $k$** | $O(N)$ (shift elements) | $O(N)$ ($O(1)$ if at ptr) | $O(N)$ ($O(1)$ if at ptr) |
| **Delete at Head** | $O(N)$ (shift elements) | **$O(1)$** | **$O(1)$** |
| **Delete at Tail** | **$O(1)$** | $O(N)$ (need \`prev\`) | **$O(1)$** |
| **Memory Overhead** | Unused capacity buffer | $1 \\times 8$B pointer/node | $2 \\times 8$B pointers/node |
| **Cache Locality** | **Excellent (Contiguous)** | Poor (Heap hopping) | Poor (Heap hopping) |`
      }
    ],
    code: {
      c: `/* Array access vs Linked List access in C */
int array_access(const int* arr, int i) {
    return arr[i]; // 1 CPU instruction: base + i*4
}

int linked_access(const Node* head, int index) {
    const Node* curr = head;
    for (int i = 0; i < index && curr; ++i) curr = curr->next; // i memory dereferences
    return curr ? curr->val : -1;
}`,
      cpp: `// C++ Benchmark comparison
// std::vector random access vs std::list traversal`,
      python: `# Python list vs custom LinkedList access`,
      java: `// Java ArrayList vs LinkedList`
    }
  },

  'cache-locality-why-arrays-win-in-practice': {
    slug: 'cache-locality-why-arrays-win-in-practice',
    title: 'Cache Locality: Why Arrays Win in Practice',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'CPU cache lines (64 bytes), spatial locality, prefetching hardware, and why contiguous arrays outperform linked lists in real benchmarks.',
    lead: 'On paper, linked lists offer $O(1)$ insertions. In real hardware, arrays almost always outperform linked lists due to CPU cache line prefetching and spatial locality.',
    sections: [
      {
        id: 'the-64-byte-cache-line-rule',
        title: 'The 64-Byte Cache Line Rule',
        content: `When a CPU core fetches an integer from RAM, it does not fetch 4 bytes; it fetches an entire **64-byte Cache Line** into L1 cache:
- **Array Contiguity**: When you read \`arr[0]\`, the hardware prefetcher automatically loads \`arr[1]\` through \`arr[15]\` into L1 cache for free. Next 15 reads cost ~0.5 ns!
- **Linked List Pointer Chasing**: Node 1 is at \`0x1000\`, Node 2 is at \`0x9000\`. Every node dereference misses L1/L2 cache and stalls the CPU for ~50–100 ns waiting for RAM.`
      }
    ],
    code: {
      c: `/* Demonstrating Cache Line packing */
#include <stdio.h>

/* Flat array: 16 ints packed tightly in exactly ONE 64-byte cache line */
int cache_friendly_array[16];`,
      cpp: `// C++ Vector contiguous memory ensures maximum L1/L2 cache utilization`,
      python: `# Memory contiguous array via array module or numpy
import array
contig = array.array('i', [1, 2, 3, 4, 5])`,
      java: `// Primitive arrays (int[]) are contiguous; object arrays contain references`
    }
  },

  'same-structure-different-skin': {
    slug: 'same-structure-different-skin',
    title: 'Same Structure, Different Skin',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'How Stacks, Queues, Deques, and Graph Adjacency Lists are all implemented using linked list backbones.',
    lead: 'A Linked List is a chameleon structure. By constraining which endpoints allow insertions and removals, it transforms into a Stack (LIFO), a Queue (FIFO), or a Deque.',
    sections: [
      {
        id: 'derived-data-structures',
        title: 'Derived Linked Data Structures',
        content: `1. **Stack (LIFO)**: Restrict operations to \`push_front\` and \`pop_front\` ($O(1)$ operations at head).
2. **Queue (FIFO)**: Enqueue at tail, dequeue at head ($O(1)$ operations with head & tail pointers).
3. **Graph Adjacency List**: Array of linked lists representing directed/undirected edges.
4. **LRU Cache**: Doubly Linked List paired with a Hash Map for $O(1)$ eviction.`
      }
    ],
    code: {
      c: `/* Stack implemented using Linked List */
typedef struct Stack {
    Node* top;
} Stack;

void stack_push(Stack* s, int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    n->val = val;
    n->next = s->top;
    s->top = n;
}

int stack_pop(Stack* s) {
    if (!s->top) return -1;
    Node* temp = s->top;
    int val = temp->val;
    s->top = s->top->next;
    free(temp);
    return val;
}`,
      cpp: `// C++ Linked Stack
class LinkedStack {
    Node* top = nullptr;
public:
    void push(int v) { top = new Node(v, top); }
    int pop() {
        if (!top) throw std::runtime_error("Empty");
        int v = top->val;
        Node* t = top;
        top = top->next;
        delete t;
        return v;
    }
};`,
      python: `class LinkedStack:
    def __init__(self):
        self.top = None
    def push(self, val):
        self.top = Node(val, self.top)
    def pop(self):
        if not self.top: raise IndexError("Empty")
        val = self.top.val
        self.top = self.top.next
        return val`,
      java: `public class LinkedStack<T> {
    private Node<T> top;
    public void push(T val) {
        Node<T> n = new Node<>(val);
        n.next = top;
        top = n;
    }
}`
    }
  },

  'build-it-yourself-sandbox': {
    slug: 'build-it-yourself-sandbox',
    title: 'Build-It-Yourself Sandbox',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'Complete production-grade reference implementation of a generic linked list in all four languages with unit tests.',
    lead: 'A battle-tested, memory-safe, generic linked list implementation with constructors, insertion, deletion, searching, reversal, and memory deallocation in C, C++, Python, and Java.',
    sections: [
      {
        id: 'production-checklist',
        title: 'Production Implementation Checklist',
        content: `- [x] Handles empty list ($N=0$) safely
- [x] Handles single-element list ($N=1$) safely
- [x] No memory leaks on destruction (\`free()\` / RAII)
- [x] $O(1)$ head insertion and head deletion
- [x] Constant-time size reporting`
      }
    ],
    code: {
      c: `/* Complete Generic Linked List in C */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct {
    Node* head;
    size_t size;
} LinkedList;

LinkedList* list_create(void) {
    LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));
    list->head = NULL;
    list->size = 0;
    return list;
}

void list_destroy(LinkedList* list) {
    Node* curr = list->head;
    while (curr) {
        Node* next = curr->next;
        free(curr);
        curr = next;
    }
    free(list);
}`,
      cpp: `// Complete Templated Linked List in C++
#include <iostream>
#include <stdexcept>

template <typename T>
class LinkedList {
    struct Node {
        T data;
        Node* next;
        Node(T val, Node* n = nullptr) : data(val), next(n) {}
    };
    Node* head = nullptr;
    size_t size_ = 0;
public:
    ~LinkedList() { clear(); }
    void clear() {
        while (head) {
            Node* next = head->next;
            delete head;
            head = next;
        }
        size_ = 0;
    }
    void pushFront(T val) {
        head = new Node(val, head);
        size_++;
    }
    size_t size() const { return size_; }
};`,
      python: `# Complete Generic Linked List in Python
class LinkedList:
    class _Node:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next

    def __init__(self):
        self._head = None
        self._size = 0

    def push_front(self, val):
        self._head = self._Node(val, self._head)
        self._size += 1

    def __len__(self):
        return self._size`,
      java: `public class LinkedList<E> {
    private static class Node<E> {
        E data;
        Node<E> next;
        Node(E data, Node<E> next) { this.data = data; this.next = next; }
    }
    private Node<E> head;
    private int size = 0;

    public void pushFront(E data) {
        head = new Node<>(data, head);
        size++;
    }
    public int size() { return size; }
}`
    }
  },

  'how-to-approach-any-problem': {
    slug: 'how-to-approach-any-problem',
    title: 'How to Approach Any Problem',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The 5-step blueprint for solving any linked list problem with zero pointer bugs.',
    lead: 'Follow this systematic engineering blueprint to analyze, model, and implement linked list algorithms without off-by-one errors or segmentation faults.',
    sections: [
      {
        id: 'the-5-step-blueprint',
        title: 'The 5-Step Linked List Blueprint',
        content: `1. **Draw the State Machine**: Draw 3 nodes on paper. Label \`prev\`, \`curr\`, and \`next\`.
2. **Use a Dummy Sentinel Node**: Simplify head mutations by creating \`dummy = Node(0, head)\`.
3. **Capture Before Severing**: Always record \`next = curr->next\` BEFORE updating \`curr->next\`.
4. **Formulate Invariants**: What must hold true after each loop iteration?
5. **Check 4 Critical Edge Cases**:
   - Empty list (\`head == NULL\`)
   - Single node (\`head->next == NULL\`)
   - Two nodes
   - Cyclic list / disconnected subgraphs`
      }
    ],
    code: {
      c: `/* Dummy Sentinel Pattern Template in C */
Node* modify_list_pattern(Node* head) {
    Node dummy;
    dummy.next = head;
    Node* prev = &dummy;
    
    /* Safely operate on prev->next without head edge cases */
    
    return dummy.next;
}`,
      cpp: `// Dummy Sentinel Pattern Template in C++
Node* patternDemo(Node* head) {
    Node dummy(0);
    dummy.next = head;
    Node* prev = &dummy;
    // Process chain
    return dummy.next;
}`,
      python: `def pattern_demo(head: Node | None) -> Node | None:
    dummy = Node(0, head)
    prev = dummy
    # Process chain
    return dummy.next`,
      java: `public static Node patternDemo(Node head) {
    Node dummy = new Node(0);
    dummy.next = head;
    Node prev = dummy;
    // Process chain
    return dummy.next;
}`
    }
  },

  // Problems Section
  'reversing-a-linked-list': {
    slug: 'reversing-a-linked-list',
    title: 'Reversing a Linked List',
    folder: 'problems',
    category: 'problems',
    interactiveVisualizer: 'sll-reverse',
    summary: 'Classic 3-pointer iterative reversal and recursive call-stack unwinding reversal.',
    lead: 'Reversing a singly linked list in-place ($O(N)$ time, $O(1)$ space) is the benchmark test of pointer mechanics and loop invariants.',
    sections: [
      {
        id: '3-pointer-iterative-invariants',
        title: 'Iterative Invariant Breakdown',
        content: `At the start of each iteration:
- \`prev\` is the head of the already reversed prefix.
- \`curr\` is the head of the remaining unreversed suffix.
- In each step:
\`\`\`c
Node* next = curr->next; // 1. Save forward address
curr->next = prev;       // 2. Reverse link
prev = curr;             // 3. Step prev forward
curr = next;             // 4. Step curr forward
\`\`\``
      }
    ],
    code: {
      c: `/* In-place List Reversal in C */
Node* reverse_list(Node* head) {
    Node* prev = NULL;
    Node* curr = head;
    while (curr) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      cpp: `// C++ Iterative Reversal
Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      python: `def reverse_list(head: Node | None) -> Node | None:
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      java: `public static Node reverseList(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }`
    }
  },

  'merging-two-sorted-lists': {
    slug: 'merging-two-sorted-lists',
    title: 'Merging Two Sorted Lists',
    folder: 'problems',
    category: 'problems',
    summary: 'Two-pointer zipper merge in $O(N+M)$ time with $O(1)$ auxiliary space.',
    lead: 'Merging two pre-sorted linked lists into a single sorted list by splicing existing nodes without allocating new heap memory.',
    sections: [
      {
        id: 'zipper-merge-algorithm',
        title: 'The Zipper Merge Algorithm',
        content: `1. Initialize a \`dummy\` sentinel node and a \`tail\` pointer pointing to it.
2. Compare \`l1->val\` and \`l2->val\`.
3. Attach the smaller node to \`tail->next\` and advance that list.
4. Advance \`tail = tail->next\`.
5. When one list is exhausted, attach the remaining chain directly in $O(1)$ (\`tail->next = l1 ? l1 : l2\`).`
      }
    ],
    code: {
      c: `/* Merge Two Sorted Lists in C */
Node* merge_two_lists(Node* l1, Node* l2) {
    Node dummy;
    Node* tail = &dummy;
    dummy.next = NULL;
    
    while (l1 && l2) {
        if (l1->val <= l2->val) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    return dummy.next;
}`,
      cpp: `// C++ Zipper Merge
Node* mergeTwoLists(Node* l1, Node* l2) {
    Node dummy(0);
    Node* tail = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    return dummy.next;
}`,
      python: `def merge_two_lists(l1: Node | None, l2: Node | None) -> Node | None:
    dummy = Node(0)
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
      java: `public static Node mergeTwoLists(Node l1, Node l2) {
    Node dummy = new Node(0);
    Node tail = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }
    tail.next = (l1 != null) ? l1 : l2;
    return dummy.next;
}`
    }
  },

  'sorting-a-linked-list': {
    slug: 'sorting-a-linked-list',
    title: 'Sorting a Linked List',
    folder: 'problems',
    category: 'problems',
    summary: 'Optimal $O(N \\log N)$ MergeSort on linked lists with $O(1)$ auxiliary memory (subdividing via fast/slow pointers).',
    lead: 'While QuickSort struggles on linked lists due to non-contiguous partition swapping, MergeSort is the optimal $O(N \\log N)$ sorting algorithm for linked lists because halving and merging require zero element copies.',
    sections: [
      {
        id: 'mergesort-on-linked-lists',
        title: 'MergeSort Algorithm on Linked Lists',
        content: `1. **Base Case**: If \`!head || !head->next\`, return \`head\`.
2. **Split (Halve)**: Use Fast & Slow pointers to locate midpoint, sever \`prev_mid->next = NULL\` to split list into two independent halves.
3. **Recurse**: Sort left half and right half recursively.
4. **Merge**: Zip merge both sorted halves in $O(N)$ time with $O(1)$ extra space.`
      }
    ],
    code: {
      c: `/* MergeSort on Singly Linked List in C */
Node* sort_list(Node* head) {
    if (!head || !head->next) return head;
    
    /* Fast/slow pointers to find mid */
    Node* slow = head;
    Node* fast = head;
    Node* prev = NULL;
    while (fast && fast->next) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }
    prev->next = NULL; /* Sever left half from right half */
    
    Node* left = sort_list(head);
    Node* right = sort_list(slow);
    return merge_two_lists(left, right);
}`,
      cpp: `// C++ MergeSort
Node* sortList(Node* head) {
    if (!head || !head->next) return head;
    Node* slow = head;
    Node* fast = head;
    Node* prev = nullptr;
    while (fast && fast->next) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }
    prev->next = nullptr;
    return mergeTwoLists(sortList(head), sortList(slow));
}`,
      python: `def sort_list(head: Node | None) -> Node | None:
    if not head or not head.next: return head
    slow, fast, prev = head, head, None
    while fast and fast.next:
        prev = slow
        slow = slow.next
        fast = fast.next.next
    prev.next = None
    return merge_two_lists(sort_list(head), sort_list(slow))`,
      java: `public static Node sortList(Node head) {
    if (head == null || head.next == null) return head;
    Node slow = head, fast = head, prev = null;
    while (fast != null && fast.next != null) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
    }
    prev.next = null;
    return mergeTwoLists(sortList(head), sortList(slow));
}`
    }
  },

  'finding-the-middle-in-one-pass': {
    slug: 'finding-the-middle-in-one-pass',
    title: 'Finding the Middle in One Pass',
    folder: 'problems',
    category: 'problems',
    summary: 'Using 2-speed pointer advancement to locate the median node in a single traversal.',
    lead: 'Find the middle element of a linked list without counting length first or allocating auxiliary arrays.',
    sections: [
      {
        id: 'middle-one-pass-explanation',
        title: 'Single-Pass Mechanics',
        content: `By stepping \`slow\` by 1 node and \`fast\` by 2 nodes:
- For odd length $N=5$: \`fast\` lands on node 5, \`slow\` lands on node 3 (exact middle).
- For even length $N=4$: \`fast\` lands on \`NULL\`, \`slow\` lands on node 3 (second middle).`
      }
    ],
    code: {
      c: `/* Middle in one pass in C */
Node* middle_node(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
      cpp: `Node* middleNode(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
      python: `def middle_node(head: Node | None) -> Node | None:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
      java: `public static Node middleNode(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`
    }
  },

  'detecting-removing-cycles': {
    slug: 'detecting-removing-cycles',
    title: 'Detecting & Removing Cycles',
    folder: 'problems',
    category: 'problems',
    summary: 'Mathematical entry-point detection and cycle unlinking using Floyd’s algorithm.',
    lead: 'Detect if a cycle exists, locate the exact starting node of the loop, and sever the cycle to restore a valid linear linked list.',
    sections: [
      {
        id: 'cycle-entry-point-mathematics',
        title: 'Finding the Cycle Entry Point',
        content: `Let distance from \`head\` to cycle start be $L$, and meeting point inside cycle be $k$ steps from entry:
- Fast travels $2 \\times \\text{Slow}$.
- It mathematically follows that resetting one pointer to \`head\` and advancing both pointers 1 step at a time will cause them to collide **precisely at the cycle entry node**!`
      }
    ],
    code: {
      c: `/* Detect and remove cycle in C */
void detect_and_remove_cycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) break;
    }
    
    if (!fast || !fast->next) return; // No cycle
    
    /* Find cycle entry */
    slow = head;
    if (slow == fast) {
        while (fast->next != slow) fast = fast->next;
    } else {
        while (slow->next != fast->next) {
            slow = slow->next;
            fast = fast->next;
        }
    }
    fast->next = NULL; /* Break cycle */
}`,
      cpp: `// C++ Cycle Entry and Removal
void removeCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) break;
    }
    if (!fast || !fast->next) return;
    slow = head;
    if (slow == fast) {
        while (fast->next != slow) fast = fast->next;
    } else {
        while (slow->next != fast->next) {
            slow = slow->next;
            fast = fast->next;
        }
    }
    fast->next = nullptr;
}`,
      python: `def remove_cycle(head: Node | None) -> None:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast: break
    if not fast or not fast.next: return
    slow = head
    if slow == fast:
        while fast.next != slow: fast = fast.next
    else:
        while slow.next != fast.next:
            slow = slow.next
            fast = fast.next
    fast.next = None`,
      java: `public static void removeCycle(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) break;
    }
    if (fast == null || fast.next == null) return;
    slow = head;
    if (slow == fast) {
        while (fast.next != slow) fast = fast.next;
    } else {
        while (slow.next != fast.next) {
            slow = slow.next;
            fast = fast.next;
        }
    }
    fast.next = null;
}`
    }
  }
};
