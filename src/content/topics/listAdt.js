export const listAdtTopics = {
  'what-is-an-abstract-data-type': {
    slug: 'what-is-an-abstract-data-type',
    title: 'What Is an ADT?',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The vending machine analogy: separating the button-press contract from internal mechanisms.',
    lead: `You press B4 on a vending machine, and a snack drops. That's the entire interaction. You have no idea whether the machine uses a spiral coil that rotates and pushes the snack forward, a small robotic arm that grabs it, or a conveyor belt that shifts it into position.

You don't need to know, and honestly, you don't care — as far as you're concerned, *"press B4, get that snack"* is the entire contract. Two completely different vending machine manufacturers could build wildly different internals, and you'd never notice, as long as both of them honor that same button-press contract.`,
    sections: [
      {
        id: 'the-definition',
        title: 'The Definition',
        content: `An ADT is a description of **what something does** — the operations it promises and the behavior it guarantees — with **zero commitment to how it actually does it internally**. It's a contract, not a mechanism.

*"Press B4, get a snack"* is the ADT. The spiral coil vs. the robotic arm is the implementation, and it's deliberately none of your business.

Written out the way you'd actually declare one, an ADT looks like a set of operation signatures with no bodies at all — just promises:

\`\`\`pseudocode
List ADT promises:
    1. Add an item somewhere in the collection
    2. Remove the item at a given position
    3. Get the item at a given position
    4. Report how many items are stored
\`\`\`

\`\`\`c
// C: Contract only (Header file declaration)
void add(int item);
int remove_at(int index);
int get(int index);
int size(void);
\`\`\`
\`\`\`cpp
// C++: Pure Abstract Interface
template <typename T>
struct IList {
    virtual void add(const T& item) = 0;
    virtual T remove(int index) = 0;
    virtual T get(int index) const = 0;
    virtual int size() const = 0;
};
\`\`\`
\`\`\`python
# Python: Abstract Base Class
from abc import ABC, abstractmethod

class ListADT(ABC):
    @abstractmethod
    def add(self, item): pass

    @abstractmethod
    def remove(self, index): pass

    @abstractmethod
    def get(self, index): pass

    @abstractmethod
    def size(self): pass
\`\`\`
\`\`\`java
// Java: Interface Contract
public interface ListADT<T> {
    void add(T item);
    T remove(int index);
    T get(int index);
    int size();
}
\`\`\`

> Nothing here says whether this is backed by contiguous memory, a chain of linked nodes, or something else entirely. That's the entire point.
> 
> The ADT is only making promises about behavior — call \`get(2)\` and you will get the third item back, guaranteed, regardless of what's happening underneath.`
      },
      {
        id: 'why-separate-these',
        title: 'Why Separate These',
        content: `Because it lets you **swap the internals without breaking anything built on top**.

If a vending machine company upgrades their internal mechanism from a coil to a robotic arm, every customer who only ever interacted through the buttons doesn't need to relearn anything — the contract didn't change, only the guts did.

> **Key Takeaway:** The same is true in code. If you write a program against the List ADT's contract — \`add\`, \`remove\`, \`get\`, \`size\` — you can swap out which concrete implementation is backing it (array-based, node-based, or something else entirely) without touching a single line of the code that uses it. The contract shields you from needing to care.`
      },
      {
        id: 'a-word-on-naming',
        title: 'A Word on Naming',
        content: `You'll sometimes see this described as the difference between an **interface** and its **implementation** — same idea, different vocabulary. The interface is the vending machine's front panel. The implementation is whatever's actually happening behind the coin slot.

> This distinction sits underneath everything that follows in this section.
> 
> The next page zooms in specifically on the List ADT's contract — precisely what a "list" promises to do — before the pages after that crack open the vending machine and look at the different mechanisms that can honor that same promise.`
      }
    ]
  },

  'the-list-adt-defining-behavior': {
    slug: 'the-list-adt-defining-behavior',
    title: 'List ADT: Defining Behavior',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The train coaches analogy: order preservation, addressability, duplicate support, and dynamic sizing.',
    lead: `Think of a train made up of numbered coaches — coach 1, coach 2, coach 3, and so on, all connected in a fixed sequence. A few things are just naturally true about a train like this.

The order of the coaches means something — coach 2 always comes after coach 1, and swapping that order changes the train. Every coach has a specific position you can refer to directly — *"coach 3"* always means the third one, no ambiguity. Two coaches could, in principle, be carrying identical cargo — being identical doesn't merge them into one coach; they're still two distinct positions in the sequence. And coaches can be added or removed as needed, so the length of the train isn't fixed forever.`,
    sections: [
      {
        id: 'the-full-behavioral-contract',
        title: 'The Full Behavioral Contract',
        content: `A List ADT is a collection with a specific set of guarantees, and it's worth being precise about each one:

- **Order is preserved and meaningful:** The sequence you insert items in is the sequence they stay in, unless you explicitly do something to change it. This isn't optional — it's a defining property of what makes something a list at all.
- **Every position is addressable:** You can refer to *"the item at position 2"* directly, the same way you can refer to *"coach 3"* without needing to know anything about what's in the other coaches.
- **Duplicates are allowed:** A list doesn't care if two items look identical — they still occupy two separate positions and are tracked as two separate entries.
- **Size is dynamic:** A list can grow or shrink over its lifetime. You're not locked into a fixed number of slots decided upfront.

> None of this says anything yet about how these guarantees get delivered — whether it's backed by contiguous memory or a chain of connected nodes is a completely separate question, covered a couple of pages from now.
> 
> This page is purely about the promise itself, before any mechanism enters the picture.`
      },
      {
        id: 'the-contract-not-the-mechanism',
        title: 'The Contract, Not the Mechanism',
        content: `If you were describing this contract purely as a promise with no committed mechanism yet:

\`\`\`pseudocode
List ADT promises:
    1. Add an item, preserving order
    2. Insert an item at a specific position
    3. Get the item at a specific position
    4. Remove the item at a specific position
    5. Report the current number of items
\`\`\`

\`\`\`c
// C: Contract function signatures (no mechanism committed)
void list_add(int item);
void list_insert(int index, int item);
int list_get(int index);
int list_remove(int index);
int list_size(void);
\`\`\`
\`\`\`cpp
// C++: Pure virtual contract
template <typename T>
struct IListContract {
    virtual void add(const T& item) = 0;
    virtual void insert(int index, const T& item) = 0;
    virtual T get(int index) const = 0;
    virtual T remove(int index) = 0;
    virtual int size() const = 0;
};
\`\`\`
\`\`\`python
# Python: List ADT interface specification
from abc import ABC, abstractmethod

class ListADT(ABC):
    @abstractmethod
    def add(self, item): ...

    @abstractmethod
    def insert(self, index, item): ...

    @abstractmethod
    def get(self, index): ...

    @abstractmethod
    def remove(self, index): ...

    @abstractmethod
    def size(self): ...
\`\`\`
\`\`\`java
// Java: List ADT Behavioral Contract
public interface ListADT<E> {
    void add(E item);
    void insert(int index, E item);
    E get(int index);
    E remove(int index);
    int size();
}
\`\`\`

Every one of these operations respects the four guarantees above:
- \`insert(index, item)\` respects **order** because it places the item at a specific spot rather than somewhere arbitrary.
- \`get(index)\` respects **addressability**.
- Nothing here rejects **duplicate values**.
- And nothing here assumes a fixed maximum **size**.`
      },
      {
        id: 'why-pin-this-down',
        title: 'Why Pin This Down',
        content: `Because the moment you start building actual implementations — which starts happening very soon — it becomes easy to accidentally build something that technically compiles and runs, but quietly violates one of these guarantees.

> **Crucial Insight:** A structure that silently reorders your items, or refuses duplicates, or caps out at a fixed size without telling you, isn't a bug in a List — **it's simply not a List**, whatever it happens to be called in your code.
> 
> With the contract this clearly defined, the next page turns it into something even more concrete: the exact minimum set of operations that any honest implementation of this contract has to support, no exceptions.`
      }
    ]
  },

  'operations-every-list-must-support': {
    slug: 'operations-every-list-must-support',
    title: 'List Operations Required',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The five mandatory operations every honest List implementation must support: insert, access, delete, search, size.',
    lead: `Back to the train. Whatever company builds it, however the coaches are physically connected underneath, a working train has to let you do a specific set of things to it, or it's simply not functioning as a train.

You need to be able to attach a new coach somewhere. You need to be able to detach one. You need to be able to check what's inside a specific coach without opening every single one first. And you need to be able to ask how many coaches the whole train currently has.

> Skip any one of these, and you don't have a slightly-limited train — you have something else entirely, wearing a train's name.`,
    sections: [
      {
        id: 'the-minimum-operation-set',
        title: 'The Minimum Operation Set',
        content: `Every honest implementation of the List ADT — no matter what's happening underneath — has to support these, at minimum:

- **Insert** — add an item, either at the end or at a specific position.
- **Access (get)** — retrieve the item sitting at a given position, without needing to touch anything else in the list.
- **Delete** — remove the item at a given position, and close the resulting gap so positions stay meaningful.
- **Search** — find whether a specific value exists in the list, and typically, at which position.
- **Size** — report how many items are currently being held.

\`\`\`pseudocode
To insert an item at a position:
    1. Place NewItem at Position

To get an item at a position:
    1. Return item at Position

To delete an item at a position:
    1. Remove item at Position
    2. Close the gap so positions stay meaningful

To search for a value:
    1. Loop through items:
        a. If item equals TargetValue, return its position
    2. Return not-found

To get the size:
    1. Return current count of items
\`\`\`

\`\`\`c
// C: Core list operations (Array implementation logic)
// Insert at position
for (int i = size; i > position; i--) {
    array[i] = array[i - 1];
}
array[position] = new_item;
size++;

// Get at position
return array[position];

// Delete at position
for (int i = position; i < size - 1; i++) {
    array[i] = array[i + 1];
}
size--;

// Search for a value
for (int i = 0; i < size; i++) {
    if (array[i] == target_value) {
        return i;
    }
}
return -1;

// Get size
return size;
\`\`\`
\`\`\`cpp
// C++: Core list operations (std::vector operations)
// Insert at position
vec.insert(vec.begin() + position, new_item);

// Get at position
int val = vec[position];

// Delete at position
vec.erase(vec.begin() + position);

// Search for a value
auto it = std::find(vec.begin(), vec.end(), target_value);
int index = (it != vec.end()) ? std::distance(vec.begin(), it) : -1;

// Get size
size_t sz = vec.size();
\`\`\`
\`\`\`python
# Python: Core list operations
# Insert at position
lst.insert(position, new_item)

# Get at position
val = lst[position]

# Delete at position
del lst[position]

# Search for a value
try:
    index = lst.index(target_value)
except ValueError:
    index = -1

# Get size
sz = len(lst)
\`\`\`
\`\`\`java
// Java: Core list operations
// Insert at position
list.add(position, newItem);

// Get at position
int val = list.get(position);

// Delete at position
list.remove(position);

// Search for a value
int index = list.indexOf(targetValue);

// Get size
int sz = list.size();
\`\`\``
      },
      {
        id: 'why-minimum-matters',
        title: 'Why "Minimum" Matters',
        content: `These five aren't a wish list — **they're the floor**. A structure that can't tell you its own size, or can't retrieve an item by position, has broken one of the guarantees from the previous page and doesn't get to call itself a List regardless of what else it does well.

> **Crucial Concept:** What's deliberately **not** specified here is performance.
> 
> The contract says \`get(index)\` must return the right value — it says nothing about whether that lookup takes the same amount of time regardless of position, or gets slower the deeper into the list you go.
> 
> Two structures can both honestly satisfy every operation on this list, correctly, while having completely different costs attached to each one. That gap — **same promises, different price tags** — is exactly what separates an ADT from an implementation, and it's the entire subject of the next page.`
      }
    ]
  },

  'adt-vs-implementation': {
    slug: 'adt-vs-implementation',
    title: 'ADT vs. Implementation',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'Opening up the vending machine: how the button-press contract maps to different physical mechanisms.',
    lead: `Time to actually open up the vending machine from a few pages back. Picture two different machines, built by two different manufacturers, both honoring the exact same button-press contract — press B4, get that snack. Pop the back panel off each one, though, and you'll find completely different internals.

One uses a tightly packed spiral coil, where every item sits in a fixed, numbered slot, and the machine just rotates the correct slot into position — fast and predictable, but every slot has to be pre-arranged and there's no room to squeeze in an extra item between two existing ones without redesigning the whole coil.

The other uses a loosely connected series of small compartments, each one holding a note pointing to where the next compartment is — nothing has to be pre-arranged in fixed slots, and a new compartment can be wired in anywhere without disturbing the rest, but reaching compartment #12 means physically working your way through the eleven before it.

> Both machines satisfy "press B4, get a snack." Neither one is more correct than the other. They're just different bets on where the mechanism should be cheap and where it's allowed to be expensive.`,
    sections: [
      {
        id: 'array-vs-linked-list-situation',
        title: 'This is precisely the array vs. linked list situation',
        content: `The **List ADT** is the button-press contract — \`insert\`, \`get\`, \`remove\`, \`find\`, \`size\`, guaranteed to behave correctly. Two of the most common ways to actually build that contract are:

- **An array-based list**: Every item sits in a fixed, contiguous block of memory — like the spiral coil, numbered slots in a row.
- **A linked list**: Each item is stored in its own small unit that also holds directions to the next one — like the chain of connected compartments.

Both satisfy every operation. Both are, honestly and correctly, a List. But look at what each one actually costs underneath:

### Cost Breakdown: Array vs. Linked List

#### 1. Array Operations
\`\`\`pseudocode
To get an item by index (array):
    1. Return data[index]                     // O(1)

To insert an item at the front (array):
    1. Loop from last index down to 0:
        a. Shift data[i] to data[i+1]         // O(n)
    2. Set data[0] to item
\`\`\`

\`\`\`c
// C: Array get & insert front
int array_get(int* data, int index) {
    return data[index]; // O(1)
}

void array_insert_front(int* data, int* size, int item) {
    for (int i = *size; i > 0; i--) {
        data[i] = data[i - 1]; // O(n) shift
    }
    data[0] = item;
    (*size)++;
}
\`\`\`
\`\`\`cpp
// C++: Array get & insert front
int arrayGet(const std::vector<int>& data, int index) {
    return data[index]; // O(1)
}

void arrayInsertFront(std::vector<int>& data, int item) {
    data.insert(data.begin(), item); // O(n) shift
}
\`\`\`
\`\`\`python
# Python: Array get & insert front
def array_get(data: list[int], index: int) -> int:
    return data[index] # O(1)

def array_insert_front(data: list[int], item: int) -> None:
    data.insert(0, item) # O(n) shift
\`\`\`
\`\`\`java
// Java: Array get & insert front
public static int arrayGet(int[] data, int index) {
    return data[index]; // O(1)
}

public static void arrayInsertFront(int[] data, int size, int item) {
    for (int i = size; i > 0; i--) {
        data[i] = data[i - 1]; // O(n) shift
    }
    data[0] = item;
}
\`\`\`

---

#### 2. Linked List Operations
\`\`\`pseudocode
To get an item by index (linked list):
    1. Point Current to Head
    2. Loop index times:
        a. Move Current to Current.next       // O(n)
    3. Return Current.data

To insert an item at the front (linked list):
    1. Create NewNode with data
    2. Point NewNode.next to Head
    3. Point Head to NewNode                  // O(1)
\`\`\`

\`\`\`c
// C: Linked list get & insert front
int list_get(Node* head, int index) {
    Node* current = head;
    for (int i = 0; i < index; i++) {
        current = current->next; // O(n) traversal
    }
    return current->data;
}

Node* list_insert_front(Node* head, int item) {
    Node* new_node = malloc(sizeof(Node));
    new_node->data = item;
    new_node->next = head; // O(1) pointer swing
    return new_node;
}
\`\`\`
\`\`\`cpp
// C++: Linked list get & insert front
int listGet(Node* head, int index) {
    Node* curr = head;
    for (int i = 0; i < index && curr; ++i) {
        curr = curr->next; // O(n)
    }
    return curr ? curr->data : -1;
}

void listInsertFront(Node*& head, int item) {
    head = new Node{item, head}; // O(1) pointer swing
}
\`\`\`
\`\`\`python
# Python: Linked list get & insert front
def list_get(head: Node | None, index: int) -> int:
    curr = head
    for _ in range(index):
        if curr:
            curr = curr.next
    return curr.data if curr else None

def list_insert_front(head: Node | None, item: int) -> Node:
    return Node(item, head) # O(1) pointer swing
\`\`\`
\`\`\`java
// Java: Linked list get & insert front
public static int listGet(Node head, int index) {
    Node curr = head;
    for (int i = 0; i < index && curr != null; i++) {
        curr = curr.next; // O(n)
    }
    return curr != null ? curr.data : -1;
}

public static Node listInsertFront(Node head, int item) {
    Node newNode = new Node(item);
    newNode.next = head; // O(1)
    return newNode;
}
\`\`\`

> Same \`get\`. Same \`insert_front\`. Wildly different cost, in both directions. The array is fast at direct access and slow at front-insertion. The linked list is exactly the opposite. Neither implementation is doing anything wrong — they're just two different mechanisms honoring one shared contract, with the cost distributed differently across the same set of operations.`
      },
      {
        id: 'why-distinction-matters',
        title: 'Why this distinction has to be permanently in your head',
        content: `> **Core Principle:** Because the moment you're solving a real problem, *"I need a List"* is an incomplete thought.
> 
> The real question is: *"I need a List, and this problem leans heavily on this specific operation — which mechanism makes that operation cheap?"*

Answering that requires knowing that the ADT and the implementation are two separate layers, and that picking a List doesn't automatically tell you which trade-offs you're accepting until you decide which mechanism is doing the work underneath.

The rest of this section walks through both mechanisms properly — starting with the array-based version, since it's the more familiar shape, before spending real time in the linked list, which is where most of the actual conceptual weight lives.`
      }
    ],
    pseudocode: `To get an item by index (array):
    1. Return data[index]                     // O(1)

To insert an item at the front (array):
    1. Loop from last index down to 0:
        a. Shift data[i] to data[i+1]         // O(n)
    2. Set data[0] to item

To get an item by index (linked list):
    1. Point Current to Head
    2. Loop index times:
        a. Move Current to Current.next       // O(n)
    3. Return Current.data

To insert an item at the front (linked list):
    1. Create NewNode with data
    2. Point NewNode.next to Head
    3. Point Head to NewNode                  // O(1)`,
    code: {
      c: `// === ARRAY-BASED LIST ===
int array_get(int* data, int index) {
    return data[index]; // O(1)
}

void array_insert_front(int* data, int* size, int item) {
    for (int i = *size; i > 0; i--) {
        data[i] = data[i - 1]; // O(n) shift
    }
    data[0] = item;
    (*size)++;
}

// === LINKED LIST ===
typedef struct Node {
    int data;
    struct Node* next;
} Node;

int list_get(Node* head, int index) {
    Node* current = head;
    for (int i = 0; i < index; i++) {
        current = current->next; // O(n) traversal
    }
    return current->data;
}

Node* list_insert_front(Node* head, int item) {
    Node* new_node = malloc(sizeof(Node));
    new_node->data = item;
    new_node->next = head; // O(1) pointer swing
    return new_node;
}`,
      cpp: `// === ARRAY-BASED LIST ===
#include <vector>

int arrayGet(const std::vector<int>& data, int index) {
    return data[index]; // O(1)
}

void arrayInsertFront(std::vector<int>& data, int item) {
    data.insert(data.begin(), item); // O(n)
}

// === LINKED LIST ===
struct Node {
    int data;
    Node* next;
};

int listGet(Node* head, int index) {
    Node* curr = head;
    for (int i = 0; i < index && curr; ++i) {
        curr = curr->next; // O(n)
    }
    return curr ? curr->data : -1;
}

void listInsertFront(Node*& head, int item) {
    head = new Node{item, head}; // O(1)
}`,
      python: `# === ARRAY-BASED LIST ===
def array_get(data: list[int], index: int) -> int:
    return data[index] # O(1) direct offset

def array_insert_front(data: list[int], item: int) -> None:
    data.insert(0, item) # O(n) shifting elements

# === LINKED LIST ===
class Node:
    def __init__(self, data: int, next=None):
        self.data = data
        self.next = next

def list_get(head: Node | None, index: int) -> int:
    curr = head
    for _ in range(index):
        if curr:
            curr = curr.next
    return curr.data if curr else None

def list_insert_front(head: Node | None, item: int) -> Node:
    return Node(item, head) # O(1) prepend`,
      java: `// === ARRAY VS LINKED LIST CONTRACT ===
public class ListAdtComparison {
    // Array: O(1) lookup, O(n) front insertion
    public static int arrayGet(int[] data, int index) {
        return data[index]; // O(1)
    }

    public static void arrayInsertFront(int[] data, int size, int item) {
        for (int i = size; i > 0; i--) {
            data[i] = data[i - 1]; // O(n)
        }
        data[0] = item;
    }

    // Linked List: O(n) lookup, O(1) front insertion
    public static class Node {
        public int data;
        public Node next;
        public Node(int data) { this.data = data; }
    }

    public static int listGet(Node head, int index) {
        Node curr = head;
        for (int i = 0; i < index && curr != null; i++) {
            curr = curr.next; // O(n)
        }
        return curr != null ? curr.data : -1;
    }

    public static Node listInsertFront(Node head, int item) {
        Node newNode = new Node(item);
        newNode.next = head; // O(1)
        return newNode;
    }
}`
    }
  },

  'implementations-of-the-list-adt': {
    slug: 'implementations-of-the-list-adt',
    title: 'Implementations of the List ADT',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The book series shelf analogy: continuous physical rows vs scattered rooms with directional notes.',
    lead: `Think about two different ways you could organize a shelf of books that form a series. In the first, every book sits directly beside the next one, in one continuous row — book 1, then book 2 right next to it, then book 3 right after that, no gaps. If you know the series starts at the left end of the shelf, you can point straight at the fourth book without touching the other three.

In the second, the books are scattered across different rooms entirely — book 1 might be on a desk, book 2 tucked into a shelf in another room, book 3 somewhere else again. The only way this still works as a series is if each book has a small note tucked inside its cover saying exactly which room and shelf to go to for the next one. To reach book 4, you have no choice but to start at book 1 and follow the notes, one at a time, through books 2 and 3 first.

> Both arrangements are genuinely "the same series, in order." They just store that order completely differently — one through physical position, one through explicit notes pointing forward.`,
    sections: [
      {
        id: 'two-implementations',
        title: 'Two Implementations',
        content: `The **array-based list** is the continuous shelf. Every element lives in one unbroken block of memory, back to back, and a position translates directly into a memory address — which is exactly why direct access is fast, and exactly why inserting something in the middle means physically shifting everything after it to make room, the same way squeezing a new book into the middle of that continuous shelf means sliding every book after it down by one spot.

The **linked list** is the scattered rooms with notes. Each element (a node) lives wherever it happens to be placed in memory, with no requirement that it sit near the others — and it carries an explicit pointer to wherever the next node happens to be. This is exactly why reaching a specific position requires walking through everything before it, and exactly why inserting something in the middle is cheap — you're not shifting anything, you're just rewriting one note to point somewhere new.

\`\`\`pseudocode
To represent an array-based list:
    1. Store values contiguously in one block: 10, 20, 30, 40

To represent a linked list:
    1. Point NodeA.next to NodeB
    2. Point NodeB.next to NodeC
    3. Point NodeC.next to NodeD
\`\`\`

\`\`\`c
// C: Array-based list vs Linked list
// Array-based list: contiguous memory
int array_list[] = {10, 20, 30, 40};

// Linked list: nodes wired with pointers
nodeA->next = nodeB;
nodeB->next = nodeC;
nodeC->next = nodeD;
\`\`\`
\`\`\`cpp
// C++: std::vector vs Linked Node Chain
// Array-based list: contiguous memory
std::vector<int> array_list = {10, 20, 30, 40};

// Linked list: pointer connections
nodeA->next = nodeB;
nodeB->next = nodeC;
nodeC->next = nodeD;
\`\`\`
\`\`\`python
# Python: List vs Linked Nodes
# Array-based list
array_list = [10, 20, 30, 40]

# Linked list
node_a.next = node_b
node_b.next = node_c
node_c.next = node_d
\`\`\`
\`\`\`java
// Java: Array vs Node Chain
// Array-based list
int[] arrayList = {10, 20, 30, 40};

// Linked list
nodeA.next = nodeB;
nodeB.next = nodeC;
nodeC.next = nodeD;
\`\`\``
      },
      {
        id: 'why-learn-both',
        title: 'Why Learn Both',
        content: `It's tempting to think *"just pick whichever one is faster"* and move on — but neither is faster in general, only faster at specific operations, in exactly the trade-off pattern the last page walked through.

> **Key Takeaway:** Knowing both properly means you're never stuck defaulting to whichever one you happen to remember better; you're actually choosing based on what the problem in front of you needs most.

The very next page goes deep on the array-based version specifically — including a detail that trips up a lot of students the first time they see it: what actually happens when an array-based list runs out of room and needs to grow. After that, the rest of this course spends serious time in the linked list, building it up from its smallest working piece.`
      }
    ]
  },

  'array-list-and-amortized-growth': {
    slug: 'array-list-and-amortized-growth',
    title: 'Amortized Growth',
    folder: '02-list-adt',
    category: '02-list-adt',
    summary: 'The moving house analogy: why dynamic arrays double capacity on overflow and how amortized O(1) works.',
    lead: `A family starts out in a small apartment — enough room for two people, comfortably. A third person joins, and it's tight but workable. A fourth arrives, and now it's genuinely full — every room accounted for, no space left to add so much as a bed.

At this point, nobody moves house to gain exactly one extra room. That would mean going through the entire ordeal of packing, hiring movers, and unpacking again the very next time someone new joins. Instead, the sensible move is to jump to a place roughly twice the size — enough room to keep adding people for a good while before this whole moving process has to happen again.

> Moving itself is expensive and disruptive. But because it happens rarely, and buys a long stretch of "just walk in and use the new room" afterward, the average hassle per new family member stays low, even though any single moving day is a big deal on its own.`,
    sections: [
      {
        id: 'resizing-on-overflow',
        title: 'Resizing on Overflow',
        content: `An array is a fixed block of memory, decided at creation time. The moment you try to add one more item than it has room for, there's no way to just "add a bit more space" onto the end — whatever memory happens to sit right after your array is very likely already being used by something else entirely.

The only option is to allocate a brand new, bigger block elsewhere, and copy every existing element over into it.

\`\`\`pseudocode
To append an item:
    1. If Size equals Capacity:
        a. Double Capacity
        b. Allocate NewArray of Capacity
        c. Loop through existing items:
            i. Copy Array[i] to NewArray[i]   // O(n) — the "moving day"
        d. Point Array to NewArray
    2. Set Array[Size] to item
    3. Increment Size                          // amortized O(1)
\`\`\`

\`\`\`c
// C: Resizing on Overflow
if (size == capacity) {
    capacity *= 2;
    int* new_array = malloc(capacity * sizeof(int));
    for (int i = 0; i < size; i++) {
        new_array[i] = array[i]; // O(n) copy
    }
    free(array);
    array = new_array;
}
array[size] = item;
size++;
\`\`\`
\`\`\`cpp
// C++: Resizing on Overflow
if (size == capacity) {
    capacity *= 2;
    int* new_array = new int[capacity];
    for (size_t i = 0; i < size; i++) {
        new_array[i] = array[i]; // O(n) copy
    }
    delete[] array;
    array = new_array;
}
array[size++] = item;
\`\`\`
\`\`\`python
# Python: Resizing on Overflow (simulated)
if size == capacity:
    capacity *= 2
    new_array = [None] * capacity
    for i in range(size):
        new_array[i] = array[i] # O(n) copy
    array = new_array

array[size] = item
size += 1
\`\`\`
\`\`\`java
// Java: Resizing on Overflow
if (size == capacity) {
    capacity *= 2;
    int[] newArray = new int[capacity];
    System.arraycopy(array, 0, newArray, 0, size); // O(n) copy
    array = newArray;
}
array[size++] = item;
\`\`\`

Doubling, rather than growing by a fixed small amount, is the deliberate choice here — the same reasoning as jumping to a much bigger apartment instead of one with exactly one extra room. Growing by a small fixed amount every time means moving day happens constantly. Doubling means moving day gets rarer and rarer the bigger the list gets, even though each individual move copies more elements than the last.`
      },
      {
        id: 'why-amortized-o1',
        title: 'Why Amortized O(1)',
        content: `This is the part that trips people up the first time they see it. Any single append that triggers a resize costs \`O(n)\` — real, undeniable work, copying every element.

But look at what happens across a long sequence of appends: most of them land in already-available room and cost a constant, tiny amount. Only the rare ones, at positions 2, 4, 8, 16, 32, and so on, trigger a full resize.

> **Key Insight:** Spread that occasional expensive cost out evenly across all the cheap ones that came before it, and the average cost per append settles down to a constant — this is what **amortized \`O(1)\`** means.
> 
> It's not a claim that every single operation is cheap. It's a claim about the average cost across a long run of operations, the exact same way "moving house is rare enough that the average hassle per new family member stays low" doesn't mean moving day itself was cheap.`
      },
      {
        id: 'practical-notes',
        title: 'Practical Notes',
        content: `If you can estimate your list's eventual size upfront, pre-allocating that capacity from the start skips the repeated moving entirely — genuinely faster in practice, not just in theory.

And doubling isn't free of cost even when amortized nicely: it can temporarily use up to twice the memory you actually need, right after a resize, before the list fills back up. That's the trade being made — some wasted space, in exchange for cheap growth on average.

> With this piece in place, the array-based side of the List ADT is fully covered. Everything from here on shifts to the other implementation from a few pages ago — the scattered rooms connected by notes — starting from its smallest possible building block.`
      }
    ],
    pseudocode: `To append an item:
    1. If Size equals Capacity:
        a. Double Capacity
        b. Allocate NewArray of Capacity
        c. Loop through existing items:
            i. Copy Array[i] to NewArray[i]   // O(n) — the "moving day"
        d. Point Array to NewArray
    2. Set Array[Size] to item
    3. Increment Size                          // amortized O(1)`,
    code: {
      c: `// C LOGIC: Dynamic Array Append with Geometric Doubling
#include <stdio.h>
#include <stdlib.h>

void append(int** array, int* size, int* capacity, int item) {
    if (*size == *capacity) {
        *capacity = (*capacity == 0) ? 2 : (*capacity * 2);
        int* new_array = malloc((*capacity) * sizeof(int));
        for (int i = 0; i < *size; i++) {
            new_array[i] = (*array)[i]; // O(n) copy
        }
        free(*array);
        *array = new_array;
    }
    (*array)[*size] = item;
    (*size)++;
}`,
      cpp: `// C++ Vector-Style Dynamic Array
#include <iostream>

template <typename T>
class DynamicArray {
    T* data = nullptr;
    size_t sz = 0, cap = 0;
public:
    void append(const T& item) {
        if (sz == cap) {
            cap = (cap == 0) ? 2 : cap * 2;
            T* next = new T[cap];
            for (size_t i = 0; i < sz; ++i) {
                next[i] = data[i]; // O(n) copy
            }
            delete[] data;
            data = next;
        }
        data[sz++] = item; // amortized O(1)
    }
};`,
      python: `# Python: Simulating Dynamic Array Resizing
class DynamicArray:
    def __init__(self):
        self.capacity = 2
        self.size = 0
        self.data = [None] * self.capacity

    def append(self, item):
        if self.size == self.capacity:
            self.capacity *= 2
            new_data = [None] * self.capacity
            for i in range(self.size):
                new_data[i] = self.data[i] # O(n) copy
            self.data = new_data
        self.data[self.size] = item
        self.size += 1 # amortized O(1)`,
      java: `// Java: Dynamic Array Growth Simulation
public class DynamicArray {
    private int[] data = new int[2];
    private int size = 0;

    public void append(int item) {
        if (size == data.length) {
            int[] next = new int[data.length * 2];
            System.arraycopy(data, 0, next, 0, size); // O(n) copy
            data = next;
        }
        data[size++] = item; // amortized O(1)
    }
}`
    }
  }
};
