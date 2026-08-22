export const listAdtTopics = {
  'what-is-an-abstract-data-type': {
    slug: 'what-is-an-abstract-data-type',
    title: 'What is an Abstract Data Type?',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The mathematical definition of an ADT: separating the interface contract from the physical implementation.',
    lead: 'An Abstract Data Type (ADT) is a high-level specification of what operations can be performed on a collection of data, completely detached from how memory is allocated, indexed, or chained under the hood.',
    sections: [
      {
        id: 'the-abstraction-boundary',
        title: 'The Abstraction Boundary',
        content: `Software engineering relies on abstraction barriers to prevent consumers from coupling to private implementation details. 
An ADT defines:
1. **Values**: What kind of objects/elements are held in the collection.
2. **Operations**: The signatures of functions that manipulate the collection (e.g. \`insert\`, \`delete\`, \`get\`, \`size\`).
3. **Axioms**: Mathematical guarantees that must hold true regardless of implementation.`
      }
    ],
    code: {
      c: `/* ADT Interface in C (Opaque Type Pattern) */
#ifndef LIST_ADT_H
#define LIST_ADT_H

#include <stddef.h>
#include <stdbool.h>

/* Incomplete type hiding internal fields from client */
typedef struct List List;

List* list_create(void);
void list_destroy(List* list);
size_t list_size(const List* list);
bool list_append(List* list, int value);
bool list_get(const List* list, size_t index, int* out_value);

#endif`,
      cpp: `// ADT Interface in C++ (Pure Virtual Abstract Class)
template <typename T>
class IList {
public:
    virtual ~IList() = default;
    virtual size_t size() const = 0;
    virtual bool isEmpty() const = 0;
    virtual void add(const T& element) = 0;
    virtual T get(size_t index) const = 0;
    virtual T remove(size_t index) = 0;
};`,
      python: `# Python Abstract Base Class (ABC) for ADT List
from abc import ABC, abstractmethod
from typing import TypeVar, Generic

T = TypeVar('T')

class IList(ABC, Generic[T]):
    @abstractmethod
    def size(self) -> int: ...

    @abstractmethod
    def is_empty(self) -> bool: ...

    @abstractmethod
    def append(self, item: T) -> None: ...

    @abstractmethod
    def get(self, index: int) -> T: ...`,
      java: `// Java List Interface Contract
public interface IList<E> {
    int size();
    boolean isEmpty();
    void add(E element);
    E get(int index);
    E remove(int index);
}`
    }
  },

  'the-list-adt-defining-behavior': {
    slug: 'the-list-adt-defining-behavior',
    title: 'The List ADT: Defining Behavior',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The formal definition of linear ordered sequences and positional contracts.',
    lead: 'The List ADT represents a finite sequence of elements $L = (x_0, x_1, \\dots, x_{n-1})$ where each element has a distinct 0-indexed position (rank), predecessor, and successor.',
    sections: [
      {
        id: 'positional-invariants',
        title: 'Positional Invariants',
        content: `- **Order Preserved**: Elements remain in the exact sequence they were inserted until mutated.
- **Duplicates Permitted**: Unlike Sets, Lists allow identical elements at distinct positions.
- **Dynamic Extensibility**: Size $N \\ge 0$ expands or contracts as operations execute.`
      }
    ],
    code: {
      c: `/* List ADT Function Signatures */
int list_get_first(const List* list);
int list_get_last(const List* list);
bool list_set_at(List* list, size_t index, int new_val);`,
      cpp: `// C++ Positional Query
template <typename T>
class PositionalList : public IList<T> {
    // Defines positional semantics
};`,
      python: `class ListBehaviorDemo:
    def __init__(self):
        self._data = []
    def __getitem__(self, idx):
        return self._data[idx]`,
      java: `public interface ListBehavior<E> {
    E getFirst();
    E getLast();
}`
    }
  },

  'operations-every-list-must-support': {
    slug: 'operations-every-list-must-support',
    title: 'Operations Every List Must Support',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'Detailed taxonomy of query, insertion, deletion, and traversal operations.',
    lead: 'A fully functional List ADT requires a complete suite of operations spanning element inspection, index-based mutation, and lifecycle destruction.',
    sections: [
      {
        id: 'operation-taxonomy',
        title: 'Complete Operation Taxonomy',
        content: `1. **Queries**: \`size()\`, \`isEmpty()\`, \`get(index)\`, \`indexOf(value)\`, \`contains(value)\`
2. **Insertions**: \`addFirst(val)\`, \`addLast(val)\`, \`insert(index, val)\`
3. **Deletions**: \`removeFirst()\`, \`removeLast()\`, \`removeAt(index)\`, \`clear()\`
4. **Lifecycle**: \`create()\`, \`destroy()\` (in C/C++)`
      }
    ],
    code: {
      c: `/* Full C CRUD API for List ADT */
bool list_insert_at(List* list, size_t index, int val);
bool list_remove_at(List* list, size_t index, int* out_val);
size_t list_find(const List* list, int val);`,
      cpp: `// C++ CRUD API
void insertAt(size_t index, const T& item);
T removeAt(size_t index);
int indexOf(const T& item) const;`,
      python: `# Python CRUD methods
def insert(self, index: int, val: any) -> None: ...
def pop(self, index: int = -1) -> any: ...`,
      java: `public interface FullList<E> {
    void add(int index, E element);
    E remove(int index);
    int indexOf(Object o);
}`
    }
  },

  'adt-vs-implementation': {
    slug: 'adt-vs-implementation',
    title: 'ADT vs. Implementation',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'Contrasting the abstract behavioral contract with concrete physical data structures.',
    lead: 'An ADT is the "What" (the interface); a concrete data structure is the "How" (the underlying memory layout and algorithm).',
    sections: [
      {
        id: 'one-adt-multiple-implementations',
        title: 'One Interface, Multiple Physical Engines',
        content: `The List ADT can be physically implemented via:
1. **Dynamic Array (Array List)**: Contiguous memory chunk. Fast random read $O(1)$, slow middle insert $O(N)$.
2. **Singly Linked List**: Dispersed heap nodes with forward pointers. Slow random read $O(N)$, fast head insert $O(1)$.
3. **Doubly Linked List**: Dispersed nodes with \`prev\` and \`next\` pointers. Fast bidirectional traversal.
4. **Skip List / Unrolled Linked List**: Hybrid approaches balancing memory density and pointer jumps.`
      }
    ],
    code: {
      c: `/* Same List ADT, two concrete implementations */
List* create_array_list(size_t initial_cap);
List* create_linked_list(void);`,
      cpp: `// Polymorphic instantiation in C++
std::unique_ptr<IList<int>> list1 = std::make_unique<ArrayList<int>>();
std::unique_ptr<IList<int>> list2 = std::make_unique<LinkedList<int>>();`,
      python: `# Same interface, swapped implementations
list_a: IList = ArrayList()
list_b: IList = LinkedList()`,
      java: `// Java Collections Framework abstraction
List<String> list1 = new ArrayList<>();
List<String> list2 = new LinkedList<>();`
    }
  },

  'implementations-of-the-list-adt': {
    slug: 'implementations-of-the-list-adt',
    title: 'Implementations of the List ADT',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'Architectural overview of contiguous dynamic buffers vs discrete heap-linked chains.',
    lead: 'We contrast the internal memory architectures of Array-based lists and Node-linked lists, highlighting how physical hardware caches interact with each.',
    sections: [
      {
        id: 'architectural-overview',
        title: 'Architectural Comparison',
        content: `| Parameter | Dynamic Array (\`ArrayList\`) | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **Physical Storage** | Contiguous heap array | Dispersed heap nodes | Dispersed heap nodes |
| **Random Indexing** | $O(1)$ (Pointer Arithmetic) | $O(N)$ (Pointer Chasing) | $O(N)$ (Pointer Chasing) |
| **Insert at Index 0** | $O(N)$ (Shift elements) | $O(1)$ (Update head) | $O(1)$ (Update head/prev) |
| **Insert at Tail** | Amortized $O(1)$ | $O(1)$ (with tail ref) | $O(1)$ |
| **Space Overhead** | Extra capacity buffer | $1 \\times 8$ bytes pointer/node | $2 \\times 8$ bytes pointers/node |`
      }
    ],
    code: {
      c: `/* Array List Struct */
typedef struct {
    int* buffer;
    size_t size;
    size_t capacity;
} ArrayList;

/* Linked List Struct */
typedef struct {
    struct Node* head;
    struct Node* tail;
    size_t size;
} LinkedList;`,
      cpp: `// C++ Struct headers
template <typename T>
class ArrayList {
    T* data;
    size_t sz, cap;
};

template <typename T>
class LinkedList {
    Node<T>* head;
    size_t sz;
};`,
      python: `# Array-backed vs Node-backed
class ArrayListImpl:
    def __init__(self):
        self.buffer = [None] * 8
        self.size = 0`,
      java: `public class Implementations {
    // java.util.ArrayList (contiguous array)
    // java.util.LinkedList (doubly linked list)
}`
    }
  },

  'array-list-and-amortized-growth': {
    slug: 'array-list-and-amortized-growth',
    title: 'Array List & Amortized Growth',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'Dynamic resizing mechanics, geometric progression ($2\\times$), and amortized $O(1)$ mathematical proof.',
    lead: 'A dynamic array cannot resize in place if adjacent memory is occupied. When capacity is exceeded, it must allocate a larger buffer, copy all $N$ elements, and free the old buffer. Geometric resizing ensures this expensive copy costs only $O(1)$ on average.',
    sections: [
      {
        id: 'why-geometric-doubling',
        title: 'Why Geometric Doubling ($2\\times$)?',
        content: `If we increased capacity linearly ($C \\to C + k$):
- Resizing occurs every $k$ inserts.
- Copying cost across $N$ inserts: $k + 2k + 3k + \\dots + N \\approx O(N^2)$.
- Average cost per insert: $O(N^2) / N = O(N)$ (Unacceptable!).

When doubling capacity ($C \\to 2C$):
- Resizing occurs at powers of two: $1, 2, 4, 8, \\dots, N$.
- Total copy operations for $N$ inserts: $1 + 2 + 4 + \\dots + N/2 + N < 2N$.
- Amortized cost per insert: $\\frac{2N}{N} = O(1)$!`
      }
    ],
    code: {
      c: `/* Dynamic Array Growth in C */
#include <stdlib.h>

typedef struct {
    int* data;
    size_t size;
    size_t capacity;
} DynArray;

bool dynarray_push_back(DynArray* arr, int value) {
    if (arr->size == arr->capacity) {
        size_t new_cap = (arr->capacity == 0) ? 4 : arr->capacity * 2;
        int* new_data = (int*)realloc(arr->data, new_cap * sizeof(int));
        if (!new_data) return false;
        arr->data = new_data;
        arr->capacity = new_cap;
    }
    arr->data[arr->size++] = value;
    return true;
}`,
      cpp: `// C++ Dynamic Resizing Vector
template <typename T>
void push_back(const T& val) {
    if (size_ == capacity_) {
        size_t new_cap = (capacity_ == 0) ? 2 : capacity_ * 2;
        T* new_data = new T[new_cap];
        for (size_t i = 0; i < size_; ++i) new_data[i] = std::move(data_[i]);
        delete[] data_;
        data_ = new_data;
        capacity_ = new_cap;
    }
    data_[size_++] = val;
}`,
      python: `# Python list uses over-allocation growth factor (~1.125x + 3/6)
import sys

lst = []
for i in range(10):
    lst.append(i)
    # sys.getsizeof(lst) shows capacity jumps geometrically`,
      java: `// Java ArrayList grows by 1.5x (oldCapacity + (oldCapacity >> 1))
public class ArrayListDemo {
    public static void main(String[] args) {
        java.util.ArrayList<Integer> list = new java.util.ArrayList<>(4);
        // Automatically expands when capacity reaches threshold
    }
}`
    }
  }
};
