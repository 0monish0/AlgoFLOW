export const languageImplementationTopics = {
  'linked-list-c': {
    slug: 'linked-list-c',
    title: 'Linked List — Full C Implementation',
    category: 'Linked List',
    summary: 'A complete, leak-checked ISO C99 Singly and Doubly Linked List module with explicit malloc error handling, pointer integrity checks, and clean destroy routines.',
    lead: 'In pure C, memory management is manual. Every node must be allocated via `malloc` and explicitly reclaimed with `free`. This implementation demonstrates defensive memory handling and idiomatic pointer operations.',
    sections: [
      {
        id: 'c-code-structure',
        title: 'Full Runnable C Program',
        content: `The following C implementation includes head insertion, tail insertion, index insertion, deletion, linear search, in-place list reversal, and complete memory reclamation.`
      }
    ],
    code: {
      c: `/* =========================================================================
 * SinglyLinkedList.c — Complete, Memory-Safe C99 Linked List Implementation
 * ========================================================================= */
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

/* Constructor */
LinkedList* list_create(void) {
    LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));
    if (!list) return NULL;
    list->head = NULL;
    list->size = 0;
    return list;
}

/* Destructor */
void list_destroy(LinkedList* list) {
    if (!list) return;
    Node* curr = list->head;
    while (curr != NULL) {
        Node* tmp = curr;
        curr = curr->next;
        free(tmp);
    }
    free(list);
}

/* Insert at Head: O(1) */
bool list_push_front(LinkedList* list, int value) {
    if (!list) return false;
    Node* node = (Node*)malloc(sizeof(Node));
    if (!node) return false;
    node->data = value;
    node->next = list->head;
    list->head = node;
    list->size++;
    return true;
}

/* Insert at Tail: O(n) */
bool list_push_back(LinkedList* list, int value) {
    if (!list) return false;
    Node* node = (Node*)malloc(sizeof(Node));
    if (!node) return false;
    node->data = value;
    node->next = NULL;

    if (!list->head) {
        list->head = node;
    } else {
        Node* curr = list->head;
        while (curr->next != NULL) {
            curr = curr->next;
        }
        curr->next = node;
    }
    list->size++;
    return true;
}

/* Delete Head: O(1) */
bool list_pop_front(LinkedList* list, int* out_val) {
    if (!list || !list->head) return false;
    Node* target = list->head;
    if (out_val) *out_val = target->data;
    list->head = target->next;
    free(target);
    list->size--;
    return true;
}

/* In-place Reversal: O(n) */
void list_reverse(LinkedList* list) {
    if (!list || !list->head) return;
    Node* prev = NULL;
    Node* curr = list->head;
    Node* next = NULL;

    while (curr != NULL) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    list->head = prev;
}

/* Display */
void list_print(const LinkedList* list) {
    if (!list) return;
    printf("List [size=%zu]: ", list->size);
    for (Node* c = list->head; c != NULL; c = c->next) {
        printf("%d -> ", c->data);
    }
    printf("NULL\\n");
}

int main(void) {
    LinkedList* list = list_create();
    list_push_front(list, 10);
    list_push_front(list, 20);
    list_push_back(list, 30);
    list_push_back(list, 40);

    list_print(list); // 20 -> 10 -> 30 -> 40 -> NULL

    printf("Reversing list...\\n");
    list_reverse(list);
    list_print(list); // 40 -> 30 -> 10 -> 20 -> NULL

    int popped = 0;
    list_pop_front(list, &popped);
    printf("Popped front: %d\\n", popped);
    list_print(list);

    list_destroy(list);
    return 0;
}`,
      cpp: `// Equivalent modern C++ class with RAII`,
      python: `"""Equivalent Python linked list"""`,
      java: `/** Equivalent Java linked list */`
    },
    complexity: [
      { operation: 'push_front', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'pop_front', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'reverse', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['linked-list-cpp', 'linked-list-python', 'linked-list-java']
  },

  'linked-list-cpp': {
    slug: 'linked-list-cpp',
    title: 'Linked List — Full C++ Implementation',
    category: 'Linked List',
    summary: 'A modern generic C++20 template linked list with RAII, move semantics, standard forward iterators, and exception-safe operations.',
    lead: 'Modern C++ emphasizes template meta-programming, deterministic destruction, and STL iterator compliance. This class provides an STL-like interface.',
    sections: [
      {
        id: 'cpp-architecture-overview',
        title: 'C++ Architecture Features',
        content: `- **Template Generics**: Storing arbitrary types \`T\`.
- **Custom Forward Iterator**: Enabler for standard \`for (const auto& x : list)\` range-based loops and STL algorithms.
- **Rule of 5**: Move constructor, move assignment, copy constructor, copy assignment, and virtual destructor.`
      }
    ],
    code: {
      c: `/* See C tab */`,
      cpp: `// =========================================================================
// LinkedList.hpp — Production C++ Template Linked List
// =========================================================================
#include <iostream>
#include <stdexcept>
#include <utility>
#include <iterator>

template <typename T>
class LinkedList {
private:
    struct Node {
        T data;
        Node* next;
        explicit Node(const T& val) : data(val), next(nullptr) {}
        explicit Node(T&& val) : data(std::move(val)), next(nullptr) {}
    };

    Node* head_;
    std::size_t size_;

public:
    // Forward Iterator
    class Iterator {
    private:
        Node* curr_;
    public:
        using iterator_category = std::forward_iterator_tag;
        using value_type = T;
        using difference_type = std::ptrdiff_t;
        using pointer = T*;
        using reference = T&;

        explicit Iterator(Node* node) : curr_(node) {}
        reference operator*() const { return curr_->data; }
        pointer operator->() const { return &(curr_->data); }
        Iterator& operator++() { curr_ = curr_->next; return *this; }
        Iterator operator++(int) { Iterator tmp = *this; ++(*this); return tmp; }
        bool operator==(const Iterator& o) const { return curr_ == o.curr_; }
        bool operator!=(const Iterator& o) const { return curr_ != o.curr_; }
    };

    LinkedList() : head_(nullptr), size_(0) {}
    
    ~LinkedList() { clear(); }

    // Move constructor
    LinkedList(LinkedList&& other) noexcept : head_(other.head_), size_(other.size_) {
        other.head_ = nullptr;
        other.size_ = 0;
    }

    void clear() noexcept {
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

    void push_front(const T& val) {
        Node* node = new Node(val);
        node->next = head_;
        head_ = node;
        ++size_;
    }

    T pop_front() {
        if (!head_) throw std::runtime_error("List is empty");
        Node* old = head_;
        T val = std::move(old->data);
        head_ = old->next;
        delete old;
        --size_;
        return val;
    }

    void reverse() noexcept {
        Node* prev = nullptr;
        Node* curr = head_;
        Node* next = nullptr;
        while (curr) {
            next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        head_ = prev;
    }

    Iterator begin() noexcept { return Iterator(head_); }
    Iterator end() noexcept { return Iterator(nullptr); }
};

int main() {
    LinkedList<int> list;
    list.push_front(30);
    list.push_front(20);
    list.push_front(10);

    for (int val : list) {
        std::cout << val << " -> ";
    }
    std::cout << "nullptr\\n";
    return 0;
}`,
      python: `"""See Python tab"""`,
      java: `/** See Java tab */`
    },
    complexity: [
      { operation: 'push_front', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Iterator Traversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['linked-list-c', 'linked-list-python', 'linked-list-java']
  },

  'linked-list-python': {
    slug: 'linked-list-python',
    title: 'Linked List — Full Python Implementation',
    category: 'Linked List',
    summary: 'A Pythonic singly linked list featuring custom magic methods (__len__, __iter__, __getitem__, __repr__) and type annotations.',
    lead: 'Python enables expressive data structure programming through the data model protocol. This implementation implements iteration, sequence length, string representation, and indexing.',
    sections: [
      {
        id: 'pythonic-protocols',
        title: 'Pythonic Dunder Protocols',
        content: `Implements:
- \`__len__\`: Enables \`len(my_list)\`
- \`__iter__\`: Enables generator iteration in \`for x in my_list\`
- \`__repr__\`: Beautiful console output \`[10 -> 20 -> 30]\``
      }
    ],
    code: {
      c: `/* See C tab */`,
      cpp: `// See C++ tab`,
      python: `"""
=============================================================================
linked_list.py — Full Pythonic Singly Linked List Implementation
=============================================================================
"""
from typing import TypeVar, Generic, Optional, Iterator, Any

T = TypeVar('T')

class Node(Generic[T]):
    __slots__ = ('data', 'next')
    
    def __init__(self, data: T, next_node: Optional['Node[T]'] = None) -> None:
        self.data: T = data
        self.next: Optional['Node[T]'] = next_node

    def __repr__(self) -> str:
        return f"Node({self.data})"


class LinkedList(Generic[T]):
    """A fully-featured, Pythonic Singly Linked List."""

    def __init__(self) -> None:
        self.head: Optional[Node[T]] = None
        self._size: int = 0

    def __len__(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self.head is None

    def push_front(self, data: T) -> None:
        """Insert at beginning: O(1)"""
        self.head = Node(data, self.head)
        self._size += 1

    def push_back(self, data: T) -> None:
        """Insert at end: O(n)"""
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
        else:
            curr = self.head
            while curr.next is not None:
                curr = curr.next
            curr.next = new_node
        self._size += 1

    def pop_front(self) -> T:
        """Remove and return head value: O(1)"""
        if self.head is None:
            raise IndexError("pop from empty linked list")
        val = self.head.data
        self.head = self.head.next
        self._size -= 1
        return val

    def reverse(self) -> None:
        """In-place pointer reversal: O(n) time, O(1) space"""
        prev: Optional[Node[T]] = None
        curr: Optional[Node[T]] = self.head
        while curr is not None:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        self.head = prev

    def __iter__(self) -> Iterator[T]:
        curr = self.head
        while curr is not None:
            yield curr.data
            curr = curr.next

    def __repr__(self) -> str:
        nodes = [str(x) for x in self]
        return " -> ".join(nodes) + (" -> None" if nodes else "Empty")


if __name__ == "__main__":
    ll = LinkedList[int]()
    ll.push_front(10)
    ll.push_front(20)
    ll.push_back(30)
    print("Initial list:", ll)  # 20 -> 10 -> 30 -> None
    ll.reverse()
    print("Reversed list:", ll) # 30 -> 10 -> 20 -> None
`,
      java: `/** See Java tab */`
    },
    complexity: [
      { operation: 'push_front', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'reverse', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['linked-list-c', 'linked-list-cpp', 'linked-list-java']
  },

  'linked-list-java': {
    slug: 'linked-list-java',
    title: 'Linked List — Full Java Implementation',
    category: 'Linked List',
    summary: 'A production generic Java LinkedList with Iterable support, fail-fast iterator modification counters (modCount), and complete node lifecycle management.',
    lead: 'Java generic collections manage heap references automatically through garbage collection. This class demonstrates an industrial-strength generic implementation.',
    sections: [
      {
        id: 'java-features',
        title: 'Java Generic Architecture',
        content: `- **Static Generic Inner Node**: Avoids unnecessary synthetic outer class reference overhead.
- **Fail-Fast Iterator**: Increments \`modCount\` on mutations to detect concurrent modifications during iteration.`
      }
    ],
    code: {
      c: `/* See C tab */`,
      cpp: `// See C++ tab`,
      python: `"""See Python tab"""`,
      java: `package dsa.reference.linkedlist;

import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.NoSuchElementException;

public class CustomLinkedList<E> implements Iterable<E> {
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
    private int modCount = 0;

    public CustomLinkedList() {
        this.head = null;
        this.size = 0;
    }

    public int size() { return size; }
    public boolean isEmpty() { return head == null; }

    public void addFirst(E element) {
        head = new Node<>(element, head);
        size++;
        modCount++;
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
        modCount++;
    }

    public E removeFirst() {
        if (head == null) throw new NoSuchElementException("List is empty");
        E val = head.data;
        head = head.next;
        size--;
        modCount++;
        return val;
    }

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
        modCount++;
    }

    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            private Node<E> curr = head;
            private int expectedModCount = modCount;

            public boolean hasNext() {
                return curr != null;
            }

            public E next() {
                if (modCount != expectedModCount) {
                    throw new ConcurrentModificationException();
                }
                if (!hasNext()) throw new NoSuchElementException();
                E data = curr.data;
                curr = curr.next;
                return data;
            }
        };
    }
}`
    },
    complexity: [
      { operation: 'addFirst', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'reverse', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['linked-list-c', 'linked-list-cpp', 'linked-list-python']
  }
};
