export const gettingStartedTopics = {
  'intro-to-adts': {
    slug: 'intro-to-adts',
    title: 'Introduction to Abstract Data Types (ADTs)',
    category: 'Getting Started',
    summary: 'An Abstract Data Type (ADT) is a mathematical specification of a data structure that defines the data values and the operations that can be performed on them, without specifying the underlying implementation or memory layout.',
    lead: 'In software engineering and computer science, abstraction enforces a strict boundary between what an interface promises (the contract) and how an underlying system delivers it (the implementation). Understanding ADTs is the prerequisite for evaluating time/space trade-offs across data structures.',
    sections: [
      {
        id: 'specification-vs-implementation',
        title: 'Specification vs. Implementation',
        content: `An ADT defines the *behavioral contract* of a data type from the perspective of a consumer. It specifies:
1. **Domain**: The set of valid values the type can represent.
2. **Operations**: The complete set of functions, procedures, or methods that operate on the domain.
3. **Axioms / Invariants**: Semantic rules and pre/post-conditions that every operation must preserve (e.g., calling \`pop()\` immediately after \`push(x)\` yields \`x\`).

Critically, an ADT makes no assertions about pointer layouts, cache lines, heap allocations, or algorithmic mechanics. Multiple radically distinct data structures can satisfy the exact same ADT contract with differing algorithmic asymptotic bounds.`
      },
      {
        id: 'the-list-adt-concept',
        title: 'The List ADT Concept',
        content: `The **List ADT** represents an ordered sequence of homogeneous elements $(a_0, a_1, \\dots, a_{n-1})$ where the position of each element is significant. Common implementations include:
- **Array-based List (Dynamic Array)**: Contiguous block of memory with $O(1)$ random access and $O(n)$ worst-case insertion.
- **Linked List**: Dispersed heap nodes linked by pointers with $O(1)$ head insertion and $O(n)$ linear access.

Both structures fulfill the identical abstract List interface, but their physical memory architectures produce fundamentally divergent performance profiles.`
      }
    ],
    code: {
      c: `/* ADT List Interface Contract in C (list_adt.h) */
#ifndef LIST_ADT_H
#define LIST_ADT_H

#include <stddef.h>
#include <stdbool.h>

/* Opaque pointer to the concrete implementation */
typedef struct List List;

/* Constructor / Destructor */
List* list_create(void);
void list_destroy(List* list);

/* Contract operations */
size_t list_size(const List* list);
bool list_is_empty(const List* list);
bool list_insert(List* list, size_t index, int value);
bool list_delete(List* list, size_t index, int* out_value);
bool list_get(const List* list, size_t index, int* out_value);
bool list_set(List* list, size_t index, int value);

#endif /* LIST_ADT_H */`,
      cpp: `// ADT List Interface Contract in C++ (Pure Virtual Interface)
#ifndef LIST_ADT_HPP
#define LIST_ADT_HPP

#include <cstddef>

template <typename T>
class IList {
public:
    virtual ~IList() = default;

    virtual std::size_t size() const = 0;
    virtual bool isEmpty() const = 0;
    virtual void insert(std::size_t index, const T& element) = 0;
    virtual T remove(std::size_t index) = 0;
    virtual const T& get(std::size_t index) const = 0;
    virtual void set(std::size_t index, const T& element) = 0;
    virtual void clear() = 0;
};

#endif // LIST_ADT_HPP`,
      python: `"""
ADT List Interface Contract in Python (Abstract Base Class)
"""
from abc import ABC, abstractmethod
from typing import TypeVar, Generic

T = TypeVar('T')

class ListADT(ABC, Generic[T]):
    """Abstract interface defining the sequential List contract."""
    
    @abstractmethod
    def size(self) -> int:
        """Return the number of elements in the list."""
        pass

    @abstractmethod
    def is_empty(self) -> bool:
        """Return True if the list contains no elements."""
        pass

    @abstractmethod
    def insert(self, index: int, element: T) -> None:
        """Insert element at specified index (0 <= index <= size)."""
        pass

    @abstractmethod
    def remove(self, index: int) -> T:
        """Remove and return element at specified index."""
        pass

    @abstractmethod
    def get(self, index: int) -> T:
        """Retrieve element at specified index without removing it."""
        pass`,
      java: `/**
 * ADT List Interface Contract in Java
 */
package dsa.reference.adt;

public interface ListADT<E> {
    /** Returns the number of elements in this list. */
    int size();

    /** Returns true if this list contains no elements. */
    boolean isEmpty();

    /** Inserts the specified element at the specified position. */
    void insert(int index, E element);

    /** Removes the element at the specified position in this list. */
    E remove(int index);

    /** Returns the element at the specified position in this list. */
    E get(int index);

    /** Replaces the element at the specified position. */
    E set(int index, E element);

    /** Removes all of the elements from this list. */
    void clear();
}`
    },
    complexity: [
      { operation: 'Random Access (get/set)', best: 'O(1)', avg: 'O(1) [Array] / O(n) [Linked]', worst: 'O(1) [Array] / O(n) [Linked]', space: 'O(1)' },
      { operation: 'Insert at Head', best: 'O(1)', avg: 'O(n) [Array] / O(1) [Linked]', worst: 'O(n) [Array] / O(1) [Linked]', space: 'O(1)' },
      { operation: 'Insert at Tail', best: 'O(1)', avg: 'O(1) amortized', worst: 'O(n) [Array resize]', space: 'O(1)' },
      { operation: 'Delete at Head', best: 'O(1)', avg: 'O(n) [Array] / O(1) [Linked]', worst: 'O(n) [Array] / O(1) [Linked]', space: 'O(1)' },
    ],
    relatedSlugs: ['how-to-use', 'big-o-primer', 'adt-list-contract']
  },

  'how-to-use': {
    slug: 'how-to-use',
    title: 'How to Use This Reference',
    category: 'Getting Started',
    summary: 'A guide to navigating the DSA reference: multi-language side-by-side code blocks, interactive memory visualizers, complexity tables, and keyboard command shortcuts.',
    lead: 'This documentation system is designed as an authoritative, concise engineering handbook. Every topic provides mathematical complexity specifications, interactive visual step-throughs, and verbatim compilable code across C, C++, Python, and Java.',
    sections: [
      {
        id: 'multilingual-design',
        title: 'Unified Multilingual Code Blocks',
        content: `All code blocks maintain consistent structural conventions:
- **Variable and member naming parity**: Data nodes use \`Node\`, pointers to next element use \`next\`, head references use \`head\`.
- **Memory safety invariants**: C and C++ examples demonstrate explicit allocation (\`malloc\`, \`new\`) and complete leak-free deallocation (\`free\`, \`delete\`). Python and Java examples leverage standard garbage collector semantics and idiomatic error handling (e.g. \`IndexOutOfBoundsException\`).
- **Global Preferred Language**: Use the top bar switcher to set your default language across all pages, or click the local tabs to inspect and compare syntax.`
      },
      {
        id: 'keyboard-and-search',
        title: 'Keyboard Shortcuts & Command Palette',
        content: `The entire site is accessible via keyboard:
- \`⌘K\` or \`Ctrl+K\`: Open the global search palette to jump to any topic, operation, or code implementation.
- \`/\`: Focus quick search.
- \`Esc\`: Close modals and drawers.`
      }
    ],
    code: {
      c: `/* Idiomatic C Conventions used throughout this reference */
typedef struct Node {
    int data;
    struct Node* next;
} Node;

Node* create_node(int data) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (!new_node) return NULL; /* Safe allocation check */
    new_node->data = data;
    new_node->next = NULL;
    return new_node;
}`,
      cpp: `// Idiomatic C++ Conventions used throughout this reference
template <typename T>
struct Node {
    T data;
    Node* next;

    explicit Node(const T& val) : data(val), next(nullptr) {}
};`,
      python: `"""Idiomatic Python Conventions used throughout this reference"""
from typing import Optional, Generic, TypeVar

T = TypeVar('T')

class Node(Generic[T]):
    __slots__ = ('data', 'next')
    
    def __init__(self, data: T, next_node: Optional['Node[T]'] = None):
        self.data: T = data
        self.next: Optional['Node[T]'] = next_node`,
      java: `/** Idiomatic Java Conventions used throughout this reference */
public class Node<E> {
    public E data;
    public Node<E> next;

    public Node(E data) {
        this(data, null);
    }

    public Node(E data, Node<E> next) {
        this.data = data;
        this.next = next;
    }
}`
    },
    complexity: [],
    relatedSlugs: ['intro-to-adts', 'big-o-primer', 'singly-linked-list-structure']
  },

  'big-o-primer': {
    slug: 'big-o-primer',
    title: 'Complexity Notation — A Big-O Primer',
    category: 'Getting Started',
    summary: 'A rigorous overview of asymptotic notations (O, Ω, Θ), amortized time complexity, and auxiliary space bounds as applied to linear data structures.',
    lead: 'Asymptotic analysis models the rate of growth of execution time and auxiliary space with respect to input size $n$. For list structures, we analyze worst-case, average-case, best-case, and amortized bounds.',
    sections: [
      {
        id: 'formal-definitions',
        title: 'Asymptotic Notations: Big-O, Big-Omega, Big-Theta',
        content: `Given an input size $n$:
- **Big-O ($O$)**: Upper bound. $f(n) = O(g(n))$ if there exist positive constants $c$ and $n_0$ such that $0 \\le f(n) \\le c \\cdot g(n)$ for all $n \\ge n_0$.
- **Big-Omega ($\\Omega$)**: Lower bound. $f(n) = \\Omega(g(n))$ if $f(n) \\ge c \\cdot g(n)$ for all $n \\ge n_0$.
- **Big-Theta ($\\Theta$)**: Tight asymptotic bound. $f(n) = \\Theta(g(n))$ if $f(n) = O(g(n))$ and $f(n) = \\Omega(g(n))$.`
      },
      {
        id: 'amortized-analysis',
        title: 'Amortized Analysis (Dynamic Array Resizing)',
        content: `A dynamic array (\`std::vector\`, Python \`list\`, Java \`ArrayList\`) doubles its capacity when full. A single insertion that triggers resizing incurs $O(n)$ data copy cost. However, because $n$ elements can be appended before the next reallocation, the aggregate cost of $n$ appends is:
$$\\sum_{i=0}^{\\log_2 n} 2^i = 2n - 1 = O(n)$$
Dividing by $n$ operations yields an **amortized time complexity of $O(1)$** per insertion.`
      },
      {
        id: 'memory-overhead',
        title: 'Memory Overhead & Space Complexity',
        content: `Space complexity distinguishes between:
- **Primary Data Storage**: Memory allocated directly to the stored items.
- **Auxiliary Overhead**: Pointer fields in nodes (e.g. 8 bytes per pointer on 64-bit architectures), dynamic array unused spare capacity, and memory allocator alignment padding.`
      }
    ],
    code: {
      c: `/* Demonstration of Dynamic Array Geometric Growth in C */
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int* data;
    size_t size;
    size_t capacity;
} DynamicArray;

void push_back(DynamicArray* arr, int value) {
    if (arr->size == arr->capacity) {
        size_t new_cap = (arr->capacity == 0) ? 2 : arr->capacity * 2;
        int* new_data = (int*)realloc(arr->data, new_cap * sizeof(int));
        if (!new_data) return;
        arr->data = new_data;
        arr->capacity = new_cap;
    }
    arr->data[arr->size++] = value;
}`,
      cpp: `// C++ Demonstrating Amortized Push Back
#include <vector>
#include <iostream>

void demonstrateCapacity() {
    std::vector<int> v;
    for (int i = 0; i < 10; ++i) {
        v.push_back(i);
        // Capacity grows geometrically (typically 1.5x or 2x)
        std::cout << "size: " << v.size() 
                  << ", capacity: " << v.capacity() << "\\n";
    }
}`,
      python: `"""Python List Geometric Growth Visualization"""
import sys

def inspect_list_growth():
    lst = []
    prev_size = sys.getsizeof(lst)
    for i in range(20):
        lst.append(i)
        current_size = sys.getsizeof(lst)
        if current_size != prev_size:
            print(f"Len: {len(lst):2d} | Bytes: {current_size} (reallocated)")
            prev_size = current_size`,
      java: `/** Java ArrayList Dynamic Expansion Demonstration */
package dsa.reference.complexity;

import java.util.ArrayList;

public class AmortizedDemo {
    public static void main(String[] args) {
        ArrayList<Integer> list = new ArrayList<>();
        // Default initial capacity is 10; grows by (oldCapacity * 1.5)
        for (int i = 0; i < 20; i++) {
            list.add(i);
        }
    }
}`
    },
    complexity: [
      { operation: 'Dynamic Array Append (Amortized)', best: 'O(1)', avg: 'O(1)', worst: 'O(n) [Reallocation]', space: 'O(1)' },
      { operation: 'Linked List Head Insert', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Linked List Traversal', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['intro-to-adts', 'array-list-impl', 'complexity-cheat-sheet']
  }
};
