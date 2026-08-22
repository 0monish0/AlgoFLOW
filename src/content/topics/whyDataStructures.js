export const whyDataStructuresTopics = {
  'is-there-even-a-need': {
    slug: 'is-there-even-a-need',
    title: 'Is There Even a Need?',
    folder: '00-why-data-structures',
    category: '00-why-data-structures',
    summary: 'Why do data structures exist in the first place? An exploration of hardware physics, memory constraints, and computational trade-offs.',
    lead: 'If computers possessed infinite registers operating at zero latency with zero power consumption, data structures would be obsolete. Data structures exist because physical hardware imposes real trade-offs between speed, space, contiguous locality, and mutation cost.',
    sections: [
      {
        id: 'the-illusion-of-infinite-compute',
        title: 'The Illusion of Infinite Compute',
        content: `Every software program ultimately computes over state. In trivial toy programs with dozens of elements, any ad-hoc representation (like a naive unordered list or flat buffer) works fine because CPUs execute billions of cycles per second.

However, computational cost scales non-linearly. As dataset cardinality grows from $N = 10^2$ to $N = 10^8$:
- An $O(1)$ lookup takes 1 CPU cycle (~0.3 ns).
- An $O(N)$ linear scan requires traversing 100,000,000 memory addresses (~25–100 ms).
- An $O(N^2)$ brute-force check requires $10^{16}$ operations (months of continuous CPU time).

Data structures are architectural blueprints designed to keep algorithms within feasible time and memory bounds.`
      },
      {
        id: 'hardware-constraints-drive-design',
        title: 'Hardware Constraints Drive Design',
        content: `Modern computer architecture is fundamentally hierarchical:
1. **L1/L2/L3 CPU Caches**: Blazing fast (1–10 ns), but microscopic in size (megabytes).
2. **Main RAM**: Moderate speed (50–100 ns latency), gigabytes in size.
3. **Persistent Disk (NVMe/SSD)**: High latency (microseconds to milliseconds), terabytes in size.

Because sequential memory access is 10x to 100x faster than random pointer chasing due to CPU cache prefetchers, our choice of data structure directly dictates whether CPU cores spend cycles computing or stalling for RAM fetches.`
      },
      {
        id: 'the-fundamental-trilemma',
        title: 'The Fundamental Trilemma',
        content: `No single data structure excels in every operation. Every structure is a deliberate compromise among three competing forces:
- **Read Speed (Access / Search)**: How quickly can an arbitrary element be located?
- **Write Speed (Insert / Delete)**: How cheaply can items be added or removed without massive shifts?
- **Memory Overhead**: How much auxiliary space (pointers, spare capacity, metadata) is consumed per byte of useful payload?`
      }
    ],
    code: {
      c: `/* Demonstrating the scale gap: O(1) direct offset vs O(N) linear scan */
#include <stdio.h>
#include <time.h>

int find_direct(const int* arr, int index) {
    return arr[index]; /* O(1) direct memory calculation: base + (index * sizeof(int)) */
}

int find_linear(const int* arr, int size, int target) {
    for (int i = 0; i < size; ++i) {
        if (arr[i] == target) return i; /* O(N) traversal */
    }
    return -1;
}`,
      cpp: `// Scale gap demonstrated in C++
#include <vector>
#include <algorithm>

int direct_access(const std::vector<int>& v, size_t index) {
    return v[index]; // O(1) direct index
}

int linear_search(const std::vector<int>& v, int target) {
    auto it = std::find(v.begin(), v.end(), target); // O(N)
    return (it != v.end()) ? std::distance(v.begin(), it) : -1;
}`,
      python: `# Demonstrating scale gap in Python
def direct_access(arr: list, index: int) -> int:
    return arr[index]  # O(1) array offset

def linear_search(arr: list, target: int) -> int:
    for i, val in enumerate(arr):  # O(N) scan
        if val == target:
            return i
    return -1`,
      java: `// Scale gap demonstrated in Java
public class ScaleComparison {
    public static int directAccess(int[] arr, int index) {
        return arr[index]; // O(1)
    }

    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i; // O(N)
        }
        return -1;
    }
}`
    }
  },

  'data-structures-as-decisions-not-recipes': {
    slug: 'data-structures-as-decisions-not-recipes',
    title: 'Data Structures as Decisions, Not Recipes',
    folder: '00-why-data-structures',
    category: '00-why-data-structures',
    summary: 'Viewing data structures not as canned snippets to memorize, but as trade-off matrices between access patterns and mutation costs.',
    lead: 'Treating data structures like cookbook recipes leads to fragile, inefficient code. Professional engineers evaluate access patterns, concurrency requirements, cache topologies, and memory budgets before picking a data structure.',
    sections: [
      {
        id: 'the-decision-framework',
        title: 'The Systematic Decision Framework',
        content: `Before writing a single line of code, ask five fundamental architectural questions:
1. **What is the Read-to-Write ratio?** (Is the workload 99% reads and 1% writes, or write-heavy streaming?)
2. **Is data access sequential or random?** (Do you query by index $i$ or iterate $0 \\to N$?)
3. **Is the dataset size bounded or unbounded?** (Do you know maximum capacity upfront, or does memory fluctuate wildly?)
4. **Is mutation localized?** (Are items added/removed only at boundaries like head/tail, or in the middle?)
5. **Does the workload require cache friendliness?** (Will throughput be memory-bandwidth bound?)`
      },
      {
        id: 'decision-matrix-example',
        title: 'Decision Matrix: List Contenders',
        content: `| Requirement / Trait | Dynamic Array (ArrayList) | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **Random Indexing $O(1)$** | **Yes** (Instant offset) | No ($O(N)$ traversal) | No ($O(N)$ traversal) |
| **Head Insertion $O(1)$** | No ($O(N)$ element shift) | **Yes** (Pointer swap) | **Yes** (Pointer swap) |
| **Tail Insertion $O(1)$** | **Amortized $O(1)$** | **$O(1)$** (with tail pointer) | **$O(1)$** |
| **Memory Overhead** | Low (contiguous payload) | 1 pointer per node (8 bytes) | 2 pointers per node (16 bytes) |
| **CPU Cache Friendliness** | **High** (L1 prefetch friendly) | Poor (pointer chasing) | Poor (pointer chasing) |`
      }
    ],
    code: {
      c: `/* Choosing between array vs linked list based on mutation decision */
#include <stdlib.h>

/* Scenario A: Read-heavy table -> Flat Array */
typedef struct {
    int* elements;
    size_t count;
} LookupTable;

/* Scenario B: Frequent middle insertions with given node pointer -> Linked Node */
typedef struct ListNode {
    int value;
    struct ListNode* next;
} ListNode;`,
      cpp: `// Decision in C++: std::vector vs std::list vs std::deque
#include <vector>
#include <list>
#include <deque>

// Vector: Default choice (90% of cases) due to cache locality
using FastReadBuffer = std::vector<int>;

// List: Used when pointer stability & O(1) splice is mandatory
using StableSpliceList = std::list<int>;

// Deque: Fast O(1) push/pop at BOTH ends without whole-buffer reallocations
using DoubleEndedQueue = std::deque<int>;`,
      python: `# Python decision: list (dynamic array) vs collections.deque (doubly-linked blocks)
from collections import deque

# Python list: dynamic array, O(1) random access, O(1) append/pop at tail
read_heavy = [10, 20, 30, 40]

# collections.deque: O(1) append/popleft on BOTH ends
fifo_queue = deque([10, 20, 30, 40])
fifo_queue.appendleft(5)  # O(1) without shifting elements`,
      java: `// Java decision: ArrayList vs LinkedList vs ArrayDeque
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.ArrayDeque;

public class DecisionDemo {
    // 95% of workloads: contiguous memory wins
    ArrayList<Integer> fastReads = new ArrayList<>();

    // Queue / Deque workloads: ArrayDeque outperforms LinkedList significantly
    ArrayDeque<Integer> fastQueue = new ArrayDeque<>();
}`
    }
  },

  'what-being-good-at-dsa-actually-means': {
    slug: 'what-being-good-at-dsa-actually-means',
    title: 'What Being Good at DSA Actually Means',
    folder: '00-why-data-structures',
    category: '00-why-data-structures',
    summary: 'Moving beyond rote LeetCode memorization to mastering invariants, pointer discipline, state machine visualization, and boundary handling.',
    lead: 'Mastery in Data Structures and Algorithms is not about memorizing 300 problem solutions. It is about recognizing structural invariants, reasoning with mathematical clarity, maintaining flawless pointer discipline, and visualizing state transitions.',
    sections: [
      {
        id: 'the-four-pillars-of-mastery',
        title: 'The Four Pillars of DSA Mastery',
        content: `True DSA competence rests upon four foundational pillars:
1. **Loop Invariants & State**: Formulating invariants that remain true before, during, and after every iteration.
2. **Pointer Arithmetic & Ownership**: Understanding exactly who owns memory, what address is being dereferenced, and preventing memory leaks or dangling pointers.
3. **Edge Case Elimination**: Handling null pointers, single-element lists, empty inputs, duplicate keys, and boundary overflows without cluttering code with fifty special-case \`if\` statements.
4. **Asymptotic & Constant-Factor Reasoning**: Accurately distinguishing between theoretical $O(N)$ and wall-clock execution time influenced by branch prediction and memory bus saturation.`
      },
      {
        id: 'the-engineering-mindset',
        title: 'The Engineering Mindset: Invariants over Hacks',
        content: `When implementing a linked list reversal, a beginner tries to guess pointer reassignments until test cases pass. 

A master defines a clean invariant:
- \`prev\` points to the reversed prefix.
- \`curr\` points to the remaining unprocessed suffix.
- In each step: capture \`next = curr->next\`, reverse \`curr->next = prev\`, advance \`prev = curr\`, advance \`curr = next\`.
- Termination condition is obvious: when \`curr == NULL\`, \`prev\` is the new head.`
      }
    ],
    code: {
      c: `/* Flawless pointer discipline in C: Reversing a Singly Linked List */
typedef struct Node {
    int data;
    struct Node* next;
} Node;

Node* reverse_list(Node* head) {
    Node* prev = NULL;
    Node* curr = head;
    
    while (curr != NULL) {
        Node* next_temp = curr->next; /* 1. Preserve forward link */
        curr->next = prev;            /* 2. Reverse pointer */
        prev = curr;                  /* 3. Advance prev */
        curr = next_temp;              /* 4. Advance curr */
    }
    
    return prev; /* prev is the new head */
}`,
      cpp: `// Clean pointer discipline in C++
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr != nullptr) {
        Node* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
      python: `# Clean pointer discipline in Python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr is not None:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev`,
      java: `// Clean pointer discipline in Java
public class ListReversal {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`
    }
  }
};
