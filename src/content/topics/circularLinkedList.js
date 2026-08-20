export const circularLinkedListTopics = {
  'circular-linked-list': {
    slug: 'circular-linked-list',
    title: 'Circular Linked List — Singly & Doubly Circular',
    category: 'Linked List',
    summary: 'Linked list variants where the tail node points back to the head (or head prev points to tail), eliminating NULL pointers and enabling continuous cyclic processing.',
    lead: 'In a Circular Linked List, the sequence forms a closed loop. There is no terminal `NULL` pointer: following `next` pointers from any starting node will continually cycle through all elements indefinitely.',
    sections: [
      {
        id: 'tail-pointer-pattern',
        title: 'The Single-Tail-Pointer Pattern',
        content: `A singly circular list can be maintained using just a single pointer to \`tail\`:
- \`tail->next\` is inherently the \`head\`!
- This gives $O(1)$ access to **both** the head and the tail without maintaining a separate head pointer.`
      },
      {
        id: 'cycle-detection',
        title: "Floyd's Tortoise & Hare Cycle Detection",
        content: `To detect or verify cycles without extra memory:
- Maintain two pointers: \`slow\` (advances 1 step) and \`fast\` (advances 2 steps).
- If \`slow == fast\` at any point, a cycle exists. If \`fast == NULL\` or \`fast->next == NULL\`, the list is linear ($O(n)$ time, $O(1)$ space).`
      }
    ],
    code: {
      c: `/* Singly Circular Linked List using Tail Pointer in C */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct CNode {
    int data;
    struct CNode* next;
} CNode;

typedef struct {
    CNode* tail; // tail->next is the head
    size_t size;
} CircularList;

CircularList* cl_create(void) {
    CircularList* list = (CircularList*)malloc(sizeof(CircularList));
    list->tail = NULL;
    list->size = 0;
    return list;
}

bool cl_insert_head(CircularList* list, int value) {
    CNode* node = (CNode*)malloc(sizeof(CNode));
    if (!node) return false;
    node->data = value;

    if (!list->tail) {
        node->next = node;
        list->tail = node;
    } else {
        node->next = list->tail->next; // link to head
        list->tail->next = node;       // tail now points to new head
    }
    list->size++;
    return true;
}

bool cl_insert_tail(CircularList* list, int value) {
    if (!cl_insert_head(list, value)) return false;
    list->tail = list->tail->next; // Advance tail to newly inserted head
    return true;
}`,
      cpp: `// Circular Linked List in C++
template <typename T>
class CircularList {
private:
    struct Node {
        T data;
        Node* next;
        explicit Node(const T& val) : data(val), next(nullptr) {}
    };
    Node* tail_;
    std::size_t size_;

public:
    CircularList() : tail_(nullptr), size_(0) {}

    void push_front(const T& val) {
        Node* node = new Node(val);
        if (!tail_) {
            node->next = node;
            tail_ = node;
        } else {
            node->next = tail_->next;
            tail_->next = node;
        }
        ++size_;
    }

    void push_back(const T& val) {
        push_front(val);
        tail_ = tail_->next;
    }
};`,
      python: `"""Circular Linked List in Python"""
class CNode:
    __slots__ = ('data', 'next')
    def __init__(self, data, next_node=None):
        self.data = data
        self.next = next_node

class CircularList:
    def __init__(self):
        self.tail = None
        self._size = 0

    def push_front(self, val):
        node = CNode(val)
        if self.tail is None:
            node.next = node
            self.tail = node
        else:
            node.next = self.tail.next
            self.tail.next = node
        self._size += 1

    def push_back(self, val):
        self.push_front(val)
        self.tail = self.tail.next`,
      java: `/** Circular Linked List in Java */
public class CircularList<E> {
    private static class Node<E> {
        E data;
        Node<E> next;
        Node(E data) { this.data = data; }
    }

    private Node<E> tail;
    private int size;

    public void addFirst(E val) {
        Node<E> node = new Node<>(val);
        if (tail == null) {
            node.next = node;
            tail = node;
        } else {
            node.next = tail.next;
            tail.next = node;
        }
        size++;
    }

    public void addLast(E val) {
        addFirst(val);
        tail = tail.next;
    }
}`
    },
    complexity: [
      { operation: 'Insert at Head (with tail ptr)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Insert at Tail (with tail ptr)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Floyd Cycle Detection', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['singly-linked-list-structure', 'doubly-linked-list-structure', 'applications-use-cases']
  }
};
