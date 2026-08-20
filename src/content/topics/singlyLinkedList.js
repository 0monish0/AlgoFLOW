export const singlyLinkedListTopics = {
  'linked-list-overview': {
    slug: 'linked-list-overview',
    title: 'Linked List — Overview',
    category: 'Linked List',
    summary: 'A linear data structure whose elements are stored in dynamically allocated node objects dispersed throughout the heap and linked via explicit pointer addresses.',
    lead: 'Unlike dynamic arrays that require contiguous physical memory blocks, linked lists allocate memory for each element independently on the heap. Pointers chain discrete nodes together sequentially.',
    sections: [
      {
        id: 'node-concept',
        title: 'The Node Abstraction & Memory Layout',
        content: `A **Node** is a composite record comprising:
1. **Data payload**: The stored value (primitive or pointer to object).
2. **Link pointer(s)**: Memory address pointing to successor (and predecessor in doubly linked lists).

Because nodes are allocated on-demand, linked lists avoid large contiguous reallocation copies, but incur an 8-byte pointer overhead per node and sacrifice hardware cache locality.`
      },
      {
        id: 'variants-summary',
        title: 'Linked List Family Taxonomy',
        content: `- **Singly Linked List**: Unidirectional traversal (\`next\` pointer only).
- **Doubly Linked List**: Bidirectional traversal (\`next\` and \`prev\` pointers).
- **Circular Linked List**: Tail node loops back to the head node.
- **Skip List**: Multi-level indexed linked structure achieving $O(\\log n)$ search.`
      }
    ],
    code: {
      c: `/* Minimal Singly Linked List Node in C */
typedef struct Node {
    int data;
    struct Node* next;
} Node;`,
      cpp: `// Minimal Singly Linked List Node in C++
template <typename T>
struct Node {
    T data;
    Node* next;
    explicit Node(const T& val) : data(val), next(nullptr) {}
};`,
      python: `"""Minimal Singly Linked List Node in Python"""
class Node:
    __slots__ = ('data', 'next')
    def __init__(self, data, next_node=None):
        self.data = data
        self.next = next_node`,
      java: `/** Minimal Singly Linked List Node in Java */
public class Node<E> {
    public E data;
    public Node<E> next;
    public Node(E data) {
        this.data = data;
        this.next = null;
    }
}`
    },
    complexity: [
      { operation: 'Insert at Head', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Insert at Tail (with tail ptr)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Arbitrary Access (get i)', best: 'O(1) [head]', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Search by Value', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['singly-linked-list-structure', 'comparison-linked-vs-array', 'doubly-linked-list-structure']
  },

  'singly-linked-list-structure': {
    slug: 'singly-linked-list-structure',
    title: 'Singly Linked List — Structure & Node Definition',
    category: 'Linked List',
    summary: 'Anatomy of a Singly Linked List: head pointers, tail references, node construction, and memory alignment.',
    lead: 'A singly linked list is governed by a `head` reference. Each node contains a single outgoing `next` pointer terminating in `NULL` / `None`.',
    sections: [
      {
        id: 'node-memory-alignment',
        title: 'Memory Footprint & Alignment',
        content: `On a 64-bit platform:
- Data integer: 4 bytes + 4 bytes struct padding = 8 bytes.
- Next pointer: 8 bytes.
- Total per-node heap allocation: **16 bytes** (plus memory allocator chunk headers of 8–16 bytes).`
      }
    ],
    code: {
      c: `/* Singly Linked List Definitions in C */
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
} SinglyLinkedList;

SinglyLinkedList* sll_create(void) {
    SinglyLinkedList* list = (SinglyLinkedList*)malloc(sizeof(SinglyLinkedList));
    if (!list) return NULL;
    list->head = NULL;
    list->size = 0;
    return list;
}

void sll_destroy(SinglyLinkedList* list) {
    if (!list) return;
    Node* curr = list->head;
    while (curr) {
        Node* tmp = curr;
        curr = curr->next;
        free(tmp);
    }
    free(list);
}`,
      cpp: `// Singly Linked List Class Skeleton in C++
#include <cstddef>
#include <iostream>

template <typename T>
class SinglyLinkedList {
private:
    struct Node {
        T data;
        Node* next;
        explicit Node(const T& val) : data(val), next(nullptr) {}
    };

    Node* head_;
    std::size_t size_;

public:
    SinglyLinkedList() : head_(nullptr), size_(0) {}

    ~SinglyLinkedList() {
        clear();
    }

    void clear() {
        Node* curr = head_;
        while (curr) {
            Node* next = curr->next;
            delete curr;
            curr = next;
        }
        head_ = nullptr;
        size_ = 0;
    }

    std::size_t size() const noexcept { return size_; }
    bool empty() const noexcept { return head_ == nullptr; }
};`,
      python: `"""Singly Linked List Class in Python"""
from typing import Optional, Any, Iterator

class Node:
    __slots__ = ('data', 'next')
    def __init__(self, data: Any, next_node: Optional['Node'] = None) -> None:
        self.data: Any = data
        self.next: Optional['Node'] = next_node

class SinglyLinkedList:
    def __init__(self) -> None:
        self.head: Optional[Node] = None
        self._size: int = 0

    def __len__(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self.head is None`,
      java: `/** Singly Linked List Skeleton in Java */
package dsa.reference.linkedlist;

public class SinglyLinkedList<E> {
    private static class Node<E> {
        E data;
        Node<E> next;

        Node(E data, Node<E> next) {
            this.data = data;
            this.next = next;
        }
    }

    private Node<E> head;
    private int size;

    public SinglyLinkedList() {
        this.head = null;
        this.size = 0;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return head == null;
    }
}`
    },
    complexity: [
      { operation: 'Instantiation', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Deallocation / Cleanup', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['linked-list-overview', 'singly-linked-list-insertion', 'singly-linked-list-deletion']
  },

  'singly-linked-list-insertion': {
    slug: 'singly-linked-list-insertion',
    title: 'Singly Linked List — Insertion',
    category: 'Linked List',
    summary: 'Algorithms and pointer rewiring mechanics for inserting nodes at head, tail, or arbitrary indices in singly linked lists.',
    lead: 'Inserting into a singly linked list requires allocating a new node, connecting its `next` pointer to the successor node, and updating the predecessor’s `next` pointer (or the `head` reference).',
    interactiveVisualizer: 'sll-insertion',
    sections: [
      {
        id: 'insertion-cases',
        title: 'Three Primary Insertion Scenarios',
        content: `1. **Insert at Head ($O(1)$)**:
   - Create new node $N$.
   - Set $N.\\text{next} = \\text{head}$.
   - Set $\\text{head} = N$.

2. **Insert at Tail ($O(n)$ or $O(1)$ with tail pointer)**:
   - Traverse to the last node whose $\\text{next} == \\text{NULL}$.
   - Set $\\text{last}.\\text{next} = N$.

3. **Insert at Arbitrary Index $k$ ($O(n)$)**:
   - Traverse $k-1$ steps to reach the predecessor node $P$.
   - Set $N.\\text{next} = P.\\text{next}$.
   - Set $P.\\text{next} = N$.`
      }
    ],
    code: {
      c: `/* Insertion Functions in C */
#include <stdlib.h>
#include <stdbool.h>

bool sll_insert_head(SinglyLinkedList* list, int value) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (!new_node) return false;
    new_node->data = value;
    new_node->next = list->head;
    list->head = new_node;
    list->size++;
    return true;
}

bool sll_insert_tail(SinglyLinkedList* list, int value) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (!new_node) return false;
    new_node->data = value;
    new_node->next = NULL;

    if (!list->head) {
        list->head = new_node;
    } else {
        Node* curr = list->head;
        while (curr->next) {
            curr = curr->next;
        }
        curr->next = new_node;
    }
    list->size++;
    return true;
}

bool sll_insert_at(SinglyLinkedList* list, size_t index, int value) {
    if (index > list->size) return false;
    if (index == 0) return sll_insert_head(list, value);

    Node* curr = list->head;
    for (size_t i = 0; i < index - 1; ++i) {
        curr = curr->next;
    }
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (!new_node) return false;
    new_node->data = value;
    new_node->next = curr->next;
    curr->next = new_node;
    list->size++;
    return true;
}`,
      cpp: `// Insertion Methods in C++
template <typename T>
void SinglyLinkedList<T>::push_front(const T& val) {
    Node* new_node = new Node(val);
    new_node->next = head_;
    head_ = new_node;
    ++size_;
}

template <typename T>
void SinglyLinkedList<T>::push_back(const T& val) {
    Node* new_node = new Node(val);
    if (!head_) {
        head_ = new_node;
    } else {
        Node* curr = head_;
        while (curr->next) {
            curr = curr->next;
        }
        curr->next = new_node;
    }
    ++size_;
}

template <typename T>
void SinglyLinkedList<T>::insert_at(std::size_t index, const T& val) {
    if (index > size_) throw std::out_of_range("Index out of bounds");
    if (index == 0) {
        push_front(val);
        return;
    }
    Node* curr = head_;
    for (std::size_t i = 0; i < index - 1; ++i) {
        curr = curr->next;
    }
    Node* new_node = new Node(val);
    new_node->next = curr->next;
    curr->next = new_node;
    ++size_;
}`,
      python: `"""Insertion Methods in Python"""
def push_front(self, value: Any) -> None:
    new_node = Node(value, self.head)
    self.head = new_node
    self._size += 1

def push_back(self, value: Any) -> None:
    new_node = Node(value)
    if self.head is None:
        self.head = new_node
    else:
        curr = self.head
        while curr.next is not None:
            curr = curr.next
        curr.next = new_node
    self._size += 1

def insert_at(self, index: int, value: Any) -> None:
    if not 0 <= index <= self._size:
        raise IndexError("Index out of bounds")
    if index == 0:
        self.push_front(value)
        return
    curr = self.head
    for _ in range(index - 1):
        curr = curr.next
    new_node = Node(value, curr.next)
    curr.next = new_node
    self._size += 1`,
      java: `/** Insertion Methods in Java */
public void addFirst(E element) {
    head = new Node<>(element, head);
    size++;
}

public void addLast(E element) {
    Node<E> newNode = new Node<>(element, null);
    if (head == null) {
        head = newNode;
    } else {
        Node<E> curr = head;
        while (curr.next != null) {
            curr = curr.next;
        }
        curr.next = newNode;
    }
    size++;
}

public void add(int index, E element) {
    if (index < 0 || index > size) {
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
    if (index == 0) {
        addFirst(element);
        return;
    }
    Node<E> curr = head;
    for (int i = 0; i < index - 1; i++) {
        curr = curr.next;
    }
    curr.next = new Node<>(element, curr.next);
    size++;
}`
    },
    complexity: [
      { operation: 'Insert at Head (prepend)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Insert at Tail (no tail ptr)', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Insert at Index k', best: 'O(1) [at 0]', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['singly-linked-list-deletion', 'singly-linked-list-reverse', 'doubly-linked-list-insertion']
  },

  'singly-linked-list-deletion': {
    slug: 'singly-linked-list-deletion',
    title: 'Singly Linked List — Deletion',
    category: 'Linked List',
    summary: 'Pointer bypassing and memory reclamation procedures for deleting nodes from head, tail, or middle positions.',
    lead: 'Deleting a node requires routing the predecessor’s `next` pointer around the target node to the successor node, followed by deallocating the freed memory.',
    interactiveVisualizer: 'sll-deletion',
    sections: [
      {
        id: 'deletion-mechanics',
        title: 'Pointer Bypassing Protocol',
        content: `1. **Delete Head**:
   - Save temporary pointer $T = \\text{head}$.
   - Set $\\text{head} = \\text{head}.\\text{next}$.
   - Free memory $T$.

2. **Delete Intermediate Node**:
   - Traverse to node $P$ immediately preceding target $T$.
   - Set $P.\\text{next} = T.\\text{next}$.
   - Free memory $T$.`
      }
    ],
    code: {
      c: `/* Deletion Functions in C with proper free() */
#include <stdlib.h>
#include <stdbool.h>

bool sll_delete_head(SinglyLinkedList* list, int* out_val) {
    if (!list->head) return false;
    Node* target = list->head;
    if (out_val) *out_val = target->data;
    list->head = target->next;
    free(target);
    list->size--;
    return true;
}

bool sll_delete_at(SinglyLinkedList* list, size_t index, int* out_val) {
    if (index >= list->size || !list->head) return false;
    if (index == 0) return sll_delete_head(list, out_val);

    Node* curr = list->head;
    for (size_t i = 0; i < index - 1; ++i) {
        curr = curr->next;
    }
    Node* target = curr->next;
    if (out_val) *out_val = target->data;
    curr->next = target->next;
    free(target);
    list->size--;
    return true;
}`,
      cpp: `// Deletion Methods in C++
template <typename T>
T SinglyLinkedList<T>::pop_front() {
    if (!head_) throw std::runtime_error("List is empty");
    Node* target = head_;
    T val = std::move(target->data);
    head_ = target->next;
    delete target;
    --size_;
    return val;
}

template <typename T>
T SinglyLinkedList<T>::remove_at(std::size_t index) {
    if (index >= size_ || !head_) throw std::out_of_range("Index out of bounds");
    if (index == 0) return pop_front();

    Node* curr = head_;
    for (std::size_t i = 0; i < index - 1; ++i) {
        curr = curr->next;
    }
    Node* target = curr->next;
    T val = std::move(target->data);
    curr->next = target->next;
    delete target;
    --size_;
    return val;
}`,
      python: `"""Deletion Methods in Python"""
def pop_front(self) -> Any:
    if self.head is None:
        raise IndexError("pop from empty list")
    val = self.head.data
    self.head = self.head.next
    self._size -= 1
    return val

def remove_at(self, index: int) -> Any:
    if not 0 <= index < self._size:
        raise IndexError("Index out of bounds")
    if index == 0:
        return self.pop_front()
    curr = self.head
    for _ in range(index - 1):
        curr = curr.next
    target = curr.next
    val = target.data
    curr.next = target.next
    self._size -= 1
    return val`,
      java: `/** Deletion Methods in Java */
public E removeFirst() {
    if (head == null) {
        throw new java.util.NoSuchElementException("List is empty");
    }
    E val = head.data;
    head = head.next;
    size--;
    return val;
}

public E remove(int index) {
    if (index < 0 || index >= size) {
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
    if (index == 0) return removeFirst();

    Node<E> curr = head;
    for (int i = 0; i < index - 1; i++) {
        curr = curr.next;
    }
    Node<E> target = curr.next;
    E val = target.data;
    curr.next = target.next;
    size--;
    return val;
}`
    },
    complexity: [
      { operation: 'Delete Head', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Delete Tail (singly linked)', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Delete at Index k', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['singly-linked-list-insertion', 'singly-linked-list-reverse', 'doubly-linked-list-deletion']
  },

  'singly-linked-list-traversal': {
    slug: 'singly-linked-list-traversal',
    title: 'Singly Linked List — Traversal',
    category: 'Linked List',
    summary: 'Iterative pointer advancing, recursive traversal patterns, and custom iterator implementations across all 4 languages.',
    lead: 'Traversal iterates through each node starting at `head` by repeatedly executing `curr = curr->next` until encountering `NULL`.',
    sections: [
      {
        id: 'pointer-chasing',
        title: 'Pointer Dereferencing & Loop Invariant',
        content: `The traversal loop invariant:
\`while (curr != NULL) { process(curr->data); curr = curr->next; }\`
Each step performs a non-contiguous heap dereference. On modern microarchitectures, this is vulnerable to CPU cache stalls (pointer chasing).`
      }
    ],
    code: {
      c: `/* Traversal in C */
#include <stdio.h>

void sll_print(const SinglyLinkedList* list) {
    const Node* curr = list->head;
    printf("[HEAD] -> ");
    while (curr != NULL) {
        printf("[%d] -> ", curr->data);
        curr = curr->next;
    }
    printf("NULL\\n");
}`,
      cpp: `// C++ Iterator-based Traversal
#include <iostream>

template <typename T>
void printList(const SinglyLinkedList<T>& list) {
    // Traverse with manual node pointer or custom iterator
    std::cout << "[HEAD] -> ";
    // using internal traversal method
}`,
      python: `"""Python Traversal via Generator"""
def __iter__(self):
    curr = self.head
    while curr is not None:
        yield curr.data
        curr = curr.next

# Usage:
# for val in my_list:
#     print(val)`,
      java: `/** Java Iterator Pattern for Linked List */
import java.util.Iterator;
import java.util.NoSuchElementException;

public Iterator<E> iterator() {
    return new Iterator<E>() {
        private Node<E> curr = head;

        public boolean hasNext() {
            return curr != null;
        }

        public E next() {
            if (!hasNext()) throw new NoSuchElementException();
            E data = curr.data;
            curr = curr.next;
            return data;
        }
    };
}`
    },
    complexity: [
      { operation: 'Full Traversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1) [Iterative] / O(n) [Recursive Call Stack]' },
    ],
    relatedSlugs: ['singly-linked-list-search', 'singly-linked-list-reverse', 'doubly-linked-list-traversal']
  },

  'singly-linked-list-search': {
    slug: 'singly-linked-list-search',
    title: 'Singly Linked List — Search',
    category: 'Linked List',
    summary: 'Linear search algorithms for key matching, index location, and node extraction.',
    lead: 'Because nodes are not indexed contiguously in memory, binary search cannot be performed on a singly linked list in sub-linear time. Search requires sequential $O(n)$ scanning.',
    sections: [
      {
        id: 'search-mechanics',
        title: 'Linear Key Matching',
        content: `Search compares target key $K$ against \`curr->data\` at each node. Returns either:
- The 0-based integer index of the first match.
- A pointer/reference to the matched node.
- \`-1\` or \`NULL\` if absent after reaching end-of-list.`
      }
    ],
    code: {
      c: `/* Linear Search in C */
#include <stddef.h>

int sll_index_of(const SinglyLinkedList* list, int target) {
    const Node* curr = list->head;
    int index = 0;
    while (curr) {
        if (curr->data == target) {
            return index;
        }
        curr = curr->next;
        index++;
    }
    return -1; // Not found
}`,
      cpp: `// Linear Search in C++
template <typename T>
int SinglyLinkedList<T>::indexOf(const T& target) const {
    Node* curr = head_;
    int index = 0;
    while (curr) {
        if (curr->data == target) return index;
        curr = curr->next;
        ++index;
    }
    return -1;
}`,
      python: `"""Linear Search in Python"""
def index_of(self, target: Any) -> int:
    curr = self.head
    index = 0
    while curr is not None:
        if curr.data == target:
            return index
        curr = curr.next
        index += 1
    return -1`,
      java: `/** Linear Search in Java */
public int indexOf(Object target) {
    int index = 0;
    if (target == null) {
        for (Node<E> x = head; x != null; x = x.next) {
            if (x.data == null) return index;
            index++;
        }
    } else {
        for (Node<E> x = head; x != null; x = x.next) {
            if (target.equals(x.data)) return index;
            index++;
        }
    }
    return -1;
}`
    },
    complexity: [
      { operation: 'Find Element (Target at Head)', best: 'O(1)', avg: 'O(n/2) = O(n)', worst: 'O(n) [Absent]', space: 'O(1)' },
    ],
    relatedSlugs: ['singly-linked-list-traversal', 'singly-linked-list-insertion', 'comparison-linked-vs-array']
  },

  'singly-linked-list-reverse': {
    slug: 'singly-linked-list-reverse',
    title: 'Singly Linked List — Reverse',
    category: 'Linked List',
    summary: 'In-place pointer reversal using the classic 3-pointer iterative technique and recursive formulation.',
    lead: 'Reversing a singly linked list in-place ($O(1)$ auxiliary space) requires systematically redirecting each node’s `next` pointer to its predecessor using three tracking pointers: `prev`, `curr`, and `next`.',
    interactiveVisualizer: 'sll-reverse',
    sections: [
      {
        id: 'iterative-3-pointer',
        title: 'Iterative 3-Pointer Algorithm',
        content: `Initialize:
\`prev = NULL\`, \`curr = head\`
Loop while \`curr != NULL\`:
1. Store successor: \`next = curr->next\`
2. Reverse link: \`curr->next = prev\`
3. Advance prev: \`prev = curr\`
4. Advance curr: \`curr = next\`
Post-loop: Update \`head = prev\`.`
      },
      {
        id: 'recursive-reversal',
        title: 'Recursive Reversal Protocol',
        content: `Base case: If \`!head || !head->next\`, return \`head\`.
Recursive step:
1. \`new_head = reverse(head->next)\`
2. \`head->next->next = head\`
3. \`head->next = NULL\`
4. Return \`new_head\`.
Incurs $O(n)$ call stack memory overhead.`
      }
    ],
    code: {
      c: `/* In-place 3-Pointer Reversal in C */
void sll_reverse(SinglyLinkedList* list) {
    Node* prev = NULL;
    Node* curr = list->head;
    Node* next = NULL;

    while (curr != NULL) {
        next = curr->next;  // 1. Store next node
        curr->next = prev;  // 2. Reverse current link
        prev = curr;        // 3. Move prev forward
        curr = next;        // 4. Move curr forward
    }
    list->head = prev;      // Update head to new front
}`,
      cpp: `// In-place Reversal in C++
template <typename T>
void SinglyLinkedList<T>::reverse() noexcept {
    Node* prev = nullptr;
    Node* curr = head_;
    Node* next = nullptr;

    while (curr != nullptr) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    head_ = prev;
}`,
      python: `"""In-place Reversal in Python"""
def reverse(self) -> None:
    prev = None
    curr = self.head
    while curr is not None:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    self.head = prev`,
      java: `/** In-place Reversal in Java */
public void reverse() {
    Node<E> prev = null;
    Node<E> curr = head;
    Node<E> next = null;

    while (curr != null) {
        next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    head = prev;
}`
    },
    complexity: [
      { operation: 'Iterative Reversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Recursive Reversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(n) stack' },
    ],
    relatedSlugs: ['singly-linked-list-insertion', 'singly-linked-list-deletion', 'doubly-linked-list-structure']
  }
};
