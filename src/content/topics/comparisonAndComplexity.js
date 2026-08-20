export const comparisonAndComplexityTopics = {
  'comparison-linked-vs-array': {
    slug: 'comparison-linked-vs-array',
    title: 'Linked List vs. Array List — Comparison',
    category: 'Linked List',
    summary: 'A deep-dive technical comparison: contiguous vs fragmented memory layouts, CPU cache lines, TLB hit rates, memory overhead, and algorithmic operation bounds.',
    lead: 'Choosing between an Array List and a Linked List requires balancing algorithmic time complexity against modern CPU hardware architecture and cache memory hierarchy.',
    sections: [
      {
        id: 'memory-layout-comparison',
        title: 'Memory Architecture & Cache Behavior',
        content: `### 1. Spatial Locality & Hardware Prefetching
- **Dynamic Array**: Consecutive memory addresses allow hardware prefetchers to load entire cache lines (64 bytes) ahead of time. Iterating through $10^6$ elements causes minimal cache misses.
- **Linked List**: Nodes are allocated individually on the heap at scattered addresses. Dereferencing \`curr->next\` frequently causes L1/L2/L3 cache misses and Translation Lookaside Buffer (TLB) misses (pointer chasing).

### 2. Memory Overhead
- **Dynamic Array**: Spare capacity overhead varies between $0\\%$ and $50\\%$ of array length. Zero pointer metadata stored per element.
- **Singly Linked List**: 8 bytes pointer overhead per node + allocator chunk metadata (8–16 bytes). Storing 4-byte integers incurs $4\\times$ memory overhead.
- **Doubly Linked List**: 16 bytes pointer overhead per node.`
      },
      {
        id: 'operational-tradeoffs',
        title: 'Operation Tradeoffs Matrix',
        content: `| Characteristic | Dynamic Array | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **Random Access ($i$-th)** | $\\mathbf{O(1)}$ (direct pointer math) | $O(n)$ (linear traversal) | $O(n)$ (linear traversal) |
| **Insert / Delete at Head** | $O(n)$ (shift memory) | $\\mathbf{O(1)}$ | $\\mathbf{O(1)}$ |
| **Insert / Delete at Tail** | $\\mathbf{O(1)}$ (amortized) | $O(n)$ or $O(1)$ (w/ tail ptr) | $\\mathbf{O(1)}$ |
| **Insert / Delete at Iterator** | $O(n)$ (shift memory) | $\\mathbf{O(1)}$ (after target) | $\\mathbf{O(1)}$ (at target) |
| **Memory Contiguity** | Strict Contiguous | Dispersed Heap | Dispersed Heap |
| **CPU Cache Efficiency** | Extremely High | Low (Pointer Chasing) | Low (Pointer Chasing) |`
      }
    ],
    code: {
      c: `/* Micro-benchmark: Linear iteration over 10^6 elements */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define N 1000000

typedef struct Node {
    int val;
    struct Node* next;
} Node;

void compare_iteration_speed(void) {
    int* array = (int*)malloc(N * sizeof(int));
    Node* head = NULL;
    Node* tail = NULL;

    for (int i = 0; i < N; i++) {
        array[i] = i;
        Node* node = (Node*)malloc(sizeof(Node));
        node->val = i;
        node->next = NULL;
        if (!head) { head = node; tail = node; }
        else { tail->next = node; tail = node; }
    }

    // Benchmark Array
    clock_t t0 = clock();
    long long sum_arr = 0;
    for (int i = 0; i < N; i++) sum_arr += array[i];
    clock_t t1 = clock();
    double arr_time = ((double)(t1 - t0) / CLOCKS_PER_SEC) * 1000.0;

    // Benchmark Linked List
    clock_t t2 = clock();
    long long sum_ll = 0;
    for (Node* curr = head; curr; curr = curr->next) sum_ll += curr->val;
    clock_t t3 = clock();
    double ll_time = ((double)(t3 - t2) / CLOCKS_PER_SEC) * 1000.0;

    printf("Array Iteration: %.3f ms\\n", arr_time);
    printf("Linked List Iteration: %.3f ms (Typically 5-10x slower due to cache misses)\\n", ll_time);
}`,
      cpp: `// C++ Cache Locality Benchmark
#include <vector>
#include <list>
#include <chrono>
#include <iostream>

void compareStdVectorVsStdList() {
    constexpr int N = 1'000'000;
    std::vector<int> v(N, 1);
    std::list<int> l(N, 1);

    auto t0 = std::chrono::high_resolution_clock::now();
    long long s1 = 0;
    for (int x : v) s1 += x;
    auto t1 = std::chrono::high_resolution_clock::now();

    long long s2 = 0;
    for (int x : l) s2 += x;
    auto t2 = std::chrono::high_resolution_clock::now();

    std::cout << "Vector: " << std::chrono::duration<double, std::milli>(t1-t0).count() << " ms\\n";
    std::cout << "List: " << std::chrono::duration<double, std::milli>(t2-t1).count() << " ms\\n";
}`,
      python: `"""Memory size comparison in Python"""
import sys

# Array-based list
py_list = list(range(1000))
print(f"Python list overhead: {sys.getsizeof(py_list)} bytes")`,
      java: `/** Java ArrayList vs LinkedList Memory & Iteration */
package dsa.reference.comparison;

import java.util.ArrayList;
import java.util.LinkedList;

public class Benchmark {
    public static void main(String[] args) {
        int n = 1_000_000;
        ArrayList<Integer> al = new ArrayList<>(n);
        LinkedList<Integer> ll = new LinkedList<>();
        for (int i = 0; i < n; i++) {
            al.add(i);
            ll.add(i);
        }
        // ArrayList outperforms LinkedList by order of magnitude in iteration
    }
}`
    },
    complexity: [
      { operation: 'Random Index Access', best: 'Array O(1)', avg: 'Array O(1) vs List O(n)', worst: 'List O(n)', space: 'Array O(1)' },
      { operation: 'Insert at Head', best: 'List O(1)', avg: 'List O(1) vs Array O(n)', worst: 'Array O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-impl', 'complexity-linked-list', 'applications-use-cases']
  },

  'complexity-linked-list': {
    slug: 'complexity-linked-list',
    title: 'Complexity Analysis — Linked List',
    category: 'Linked List',
    summary: 'Asymptotic time and space complexity breakdown across all operations for Singly, Doubly, and Circular Linked Lists.',
    lead: 'A consolidated analysis of linked list variations highlighting exact time bounds for head, tail, and node-pointer-based modifications.',
    sections: [
      {
        id: 'comprehensive-table',
        title: 'Master Complexity Matrix',
        content: `| Operation | Singly Linked | Singly w/ Tail | Doubly Linked | Doubly w/ Tail |
| :--- | :--- | :--- | :--- | :--- |
| **Insert Head** | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| **Insert Tail** | $O(n)$ | $O(1)$ | $O(n)$ | $O(1)$ |
| **Delete Head** | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| **Delete Tail** | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$ |
| **Insert After Node $P$** | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| **Delete Node $P$ (given ptr)** | $O(n)$ (need pred) | $O(n)$ | $O(1)$ | $O(1)$ |
| **Search by Key** | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ |
| **Reverse In-Place** | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ |`
      }
    ],
    code: {
      c: `/* Complexity benchmark summary functions */`,
      cpp: `// Complexity benchmark summary functions`,
      python: `"""Complexity summary"""`,
      java: `/** Complexity summary */`
    },
    complexity: [
      { operation: 'Head Operations', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Arbitrary Search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'In-Place Reverse', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['comparison-linked-vs-array', 'complexity-cheat-sheet', 'applications-use-cases']
  },

  'applications-use-cases': {
    slug: 'applications-use-cases',
    title: 'Applications & Real-World Use Cases',
    category: 'Linked List',
    summary: 'Practical applications of linked lists in production software engineering: LRU caches, kernel process scheduling, memory allocators, and undo-redo stacks.',
    lead: 'While contiguous dynamic arrays dominate general-purpose collections due to cache locality, linked structures excel in scenarios demanding strictly bounded $O(1)$ node insertion/removal without reallocations.',
    sections: [
      {
        id: 'lru-cache',
        title: '1. Least Recently Used (LRU) Cache',
        content: `An LRU Cache combines a **Hash Table** with a **Doubly Linked List**:
- Hash map provides $O(1)$ key-to-node lookup.
- Doubly linked list maintains access recency order.
- When an item is read or written, its node is moved to the list head in $O(1)$ time via pointer splicing.
- When capacity is exceeded, the tail node is evicted in $O(1)$ time.`
      },
      {
        id: 'os-free-lists',
        title: '2. Memory Allocator Free Lists & OS Task Queues',
        content: `- **Free Lists**: Memory allocators (e.g. \`jemalloc\`, \`dlmalloc\`) use circular doubly linked lists embedded inside free heap chunks to merge and allocate blocks in $O(1)$ without extra metadata memory.
- **OS Process Scheduling**: Operating system kernels (e.g. Linux CFS \`struct list_head\`) use circular doubly linked lists to cycle active process control blocks.`
      }
    ],
    code: {
      c: `/* Linux-Kernel style intrusive doubly linked list pattern */
typedef struct list_head {
    struct list_head *next, *prev;
} list_head;

static inline void list_add(list_head *new_node, list_head *head) {
    head->next->prev = new_node;
    new_node->next = head->next;
    new_node->prev = head;
    head->next = new_node;
}`,
      cpp: `// LRU Cache Node linkage in C++
#include <unordered_map>
#include <list>

template <typename K, typename V>
class LRUCache {
    std::size_t capacity_;
    std::list<std::pair<K, V>> items_;
    std::unordered_map<K, typename std::list<std::pair<K, V>>::iterator> map_;
public:
    explicit LRUCache(std::size_t cap) : capacity_(cap) {}

    void put(const K& key, const V& val) {
        auto it = map_.find(key);
        if (it != map_.end()) {
            items_.erase(it->second);
        } else if (items_.size() >= capacity_) {
            map_.erase(items_.back().first);
            items_.pop_back();
        }
        items_.push_front({key, val});
        map_[key] = items_.begin();
    }
};`,
      python: `"""LRU Cache mechanism in Python using OrderedDict (Doubly Linked List + Dict)"""
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key, last=False) # Move to front
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key, last=False)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=True) # Evict oldest from tail`,
      java: `/** Java LinkedHashMap (Doubly-Linked List + Hash Table for LRU) */
package dsa.reference.applications;

import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // true = access-order
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}`
    },
    complexity: [
      { operation: 'LRU Cache Get / Put', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(capacity)' },
      { operation: 'Free List Block Insert / Merge', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    ],
    relatedSlugs: ['doubly-linked-list-structure', 'comparison-linked-vs-array', 'complexity-cheat-sheet']
  }
};
