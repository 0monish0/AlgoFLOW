export const gettingStartedTopics = {
  'stack-heap-and-where-data-lives': {
    slug: 'stack-heap-and-where-data-lives',
    title: 'Stack, Heap, and Where Data Lives',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'The physical division of program memory: automatic call stack frames vs dynamically allocated heap regions.',
    lead: 'Every variable, node, and pointer in your program resides in memory. Understanding the runtime difference between the Call Stack and the Heap is the foundation of data structure implementation, lifetime management, and cache performance.',
    sections: [
      {
        id: 'the-stack-automatic-deterministic',
        title: 'The Stack: Automatic, Fast, and Contiguous',
        content: `The **Stack** is an architectural memory region managed directly by the CPU via the Stack Pointer register (\`SP\`).
- **Allocation Mechanism**: Pushing a stack frame is a single subtract/add instruction on \`SP\`.
- **Lifetime**: Strictly bounded by scope. When a function returns, its entire frame is popped instantly.
- **Locality**: Extremely high L1/L2 cache hit rate due to tight sequential memory reuse.
- **Constraints**: Fixed size (typically 1MB to 8MB). Exceeding this limit causes a catastrophic \`StackOverflowException\`.`
      },
      {
        id: 'the-heap-dynamic-flexible-fragmented',
        title: 'The Heap: Dynamic, Persistent, and Fragmented',
        content: `The **Heap** is a large, unorganized pool of memory used for objects whose size or lifetime cannot be determined at compile time.
- **Allocation Mechanism**: Dynamic allocator (\`malloc\`, \`new\`, GC runtime) scans free-lists or bins to find contiguous bytes.
- **Lifetime**: Controlled manually (\`free\`, \`delete\`) or by a Garbage Collector tracing reachable roots.
- **Locality**: Poor compared to the stack. Nodes allocated separately in time end up scattered across physical RAM, causing CPU cache misses (cache line thrashing).
- **Cost**: Dynamic allocation involves system calls, lock contention, and metadata tracking overhead.`
      },
      {
        id: 'stack-vs-heap-comparison',
        title: 'Stack vs Heap Architectural Comparison',
        content: `| Property | Call Stack | Dynamic Heap |
| :--- | :--- | :--- |
| **Allocation Speed** | ~1 CPU cycle (adjust pointer) | 20–200+ CPU cycles (allocator lookup) |
| **Access Latency** | Near zero (hot in L1 cache) | Variable (potential RAM latency) |
| **Size Limit** | Small (1–8 MB typical) | Large (bounded only by virtual RAM) |
| **Lifetime** | Scope-bound (automatic unwind) | Manual or GC-driven |
| **Fragmentation** | Impossible (strictly contiguous LIFO) | High (heap holes over runtime) |`
      }
    ],
    code: {
      c: `/* Stack vs Heap memory allocation in C */
#include <stdlib.h>

void memory_demo(void) {
    /* Stack allocation: local variable, destroyed automatically at function exit */
    int stack_val = 42;
    int stack_array[100]; // 400 bytes on stack frame

    /* Heap allocation: persists beyond this function until free() is explicitly invoked */
    int* heap_val = (int*)malloc(sizeof(int));
    *heap_val = 99;

    int* heap_array = (int*)malloc(1000 * sizeof(int)); // 4000 bytes on heap

    /* Clean up heap allocations to prevent memory leaks */
    free(heap_val);
    free(heap_array);
}`,
      cpp: `// Stack vs Heap in C++ with RAII
#include <iostream>
#include <memory>
#include <vector>

void cpp_memory_demo() {
    // Stack allocation
    int stack_val = 42;

    // Heap allocation via smart pointer (automatic cleanup)
    auto heap_node = std::make_unique<int>(99);

    // Vector header lives on stack; underlying buffer lives on heap
    std::vector<int> dynamic_buffer = {1, 2, 3, 4, 5};
}`,
      python: `# In Python, all user-defined objects live on the Heap.
# Local variable references/names exist in the local frame (Stack).
def python_memory():
    x = 42                 # 'x' reference in frame, int object on heap / intern pool
    nodes = [1, 2, 3, 4]   # list object on heap
    # GC collects objects when reference count reaches 0`,
      java: `// Java: primitives on stack (if local); all objects/arrays on Heap
public class MemoryModel {
    public void demo() {
        int stackPrimitive = 42; // on Thread Stack
        int[] heapArray = new int[100]; // array header & elements on Heap
        String heapObj = new String("AlgoFlow"); // Heap object
    }
}`
    }
  },

  'manual-vs-managed-memory': {
    slug: 'manual-vs-managed-memory',
    title: 'Manual vs. Managed Memory',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'Direct pointer ownership in C/C++ versus automated Garbage Collection (GC) in Java/Python/Go.',
    lead: 'How memory is released when data structures change shapes defines software reliability. We contrast deterministic explicit deallocation with non-deterministic runtime garbage collection.',
    sections: [
      {
        id: 'manual-memory-management',
        title: 'Manual Memory (C / C++ / Rust)',
        content: `In systems languages, the programmer holds absolute control and responsibility over memory lifecycle:
- **Pros**: Zero GC pause jitter, deterministic destructors (RAII), lowest memory overhead.
- **Cons & Hazards**:
  - **Memory Leaks**: Losing the last pointer to allocated heap memory.
  - **Dangling Pointers / Use-After-Free**: Reading or writing to an address after calling \`free()\`.
  - **Double Free**: Calling \`free()\` twice on the same pointer, corrupting the heap allocator's internal metadata.`
      },
      {
        id: 'managed-memory-management',
        title: 'Managed Memory & Garbage Collection (Java / Python / Go)',
        content: `Managed runtimes track object references continuously using tracing algorithms (e.g., Mark-and-Sweep, Generational GC, Reference Counting).
- **Pros**: Eliminates use-after-free and double-free vulnerabilities; simplifies complex graph deletion.
- **Cons**:
  - **Stop-The-World (STW) Pauses**: Real-time jitter during major GC cycles.
  - **Memory Footprint Multiplier**: GC heaps typically require 2x to 3x active payload size to avoid frequent collection cycles.
  - **Cache Overhead**: Pointer-heavy structures keep GC scanners busy traversing heap graphs.`
      }
    ],
    code: {
      c: `/* Manual Node Allocation and Deallocation in C */
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

Node* create_node(int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    if (!n) return NULL; // Handle allocation failure
    n->data = val;
    n->next = NULL;
    return n;
}

void free_list(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        Node* next = curr->next;
        free(curr); // Must capture next before freeing curr!
        curr = next;
    }
}`,
      cpp: `// RAII and Unique Pointers in C++
#include <memory>

struct Node {
    int data;
    std::unique_ptr<Node> next;
    Node(int val) : data(val), next(nullptr) {}
};

// Destructor cascades automatically down the chain without memory leaks!`,
      python: `# Python Automatic Reference Counting + Generational GC
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

head = Node(10)
head.next = Node(20)
head = None  # Previous nodes become unreferenced and are garbage collected automatically`,
      java: `// Java Automatic Garbage Collection
public class Node {
    int data;
    Node next;
    public Node(int data) { this.data = data; }

    public static void main(String[] args) {
        Node head = new Node(10);
        head.next = new Node(20);
        head = null; // Unreachable nodes are collected by the JVM Garbage Collector
    }
}`
    }
  },

  'structs-classes-grouping-data': {
    slug: 'structs-classes-grouping-data',
    title: 'Structs & Classes: Grouping Data',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'Creating compound data types, struct padding, memory alignment, and memory layouts.',
    lead: 'Data structures require bundling heterogeneous payloads (integers, strings, floats) together with relational pointers. Understanding struct memory layout and byte alignment prevents silent memory bloat.',
    sections: [
      {
        id: 'memory-alignment-and-padding',
        title: 'Memory Alignment & Padding',
        content: `CPUs read memory in word-sized chunks (typically 64 bits = 8 bytes on modern x86_64 and ARM64 processors). Accessing an 8-byte integer at an address divisible by 8 requires 1 memory fetch. Accessing it across a boundary requires 2 fetches.

To optimize speed, compilers insert invisible **padding bytes**:
\`\`\`c
struct Inefficient {
    char a;    // 1 byte (+ 7 bytes padding)
    double b;  // 8 bytes
    char c;    // 1 byte (+ 7 bytes padding)
}; // Total: 24 bytes!

struct Optimized {
    double b;  // 8 bytes
    char a;    // 1 byte
    char c;    // 1 byte (+ 6 bytes padding)
}; // Total: 16 bytes (33% memory savings!)
\`\`\`
Ordering struct fields from largest to smallest minimizes padding waste in node-heavy structures.`
      }
    ],
    code: {
      c: `/* Struct definition and alignment in C */
#include <stdio.h>

typedef struct Node {
    int data;          /* 4 bytes */
    /* 4 bytes padding on 64-bit systems */
    struct Node* next; /* 8 bytes */
} Node; /* sizeof(Node) == 16 bytes */`,
      cpp: `// C++ Class definition for a Linked Node
template <typename T>
struct Node {
    T data;
    Node* next;
    Node(T val) : data(val), next(nullptr) {}
};`,
      python: `# Python Class with __slots__ to eliminate dictionary overhead
class EfficientNode:
    __slots__ = ['data', 'next'] # Prevents __dict__ allocation per instance
    def __init__(self, data):
        self.data = data
        self.next = None`,
      java: `// Java Node Class
public class Node<T> {
    public T data;
    public Node<T> next;

    public Node(T data) {
        this.data = data;
        this.next = null;
    }
}`
    }
  },

  'pointers-references-and-address': {
    slug: 'pointers-references-and-address',
    title: 'Pointers, References, and Addresses',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'Demystifying memory addresses, pointer dereferencing, arrow operators, and object references.',
    lead: 'A pointer is nothing more than a 64-bit integer whose numerical value is the physical byte offset in virtual RAM where another piece of data begins. Mastering pointers is the key to building non-linear data structures.',
    sections: [
      {
        id: 'pointer-anatomy',
        title: 'Pointer Anatomy & Dereferencing',
        content: `When a variable \`x = 42\` is stored at address \`0x7ffeefbff568\`, a pointer \`p\` holding that value simply points to that memory location:
- \`&x\`: The "address-of" operator. Retrieves the memory address.
- \`*p\`: The "dereference" operator. Reads or writes the value located at address \`p\`.
- \`p->field\`: Shorthand for \`(*p).field\` in C/C++.`
      },
      {
        id: 'pointer-vs-reference-across-languages',
        title: 'Pointers vs References Across Languages',
        content: `| Language | Mechanism | Pointer Arithmetic? | Null Safety? |
| :--- | :--- | :--- | :--- |
| **C** | Raw Pointer (\`int*\`) | Yes (\`p + 1\`) | No (Manual check required) |
| **C++** | Raw / Smart Pointers & References | Yes on raw; No on refs | Optional via smart pointers |
| **Java** | Object References | No | \`NullPointerException\` if unchecked |
| **Python** | Object References (name bindings) | No | \`None\` check required |`
      }
    ],
    code: {
      c: `/* Pointer mechanics in C */
#include <stdio.h>

void swap(int* a, int* b) {
    int temp = *a; // Read value at address 'a'
    *a = *b;       // Write value of 'b' into address 'a'
    *b = temp;      // Write temp into address 'b'
}`,
      cpp: `// C++ References vs Pointers
void swapByRef(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}`,
      python: `# In Python, variables are named references bound to objects
def modify_list(lst):
    lst.append(100) # Modifies underlying object in place

nums = [1, 2, 3]
modify_list(nums)
# nums is now [1, 2, 3, 100]`,
      java: `// Java passes references by value
public class PointerRefDemo {
    public static void changeNodeValue(Node node, int newVal) {
        node.data = newVal; // Mutates heap object through reference
    }
}`
    }
  },

  'why-we-measure-cost-time-complexity': {
    slug: 'why-we-measure-cost-time-complexity',
    title: 'Why We Measure Cost: Time Complexity',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'Counting abstract operations rather than stopwatch seconds to achieve hardware-independent benchmarks.',
    lead: 'Benchmarking code with wall-clock timers (\`System.currentTimeMillis()\`) fails because CPU models, background processes, and compiler optimizations vary. Asymptotic time complexity measures how operation counts scale mathematically as input size $N \\to \\infty$.',
    sections: [
      {
        id: 'hardware-independent-analysis',
        title: 'Hardware-Independent Analysis',
        content: `Instead of counting milliseconds, asymptotic analysis counts **primitive computational steps**:
- Variable assignments ($c_1$)
- Arithmetic operations ($c_2$)
- Comparison checks ($c_3$)
- Array index offset lookups ($c_4$)

If an algorithm runs $T(N) = 3N^2 + 5N + 12$ operations, as $N \\to \\infty$, the $3N^2$ quadratic term completely dominates the growth rate. Constants and lower-order terms become negligible.`
      }
    ],
    code: {
      c: `/* Time complexity comparison: O(1) vs O(N) vs O(N^2) */
int constant_time(int n) {
    return n * (n + 1) / 2; // O(1) - exactly 3 operations regardless of n
}

int linear_time(int n) {
    int sum = 0;
    for (int i = 1; i <= n; ++i) { // O(N) - loop runs n times
        sum += i;
    }
    return sum;
}`,
      cpp: `// Quadratic Time Complexity O(N^2)
int countPairs(const std::vector<int>& arr) {
    int count = 0;
    int n = arr.size();
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            count++;
        }
    }
    return count; // n*(n-1)/2 operations -> O(N^2)
}`,
      python: `# O(1) mathematical closed-form vs O(N) iterative summation
def sum_constant(n: int) -> int:
    return n * (n + 1) // 2  # O(1)

def sum_linear(n: int) -> int:
    return sum(range(1, n + 1))  # O(N)`,
      java: `public class ComplexityDemo {
    public static int sumConstant(int n) {
        return n * (n + 1) / 2; // O(1)
    }

    public static int sumLinear(int n) {
        int sum = 0;
        for (int i = 1; i <= n; i++) sum += i; // O(N)
        return sum;
    }
}`
    }
  },

  'why-we-measure-cost-space-complexity': {
    slug: 'why-we-measure-cost-space-complexity',
    title: 'Why We Measure Cost: Space Complexity',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'Evaluating auxiliary memory consumption, recursion call stack frames, and working buffers.',
    lead: 'Space complexity quantifies the total auxiliary memory required by an algorithm as a function of the input size $N$, excluding the original input dataset itself.',
    sections: [
      {
        id: 'auxiliary-space-vs-total-space',
        title: 'Auxiliary Space vs. Total Space',
        content: `1. **Input Space**: The memory needed to store the input data itself.
2. **Auxiliary Space**: The extra or temporary memory allocated by the algorithm during execution (e.g., dynamic buffers, hash sets, recursion stack frames).

**Example: Recursion Call Stack**:
A recursive depth-first traversal of a linked list with $N$ elements creates $N$ simultaneous stack frames on the call stack, consuming $O(N)$ auxiliary space even without explicit heap allocations!`
      }
    ],
    code: {
      c: `/* Space Complexity: O(1) iterative vs O(N) recursive auxiliary space */

/* O(1) Auxiliary Space: uses only 2 pointer variables */
void print_iterative(const Node* head) {
    const Node* curr = head;
    while (curr != NULL) {
        printf("%d ", curr->data);
        curr = curr->next;
    }
}

/* O(N) Auxiliary Space: N call stack frames pushed to Call Stack! */
void print_recursive(const Node* head) {
    if (head == NULL) return;
    printf("%d ", head->data);
    print_recursive(head->next); // Stack frame stays until base case returns
}`,
      cpp: `// In-place O(1) auxiliary space reverse vs O(N) copy
void reverseInPlace(Node*& head) {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    head = prev; // O(1) auxiliary space
}`,
      python: `# O(N) auxiliary space via list copy
def duplicate_list(arr: list) -> list:
    return [x for x in arr]  # O(N) extra memory allocated`,
      java: `// O(1) auxiliary space swap
public class SpaceDemo {
    public static void swap(int[] arr, int i, int j) {
        int temp = arr[i]; // O(1) auxiliary variable
        arr[i] = arr[j];
        arr[j] = temp;
    }
}`
    }
  },

  'reading-big-o-like-a-sentence': {
    slug: 'reading-big-o-like-a-sentence',
    title: 'Reading Big-O Like a Sentence',
    folder: '01-getting-started',
    category: '01-getting-started',
    summary: 'Translating mathematical asymptotic bounds ($O, \\Omega, \\Theta$) into plain English engineering intuition.',
    lead: 'Big-O notation is not abstract algebra. It is an engineering sentence that describes how a system responds under scaling pressure.',
    sections: [
      {
        id: 'the-asymptotic-dictionary',
        title: 'The Asymptotic Engineering Dictionary',
        content: `| Notation | Plain English Meaning | Practical Intuition |
| :--- | :--- | :--- |
| **$O(1)$** | "Constant time" | Execution speed is independent of dataset size. |
| **$O(\\log N)$** | "Logarithmic time" | Input is halved at each step (e.g. Binary Search). Scaling to 1,000,000,000 takes only ~30 steps! |
| **$O(N)$** | "Linear time" | If data doubles, execution time doubles. Every item is inspected once. |
| **$O(N \\log N)$** | "Linearithmic time" | The theoretical lower bound for comparison-based sorting (MergeSort, QuickSort). |
| **$O(N^2)$** | "Quadratic time" | Comparing every pair of elements. Unusable for large production systems ($N > 10^5$). |
| **$O(2^N)$** | "Exponential time" | Exploring all subsets. Impractical without memoization or pruning. |`
      },
      {
        id: 'big-o-vs-omega-vs-theta',
        title: 'Big-O ($O$) vs Big-Omega ($\\Omega$) vs Big-Theta ($\\Theta$)',
        content: `- **$O(g(N))$ (Upper Bound)**: "Guaranteed not to perform worse than $g(N)$ in the worst case."
- **$\\Omega(g(N))$ (Lower Bound)**: "Takes at least $g(N)$ steps even in the best case scenario."
- **$\\Theta(g(N))$ (Tight Bound)**: "Algorithm is bounded both from above and below by $g(N)$."`
      }
    ],
    code: {
      c: `/* Asymptotic hierarchy demonstrated in C */

/* O(1) - Constant */
int get_first(const int* arr) { return arr[0]; }

/* O(log N) - Logarithmic (Binary Search) */
int binary_search(const int* arr, int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      cpp: `// C++ Logarithmic Search
#include <vector>
#include <algorithm>

bool fastFind(const std::vector<int>& sortedVec, int val) {
    return std::binary_search(sortedVec.begin(), sortedVec.end(), val); // O(log N)
}`,
      python: `# Python O(N log N) Timsort
def sort_data(arr: list):
    arr.sort()  # O(N log N) adaptive merge sort`,
      java: `// Java Binary Search
import java.util.Arrays;

public class SearchDemo {
    public static int search(int[] sortedArr, int target) {
        return Arrays.binarySearch(sortedArr, target); // O(log N)
    }
}`
    }
  }
};
