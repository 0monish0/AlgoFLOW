export const whyDataStructuresTopics = {
  'is-there-even-a-need': {
    slug: 'is-there-even-a-need',
    title: 'Is There Even a Need?',
    folder: '00-why-data-structures',
    category: '00-why-data-structures',
    summary: 'The wardrobe and student records analogy: why data structures become unavoidable as scale increases.',
    lead: `When you own three shirts, you don't organize your wardrobe. You just pile them on a shelf, and finding "the blue one" takes half a second regardless of how they're sitting. Nobody folds three shirts by category. There's no need — the mess is small enough that the mess doesn't cost you anything.

Now fast-forward a few years. You own two hundred things — shirts, jackets, winter wear, gym clothes, all mixed into one overflowing space. Finding "the navy shirt with the collar" is suddenly an expedition. At some point, without anyone teaching you a rule, you started separating things — by season, by type, by how often you wear them. Nobody forced that on you. The need for organization didn't exist at three shirts and became unavoidable at two hundred, purely because of scale.

> This is exactly the situation you're in as a programmer, and it's worth seeing in actual code before we go any further.`,
    sections: [
      {
        id: 'where-it-starts',
        title: 'Where It Starts',
        content: `Say you're tracking one student. This is completely reasonable:

\`\`\`pseudocode
To track one student:
    1. Store Name, RollNumber, Department, Marks as separate values
\`\`\`

\`\`\`c
// C: Tracking a single student
char name[50] = "Ravi";
int roll_number = 21;
char department[10] = "CSE";
int marks = 87;
\`\`\`
\`\`\`cpp
// C++: Tracking a single student
std::string name = "Ravi";
int roll_number = 21;
std::string department = "CSE";
int marks = 87;
\`\`\`
\`\`\`python
# Python: Tracking a single student
name = "Ravi"
roll_number = 21
department = "CSE"
marks = 87
\`\`\`
\`\`\`java
// Java: Tracking a single student
String name = "Ravi";
int rollNumber = 21;
String department = "CSE";
int marks = 87;
\`\`\`

Five values, five variables, done. If your entire program only ever deals with one student, you genuinely don't need anything fancier than this. This is the "three shirts" stage — the mess is small, so there's no mess.`
      },
      {
        id: 'where-it-breaks',
        title: 'Where It Breaks',
        content: `Now your program needs to handle a class of 60 students. Try to imagine extending the approach above — a separate \`name1\`, \`name2\`, \`marks1\`, \`marks2\`, and so on, 180 disconnected variables that only look related because of how you named them.

Even typing this out feels wrong, and that instinct is correct:
- How do you loop through "all students" when they're not grouped as a collection?
- How do you sort them by marks?
- How do you find student number 37 without hardcoding \`name37\` directly into your code?

> **The Turning Point:** You can't. Not cleanly. This is the exact moment a data structure stops being optional and starts being necessary — not because a syllabus says so, but because the shape of the problem demands it.`
      },
      {
        id: 'what-actually-solves-it',
        title: 'What Actually Solves It',
        content: `The fix is to stop representing "a student" as five loose variables and start representing it as one grouped unit, held inside a collection:

\`\`\`pseudocode
To store many students:
    1. Store each student as a record in one Students collection

2. To print all names and marks:
    a. Loop through Students:
        i. Print student's Name and Marks

3. To find the top student:
    a. Loop through Students, tracking the one with highest Marks
\`\`\`

\`\`\`c
// C: Grouped records in an array
typedef struct {
    char name[50];
    int roll_number;
    int marks;
} Student;

Student students[60];

// Print all students
for (int i = 0; i < 60; i++) {
    printf("%s %d\\n", students[i].name, students[i].marks);
}

// Find top student
int top = 0;
for (int i = 1; i < 60; i++) {
    if (students[i].marks > students[top].marks) {
        top = i;
    }
}
\`\`\`
\`\`\`cpp
// C++: Struct collection in std::vector
struct Student {
    std::string name;
    int roll_number;
    int marks;
};

std::vector<Student> students(60);

// Print all students
for (const auto& s : students) {
    std::cout << s.name << " " << s.marks << "\\n";
}

// Find top student
size_t top = 0;
for (size_t i = 1; i < students.size(); ++i) {
    if (students[i].marks > students[top].marks) {
        top = i;
    }
}
\`\`\`
\`\`\`python
# Python: Structured class collection
from dataclasses import dataclass

@dataclass
class Student:
    name: str
    roll_number: int
    marks: int

students: list[Student] = []

# Print all students
for s in students:
    print(f"{s.name} {s.marks}")

# Find top student
if students:
    top_student = max(students, key=lambda s: s.marks)
\`\`\`
\`\`\`java
// Java: Record collection in List
public record Student(String name, int rollNumber, int marks) {}

List<Student> students = new ArrayList<>();

// Print all students
for (Student s : students) {
    System.out.println(s.name() + " " + s.marks());
}

// Find top student
if (!students.isEmpty()) {
    Student top = students.get(0);
    for (int i = 1; i < students.size(); i++) {
        if (students.get(i).marks() > top.marks()) {
            top = students.get(i);
        }
    }
}
\`\`\`

Notice what changed. It's not that the information is different — you're still storing a name, a roll number, and marks for each student. What changed is the **shape the information is held in**. A list of grouped records lets you loop, search, sort, and filter using a handful of general-purpose operations, instead of writing custom, one-off code for every single student by hand.

> **Key Takeaway:** At small scale, no — you genuinely don't need any of this, and reaching for it anyway is often overkill. But the moment your data grows past what you can comfortably name and track by hand, the absence of structure stops being a minor inconvenience and starts being the actual thing standing between you and a working program.`
      },
      {
        id: 'a-common-misconception',
        title: 'A Common Misconception',
        content: `A lot of students treat "data structures" as a separate academic subject, disconnected from the "real coding" they do elsewhere — something you learn for exams and then set aside.

> **Core Insight:** It isn't separate. Every time you've reached for a list instead of separately numbered variables, or a dictionary instead of a pile of if-statements checking names one by one, you were already doing data structures.
> 
> This course doesn't introduce a new skill you don't have — it gives names, guarantees, and sharper tools to an instinct you're already using constantly, whether you've noticed it or not.

Once you see it this way, the real question stops being *"why do I need to learn this"* and becomes *"which structure fits the shape of this particular problem"* — which is exactly what the next page digs into.`
      }
    ],
    pseudocode: `To track one student:
    1. Store Name, RollNumber, Department, Marks as separate values

To store many students:
    1. Store each student as a record in one Students collection

To print all names and marks:
    1. Loop through Students:
        a. Print student's Name and Marks

To find the top student:
    1. Loop through Students, tracking the one with highest Marks`,
    code: {
      c: `// C LOGIC: Student Records in an Array Data Structure
#include <stdio.h>

typedef struct {
    char name[50];
    int roll_number;
    int marks;
} Student;

int main(void) {
    Student students[60];

    // Print all students
    for (int i = 0; i < 60; i++) {
        printf("%s %d\\n", students[i].name, students[i].marks);
    }

    // Find top student
    int top = 0;
    for (int i = 1; i < 60; i++) {
        if (students[i].marks > students[top].marks) {
            top = i;
        }
    }
    return 0;
}`,
      cpp: `// C++ Structured Student Records
#include <iostream>
#include <vector>
#include <string>

struct Student {
    std::string name;
    int roll_number;
    int marks;
};

int main() {
    std::vector<Student> students(60);

    // Print all students
    for (const auto& s : students) {
        std::cout << s.name << " " << s.marks << "\\n";
    }

    // Find top student
    size_t top = 0;
    for (size_t i = 1; i < students.size(); ++i) {
        if (students[i].marks > students[top].marks) {
            top = i;
        }
    }
    return 0;
}`,
      python: `# Python: Grouped Student Records
from dataclasses import dataclass

@dataclass
class Student:
    name: str
    roll_number: int
    marks: int

students: list[Student] = []

# Print all students
for s in students:
    print(f"{s.name} {s.marks}")

# Find top student
if students:
    top_student = max(students, key=lambda s: s.marks)`,
      java: `// Java Record Structure & Collection
import java.util.ArrayList;
import java.util.List;

public class StudentRegistry {
    public record Student(String name, int rollNumber, int marks) {}

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();

        // Print all students
        for (Student s : students) {
            System.out.println(s.name() + " " + s.marks());
        }

        // Find top student
        if (!students.isEmpty()) {
            Student top = students.get(0);
            for (int i = 1; i < students.size(); i++) {
                if (students.get(i).marks() > top.marks()) {
                    top = students.get(i);
                }
            }
        }
    }
}`
    }
  },

  'data-structures-as-decisions-not-recipes': {
    slug: 'data-structures-as-decisions-not-recipes',
    title: 'Decisions, Not Recipes',
    folder: '00-why-data-structures',
    category: '00-why-data-structures',
    summary: 'The mode of transport analogy: choosing data structures based on access patterns and operational cost.',
    lead: `Say you need to get somewhere. If it's five minutes away, you walk. If it's across the city, you take a cab or a train. If it's across the country, you fly. Nobody actually thinks this through as a formal decision every time — you just instinctively match your mode of transport to the situation: how far, how much you're carrying, how fast you need to arrive, what it costs.

Now imagine someone who never developed that instinct, and instead just always drives everywhere, regardless of the situation, because *"that's what I did last time and it worked."* Five minutes away — drive. Across the country — still tries to drive, and now it's a two-week ordeal that a two-hour flight would have solved. That's not someone who lacks a valid tool. It's someone applying the same fixed recipe to every situation without asking whether it actually fits.`,
    sections: [
      {
        id: 'the-recipe-trap',
        title: 'The Recipe Trap',
        content: `A huge number of students learn data structures as a checklist of things to memorize — *"this is how you build a linked list, this is how you build a stack"* — without ever internalizing that **choosing a structure is itself the actual skill**. The structures themselves are just tools. Picking the wrong one, confidently and correctly implemented, is still the wrong outcome.

Here's what "recipe thinking" looks like in code. Say you're processing a queue of support tickets, and you need to remove them from the front one at a time as they get handled — using a plain array for everything, out of habit:

\`\`\`pseudocode
To add a ticket:
    1. Append NewTicket to end of Tickets array   // O(1) amortized

To remove the oldest ticket:
    1. Take Tickets[0] as Oldest
    2. Loop through remaining elements:
        a. Shift each element left by one position   // O(n)
    3. Return Oldest
\`\`\`

\`\`\`c
// C: Add ticket & remove oldest (Array shift)
// Add ticket
tickets[size] = new_ticket;
size++;

// Remove oldest (pop front)
int oldest = tickets[0];
for (int i = 0; i < size - 1; i++) {
    tickets[i] = tickets[i + 1]; // O(n) shift
}
size--;
\`\`\`
\`\`\`cpp
// C++: Add ticket & remove oldest (std::vector shift)
// Add ticket
tickets.push_back(new_ticket);

// Remove oldest (pop front)
int oldest = tickets.front();
tickets.erase(tickets.begin()); // O(n) shift
\`\`\`
\`\`\`python
# Python: Add ticket & remove oldest (List pop(0) shift)
# Add ticket
tickets.append(new_ticket)

# Remove oldest (pop front)
oldest = tickets.pop(0) # O(n) shift
\`\`\`
\`\`\`java
// Java: Add ticket & remove oldest (ArrayList remove(0) shift)
// Add ticket
tickets.add(newTicket);

// Remove oldest (pop front)
int oldest = tickets.remove(0); // O(n) shift
\`\`\`

> That front-removal looks harmless. It isn't. Removing from the front of an array-backed list means every remaining element has to shift over by one position to fill the gap — an \`O(n)\` operation, every single time you handle a ticket.
> 
> If you're processing thousands of tickets, this "worked, technically" but quietly cost you far more than it needed to.`
      },
      {
        id: 'decision-thinking',
        title: 'Decision Thinking',
        content: `Before reaching for a structure, the actual question is: **what operations does this problem lean on most heavily, and how often?**

Here, it's clearly *"remove from the front, repeatedly."* A structure designed around cheap front-removal — like a linked list, or a purpose-built queue — fits that shape far better:

\`\`\`pseudocode
To add a ticket (linked list / deque):
    1. Create NewNode with data
    2. Point Tail.next to NewNode
    3. Point Tail to NewNode                    // O(1)

To remove the oldest ticket:
    1. Point Oldest to Head
    2. Point Head to Head.next                  // O(1)
    3. Return Oldest.data
\`\`\`

\`\`\`c
// C: Linked list queue (O(1) enqueue and dequeue)
// Add ticket (append to back)
Node* new_node = malloc(sizeof(Node));
new_node->data = new_ticket;
new_node->next = NULL;
tail->next = new_node;
tail = new_node;

// Remove oldest (pop front)
Node* oldest = head;
head = head->next;
int data = oldest->data;
free(oldest);
\`\`\`
\`\`\`cpp
// C++: std::deque / std::list queue (O(1) pop front)
// Add ticket (append to back)
queue.push_back(new_ticket);

// Remove oldest (pop front)
int oldest = queue.front();
queue.pop_front(); // O(1)
\`\`\`
\`\`\`python
# Python: collections.deque (O(1) popleft)
from collections import deque
queue = deque()

# Add ticket
queue.append(new_ticket)

# Remove oldest (pop front)
oldest = queue.popleft() # O(1)
\`\`\`
\`\`\`java
// Java: ArrayDeque / LinkedList (O(1) removeFirst)
// Add ticket
queue.addLast(newTicket);

// Remove oldest (pop front)
int oldest = queue.removeFirst(); // O(1)
\`\`\`

> Nothing about this required new syntax knowledge you didn't already have. What changed was the decision — asking what the problem actually needed before defaulting to whatever structure was most familiar.`
      },
      {
        id: 'why-it-matters',
        title: 'Why It Matters',
        content: `Every structure you'll learn — arrays, linked lists, stacks, queues, trees, hash maps — is good at some operations and mediocre or bad at others. **None of them is "the best one."**

> **Core Principle:** A structure is a bet: you're trading strength in some operations for weakness in others, on purpose, because you've decided which operations matter most for this specific problem.

This is why the next several pages don't just show you how to build a linked list — they spend real time on when a linked list is the right bet and when it very much isn't. Knowing the syntax is the easy part. Knowing which situations call for which structure is the part that actually separates someone who's memorized a chapter from someone who can walk into an unfamiliar problem and reason their way to a good solution — which, not coincidentally, is exactly what the next page is about.`
      }
    ]
  },

  'what-being-good-at-dsa-actually-means': {
    slug: 'what-being-good-at-dsa-actually-means',
    title: 'What Being Good at DSA Actually Means',
    folder: '00-why-data-structures',
    category: '00-why-data-structures',
    summary: 'Moving beyond rote LeetCode memorization to mastering invariants, pointer discipline, state machine visualization, and boundary handling.',
    lead: `Mastery in Data Structures and Algorithms is not about memorizing 300 problem solutions. It is about recognizing structural invariants, reasoning with mathematical clarity, maintaining flawless pointer discipline, and visualizing state transitions.`,
    sections: [
      {
        id: 'the-four-pillars-of-mastery',
        title: 'The Four Pillars of DSA Mastery',
        content: `True DSA competence rests upon four foundational pillars:
1. **Loop Invariants & State**: Formulating invariants that remain true before, during, and after every iteration.
2. **Pointer Arithmetic & Ownership**: Understanding exactly who owns memory, what address is being dereferenced, and preventing memory leaks or dangling pointers.
3. **Edge Case Elimination**: Handling null pointers, single-element lists, empty inputs, duplicate keys, and boundary overflows without cluttering code with fifty special-case \`if\` statements.
4. **Asymptotic & Constant-Factor Reasoning**: Accurately distinguishing between theoretical \`O(n)\` and wall-clock execution time influenced by branch prediction and memory bus saturation.`
      },
      {
        id: 'the-engineering-mindset',
        title: 'The Engineering Mindset: Invariants over Hacks',
        content: `When implementing a linked list reversal, a beginner tries to guess pointer reassignments until test cases pass. 

A master defines a clean invariant:
- \`prev\` points to the reversed prefix.
- \`curr\` points to the remaining unprocessed suffix.
- In each step: capture \`next = curr.next\`, reverse \`curr.next = prev\`, advance \`prev = curr\`, advance \`curr = next\`.
- Termination condition is obvious: when \`curr == None\`, \`prev\` is the new head.

### Reversal Algorithm

\`\`\`pseudocode
To reverse a linked list:
    1. Set Prev to None
    2. Set Curr to Head
    3. Loop while Curr is not None:
        a. NextTemp = Curr.next     // 1. Preserve forward link
        b. Curr.next = Prev          // 2. Reverse pointer
        c. Prev = Curr               // 3. Advance Prev
        d. Curr = NextTemp           // 4. Advance Curr
    4. Return Prev                   // Prev is the new head
\`\`\`

\`\`\`c
// C: Pointer Discipline in Reversing a Singly Linked List
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

Node* reverse_list(Node* head) {
    Node* prev = NULL;
    Node* curr = head;
    
    while (curr != NULL) {
        Node* next_temp = curr->next; // 1. Preserve forward link
        curr->next = prev;            // 2. Reverse pointer
        prev = curr;                  // 3. Advance prev
        curr = next_temp;              // 4. Advance curr
    }
    
    return prev; // prev is the new head
}
\`\`\`
\`\`\`cpp
// C++: Clean Pointer Discipline in Reversal
template <typename T>
struct Node {
    T data;
    Node* next;
    Node(T val) : data(val), next(nullptr) {}
};

template <typename T>
Node<T>* reverseList(Node<T>* head) {
    Node<T>* prev = nullptr;
    Node<T>* curr = head;
    while (curr != nullptr) {
        Node<T>* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}
\`\`\`
\`\`\`python
# Python: Clean Invariant in Reversal
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr is not None:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev
\`\`\`
\`\`\`java
// Java: Clean Pointer Discipline in Reversal
public class ListReversal {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}
\`\`\``
      }
    ]
  }
};
