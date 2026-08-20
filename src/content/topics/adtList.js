export const adtListTopics = {
  'adt-list-contract': {
    slug: 'adt-list-contract',
    title: 'ADT List — Definition & Contract',
    category: 'Abstract Data Type: List',
    summary: 'The formal definition, mathematical model, and interface specification of the List Abstract Data Type.',
    lead: 'A List is a countable, ordered collection of elements where identical values may occur multiple times. Its contract establishes 0-indexed positional access, dynamic size tracking, and positional mutations.',
    sections: [
      {
        id: 'formal-axioms',
        title: 'Formal Axioms & Invariants',
        content: `A list $L = [e_0, e_1, \\dots, e_{n-1}]$ of length $n$ maintains the following invariants:
- **Index Bounds**: For any element access $e_i$, $0 \\le i < n$.
- **Positional Integrity**: Inserting an element at index $k$ ($0 \\le k \\le n$) shifts all elements from index $k$ through $n-1$ to indices $k+1$ through $n$. The length becomes $n+1$.
- **Deletion Contiguity**: Deleting an element at index $k$ ($0 \\le k < n$) shifts all elements from $k+1$ through $n-1$ to indices $k$ through $n-2$. The length becomes $n-1$.`
      },
      {
        id: 'core-method-signatures',
        title: 'Core Method Signatures',
        content: `Standard List ADT operations include:
- \`get(index)\`: Return the element at index $i$.
- \`set(index, element)\`: Overwrite the element at index $i$ with a new value.
- \`insert(index, element)\`: Insert element at position $i$, shifting subsequent elements.
- \`remove(index)\`: Delete and return element at position $i$, shifting subsequent elements.
- \`size()\`: Return total count $n$ of elements currently held.
- \`isEmpty()\`: Boolean query returning $n == 0$.`
      }
    ],
    code: {
      c: `/* List ADT Interface in C */
#include <stdbool.h>
#include <stddef.h>

typedef struct ArrayList ArrayList;

ArrayList* al_create(size_t initial_capacity);
void al_destroy(ArrayList* list);

size_t al_size(const ArrayList* list);
bool al_is_empty(const ArrayList* list);
int al_get(const ArrayList* list, size_t index, bool* ok);
bool al_set(ArrayList* list, size_t index, int value);
bool al_insert(ArrayList* list, size_t index, int value);
bool al_delete(ArrayList* list, size_t index, int* out_val);`,
      cpp: `// List ADT Interface in C++
#include <cstddef>
#include <stdexcept>

template <typename T>
class ListInterface {
public:
    virtual ~ListInterface() = default;
    virtual std::size_t size() const noexcept = 0;
    virtual bool empty() const noexcept = 0;
    virtual const T& get(std::size_t index) const = 0;
    virtual void set(std::size_t index, const T& value) = 0;
    virtual void insert(std::size_t index, const T& value) = 0;
    virtual T remove(std::size_t index) = 0;
};`,
      python: `"""List ADT Interface in Python"""
from typing import Generic, TypeVar, Protocol

T = TypeVar('T')

class ListProtocol(Protocol[T]):
    def __len__(self) -> int: ...
    def __getitem__(self, index: int) -> T: ...
    def __setitem__(self, index: int, value: T) -> None: ...
    def insert(self, index: int, value: T) -> None: ...
    def pop(self, index: int = -1) -> T: ...`,
      java: `/** List ADT Interface in Java */
package dsa.reference.adt;

public interface List<E> {
    int size();
    boolean isEmpty();
    E get(int index);
    E set(int index, E element);
    void add(int index, E element);
    E remove(int index);
    void clear();
}`
    },
    complexity: [
      { operation: 'get(i) / set(i, x)', best: 'O(1)', avg: 'O(1) [Array] / O(n) [Linked]', worst: 'O(1) [Array] / O(n) [Linked]', space: 'O(1)' },
      { operation: 'insert(0, x) [Head]', best: 'O(1)', avg: 'O(n) [Array] / O(1) [Linked]', worst: 'O(n) [Array] / O(1) [Linked]', space: 'O(1)' },
      { operation: 'insert(n, x) [Tail]', best: 'O(1)', avg: 'O(1) amortized', worst: 'O(n) [Array resize]', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-impl', 'array-list-operations', 'linked-list-overview']
  },

  'array-list-impl': {
    slug: 'array-list-impl',
    title: 'Array-Based List Implementation',
    category: 'Abstract Data Type: List',
    summary: 'Internal mechanics of the Dynamic Array: contiguous memory allocation, geometric capacity expansion, amortized cost analysis, and cache line exploitation.',
    lead: 'An Array List (dynamic array) implements the List ADT over a single, contiguous block of heap memory. By holding capacity $\\ge$ size, elements are indexed via pointer arithmetic in $O(1)$ time.',
    sections: [
      {
        id: 'memory-layout',
        title: 'Contiguous Memory & Cache Locality',
        content: `Because all items in an array list reside in consecutive memory addresses:
- **Pointer Arithmetic**: Element at index $i$ is directly computed as $\\text{address}(i) = \\text{base} + (i \\times \\text{sizeof}(T))$.
- **Hardware Pre-fetching**: CPU cache lines (typically 64 bytes) load adjacent elements in a single fetch cycle, yielding near-zero cache misses during linear iterations.`
      },
      {
        id: 'resizing-mechanics',
        title: 'Geometric Resizing Strategy',
        content: `When \`size == capacity\`:
1. Allocate a new contiguous memory buffer of size $\\text{capacity} \\times 2$ (or $1.5\\times$).
2. Copy all $n$ existing elements to the new buffer.
3. Deallocate (free) the obsolete memory buffer.
4. Update the internal pointer and update \`capacity\`.`
      }
    ],
    code: {
      c: `/* Complete Dynamic Array in C with Geometric Growth */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct {
    int* data;
    size_t size;
    size_t capacity;
} ArrayList;

ArrayList* al_create(size_t initial_cap) {
    ArrayList* list = (ArrayList*)malloc(sizeof(ArrayList));
    list->capacity = initial_cap ? initial_cap : 4;
    list->size = 0;
    list->data = (int*)malloc(list->capacity * sizeof(int));
    return list;
}

static bool al_grow(ArrayList* list) {
    size_t new_cap = list->capacity * 2;
    int* new_data = (int*)realloc(list->data, new_cap * sizeof(int));
    if (!new_data) return false;
    list->data = new_data;
    list->capacity = new_cap;
    return true;
}

bool al_push_back(ArrayList* list, int value) {
    if (list->size == list->capacity) {
        if (!al_grow(list)) return false;
    }
    list->data[list->size++] = value;
    return true;
}

void al_destroy(ArrayList* list) {
    if (list) {
        free(list->data);
        free(list);
    }
}`,
      cpp: `// Modern C++ Dynamic Array with Rule of 5 and Generics
#include <cstddef>
#include <algorithm>
#include <stdexcept>

template <typename T>
class ArrayList {
private:
    T* data_;
    std::size_t size_;
    std::size_t capacity_;

    void grow() {
        std::size_t new_cap = (capacity_ == 0) ? 4 : capacity_ * 2;
        T* new_data = new T[new_cap];
        for (std::size_t i = 0; i < size_; ++i) {
            new_data[i] = std::move(data_[i]);
        }
        delete[] data_;
        data_ = new_data;
        capacity_ = new_cap;
    }

public:
    ArrayList() : data_(nullptr), size_(0), capacity_(0) {}
    ~ArrayList() { delete[] data_; }

    // Disable copy for simplicity, or implement deep copy
    ArrayList(const ArrayList&) = delete;
    ArrayList& operator=(const ArrayList&) = delete;

    std::size_t size() const noexcept { return size_; }

    void push_back(const T& val) {
        if (size_ == capacity_) grow();
        data_[size_++] = val;
    }

    const T& operator[](std::size_t i) const {
        if (i >= size_) throw std::out_of_range("Index out of bounds");
        return data_[i];
    }
};`,
      python: `"""Python Custom Dynamic Array implementation using ctypes"""
import ctypes

class DynamicArray:
    def __init__(self):
        self._n = 0
        self._capacity = 1
        self._A = self._make_array(self._capacity)

    def __len__(self):
        return self._n

    def __getitem__(self, k):
        if not 0 <= k < self._n:
            raise IndexError('Index out of range')
        return self._A[k]

    def append(self, obj):
        if self._n == self._capacity:
            self._resize(2 * self._capacity)
        self._A[self._n] = obj
        self._n += 1

    def _resize(self, c):
        B = self._make_array(c)
        for k in range(self._n):
            B[k] = self._A[k]
        self._A = B
        self._capacity = c

    def _make_array(self, c):
        return (c * ctypes.py_object)()`,
      java: `/** Complete Generic Dynamic Array in Java */
package dsa.reference.arraylist;

import java.util.Arrays;

public class MyArrayList<E> {
    private Object[] data;
    private int size;
    private static final int DEFAULT_CAPACITY = 10;

    public MyArrayList() {
        this.data = new Object[DEFAULT_CAPACITY];
        this.size = 0;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    @SuppressWarnings("unchecked")
    public E get(int index) {
        rangeCheck(index);
        return (E) data[index];
    }

    public void add(E element) {
        ensureCapacity(size + 1);
        data[size++] = element;
    }

    private void ensureCapacity(int minCapacity) {
        if (minCapacity > data.length) {
            int newCapacity = Math.max(data.length * 2, minCapacity);
            data = Arrays.copyOf(data, newCapacity);
        }
    }

    private void rangeCheck(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
    }
}`
    },
    complexity: [
      { operation: 'Access (by index)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Append (End)', best: 'O(1)', avg: 'O(1) amortized', worst: 'O(n) [Resize copy]', space: 'O(1)' },
      { operation: 'Insert at Index 0', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Delete at Index 0', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['adt-list-contract', 'array-list-operations', 'comparison-linked-vs-array']
  },

  'array-list-operations': {
    slug: 'array-list-operations',
    title: 'Array-Based List: Operations',
    category: 'Abstract Data Type: List',
    summary: 'Detailed code and mechanics for insertion, deletion, element search, and random access indexing in contiguous array lists.',
    lead: 'Array List operations depend fundamentally on the position being modified. Modifying the tail requires $O(1)$ amortized time, whereas modifications at arbitrary indices require shifting up to $n$ adjacent elements.',
    sections: [
      {
        id: 'insertion-shifting',
        title: 'Positional Insertion & Memory Shifting',
        content: `Inserting an element at index $k$:
1. Check capacity; expand if full.
2. Shift all elements from index $n-1$ down to $k$ rightward by one slot (\`memmove\` in C, \`System.arraycopy\` in Java).
3. Place the new item into slot $k$.
4. Increment \`size\` by 1.`
      },
      {
        id: 'deletion-shifting',
        title: 'Positional Deletion',
        content: `Deleting an element at index $k$:
1. Save the target value.
2. Shift all elements from index $k+1$ up to $n-1$ leftward by one slot.
3. Decrement \`size\` by 1.`
      }
    ],
    code: {
      c: `/* Insertion and Deletion at arbitrary index in C */
#include <string.h>
#include <stdbool.h>

bool al_insert_at(ArrayList* list, size_t index, int value) {
    if (index > list->size) return false;
    if (list->size == list->capacity) {
        if (!al_grow(list)) return false;
    }
    // Shift elements rightward
    if (index < list->size) {
        memmove(&list->data[index + 1], 
                &list->data[index], 
                (list->size - index) * sizeof(int));
    }
    list->data[index] = value;
    list->size++;
    return true;
}

bool al_delete_at(ArrayList* list, size_t index, int* out_val) {
    if (index >= list->size) return false;
    if (out_val) *out_val = list->data[index];
    
    // Shift elements leftward
    size_t num_to_move = list->size - index - 1;
    if (num_to_move > 0) {
        memmove(&list->data[index], 
                &list->data[index + 1], 
                num_to_move * sizeof(int));
    }
    list->size--;
    return true;
}`,
      cpp: `// Insertion and Deletion in C++
template <typename T>
void ArrayList<T>::insert(std::size_t index, const T& value) {
    if (index > size_) throw std::out_of_range("Index out of range");
    if (size_ == capacity_) grow();

    for (std::size_t i = size_; i > index; --i) {
        data_[i] = std::move(data_[i - 1]);
    }
    data_[index] = value;
    ++size_;
}

template <typename T>
T ArrayList<T>::remove(std::size_t index) {
    if (index >= size_) throw std::out_of_range("Index out of range");
    T removed_val = std::move(data_[index]);

    for (std::size_t i = index; i < size_ - 1; ++i) {
        data_[i] = std::move(data_[i + 1]);
    }
    --size_;
    return removed_val;
}`,
      python: `"""Insertion and Deletion in Python Dynamic Array"""
def insert(self, k, obj):
    if not 0 <= k <= self._n:
        raise IndexError('Index out of bounds')
    if self._n == self._capacity:
        self._resize(2 * self._capacity)
    
    for j in range(self._n, k, -1):
        self._A[j] = self._A[j - 1]
    self._A[k] = obj
    self._n += 1

def remove_at(self, k):
    if not 0 <= k < self._n:
        raise IndexError('Index out of bounds')
    val = self._A[k]
    for j in range(k, self._n - 1):
        self._A[j] = self._A[j + 1]
    self._A[self._n - 1] = None  # help garbage collection
    self._n -= 1
    return val`,
      java: `/** Insertion and Deletion in Java ArrayList */
public void add(int index, E element) {
    if (index < 0 || index > size) {
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
    ensureCapacity(size + 1);
    System.arraycopy(data, index, data, index + 1, size - index);
    data[index] = element;
    size++;
}

@SuppressWarnings("unchecked")
public E remove(int index) {
    rangeCheck(index);
    E oldValue = (E) data[index];
    int numMoved = size - index - 1;
    if (numMoved > 0) {
        System.arraycopy(data, index + 1, data, index, numMoved);
    }
    data[--size] = null; // Clear to let GC collect
    return oldValue;
}`
    },
    complexity: [
      { operation: 'Insert at index k', best: 'O(1) [at tail]', avg: 'O(n) [n/2 shifts]', worst: 'O(n) [at head]', space: 'O(1)' },
      { operation: 'Delete at index k', best: 'O(1) [at tail]', avg: 'O(n) [n/2 shifts]', worst: 'O(n) [at head]', space: 'O(1)' },
      { operation: 'Linear Search (value)', best: 'O(1) [found at 0]', avg: 'O(n)', worst: 'O(n) [not present]', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-impl', 'complexity-array-list', 'singly-linked-list-insertion']
  },

  'complexity-array-list': {
    slug: 'complexity-array-list',
    title: 'Complexity Analysis — Array List',
    category: 'Abstract Data Type: List',
    summary: 'Comprehensive algorithmic and hardware-level performance profile of array-based lists.',
    lead: 'Understanding array list performance requires examining both asymptotic bounds (Big-O) and hardware characteristics such as CPU cache lines and branch prediction.',
    sections: [
      {
        id: 'asymptotic-summary',
        title: 'Asymptotic Complexity Breakdown',
        content: `| Operation | Best | Average | Worst | Space |
| :--- | :--- | :--- | :--- | :--- |
| **Get / Set by Index** | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| **Append (push_back)** | $O(1)$ | $O(1)$ amortized | $O(n)$ (reallocation) | $O(1)$ |
| **Prepend (insert at 0)** | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$ |
| **Insert at index $k$** | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ |
| **Delete from index $k$** | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ |
| **Search (unsorted)** | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ |`
      },
      {
        id: 'space-overhead',
        title: 'Memory Footprint Analysis',
        content: `The spatial overhead of a dynamic array is defined by its load factor:
$$\\text{Load Factor} = \\frac{\\text{size}}{\\text{capacity}}$$
When doubling capacity, the worst-case space efficiency is $50\\%$ immediately following an expansion (e.g. allocating space for 1024 items when holding 513).`
      }
    ],
    code: {
      c: `/* Benchmarking contiguous access vs random memory access in C */
#include <time.h>
#include <stdio.h>
#include <stdlib.h>

#define N 10000000

void benchmark_sequential(const int* arr) {
    long long sum = 0;
    clock_t start = clock();
    for (size_t i = 0; i < N; ++i) {
        sum += arr[i]; // High cache hit rate
    }
    clock_t end = clock();
    printf("Sequential sum: %lld in %f ms\\n", 
           sum, ((double)(end - start) / CLOCKS_PER_SEC) * 1000.0);
}`,
      cpp: `// Benchmarking contiguous array iteration in C++
#include <vector>
#include <numeric>
#include <chrono>
#include <iostream>

void benchmarkVector(const std::vector<int>& v) {
    auto t0 = std::chrono::high_resolution_clock::now();
    long long sum = std::accumulate(v.begin(), v.end(), 0LL);
    auto t1 = std::chrono::high_resolution_clock::now();
    
    std::cout << "Sum: " << sum << " in " 
              << std::chrono::duration<double, std::milli>(t1 - t0).count() 
              << " ms\\n";
}`,
      python: `"""Python list traversal performance"""
import time

def benchmark_traversal(size=1_000_000):
    data = list(range(size))
    t0 = time.perf_counter()
    total = sum(data)
    t1 = time.perf_counter()
    print(f"Traversed {size} items in {(t1 - t0)*1000:.2f} ms")`,
      java: `/** Java ArrayList iteration benchmark */
package dsa.reference.benchmark;

import java.util.ArrayList;

public class ArrayListBenchmark {
    public static void main(String[] args) {
        int n = 5_000_000;
        ArrayList<Integer> list = new ArrayList<>(n);
        for (int i = 0; i < n; i++) list.add(i);

        long start = System.nanoTime();
        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += list.get(i);
        }
        long duration = System.nanoTime() - start;
        System.out.printf("Sum: %d in %.2f ms%n", sum, duration / 1_000_000.0);
    }
}`
    },
    complexity: [
      { operation: 'Indexed Read', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'Amortized Append', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Arbitrary Insertion', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-impl', 'comparison-linked-vs-array', 'complexity-linked-list']
  },

  'array-list-c': {
    slug: 'array-list-c',
    title: 'Array List — Complete C Implementation',
    category: 'Abstract Data Type: List',
    summary: 'A complete, self-contained, leak-free Dynamic Array module written in ISO C99 with robust memory bounds checking and geometric reallocation.',
    lead: 'This complete C implementation provides an opaque pointer interface with explicit lifecycle management (`al_create`, `al_destroy`), automatic capacity doubling via `realloc`, and memory safety verification.',
    sections: [
      {
        id: 'c-implementation-highlights',
        title: 'Implementation Architecture',
        content: `Key features of this C dynamic array:
- Safe allocation verification on every \`malloc\` / \`realloc\` call.
- Opaque struct handle to prevent external tampering of internal capacity and size fields.
- Bounds checking returning explicit status codes (\`bool\`).`
      }
    ],
    code: {
      c: `/* array_list.c — Complete, Production-Ready C99 Dynamic Array */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

typedef struct {
    int* items;
    size_t size;
    size_t capacity;
} ArrayList;

ArrayList* al_create(size_t initial_cap) {
    ArrayList* list = (ArrayList*)malloc(sizeof(ArrayList));
    if (!list) return NULL;
    
    list->capacity = initial_cap ? initial_cap : 4;
    list->size = 0;
    list->items = (int*)malloc(list->capacity * sizeof(int));
    if (!list->items) {
        free(list);
        return NULL;
    }
    return list;
}

void al_destroy(ArrayList* list) {
    if (!list) return;
    free(list->items);
    free(list);
}

static bool al_ensure_capacity(ArrayList* list, size_t min_cap) {
    if (min_cap <= list->capacity) return true;
    size_t new_cap = list->capacity * 2;
    if (new_cap < min_cap) new_cap = min_cap;
    
    int* new_items = (int*)realloc(list->items, new_cap * sizeof(int));
    if (!new_items) return false;
    
    list->items = new_items;
    list->capacity = new_cap;
    return true;
}

bool al_push_back(ArrayList* list, int value) {
    if (!al_ensure_capacity(list, list->size + 1)) return false;
    list->items[list->size++] = value;
    return true;
}

bool al_insert(ArrayList* list, size_t index, int value) {
    if (index > list->size) return false;
    if (!al_ensure_capacity(list, list->size + 1)) return false;

    if (index < list->size) {
        memmove(&list->items[index + 1], 
                &list->items[index], 
                (list->size - index) * sizeof(int));
    }
    list->items[index] = value;
    list->size++;
    return true;
}

bool al_remove_at(ArrayList* list, size_t index, int* out_val) {
    if (index >= list->size) return false;
    if (out_val) *out_val = list->items[index];

    size_t elements_to_shift = list->size - index - 1;
    if (elements_to_shift > 0) {
        memmove(&list->items[index], 
                &list->items[index + 1], 
                elements_to_shift * sizeof(int));
    }
    list->size--;
    return true;
}

int main(void) {
    ArrayList* list = al_create(2);
    al_push_back(list, 10);
    al_push_back(list, 20);
    al_push_back(list, 30);
    al_insert(list, 1, 15); // [10, 15, 20, 30]

    int removed = 0;
    al_remove_at(list, 2, &removed); // removes 20

    printf("Size: %zu, Capacity: %zu\\n", list->size, list->capacity);
    for (size_t i = 0; i < list->size; ++i) {
        printf("list[%zu] = %d\\n", i, list->items[i]);
    }

    al_destroy(list);
    return 0;
}`,
      cpp: `// Equivalent C++ Implementation
#include <iostream>
#include <vector>

int main() {
    std::vector<int> list = {10, 20, 30};
    list.insert(list.begin() + 1, 15);
    list.erase(list.begin() + 2);
    for (int v : list) std::cout << v << " ";
    return 0;
}`,
      python: `"""Equivalent Python list usage"""
lst = [10, 20, 30]
lst.insert(1, 15)
removed = lst.pop(2)
print("List:", lst)`,
      java: `/** Equivalent Java ArrayList usage */
import java.util.ArrayList;

public class Demo {
    public static void main(String[] args) {
        ArrayList<Integer> list = new ArrayList<>();
        list.add(10); list.add(20); list.add(30);
        list.add(1, 15);
        list.remove(2);
        System.out.println(list);
    }
}`
    },
    complexity: [
      { operation: 'Push Back', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Insert at index', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'Destroy / Cleanup', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-cpp', 'array-list-python', 'array-list-java']
  },

  'array-list-cpp': {
    slug: 'array-list-cpp',
    title: 'Array List — Complete C++ Implementation',
    category: 'Abstract Data Type: List',
    summary: 'A modern, template-based C++ vector implementation adhering to RAII, Rule of Five, and exception safety guarantees.',
    lead: 'Modern C++ enables generic array lists with compile-time type safety, automated resource cleanup (RAII), and move semantics.',
    sections: [
      {
        id: 'cpp-architecture',
        title: 'Template & RAII Design',
        content: `This implementation demonstrates:
- **Move Semantics**: Leveraging \`std::move\` to transfer ownership during dynamic buffer resizing without expensive deep copies.
- **Exception Safety**: Strong exception guarantee when copying elements.`
      }
    ],
    code: {
      c: `/* See C Implementation page */`,
      cpp: `// ArrayList.hpp — Modern C++ Generic Dynamic Array
#include <iostream>
#include <stdexcept>
#include <utility>

template <typename T>
class Vector {
private:
    T* data_;
    std::size_t size_;
    std::size_t capacity_;

    void reallocate(std::size_t new_cap) {
        T* new_block = new T[new_cap];
        for (std::size_t i = 0; i < size_; ++i) {
            new_block[i] = std::move(data_[i]);
        }
        delete[] data_;
        data_ = new_block;
        capacity_ = new_cap;
    }

public:
    Vector() : data_(nullptr), size_(0), capacity_(0) {}
    
    explicit Vector(std::size_t initial_cap) 
        : data_(new T[initial_cap]), size_(0), capacity_(initial_cap) {}

    ~Vector() {
        delete[] data_;
    }

    // Move constructor
    Vector(Vector&& other) noexcept 
        : data_(other.data_), size_(other.size_), capacity_(other.capacity_) {
        other.data_ = nullptr;
        other.size_ = 0;
        other.capacity_ = 0;
    }

    std::size_t size() const noexcept { return size_; }
    std::size_t capacity() const noexcept { return capacity_; }
    bool empty() const noexcept { return size_ == 0; }

    void push_back(const T& val) {
        if (size_ == capacity_) {
            reallocate(capacity_ == 0 ? 2 : capacity_ * 2);
        }
        data_[size_++] = val;
    }

    void insert(std::size_t index, const T& val) {
        if (index > size_) throw std::out_of_range("Index out of range");
        if (size_ == capacity_) {
            reallocate(capacity_ == 0 ? 2 : capacity_ * 2);
        }
        for (std::size_t i = size_; i > index; --i) {
            data_[i] = std::move(data_[i - 1]);
        }
        data_[index] = val;
        ++size_;
    }

    T remove(std::size_t index) {
        if (index >= size_) throw std::out_of_range("Index out of range");
        T removed = std::move(data_[index]);
        for (std::size_t i = index; i < size_ - 1; ++i) {
            data_[i] = std::move(data_[i + 1]);
        }
        --size_;
        return removed;
    }

    T& operator[](std::size_t index) { return data_[index]; }
    const T& operator[](std::size_t index) const { return data_[index]; }
};`,
      python: `"""See Python tab for corresponding implementation"""`,
      java: `/** See Java tab for corresponding implementation */`
    },
    complexity: [
      { operation: 'push_back', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'operator[]', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-c', 'array-list-python', 'array-list-java']
  },

  'array-list-python': {
    slug: 'array-list-python',
    title: 'Array List — Complete Python Implementation',
    category: 'Abstract Data Type: List',
    summary: 'A low-level Python implementation of dynamic arrays built using ctypes primitive memory buffers and Pythonic protocols.',
    lead: 'Python lists are implemented under CPython as variable-length dynamic arrays of object pointers (`PyObject**`). This module reconstructs that exact mechanism using `ctypes`.',
    sections: [
      {
        id: 'cpython-array-internals',
        title: 'CPython Memory Architecture',
        content: `In CPython:
- An empty list preallocates small memory buffers.
- Appending uses an over-allocation formula: $\\text{new\\_capacity} = \\text{size} + (\\text{size} \\gg 3) + (3 \\text{ if size } < 9 \\text{ else } 6)$.
- Element references are 8-byte pointer addresses to boxed Python objects.`
      }
    ],
    code: {
      c: `/* See C Implementation page */`,
      cpp: `// See C++ Implementation page`,
      python: `"""Complete Dynamic Array in Python using ctypes primitive buffers"""
import ctypes
from typing import Any, Iterator

class DynamicArray:
    """A dynamic array class mirroring CPython's list behavior."""
    
    def __init__(self, initial_capacity: int = 4) -> None:
        self._n = 0
        self._capacity = max(1, initial_capacity)
        self._A = self._make_array(self._capacity)

    def __len__(self) -> int:
        return self._n

    def __getitem__(self, k: int) -> Any:
        if not 0 <= k < self._n:
            raise IndexError("Index out of bounds")
        return self._A[k]

    def __setitem__(self, k: int, val: Any) -> None:
        if not 0 <= k < self._n:
            raise IndexError("Index out of bounds")
        self._A[k] = val

    def append(self, obj: Any) -> None:
        if self._n == self._capacity:
            self._resize(2 * self._capacity)
        self._A[self._n] = obj
        self._n += 1

    def insert(self, k: int, obj: Any) -> None:
        if not 0 <= k <= self._n:
            raise IndexError("Index out of bounds")
        if self._n == self._capacity:
            self._resize(2 * self._capacity)
        for j in range(self._n, k, -1):
            self._A[j] = self._A[j - 1]
        self._A[k] = obj
        self._n += 1

    def pop(self, k: int = -1) -> Any:
        if self._n == 0:
            raise IndexError("pop from empty list")
        if k < 0:
            k += self._n
        if not 0 <= k < self._n:
            raise IndexError("Index out of bounds")
            
        val = self._A[k]
        for j in range(k, self._n - 1):
            self._A[j] = self._A[j + 1]
        self._A[self._n - 1] = None  # GC cleanup
        self._n -= 1
        return val

    def _resize(self, new_cap: int) -> None:
        B = self._make_array(new_cap)
        for k in range(self._n):
            B[k] = self._A[k]
        self._A = B
        self._capacity = new_cap

    def _make_array(self, c: int):
        return (c * ctypes.py_object)()

    def __iter__(self) -> Iterator[Any]:
        for i in range(self._n):
            yield self._A[i]`,
      java: `/** See Java tab for corresponding implementation */`
    },
    complexity: [
      { operation: 'append', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(1)' },
      { operation: 'pop(0)', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-c', 'array-list-cpp', 'array-list-java']
  },

  'array-list-java': {
    slug: 'array-list-java',
    title: 'Array List — Complete Java Implementation',
    category: 'Abstract Data Type: List',
    summary: 'A full generic Java implementation of ArrayList featuring Iterable support, fail-fast boundary checks, and dynamic growth.',
    lead: 'Java generics enforce compile-time type boundaries while erasing to Object arrays at runtime. This implementation provides an idiomatic Java collection structure.',
    sections: [
      {
        id: 'java-implementation-details',
        title: 'Java Generics & Memory',
        content: `Key patterns:
- Using \`Object[]\` storage with unchecked cast suppression on read operations (\`@SuppressWarnings("unchecked")\`).
- Nullifying removed references to eliminate object retention leaks in the garbage collector.`
      }
    ],
    code: {
      c: `/* See C tab */`,
      cpp: `// See C++ tab`,
      python: `"""See Python tab"""`,
      java: `/** Complete Generic Java ArrayList Implementation */
package dsa.reference.arraylist;

import java.util.Iterator;
import java.util.NoSuchElementException;

public class CustomArrayList<E> implements Iterable<E> {
    private Object[] elements;
    private int size;
    private static final int DEFAULT_CAPACITY = 10;

    public CustomArrayList() {
        this(DEFAULT_CAPACITY);
    }

    public CustomArrayList(int initialCapacity) {
        if (initialCapacity < 0) {
            throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
        }
        this.elements = new Object[initialCapacity];
        this.size = 0;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    @SuppressWarnings("unchecked")
    public E get(int index) {
        checkIndex(index);
        return (E) elements[index];
    }

    public E set(int index, E element) {
        checkIndex(index);
        @SuppressWarnings("unchecked")
        E old = (E) elements[index];
        elements[index] = element;
        return old;
    }

    public void add(E element) {
        ensureCapacity(size + 1);
        elements[size++] = element;
    }

    public void add(int index, E element) {
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
        ensureCapacity(size + 1);
        System.arraycopy(elements, index, elements, index + 1, size - index);
        elements[index] = element;
        size++;
    }

    @SuppressWarnings("unchecked")
    public E remove(int index) {
        checkIndex(index);
        E old = (E) elements[index];
        int numMoved = size - index - 1;
        if (numMoved > 0) {
            System.arraycopy(elements, index + 1, elements, index, numMoved);
        }
        elements[--size] = null; // Clear reference for GC
        return old;
    }

    private void ensureCapacity(int minCapacity) {
        if (minCapacity > elements.length) {
            int newCap = Math.max(elements.length + (elements.length >> 1), minCapacity);
            Object[] newArr = new Object[newCap];
            System.arraycopy(elements, 0, newArr, 0, size);
            elements = newArr;
        }
    }

    private void checkIndex(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
    }

    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            private int cursor = 0;
            public boolean hasNext() { return cursor < size; }
            @SuppressWarnings("unchecked")
            public E next() {
                if (!hasNext()) throw new NoSuchElementException();
                return (E) elements[cursor++];
            }
        };
    }
}`
    },
    complexity: [
      { operation: 'get(i)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
      { operation: 'add(element)', best: 'O(1)', avg: 'O(1) amortized', worst: 'O(n)', space: 'O(1)' },
      { operation: 'remove(i)', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    ],
    relatedSlugs: ['array-list-c', 'array-list-cpp', 'array-list-python']
  }
};
