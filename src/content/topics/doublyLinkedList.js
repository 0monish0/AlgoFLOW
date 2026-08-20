export const doublyLinkedListTopics = {
  'doubly-linked-list-structure': {
    slug: 'doubly-linked-list-structure',
    title: 'Doubly Linked List — Structure & Node Definition',
    category: 'Linked List',
    summary: 'A bidirectional linked list where each node contains explicit references to both successor (next) and predecessor (prev) nodes.',
    lead: 'A Doubly Linked List (DLL) overcomes the unidirectional traversal constraint of singly linked lists by equipping every node with two pointers: `next` and `prev`. This permits $O(1)$ predecessor deletion and bidirectional traversal.',
    sections: [
      {
        id: 'node-layout',
        title: 'Bidirectional Pointer Layout',
        content: `Node structure:
- \`data\`: Element payload
- \`next\`: Pointer to successor (or \`NULL\` at tail)
- \`prev\`: Pointer to predecessor (or \`NULL\` at head)

Memory cost: 2 pointer words per node (16 bytes on 64-bit platforms) plus data payload and allocator overhead.`
      }
    ],
    code: {
      c: `/* Doubly Linked List Definition in C */
#include <stdlib.h>

typedef struct DNode {
    int data;
    struct DNode* prev;
    struct DNode* next;
} DNode;

typedef struct {
    DNode* head;
    DNode* tail;
    size_t size;
} DoublyLinkedList;

DoublyLinkedList* dll_create(void) {
    DoublyLinkedList* list = (DoublyLinkedList*)malloc(sizeof(DoublyLinkedList));
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
    return list;
}`,
      cpp: `// Doubly Linked List Definition in C++
template <typename T>
class DoublyLinkedList {
private:
    struct Node {
        T data;
        Node* prev;
        Node* next;
        explicit Node(const T& val) : data(val), prev(nullptr), next(nullptr) {}
    };

    Node* head_;
    Node* tail_;
    std::size_t size_;
public:
    DoublyLinkedList() : head_(nullptr), tail_(nullptr), size_(0) {}
    // Destructor and methods...
};`,
      python: `"""Doubly Linked List in Python"""
class DNode:
    __slots__ = ('data', 'prev', 'next')
    def __init__(self, data, prev_node=None, next_node=None):
        self.data = data
        self.prev = prev_node
        self.next = next_node

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self._size = 0`,
      java: `/** Doubly Linked List in Java */
public class DoublyLinkedList<E> {
    private static class Node<E> {
        E data;
        Node<E> prev;
        Node<E> next;

        Node(E data, Node<E> prev, Node<E> next) {
            this.data = data;
            this.prev = prev;
            this.next = next;
        }
    }

    private Node<E> head;
    private Node<E> tail;
    private int size;
}`
    },
    complexity: [
      { operation: 'Insert at Head / Tail', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Delete Given Node Pointer', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Memory Overhead per Node', best: '2 pointers', avg: '2 pointers', worst: '2 pointers', space: '2 * sizeof(ptr)' },
    ],
    relatedSlugs: ['doubly-linked-list-insertion', 'doubly-linked-list-deletion', 'singly-linked-list-structure']
  },

  'doubly-linked-list-insertion': {
    slug: 'doubly-linked-list-insertion',
    title: 'Doubly Linked List — Insertion',
    category: 'Linked List',
    summary: '4-pointer rewiring protocol for inserting nodes into doubly linked structures at head, tail, or between adjacent nodes.',
    lead: 'Inserting a node $N$ between existing nodes $A$ and $B$ requires setting 4 pointer updates: $N.\\text{prev} = A$, $N.\\text{next} = B$, $A.\\text{next} = N$, and $B.\\text{prev} = N$.',
    interactiveVisualizer: 'dll-insertion',
    sections: [
      {
        id: 'four-way-pointer-wiring',
        title: 'Four-Way Pointer Splicing',
        content: `When inserting $N$ after node $A$:
1. $N.\\text{next} = A.\\text{next}$
2. $N.\\text{prev} = A$
3. If $A.\\text{next} \\ne \\text{NULL}$, then $A.\\text{next}.\\text{prev} = N$; otherwise $\\text{tail} = N$.
4. $A.\\text{next} = N$.`
      }
    ],
    code: {
      c: `/* Insertion in Doubly Linked List in C */
#include <stdlib.h>
#include <stdbool.h>

bool dll_push_front(DoublyLinkedList* list, int value) {
    DNode* node = (DNode*)malloc(sizeof(DNode));
    if (!node) return false;
    node->data = value;
    node->prev = NULL;
    node->next = list->head;

    if (list->head) {
        list->head->prev = node;
    } else {
        list->tail = node;
    }
    list->head = node;
    list->size++;
    return true;
}

bool dll_push_back(DoublyLinkedList* list, int value) {
    DNode* node = (DNode*)malloc(sizeof(DNode));
    if (!node) return false;
    node->data = value;
    node->next = NULL;
    node->prev = list->tail;

    if (list->tail) {
        list->tail->next = node;
    } else {
        list->head = node;
    }
    list->tail = node;
    list->size++;
    return true;
}`,
      cpp: `// Insertion in C++ Doubly Linked List
template <typename T>
void DoublyLinkedList<T>::push_front(const T& val) {
    Node* node = new Node(val);
    node->next = head_;
    if (head_) {
        head_->prev = node;
    } else {
        tail_ = node;
    }
    head_ = node;
    ++size_;
}

template <typename T>
void DoublyLinkedList<T>::push_back(const T& val) {
    Node* node = new Node(val);
    node->prev = tail_;
    if (tail_) {
        tail_->next = node;
    } else {
        head_ = node;
    }
    tail_ = node;
    ++size_;
}`,
      python: `"""Insertion in Python Doubly Linked List"""
def push_front(self, val: Any) -> None:
    node = DNode(val, prev_node=None, next_node=self.head)
    if self.head is not None:
        self.head.prev = node
    else:
        self.tail = node
    self.head = node
    self._size += 1

def push_back(self, val: Any) -> None:
    node = DNode(val, prev_node=self.tail, next_node=None)
    if self.tail is not None:
        self.tail.next = node
    else:
        self.head = node
    self.tail = node
    self._size += 1`,
      java: `/** Insertion in Java Doubly Linked List */
public void addFirst(E element) {
    Node<E> newNode = new Node<>(element, null, head);
    if (head != null) {
        head.prev = newNode;
    } else {
        tail = newNode;
    }
    head = newNode;
    size++;
}

public void addLast(E element) {
    Node<E> newNode = new Node<>(element, tail, null);
    if (tail != null) {
        tail.next = newNode;
    } else {
        head = newNode;
    }
    tail = newNode;
    size++;
}`
    },
    complexity: [
      { operation: 'Push Front (Head)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Push Back (Tail)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Insert After Node Ptr', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    ],
    relatedSlugs: ['doubly-linked-list-structure', 'doubly-linked-list-deletion', 'singly-linked-list-insertion']
  },

  'doubly-linked-list-deletion': {
    slug: 'doubly-linked-list-deletion',
    title: 'Doubly Linked List — Deletion',
    category: 'Linked List',
    summary: 'Direct node unlinking and garbage collection without requiring predecessor traversal.',
    lead: 'In a Doubly Linked List, deleting a target node $X$ is an $O(1)$ operation when a pointer to $X$ is already available, because $X.\\text{prev}$ provides direct access to its predecessor without linear scanning.',
    sections: [
      {
        id: 'direct-node-unlinking',
        title: 'O(1) Direct Node Unlinking Protocol',
        content: `Given pointer to node $X$:
1. If $X.\\text{prev} \\ne \\text{NULL}$, $X.\\text{prev}.\\text{next} = X.\\text{next}$; else $\\text{head} = X.\\text{next}$.
2. If $X.\\text{next} \\ne \\text{NULL}$, $X.\\text{next}.\\text{prev} = X.\\text{prev}$; else $\\text{tail} = X.\\text{prev}$.
3. Deallocate $X$.`
      }
    ],
    code: {
      c: `/* O(1) Node Unlink in C */
void dll_unlink_node(DoublyLinkedList* list, DNode* node) {
    if (!list || !node) return;

    if (node->prev) {
        node->prev->next = node->next;
    } else {
        list->head = node->next; // unlinking head
    }

    if (node->next) {
        node->next->prev = node->prev;
    } else {
        list->tail = node->prev; // unlinking tail
    }

    free(node);
    list->size--;
}`,
      cpp: `// O(1) Node Unlink in C++
template <typename T>
void DoublyLinkedList<T>::unlink(Node* node) {
    if (!node) return;

    if (node->prev) {
        node->prev->next = node->next;
    } else {
        head_ = node->next;
    }

    if (node->next) {
        node->next->prev = node->prev;
    } else {
        tail_ = node->prev;
    }

    delete node;
    --size_;
}`,
      python: `"""O(1) Node Unlink in Python"""
def unlink_node(self, node: DNode) -> Any:
    if node is None:
        return
    if node.prev:
        node.prev.next = node.next
    else:
        self.head = node.next

    if node.next:
        node.next.prev = node.prev
    else:
        self.tail = node.prev

    self._size -= 1
    return node.data`,
      java: `/** O(1) Node Unlink in Java */
E unlink(Node<E> x) {
    final E element = x.data;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;

    if (prev == null) {
        head = next;
    } else {
        prev.next = next;
        x.prev = null;
    }

    if (next == null) {
        tail = prev;
    } else {
        next.prev = prev;
        x.next = null;
    }

    x.data = null;
    size--;
    return element;
}`
    },
    complexity: [
      { operation: 'Unlink Given Node Pointer', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Pop Front / Back', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Delete by Index k', best: 'O(1) [at head/tail]', avg: 'O(n/2) = O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['doubly-linked-list-insertion', 'doubly-linked-list-traversal', 'singly-linked-list-deletion']
  },

  'doubly-linked-list-traversal': {
    slug: 'doubly-linked-list-traversal',
    title: 'Doubly Linked List — Traversal',
    category: 'Linked List',
    summary: 'Forward and reverse bidirectional traversal strategies and optimization techniques.',
    lead: 'Doubly linked lists enable both forward ($`head \\to tail`$) and backward ($`tail \\to head`$) traversals, as well as optimizing index searches by starting from whichever end is closer to the requested index.',
    sections: [
      {
        id: 'bidirectional-search-optimization',
        title: 'Bidirectional Search Optimization',
        content: `When accessing element at index $k$:
- If $k < n/2$, start at \`head\` and traverse forward $k$ steps.
- If $k \\ge n/2$, start at \`tail\` and traverse backward $n - 1 - k$ steps.
This halves average traversal steps to $n/4$.`
      }
    ],
    code: {
      c: `/* Bidirectional Access in C */
DNode* dll_get_node(const DoublyLinkedList* list, size_t index) {
    if (index >= list->size) return NULL;
    
    if (index < list->size / 2) {
        // Forward from head
        DNode* curr = list->head;
        for (size_t i = 0; i < index; ++i) curr = curr->next;
        return curr;
    } else {
        // Backward from tail
        DNode* curr = list->tail;
        for (size_t i = list->size - 1; i > index; --i) curr = curr->prev;
        return curr;
    }
}`,
      cpp: `// Bidirectional Access in C++
template <typename T>
typename DoublyLinkedList<T>::Node* DoublyLinkedList<T>::nodeAt(std::size_t index) const {
    if (index >= size_) throw std::out_of_range("Index out of bounds");
    if (index < size_ / 2) {
        Node* curr = head_;
        for (std::size_t i = 0; i < index; ++i) curr = curr->next;
        return curr;
    } else {
        Node* curr = tail_;
        for (std::size_t i = size_ - 1; i > index; --i) curr = curr->prev;
        return curr;
    }
}`,
      python: `"""Bidirectional Access in Python"""
def _get_node(self, index: int) -> DNode:
    if not 0 <= index < self._size:
        raise IndexError("Index out of bounds")
    if index < self._size // 2:
        curr = self.head
        for _ in range(index):
            curr = curr.next
    else:
        curr = self.tail
        for _ in range(self._size - 1, index, -1):
            curr = curr.prev
    return curr`,
      java: `/** Bidirectional Access in Java */
Node<E> node(int index) {
    if (index < (size >> 1)) {
        Node<E> x = head;
        for (int i = 0; i < index; i++) x = x.next;
        return x;
    } else {
        Node<E> x = tail;
        for (int i = size - 1; i > index; i--) x = x.prev;
        return x;
    }
}`
    },
    complexity: [
      { operation: 'Bidirectional Lookup (index k)', best: 'O(1)', avg: 'O(n/4) = O(n)', worst: 'O(n/2) = O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['doubly-linked-list-structure', 'doubly-linked-list-insertion', 'circular-linked-list']
  }
};
