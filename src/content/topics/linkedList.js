export const linkedListTopics = {
  'why-a-linked-list': {
    slug: 'why-a-linked-list',
    title: 'Why a Linked List?',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The treasure hunt analogy: numbered maps vs clue-by-clue chains, and where pointer-based mutations shine.',
    lead: `Think about two different kinds of treasure hunts. In the first, you're handed a numbered map — spot 1, spot 2, spot 3, all marked at fixed positions, and you can walk straight to spot 7 without visiting the others first, because you know exactly where it is.

In the second kind, you get one clue at a time — clue 1 tells you where to physically go to find clue 2, clue 2 tells you where to find clue 3, and so on. There's no map showing everything at once. To reach clue 7, you have no shortcut — you go through 1 through 6 first, in order, because that's the only way the information connects.

Here's the interesting part: if the organizer wants to slip a brand-new clue into the middle of the second hunt — say, between clue 3 and clue 4 — it's almost trivial. They just change what clue 3 points to, insert the new clue in between, and have it point to the old clue 4. Nothing else in the entire hunt needs to be touched or renumbered.

Now try the same insertion on the numbered map. Adding a new required stop between spot 3 and spot 4 means every single spot after it — 4, 5, 6, 7 — needs to be relabeled, because the numbering itself carries the structure.`,
    sections: [
      {
        id: 'the-entire-reason',
        title: 'The Entire Reason',
        content: `The **numbered map** is your array-based list from the last few pages — direct, fast access to any position, at the cost of expensive insertion and deletion anywhere except the very end.

The **clue-by-clue hunt** is a linked list — no direct access, you always start from the beginning and follow the chain — but insertion and deletion anywhere in that chain becomes cheap, because nothing needs to shift or get renumbered. You're just changing where one clue points.

\`\`\`pseudocode
To insert in the middle (array):
    1. Loop from last index down to InsertIndex:
        a. Shift each element right by one         // O(n)
    2. Set Array[InsertIndex] to NewValue

To insert in the middle (linked list):
    1. Point NewNode.next to Prev.next
    2. Point Prev.next to NewNode                  // O(1) once Prev is known
\`\`\`

\`\`\`c
// C: Insert in the middle (Array vs Linked List)
// Array: insert in the middle
for (int i = size; i > insert_index; i--) {
    array[i] = array[i - 1]; // O(n) shift
}
array[insert_index] = new_value;
size++;

// Linked list: insert in the middle
Node* new_node = malloc(sizeof(Node));
new_node->data = new_value;
new_node->next = prev->next;
prev->next = new_node; // O(1) pointer swap
\`\`\`
\`\`\`cpp
// C++: Insert in the middle (Array vs Linked List)
// Array: insert in the middle
array.insert(array.begin() + insert_index, new_value); // O(n) shift

// Linked list: insert in the middle
Node* newNode = new Node(new_value);
newNode->next = prev->next;
prev->next = newNode; // O(1) pointer swap
\`\`\`
\`\`\`python
# Python: Insert in the middle (Array vs Linked List)
# Array: insert in the middle
array.insert(insert_index, new_value) # O(n) shift

# Linked list: insert in the middle
new_node = Node(new_value)
new_node.next = prev.next
prev.next = new_node # O(1) pointer swap
\`\`\`
\`\`\`java
// Java: Insert in the middle (Array vs Linked List)
// Array: insert in the middle
for (int i = size; i > insertIndex; i--) {
    array[i] = array[i - 1]; // O(n) shift
}
array[insertIndex] = newValue;
size++;

// Linked list: insert in the middle
Node newNode = new Node(newValue);
newNode.next = prev.next;
prev.next = newNode; // O(1) pointer swap
\`\`\``
      },
      {
        id: 'what-youre-paying-for',
        title: "What You're Paying For",
        content: `Nothing in engineering is free. The linked list gives up the numbered map's biggest advantage — **the ability to jump straight to any position**. Wanting item 7 means walking through items 1 through 6 first, every time, with no shortcut.

It also carries a small memory cost per item, since every node needs to store not just its value but the direction to the next one — the map's numbering was, in a sense, "free" structure that the clue-chain has to pay for explicitly, one pointer at a time.

> **Engineering Rule:** So the real answer to *"why a linked list"* isn't *"it's better than an array."*
> 
> It's: reach for it specifically when your problem leans heavily on inserting and removing things — especially away from the very end — and you can live without ever needing to jump straight to an arbitrary position.
> 
> The rest of this section builds that clue-chain up piece by piece, starting with what a single clue card actually contains.`
      }
    ]
  },

  'anatomy-of-a-node': {
    slug: 'anatomy-of-a-node',
    title: 'Anatomy of a Node',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The scavenger hunt clue card analogy: data payloads, next pointers, and building chains.',
    lead: `Pick up any single clue card from that scavenger hunt and look at what's actually written on it.

There are only ever two things on the card, and it's never more than that. First, the clue itself — the actual content you're there for, whatever it is. Second, a set of directions telling you exactly where to go find the next card. That's the whole card.

Nothing about its size or shape depends on how many other cards exist in the hunt, and it genuinely doesn't matter where physically the next card is sitting — under a bench three streets away, in a locker across town, wherever — the directions on this card will get you there regardless of distance.`,
    sections: [
      {
        id: 'node-structure',
        title: 'Node Structure',
        content: `Every element in a linked list — called a node — is built from precisely two parts:

\`\`\`pseudocode
To create a node:
    1. Store data in Node.data
    2. Point Node.next to None                // no next node yet
\`\`\`

\`\`\`c
// C: Initialize node fields
node->data = data;
node->next = NULL;
\`\`\`
\`\`\`cpp
// C++: Initialize node fields
node->data = data;
node->next = nullptr;
\`\`\`
\`\`\`python
# Python: Initialize node fields
self.data = data
self.next = None
\`\`\`
\`\`\`java
// Java: Initialize node fields
this.data = data;
this.next = null;
\`\`\`

- \`data\` is the **payload** — the actual thing you care about, whether that's a number, a name, or something more complex.
- \`next\` is a **pointer** — a reference to wherever the following node happens to live in memory.

When \`next\` is \`None\` / \`NULL\`, that's the equivalent of a clue card that says *"this is the end of the hunt"* — there's nowhere further to go.

> **Key Detail:** A node's \`next\` doesn't store another node's value. It stores that node's **address** — where to find it.
> 
> This is exactly why dereferencing matters: following \`current.next\` means *"go to the address written on this card,"* not *"here's a copy of the next value already in hand."*`
      },
      {
        id: 'smallest-possible-chain',
        title: 'Smallest Possible Chain',
        content: `Two nodes, manually wired together, look like this:

\`\`\`pseudocode
To link two nodes:
    1. Create First with data 10
    2. Create Second with data 20
    3. Point First.next to Second             // O(1)
\`\`\`

\`\`\`c
// C: Linking two nodes
Node* first = malloc(sizeof(Node));
first->data = 10;
first->next = NULL;

Node* second = malloc(sizeof(Node));
second->data = 20;
second->next = NULL;

first->next = second; // Chain wired!
\`\`\`
\`\`\`cpp
// C++: Linking two nodes
Node<int>* first = new Node<int>(10);
Node<int>* second = new Node<int>(20);
first->next = second; // Chain wired!
\`\`\`
\`\`\`python
# Python: Linking two nodes
first = Node(10)
second = Node(20)
first.next = second # Chain wired!
\`\`\`
\`\`\`java
// Java: Linking two nodes
Node<Integer> first = new Node<>(10);
Node<Integer> second = new Node<>(20);
first.next = second; // Chain wired!
\`\`\`

> **Critical Concept:** At this point, \`first\` is the entry point into a two-node chain. There's no separate "list" object holding both of them together in one place — the only thing connecting \`first\` and \`second\` is that one \`next\` pointer.
> 
> Lose your reference to \`first\`, and you've lost the entire chain, even though \`second\` still technically exists somewhere in memory, now unreachable.`
      },
      {
        id: 'draw-it-out',
        title: 'Draw It Out',
        content: `> **Engineering Rule:** Whenever you're handed an unfamiliar linked list problem, drawing three or four boxes on paper, each with a value and an arrow to the next box, is not optional busywork.
> 
> It's the fastest way to actually see what a piece of code is doing to those connections, rather than guessing. Every page from here forward — traversal, insertion, deletion — is really just different ways of reading or rewriting these arrows, one card at a time.`
      }
    ],
    pseudocode: `To create a node:
    1. Store data in Node.data
    2. Point Node.next to None                // no next node yet

To link two nodes:
    1. Create First with data 10
    2. Create Second with data 20
    3. Point First.next to Second             // O(1)`,
    code: {
      c: `// C LOGIC: Node Structure and Chain Creation
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

int main(void) {
    // 1. Initialize First Node
    Node* first = malloc(sizeof(Node));
    first->data = 10;
    first->next = NULL;

    // 2. Initialize Second Node
    Node* second = malloc(sizeof(Node));
    second->data = 20;
    second->next = NULL;

    // 3. Link Nodes: First points to Second
    first->next = second; // Chain wired!

    return 0;
}`,
      cpp: `// C++ Node Representation & Chain Linking
#include <iostream>

template <typename T>
struct Node {
    T data;
    Node* next;
    Node(T val) : data(val), next(nullptr) {}
};

int main() {
    Node<int>* first = new Node<int>(10);
    Node<int>* second = new Node<int>(20);
    
    // Wire chain
    first->next = second;
    return 0;
}`,
      python: `# Python: Node Class and Manual Wiring
class Node:
    def __init__(self, data, next=None):
        self.data = data
        self.next = next

# Two-node chain
first = Node(10)
second = Node(20)
first.next = second`,
      java: `// Java: Node Class & Linking Example
public class NodeDemo {
    public static class Node<T> {
        public T data;
        public Node<T> next;

        public Node(T data) {
            this.data = data;
            this.next = null;
        }
    }

    public static void main(String[] args) {
        Node<Integer> first = new Node<>(10);
        Node<Integer> second = new Node<>(20);
        first.next = second; // Wire chain
    }
}`
    }
  },

  'traversal': {
    slug: 'traversal',
    title: 'Traversal',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The clue walking analogy: following next pointers one hop at a time, index lookups, and avoiding infinite loops.',
    lead: `If you want to reach clue 7 in that scavenger hunt, there's exactly one way to get there: start at clue 1, read where it points, walk to clue 2, read where that points, and keep repeating until you physically arrive at clue 7.

There is no shortcut, no map showing every clue's location at once. The only information you ever have in your hand is *"here's the current clue, and here's where the next one is."* That's the whole game.`,
    sections: [
      {
        id: 'walking-a-linked-list',
        title: 'Walking a Linked List',
        content: `There's no indexing operation that magically jumps to a position — you always start at the beginning and follow next pointers one hop at a time, until you either find what you're looking for or run out of chain.

\`\`\`pseudocode
To traverse a list:
    1. Point Current to Head
    2. Loop while Current is not None:
        a. Visit Current.data
        b. Move Current to Current.next           // O(n)
\`\`\`

\`\`\`c
// C: Walking a linked list
Node* current = head;
while (current != NULL) {
    visit(current->data);
    current = current->next;
}
\`\`\`
\`\`\`cpp
// C++: Walking a linked list
Node* current = head;
while (current != nullptr) {
    visit(current->data);
    current = current->next;
}
\`\`\`
\`\`\`python
# Python: Walking a linked list
current = head
while current is not None:
    visit(current.data)
    current = current.next
\`\`\`
\`\`\`java
// Java: Walking a linked list
Node current = head;
while (current != null) {
    visit(current.data);
    current = current.next;
}
\`\`\`

> \`Current\` is your position in the hunt — *"which clue card am I holding right now."*
> 
> Each loop iteration does exactly one thing: look at the current card, then move to wherever it points. When \`Current\` becomes \`None\` / \`NULL\`, you've fallen off the end of the chain — there's no more hunt left.`
      },
      {
        id: 'why-this-costs-differently',
        title: 'Why This Costs Differently',
        content: `Reaching a specific position by index is where the map-vs-clue-chain trade-off from a few pages ago becomes unavoidable.

Getting to position 7 in an array is one direct calculation — \`O(1)\`. Getting to position 7 in a linked list means physically walking through positions 1 through 6 first — \`O(n)\`, every single time, no matter how many times you've walked that same path before.

\`\`\`pseudocode
To get the item at a target index:
    1. Point Current to Head
    2. Set Index to 0
    3. Loop while Current is not None:
        a. If Index equals TargetIndex, return Current.data
        b. Move Current to Current.next
        c. Increment Index                        // O(n)
    4. Return not-found
\`\`\`

\`\`\`c
// C: Get item at target index
Node* current = head;
int index = 0;
while (current != NULL) {
    if (index == target_index) {
        return current->data;
    }
    current = current->next;
    index++;
}
return -1;
\`\`\`
\`\`\`cpp
// C++: Get item at target index
Node* current = head;
int index = 0;
while (current != nullptr) {
    if (index == target_index) {
        return current->data;
    }
    current = current->next;
    index++;
}
return -1;
\`\`\`
\`\`\`python
# Python: Get item at target index
current = head
index = 0
while current is not None:
    if index == target_index:
        return current.data
    current = current.next
    index += 1
return None
\`\`\`
\`\`\`java
// Java: Get item at target index
Node current = head;
int index = 0;
while (current != null) {
    if (index == targetIndex) {
        return current.data;
    }
    current = current.next;
    index++;
}
return -1;
\`\`\`

> Notice this function is really just traversal with a counter attached, stopping early once the counter matches what you're looking for.
> 
> Nearly every linked list operation you'll learn from here on is built the exact same way — walk the chain, and do something specific at each step or at a particular stopping point.`
      },
      {
        id: 'the-pitfall',
        title: 'The Pitfall',
        content: `The single most common mistake at this stage is **forgetting to actually move \`Current\` forward inside the loop** — writing the loop condition and then never updating \`current = current->next\` anywhere inside it.

> **Warning:** The loop condition never changes, and you get stuck reading the same first card forever.
> 
> If a linked list traversal ever seems to hang indefinitely on a list you know is finite, this is almost always where to look first.
> 
> With walking the chain down cold, the next few pages turn to actually changing it — starting with the three genuinely different ways you can insert a new card into an existing hunt.`
      }
    ]
  },

  'insertion-head-middle-tail': {
    slug: 'insertion-head-middle-tail',
    title: 'Insertion: Head, Middle, and Tail',
    folder: '03-linked-list',
    category: '03-linked-list',
    interactiveVisualizer: 'sll-insertion',
    summary: 'The three insertion cases: O(1) head prepending, O(n) tail appending, and safe pointer sequencing in the middle.',
    lead: `Adding a new card to an ongoing scavenger hunt plays out differently depending on where you're adding it, and it's worth walking through all three cases separately, because each one asks something slightly different of you.`,
    sections: [
      {
        id: 'head-insertion',
        title: 'Head Insertion',
        content: `This is the easiest case by far. You simply make your new card the new starting point of the hunt, and have it point to whatever used to be first. Nobody who was already partway through the old chain is affected at all — you've only changed where the hunt begins.

\`\`\`pseudocode
To insert at the head:
    1. Create NewNode with value
    2. Point NewNode.next to Head
    3. Return NewNode as new Head                   // O(1)
\`\`\`

\`\`\`c
// C: Insert at head
Node* new_node = malloc(sizeof(Node));
new_node->data = value;
new_node->next = head;
head = new_node;
\`\`\`
\`\`\`cpp
// C++: Insert at head
Node* newNode = new Node(value);
newNode->next = head;
head = newNode;
\`\`\`
\`\`\`python
# Python: Insert at head
new_node = Node(value)
new_node.next = head
head = new_node
\`\`\`
\`\`\`java
// Java: Insert at head
Node newNode = new Node(value);
newNode.next = head;
head = newNode;
\`\`\`

> This is **\`O(1)\`** — a fixed amount of work, completely independent of how long the rest of the hunt is. No walking required at all.`
      },
      {
        id: 'tail-insertion',
        title: 'Tail Insertion',
        content: `Here, you have no choice but to walk the entire existing chain first, because the only way to find "the last card" is to keep following next pointers until one of them points to nothing. Once you're standing at that last card, attaching the new one is trivial.

\`\`\`pseudocode
To insert at the tail:
    1. Create NewNode with value
    2. If Head is None:
        a. Return NewNode as Head
    3. Point Current to Head
    4. Loop while Current.next is not None:
        a. Move Current to Current.next             // O(n) to find the end
    5. Point Current.next to NewNode
    6. Return Head
\`\`\`

\`\`\`c
// C: Insert at tail
Node* new_node = malloc(sizeof(Node));
new_node->data = value;
new_node->next = NULL;

if (head == NULL) {
    return new_node;
}

Node* current = head;
while (current->next != NULL) {
    current = current->next;
}
current->next = new_node;
return head;
\`\`\`
\`\`\`cpp
// C++: Insert at tail
Node* newNode = new Node(value);
newNode->next = nullptr;

if (head == nullptr) {
    return newNode;
}

Node* current = head;
while (current->next != nullptr) {
    current = current->next;
}
current->next = newNode;
return head;
\`\`\`
\`\`\`python
# Python: Insert at tail
new_node = Node(value)
new_node.next = None

if head is None:
    return new_node

current = head
while current.next is not None:
    current = current.next
current.next = new_node
return head
\`\`\`
\`\`\`java
// Java: Insert at tail
Node newNode = new Node(value);
newNode.next = null;

if (head == null) {
    return newNode;
}

Node current = head;
while (current.next != null) {
    current = current.next;
}
current.next = newNode;
return head;
\`\`\`

> This costs **\`O(n)\`** — not because attaching the card is expensive, but because finding the end requires walking the whole chain first.
> 
> This is exactly why some linked list implementations keep a separate, always-up-to-date pointer directly to the last node — a small bit of extra bookkeeping that turns this into **\`O(1)\`** as well, at the cost of needing to maintain that extra pointer correctly through every other operation too.`
      },
      {
        id: 'middle-insertion',
        title: 'Middle Insertion',
        content: `This is the case that actually needs the most care. To insert after a specific card, you need to be holding that card already — call it \`Prev\`. From there, the new card takes over \`Prev\`'s old connection, and \`Prev\` gets redirected to point at the new card instead:

\`\`\`pseudocode
To insert after Prev:
    1. Create NewNode with value
    2. Point NewNode.next to Prev.next
    3. Point Prev.next to NewNode                   // O(1) once Prev is known
\`\`\`

\`\`\`c
// C: Insert after Prev
Node* new_node = malloc(sizeof(Node));
new_node->data = value;
new_node->next = prev->next;
prev->next = new_node;
\`\`\`
\`\`\`cpp
// C++: Insert after Prev
Node* newNode = new Node(value);
newNode->next = prev->next;
prev->next = newNode;
\`\`\`
\`\`\`python
# Python: Insert after Prev
new_node = Node(value)
new_node.next = prev.next
prev.next = new_node
\`\`\`
\`\`\`java
// Java: Insert after Prev
Node newNode = new Node(value);
newNode.next = prev.next;
prev.next = newNode;
\`\`\`

> **Critical Warning:** Get the order of those two lines backward, and you lose the rest of the chain entirely!
> 
> If you set \`prev->next = new_node\` first, you've already overwritten the only reference to whatever used to come after \`prev\`, and \`new_node->next = prev->next\` would now just be pointing the new card at itself.`
      },
      {
        id: 'the-common-pattern',
        title: 'The Common Pattern',
        content: `Every insertion, no matter where it happens, comes down to the same **two-step move**: figure out what the new node's \`next\` should be, and figure out what the node before it should now point to.

Head insertion skips the second step because there's no "before." Tail and middle insertion both need it — the only real difference between them is how much walking it takes to find that "before" node in the first place.

> That *"you need the node before it"* requirement shows up again immediately in the next page, except this time it's not optional extra work — it's the entire reason deletion needs to be handled carefully.`
      }
    ]
  },

  'deletion-why-you-need-previous': {
    slug: 'deletion-why-you-need-previous',
    title: 'Deletion: Need for Previous',
    folder: '03-linked-list',
    category: '03-linked-list',
    interactiveVisualizer: 'sll-deletion',
    summary: 'The clue skipping analogy: why deleting a node requires redirecting its predecessor and the O(n) search for previous.',
    lead: `Say you want to pull clue 5 out of the hunt entirely, so nobody following the chain ever encounters it again.

Here's the thing — you don't do anything to clue 5's card itself. Tearing it up or crossing it out doesn't remove it from the hunt, because the hunt isn't defined by which cards physically exist, it's defined by which cards are reachable by following directions from the start.

So instead, you go to clue 4 — the card right before it — and change its directions to point straight to clue 6, skipping clue 5 entirely. Clue 5's card can now sit there, untouched, forever, and it doesn't matter — nothing points to it anymore, so nobody following the hunt will ever arrive at it.`,
    sections: [
      {
        id: 'the-mechanism',
        title: 'The Mechanism',
        content: `You never delete a node "from itself." You delete it by changing what the node before it points to:

\`\`\`pseudocode
To delete the node after Prev:
    1. Point NodeToRemove to Prev.next
    2. Point Prev.next to NodeToRemove.next     // O(1)
\`\`\`

\`\`\`c
// C: Delete node after Prev
Node* node_to_remove = prev->next;
prev->next = node_to_remove->next;
free(node_to_remove);
\`\`\`
\`\`\`cpp
// C++: Delete node after Prev
Node* nodeToRemove = prev->next;
prev->next = nodeToRemove->next;
delete nodeToRemove;
\`\`\`
\`\`\`python
# Python: Delete node after Prev
node_to_remove = prev.next
prev.next = node_to_remove.next
\`\`\`
\`\`\`java
// Java: Delete node after Prev
Node nodeToRemove = prev.next;
prev.next = nodeToRemove.next;
\`\`\`

> One line does the actual removal: \`prev->next = node_to_remove->next\`.
> 
> Everything before that line is just there to help you see clearly what's happening — \`prev\` used to point to \`node_to_remove\`, and now it points to whatever \`node_to_remove\` used to point to, cutting \`node_to_remove\` out of the chain entirely.`
      },
      {
        id: 'why-previous-is-mandatory',
        title: 'Why Previous Is Mandatory',
        content: `Here's the situation that actually trips people up: **what if you're handed a direct reference to the node you want to delete, but not to the node before it?**

In a singly linked list — where each node only knows what comes after it, never what came before — you're stuck. There's no way to ask a node *"who points to you."*

Your only option is to start over from the head and walk the chain until you find whoever's \`next\` happens to equal the node you're trying to remove:

\`\`\`pseudocode
To delete a target node from the list:
    1. If Head equals Target:
        a. Point Head to Head.next
        b. Return Head
    2. Point Current to Head
    3. Loop while Current.next is not None:
        a. If Current.next equals Target:
            i. Point Current.next to Target.next   // O(1) once found
            ii. Return Head
        b. Move Current to Current.next             // O(n) to find
    4. Return Head                                    // target not found
\`\`\`

\`\`\`c
// C: Delete target node (Finding Previous)
if (head == target) {
    head = head->next;
    free(target);
    return head;
}

Node* current = head;
while (current->next != NULL) {
    if (current->next == target) {
        current->next = target->next;
        free(target);
        return head;
    }
    current = current->next;
}
return head;
\`\`\`
\`\`\`cpp
// C++: Delete target node (Finding Previous)
if (head == target) {
    head = head->next;
    delete target;
    return head;
}

Node* current = head;
while (current->next != nullptr) {
    if (current->next == target) {
        current->next = target->next;
        delete target;
        return head;
    }
    current = current->next;
}
return head;
\`\`\`
\`\`\`python
# Python: Delete target node (Finding Previous)
if head == target:
    return head.next

current = head
while current.next is not None:
    if current.next == target:
        current.next = target.next
        return head
    current = current.next
return head
\`\`\`
\`\`\`java
// Java: Delete target node (Finding Previous)
if (head == target) {
    return head.next;
}

Node current = head;
while (current.next != null) {
    if (current.next == target) {
        current.next = target.next;
        return head;
    }
    current = current.next;
}
return head;
\`\`\`

> That search is **\`O(n)\`**, even though the actual deletion itself — one pointer reassignment — is instant.
> 
> The cost here isn't in removing the node. It's entirely in finding the node standing right before it.`
      },
      {
        id: 'edge-case-head-deletion',
        title: 'Edge Case: Head Deletion',
        content: `Deleting the very first node is its own special case, and the code above handles it explicitly — there's no "previous" node at all when you're removing the head, so instead of rewriting somebody else's \`next\`, you're moving the \`head\` reference itself forward by one step.

> **Looking Ahead:** This exact pain point — needing to walk the whole list just to find "the one before" — is precisely the itch that the next page's structure was invented to scratch.
> 
> Give every node a second pointer, one that already knows what came before it, and this entire search disappears.`
      }
    ]
  },

  'types-doubly-and-circular': {
    slug: 'types-doubly-and-circular',
    title: 'Types: Doubly and Circular',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The bidirectional clue cards and endless loop analogies: understanding Doubly and Circular linked lists.',
    lead: `Imagine redesigning the scavenger hunt so that every card carries directions in both directions — not just "here's where clue 6 is," but also "here's where clue 4 is," written right there on clue 5's card. Suddenly you're never stuck. Standing at any clue, you can walk forward to the next one or backward to the previous one, without needing to have kept track of where you came from. You could start the whole hunt over from the very last clue and walk it in reverse, and it would work exactly as well as walking it forward.

Now imagine a completely different modification: instead of the very last clue saying "the hunt is over," it says "go back to clue 1." The hunt becomes a loop — there's no true end anymore, just a cycle you could walk around indefinitely.`,
    sections: [
      {
        id: 'two-separate-upgrades',
        title: 'Two Separate Upgrades',
        content: `A **doubly linked list** gives every node a second pointer, back to whatever came before it.

\`\`\`pseudocode
To create a doubly linked node:
    1. Store data in Node.data
    2. Point Node.next to None                 // forward
    3. Point Node.prev to None                 // backward — new
\`\`\`

\`\`\`c
// C: Initialize doubly linked node fields
node->data = data;
node->next = NULL;
node->prev = NULL;
\`\`\`
\`\`\`cpp
// C++: Initialize doubly linked node fields
node->data = data;
node->next = nullptr;
node->prev = nullptr;
\`\`\`
\`\`\`python
# Python: Initialize doubly linked node fields
self.data = data
self.next = None
self.prev = None
\`\`\`
\`\`\`java
// Java: Initialize doubly linked node fields
this.data = data;
this.next = null;
this.prev = null;
\`\`\`

> The direct payoff is exactly what solved the pain point from the last page: a node no longer needs anyone else to tell it what comes before it — **it already knows**.
> 
> That "walk the whole list just to find the previous node" search disappears entirely, at the cost of one extra pointer's worth of memory per node, and one extra connection to keep correctly updated on every single insertion and deletion from here on.

---

A **circular linked list** changes a completely different thing — not how many directions a node has, but where the last node's forward pointer leads.

\`\`\`pseudocode
To close a list into a circle:
    1. Point Tail.next to Head                 // instead of None
\`\`\`

\`\`\`c
// C: Closing list into a circle
tail->next = head;
\`\`\`
\`\`\`cpp
// C++: Closing list into a circle
tail->next = head;
\`\`\`
\`\`\`python
# Python: Closing list into a circle
tail.next = head
\`\`\`
\`\`\`java
// Java: Closing list into a circle
tail.next = head;
\`\`\`

> There's no longer a node whose \`next\` is \`None\` / \`NULL\` — meaning traversal code that relies on *"stop when you hit None"* will now loop forever if you're not careful, since the chain genuinely has no end.
> 
> This shape is useful anywhere the underlying problem is naturally cyclical — a rotation that keeps repeating, a fixed set of players taking turns in order, anything where *"after the last one, go back to the first"* is the actual real-world behavior you're modeling, not a bug.`
      },
      {
        id: 'independent-upgrades',
        title: 'Independent Upgrades',
        content: `A list can be **doubly linked without being circular** — the version described above, with a clear head and tail, just now walkable in both directions.

A list can be **circular without being doubly linked** — nodes only pointing forward, but the last one's forward pointer wrapping back around instead of terminating.

And a list can be **both at once**: every node points both forward and backward, and both ends wrap around to meet each other. Which combination you reach for depends entirely on what your specific problem actually needs — backward walking, endless cycling, both, or neither, which is exactly what the plain singly linked list from the earlier pages already covers.

> **Looking Forward:** The next page puts these changes into practice, walking through exactly how insertion and deletion shift once a node knows its own previous connection, and once the chain no longer has a true end to walk off of.`
      }
    ]
  },

  'insertion-deletion-doubly-circular': {
    slug: 'insertion-deletion-doubly-circular',
    title: 'Doubly & Circular: Insert/Delete',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The search-free mutation advantage: O(1) doubly linked deletions, 4-pointer insertions, and circular wraparounds.',
    lead: `Back on the singly linked hunt, removing clue 5 meant walking all the way from clue 1 just to find clue 4 — the one card that actually needed to change.

Now that every card in the doubly linked version already carries its own "what came before me" directions, that entire walk disappears. Standing at clue 5, you already know exactly which card points to you. Removing yourself from the hunt means updating two connections instead of one — but neither of them requires any searching to find.`,
    sections: [
      {
        id: 'deletion-doubly-linked',
        title: 'Deletion (Doubly Linked)',
        content: `\`\`\`pseudocode
To delete a node (doubly linked):
    1. If Node.prev is not None:
        a. Point Node.prev.next to Node.next
    2. If Node.next is not None:
        a. Point Node.next.prev to Node.prev      // O(1), no search needed
\`\`\`

\`\`\`c
// C: Deletion in Doubly Linked List
if (node->prev != NULL) {
    node->prev->next = node->next;
}
if (node->next != NULL) {
    node->next->prev = node->prev;
}
free(node);
\`\`\`
\`\`\`cpp
// C++: Deletion in Doubly Linked List
if (node->prev != nullptr) {
    node->prev->next = node->next;
}
if (node->next != nullptr) {
    node->next->prev = node->prev;
}
delete node;
\`\`\`
\`\`\`python
# Python: Deletion in Doubly Linked List
if node.prev is not None:
    node.prev.next = node.next
if node.next is not None:
    node.next.prev = node.prev
\`\`\`
\`\`\`java
// Java: Deletion in Doubly Linked List
if (node.prev != null) {
    node.prev.next = node.next;
}
if (node.next != null) {
    node.next.prev = node.prev;
}
\`\`\`

> Both checks exist for the same reason: \`node\` might be the very first or very last card in the hunt, in which case one of those neighbors simply doesn't exist.
> 
> This is **\`O(1)\`** given the node itself — no walking required at all, which is the entire payoff of carrying that extra \`prev\` pointer on every node.`
      },
      {
        id: 'insertion-doubly-linked',
        title: 'Insertion (Doubly Linked)',
        content: `Inserting a new card between two existing ones now means wiring up **four connections** instead of two — the new card's forward and backward pointers, and both existing neighbors' pointers redirected to include it:

\`\`\`pseudocode
To insert a new node after Prev:
    1. Create NewNode with value
    2. Point NewNode.next to Prev.next
    3. Point NewNode.prev to Prev
    4. If Prev.next is not None:
        a. Point Prev.next.prev to NewNode
    5. Point Prev.next to NewNode                 // O(1)
\`\`\`

\`\`\`c
// C: Insertion in Doubly Linked List
Node* new_node = malloc(sizeof(Node));
new_node->data = value;
new_node->next = prev->next;
new_node->prev = prev;

if (prev->next != NULL) {
    prev->next->prev = new_node;
}
prev->next = new_node;
\`\`\`
\`\`\`cpp
// C++: Insertion in Doubly Linked List
Node* newNode = new Node(value);
newNode->next = prev->next;
newNode->prev = prev;

if (prev->next != nullptr) {
    prev->next->prev = newNode;
}
prev->next = newNode;
\`\`\`
\`\`\`python
# Python: Insertion in Doubly Linked List
new_node = Node(value)
new_node.next = prev.next
new_node.prev = prev

if prev.next is not None:
    prev.next.prev = new_node
prev.next = new_node
\`\`\`
\`\`\`java
// Java: Insertion in Doubly Linked List
Node newNode = new Node(value);
newNode.next = prev.next;
newNode.prev = prev;

if (prev.next != null) {
    prev.next.prev = newNode;
}
prev.next = newNode;
\`\`\`

> **Critical Warning:** Miss any one of these steps, and you get a chain that looks fine walking forward but breaks the moment someone tries to walk it backward through that spot — a bug that's easy to miss if you only ever test traversal in one direction.`
      },
      {
        id: 'circular-lists-wraparound',
        title: 'Circular Lists: Wraparound',
        content: `With a normal singly or doubly linked list, "the end" is a clear signal — \`next\` is \`None\` / \`NULL\`, stop walking.

A circular list has no such signal, since the last node deliberately points back to the first. This means every insertion and deletion near the boundary needs deliberate attention to the wraparound link specifically.

Inserting a new last node, for instance, means the new node's \`next\` has to point to the \`head\` — not to \`None\` — or the circle breaks silently:

\`\`\`pseudocode
To insert at the end of a circular list:
    1. Create NewNode with value
    2. Point NewNode.next to Head                  // wraps back to start
    3. Point Tail.next to NewNode
    4. Return NewNode as new Tail                   // O(1)
\`\`\`

\`\`\`c
// C: Insert at end of circular list
Node* new_node = malloc(sizeof(Node));
new_node->data = value;
new_node->next = head;
tail->next = new_node;
tail = new_node;
\`\`\`
\`\`\`cpp
// C++: Insert at end of circular list
Node* newNode = new Node(value);
newNode->next = head;
tail->next = newNode;
tail = newNode;
\`\`\`
\`\`\`python
# Python: Insert at end of circular list
new_node = Node(value)
new_node.next = head
tail.next = new_node
tail = new_node
\`\`\`
\`\`\`java
// Java: Insert at end of circular list
Node newNode = new Node(value);
newNode.next = head;
tail.next = newNode;
tail = newNode;
\`\`\`

> **Warning:** Forget that one line, and instead of a genuine circular list, you've quietly built a regular list with a \`None\` ending — which might not surface as a bug immediately, but will break anything downstream that was specifically relying on the wraparound behavior existing.`
      },
      {
        id: 'takeaway',
        title: 'Takeaway',
        content: `Doubly linked lists trade a bit of extra memory and bookkeeping for eliminating the "find the previous node" cost entirely. Circular lists trade away the concept of "the end" for genuine, unbroken cycling.

> **Engineering Takeaway:** Neither is an upgrade you take by default — they're specific answers to specific needs, in exactly the same spirit as everything covered back when the array-vs-linked-list trade-off was first introduced.
> 
> With both the structure and its edits fully covered, the next page turns to a genuinely different kind of technique — using two pointers moving at different speeds through the very same chain you've now built.`
      }
    ]
  },

  'fast-and-slow-pointers-the-essence': {
    slug: 'fast-and-slow-pointers-the-essence',
    title: 'Fast and Slow Pointers: The Essence',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The two friends scavenger hunt analogy: finding the midpoint without counting and detecting loops via collisions.',
    lead: `Send two friends through the same scavenger hunt at the same time, but with one rule: one of them moves to exactly one next clue at a time, while the other moves to two next clues at a time, skipping one each step. Neither of them was ever told how many total clues the hunt has — there's no map, remember, just cards pointing forward.

Here's what happens by the time the faster friend reaches the very last clue and has nowhere left to go: the slower friend, having covered exactly half the ground, is standing precisely in the middle of the hunt. Nobody counted anything. Nobody needed to know the total length in advance. The simple difference in speed did all the work.

Now imagine a version of the hunt that's been rigged so that somewhere along the way, a clue's directions loop back to an earlier clue instead of continuing forward — a hunt with no real end. Send the same two friends in. The slower one just keeps walking the loop forever. But the faster one, moving twice as fast, will eventually lap the slower one and the two of them will physically run into each other again, somewhere inside the loop. That collision is undeniable proof the hunt loops — proof that couldn't have been obtained any other way, since neither friend ever had a map to check against.`,
    sections: [
      {
        id: 'two-standard-techniques',
        title: 'Two Standard Techniques',
        content: `### 1. Finding the middle in one pass
Using exactly the two-speed idea above:

\`\`\`pseudocode
To find the middle node:
    1. Point Slow and Fast to Head
    2. Loop while Fast is not None and Fast.next is not None:
        a. Move Slow to Slow.next                 // one step
        b. Move Fast to Fast.next.next             // two steps
    3. Return Slow                                  // O(n), one pass
\`\`\`

\`\`\`c
// C: Find middle node in one pass
Node* find_middle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}
\`\`\`
\`\`\`cpp
// C++: Find middle node in one pass
Node* findMiddle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}
\`\`\`
\`\`\`python
# Python: Find middle node in one pass
def find_middle(head: Node | None) -> Node | None:
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow
\`\`\`
\`\`\`java
// Java: Find middle node in one pass
public static Node findMiddle(Node head) {
    Node slow = head;
    Node fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}
\`\`\`

> \`Fast\` finishing its walk is the natural stopping signal — no length needs to be counted beforehand, and no second pass through the list is needed either. One walk, two pointers, done.

---

### 2. Detecting a cycle
Using the same idea, watching for a collision instead of an ending:

\`\`\`pseudocode
To detect a cycle:
    1. Point Slow and Fast to Head
    2. Loop while Fast is not None and Fast.next is not None:
        a. Move Slow to Slow.next
        b. Move Fast to Fast.next.next
        c. If Slow equals Fast:
            i. Return True                         // collision found
    3. Return False                                  // fast reached the end
\`\`\`

\`\`\`c
// C: Floyd's Cycle Detection
bool has_cycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}
\`\`\`
\`\`\`cpp
// C++: Floyd's Cycle Detection
bool hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}
\`\`\`
\`\`\`python
# Python: Floyd's Cycle Detection
def has_cycle(head: Node | None) -> bool:
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
\`\`\`
\`\`\`java
// Java: Floyd's Cycle Detection
public static boolean hasCycle(Node head) {
    Node slow = head;
    Node fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}
\`\`\`

> If there's genuinely no cycle, \`fast\` eventually falls off the end, exactly like the ordinary case above, and the function reports no loop.
> 
> If a cycle exists, \`fast\` can never fall off the end — it just keeps looping — so the only way the function can ever terminate is by \`slow\` and \`fast\` eventually landing on the same node together, which is mathematically guaranteed to happen inside a loop given enough steps.`
      },
      {
        id: 'why-its-the-essence',
        title: 'Why It\'s "The Essence"',
        content: `Fast-and-slow pointers aren't really about linked lists specifically — they're a general answer to a specific kind of question: **how do I learn something about the overall shape of a sequence I can only walk through once, without ever being told its length in advance?**

> **Core Concept:** Every use of this pattern, in a linked list or otherwise, comes back to that same core idea — two positions, moving at different rates through the same one-directional walk, and paying attention to where they end up relative to each other.
> 
> With traversal, insertion, deletion, and this two-pointer technique all in hand, the next two pages step back and put the linked list side by side with the array one final time — first as an honest, direct comparison, and then digging into a performance reality that Big-O notation alone doesn't tell you about.`
      }
    ]
  },

  'array-vs-linked-list-side-by-side': {
    slug: 'array-vs-linked-list-side-by-side',
    title: 'Array vs. Linked List, Side by Side',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'Numbered maps vs clue-by-clue chains: direct comparison table and choosing based on operational cost.',
    lead: `Two ways of running the same scavenger hunt, sitting next to each other one final time.

The numbered map lets you walk straight to any spot the instant you're told its number — no walking through the others first — but adding a new required stop in the middle means relabeling every spot that comes after it.

The clue-by-clue chain has no such shortcut — reaching spot 7 always means walking through 1 through 6 first — but slipping a new clue into the middle costs nothing more than rewriting one card's directions.

> Every difference between an array and a linked list traces back to that one structural fact: an array's positions are calculated directly from a starting address, while a linked list's positions only exist by physically walking a chain of pointers.`,
    sections: [
      {
        id: 'laid-out-directly',
        title: 'Laid out directly',
        content: `| Operation | Array-based list | Linked list |
|---|---|---|
| **Access by index** | \`O(1)\` — direct calculation | \`O(n)\` — must walk from the start |
| **Search for a value** | \`O(n)\` | \`O(n)\` |
| **Insert/delete at the front** | \`O(n)\` — everything shifts | \`O(1)\` |
| **Insert/delete at the end** | \`O(1)\` amortized (with growth) | \`O(n)\` without a tracked tail, \`O(1)\` with one |
| **Insert/delete in the middle** | \`O(n)\` — shifting required | \`O(n)\` to reach the spot, \`O(1)\` once there |
| **Memory per element** | Just the value | Value plus one or more pointers |
| **Memory layout** | One contiguous block | Scattered, wherever each node was created |

A few of these are worth pulling out on their own:
- **Search is \`O(n)\` either way**: Neither structure has a built-in shortcut for *"does this value exist somewhere in here,"* since both eventually have to look at elements one at a time in the worst case.
- **Insertion in the middle is \`O(n)\` for both**: Just for different reasons — the array pays for shifting elements, the linked list pays for the walk to reach the right spot, even though the actual insertion once there is instant.

\`\`\`pseudocode
To access element at index:
    Array:       Return array[index]           // O(1) direct offset
    Linked List: March next index times       // O(n) pointer crawl

To insert element at front:
    Array:       Shift all elements right      // O(n) memory copy
    Linked List: Update head pointer           // O(1) pointer swap
\`\`\`

\`\`\`c
// C: Array access vs Linked List access
int array_val = array[5]; // O(1)

Node* curr = head;
for (int i = 0; i < 5 && curr != NULL; i++) {
    curr = curr->next;
}
int list_val = curr ? curr->data : -1; // O(n)
\`\`\`
\`\`\`cpp
// C++: Array access vs Linked List access
int arrayVal = vec[5]; // O(1)

auto it = lst.begin();
std::advance(it, 5); // O(n)
int listVal = *it;
\`\`\`
\`\`\`python
# Python: Array access vs Linked List access
array_val = array[5]  # O(1)

curr = head
for _ in range(5):
    if curr:
        curr = curr.next
list_val = curr.data if curr else None  # O(n)
\`\`\`
\`\`\`java
// Java: Array access vs Linked List access
int arrayVal = arrayList.get(5); // O(1)

int listVal = linkedList.get(5); // O(n) sequential walk internally
\`\`\``
      },
      {
        id: 'what-this-table-is-actually-telling-you-to-do',
        title: 'What this table is actually telling you to do',
        content: `> **Decision Guide:** Not *"pick whichever wins more rows."* Pick based on what your specific problem does **most often**.

- A problem that's constantly looking things up by position and rarely inserting anywhere but the end leans hard toward an **array**.
- A problem that's constantly inserting and removing things — especially from the front or the middle, and especially when you don't know the final size in advance — leans hard toward a **linked list**.
- A problem doing a healthy mix of both might genuinely be better served by neither one directly, which is exactly why other structures exist later in this course, each one another specific bet on a different mix of operations.

> There's one more piece to this comparison that the table above can't show, because it isn't visible in Big-O at all — it lives in how the two structures actually sit in physical memory, and it's the entire subject of the next page.`
      }
    ]
  },

  'cache-locality-why-arrays-win-in-practice': {
    slug: 'cache-locality-why-arrays-win-in-practice',
    title: 'Cache Locality',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The library book shelf analogy: why contiguous array traversal outperforms pointer chasing on real hardware.',
    lead: `Picture a library where an entire book series sits on one shelf, spine to spine — book 1, then book 2 right beside it, then book 3 right after that. Grabbing the next book in the series after finishing the current one costs you almost nothing — a small reach to the left, done.

Now picture a different library, where each book in the same series is deliberately shelved in a completely different room, and every book contains a note telling you which room holds the next one.

Formally, "fetching a book" is still one action in both libraries — walk to a location, pick up a book. But anyone who's actually done both knows these are nowhere near the same amount of real effort. The second library adds real, physical walking distance between every single step, even though the step count on paper looks identical.`,
    sections: [
      {
        id: 'the-big-o-blind-spot',
        title: 'The Big-O Blind Spot',
        content: `This is precisely the blind spot between array-based lists and linked lists in real hardware.

On paper, walking through $n$ elements is \`O(n)\` either way, whether it's an array or a linked list — same number of steps, same notation. But your CPU doesn't fetch memory one lonely value at a time. It pulls memory in chunks, called **cache lines**, and it aggressively guesses that if you just asked for one piece of memory, you're probably about to ask for the piece right next to it — so it grabs that neighboring chunk too, ahead of time, into a small, extremely fast on-chip cache.

\`\`\`pseudocode
To walk an array:
    1. Loop through each element in Array:
        a. Process element                    // O(n), cache-friendly

To walk a linked list:
    1. Point Current to Head
    2. Loop while Current is not None:
        a. Process Current.data                // O(n), cache-unfriendly
        b. Move Current to Current.next
\`\`\`

\`\`\`c
// C: Walk array vs walk linked list
// Walk array
for (int i = 0; i < size; i++) {
    process(array[i]);
}

// Walk linked list
Node* current = head;
while (current != NULL) {
    process(current->data);
    current = current->next;
}
\`\`\`
\`\`\`cpp
// C++: Walk array vs walk linked list
// Walk array (std::vector)
for (int i = 0; i < size; i++) {
    process(vec[i]);
}

// Walk linked list
Node* current = head;
while (current != nullptr) {
    process(current->data);
    current = current->next;
}
\`\`\`
\`\`\`python
# Python: Walk array vs walk linked list
# Walk array (contiguous list)
for item in array_list:
    process(item)

# Walk linked list
current = head
while current is not None:
    process(current.data)
    current = current.next
\`\`\`
\`\`\`java
// Java: Walk array vs walk linked list
// Walk array
for (int i = 0; i < size; i++) {
    process(array[i]);
}

// Walk linked list
Node current = head;
while (current != null) {
    process(current.data);
    current = current.next;
}
\`\`\`

> Both loops are **\`O(n)\`**. Run them on real hardware over a genuinely large amount of data, and the array version frequently comes out meaningfully faster — sometimes by a significant margin — purely because of how the two structures happen to sit in physical memory, a factor that Big-O was never designed to capture in the first place.`
      },
      {
        id: 'not-a-contradiction',
        title: 'Not a Contradiction',
        content: `This isn't a case for throwing out everything said about linked lists being cheap to insert into. It's a reminder that asymptotic cost and real-world speed are related, but they are **not the same measurement**.

> **Key Truth:** Big-O tells you how a cost scales as input grows — genuinely essential for comparing approaches at a large enough size.
> 
> It was never a promise about wall-clock speed on any specific piece of hardware, at any specific size, and treating it as one is where this particular gap catches people off guard.`
      },
      {
        id: 'takeaway',
        title: 'Takeaway',
        content: `For workloads dominated by walking through data sequentially and reading it, array-based structures tend to have a real, measurable edge that has nothing to do with Big-O and everything to do with how modern hardware happens to be built.

For workloads dominated by frequent insertion and deletion away from the edges, the linked list's structural advantage from earlier pages still holds regardless of any of this.

> **Engineering Takeaway:** Knowing both halves of that picture — not just the notation, but the hardware reality sitting underneath it — is what separates *"I calculated the Big-O"* from actually understanding how a piece of code will behave once it's running.
> 
> One page remains in this section, and it steps back from performance entirely to make a much broader point — about how much of what you've just learned isn't really new, once you notice a pattern that's already inside everything covered so far.`
      }
    ]
  },

  'same-structure-different-skin': {
    slug: 'same-structure-different-skin',
    title: 'Same Structure, Different Skin',
    folder: '03-linked-list',
    category: '03-linked-list',
    summary: 'The vending machine front panel analogy: how Stacks, Queues, and Deques are front panels bolted onto Arrays and Linked Lists.',
    lead: `Remember the vending machine from several pages back — press B4, get a snack, and it genuinely doesn't matter whether the mechanism behind the panel is a spiral coil or a small robotic arm, because the button-press contract is all that was ever promised?

Here's the payoff of learning that lesson properly: you've now spent an entire section building the two things that could be sitting behind that panel — a contiguous array, and a chain of connected nodes. And it turns out, nearly every other structure you're about to learn in this course is really just a different front panel, bolted onto one of these same two mechanisms underneath.`,
    sections: [
      {
        id: 'what-front-panel-means',
        title: 'What "Front Panel" Means',
        content: `A **stack** promises exactly one thing: the last item you added is the first one you get back — add to the top, remove from the top, nothing else. Nothing about that promise says anything about how it's built.

\`\`\`pseudocode
To push an item (array-backed stack):
    1. Place Item at Data[Size]
    2. Increment Size                          // O(1)

To pop an item (array-backed stack):
    1. Decrement Size
    2. Return Data[Size]                       // O(1)

To push an item (linked-list-backed stack):
    1. Create NewNode with data
    2. Point NewNode.next to Top
    3. Point Top to NewNode                    // O(1)

To pop an item (linked-list-backed stack):
    1. Point OldTop to Top
    2. Point Top to Top.next
    3. Return OldTop.data                      // O(1)
\`\`\`

\`\`\`c
// C: Array-backed stack vs Linked-list-backed stack
// 1. Array-backed stack: push & pop
data[size] = item;
size++;

size--;
int array_val = data[size];

// 2. Linked-list-backed stack: push & pop
Node* new_node = malloc(sizeof(Node));
new_node->data = item;
new_node->next = top;
top = new_node;

Node* old_top = top;
top = top->next;
int list_val = old_top->data;
free(old_top);
\`\`\`
\`\`\`cpp
// C++: Array-backed stack vs Linked-list-backed stack
// 1. Vector stack
vec.push_back(item);
int v_val = vec.back();
vec.pop_back();

// 2. Linked-list stack
top = new Node(item, top);

Node* oldTop = top;
top = top->next;
int l_val = oldTop->data;
delete oldTop;
\`\`\`
\`\`\`python
# Python: Array-backed stack vs Linked-list-backed stack
# 1. Array list stack
stack.append(item)
val = stack.pop()

# 2. Linked-list stack
top = Node(item, next=top)

old_top = top
top = top.next
val = old_top.data
\`\`\`
\`\`\`java
// Java: Array-backed stack vs Linked-list-backed stack
// 1. Array-backed stack
data[size++] = item;
int aVal = data[--size];

// 2. Linked-list stack
top = new Node(item, top);

Node oldTop = top;
top = top.next;
int lVal = oldTop.data;
\`\`\`

> Build a stack on an **array**, and pushing means placing at the current end — cheap, as long as there's room.
> 
> Build it on a **linked list**, and pushing means inserting at the head — also cheap, for exactly the reason covered a few pages ago. Both are completely honest, correct stacks. They're the same front panel, wired to the two different mechanisms you already know inside and out.

---

A **queue** makes a different promise — first in, first out, add at one end, remove from the other.

- Build this one on a plain array and removing from the front becomes the **expensive shifting operation** from early in this section — every remaining element has to slide over ($O(n)$).
- Build it on a linked list instead, and removing from the front is exactly the **$O(1)$ head-removal** already covered — no shifting required at all.

> Same contract, same two mechanisms available underneath, but this time the choice of mechanism genuinely matters for performance, because the two operations this contract leans on hardest happen to be exactly where arrays and linked lists diverge the most.`
      },
      {
        id: 'the-real-takeaway',
        title: 'The Real Takeaway',
        content: `None of these later structures introduce a brand-new way of physically arranging data in memory.

**Contiguous blocks** and **pointer-connected chains** are still, fundamentally, the two tools doing all the actual work — everything else is a different set of promises, a different front panel, layered on top of the same two mechanisms.

> **Engineering Principle:** Once you see a new structure this way, learning it stops being *"memorize an entirely new thing"* and becomes *"figure out which promise this one is making, and which of the two mechanisms I already know honors that promise more cheaply."*
> 
> That's the real reason this section spent as long as it did on arrays and linked lists specifically, instead of rushing toward the more exciting-sounding names. Everything from here builds directly on top of what's already sitting in your hands.`
      }
    ]
  }
};
