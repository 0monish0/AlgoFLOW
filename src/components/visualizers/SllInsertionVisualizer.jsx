import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

const INSERT_MODES = [
  { id: 'head', label: 'Insert at Head (value=99)' },
  { id: 'middle', label: 'Insert at Index 2 (value=99)' },
  { id: 'tail', label: 'Insert at Tail (value=99)' },
];

export const SllInsertionVisualizer = () => {
  const [mode, setMode] = useState('head');
  const [step, setStep] = useState(0);

  const getStepInfo = () => {
    if (mode === 'head') {
      const steps = [
        {
          desc: 'Initial state: Existing linked list [10] -> [20] -> [30] -> NULL with head pointer at [10].',
          highlight: 'list->head = [10]',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: null,
          headTarget: 1,
        },
        {
          desc: 'Step 1: Allocate new node with data = 99 in memory: Node* node = malloc(sizeof(Node)).',
          highlight: 'node->data = 99; node->next = NULL;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: { id: 99, val: 99, nextTarget: null },
          headTarget: 1,
        },
        {
          desc: 'Step 2: Point new node’s next pointer to the current head: node->next = head.',
          highlight: 'node->next = list->head;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: { id: 99, val: 99, nextTarget: 1 },
          headTarget: 1,
        },
        {
          desc: 'Step 3: Update head pointer to point to the newly inserted node: head = node.',
          highlight: 'list->head = node;',
          nodes: [{ id: 99, val: 99 }, { id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: null,
          headTarget: 99,
        },
      ];
      return { steps, current: steps[Math.min(step, steps.length - 1)] };
    } else if (mode === 'middle') {
      const steps = [
        {
          desc: 'Initial state: List [10] -> [20] -> [30] -> NULL. Target insertion index = 2.',
          highlight: 'curr = head',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: null,
          currIndex: 0,
        },
        {
          desc: 'Step 1: Traverse pointer curr to index 1 (predecessor of index 2): curr = curr->next.',
          highlight: 'for (i = 0; i < 1; i++) curr = curr->next;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: null,
          currIndex: 1,
        },
        {
          desc: 'Step 2: Allocate new node [99] and connect its next pointer to curr->next: node->next = curr->next.',
          highlight: 'node->next = curr->next; // points to [30]',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: { id: 99, val: 99, nextTarget: 3 },
          currIndex: 1,
        },
        {
          desc: 'Step 3: Splice predecessor pointer: curr->next = node. Insertion complete!',
          highlight: 'curr->next = node;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 99, val: 99 }, { id: 3, val: 30 }],
          newNode: null,
          currIndex: -1,
        },
      ];
      return { steps, current: steps[Math.min(step, steps.length - 1)] };
    } else {
      // Tail
      const steps = [
        {
          desc: 'Initial state: List [10] -> [20] -> [30] -> NULL. Traverse to terminal node.',
          highlight: 'while (curr->next != NULL) curr = curr->next;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: null,
          currIndex: 2,
        },
        {
          desc: 'Step 1: Allocate new node [99] with next = NULL: node->next = NULL.',
          highlight: 'node = malloc(sizeof(Node)); node->next = NULL;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          newNode: { id: 99, val: 99, nextTarget: 'NULL' },
          currIndex: 2,
        },
        {
          desc: 'Step 2: Connect terminal node next pointer to new node: curr->next = node.',
          highlight: 'curr->next = node;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }, { id: 99, val: 99 }],
          newNode: null,
          currIndex: -1,
        },
      ];
      return { steps, current: steps[Math.min(step, steps.length - 1)] };
    }
  };

  const { steps, current } = getStepInfo();

  return (
    <div className="border border-border rounded bg-surface/50 p-4 my-6 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/20 text-primary">
            Interactive Visualizer
          </span>
          <span className="text-xs text-text-muted">Pointer State Machine</span>
        </div>
        <div className="flex items-center gap-1.5">
          {INSERT_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setStep(0);
              }}
              className={`text-2xs px-2.5 py-1 rounded transition-colors ${
                mode === m.id
                  ? 'bg-primary text-base font-semibold'
                  : 'bg-surface hover:bg-accent/15 text-text-muted border border-border'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="min-h-[140px] flex flex-col justify-center items-center py-6 bg-code-bg/5 dark:bg-black/20 rounded border border-border/60 overflow-x-auto">
        <div className="flex items-center gap-2 px-4">
          <div className="flex items-center gap-1 text-2xs font-bold text-accent">
            <span>HEAD</span>
            <span>→</span>
          </div>

          {current.nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex items-stretch border rounded font-mono text-xs shadow-sm overflow-hidden ${
                  node.val === 99
                    ? 'border-accent bg-accent/20 text-primary font-bold ring-1 ring-accent'
                    : 'border-border bg-surface text-text'
                }`}
              >
                <div className="px-3 py-2 border-r border-border/60 flex items-center justify-center font-bold min-w-[36px]">
                  {node.val}
                </div>
                <div className="px-2 py-2 bg-black/5 dark:bg-white/5 text-2xs text-text-muted flex items-center justify-center">
                  •
                </div>
              </motion.div>

              {i < current.nodes.length - 1 ? (
                <div className="text-text-muted text-xs font-bold">→</div>
              ) : (
                <div className="flex items-center text-text-muted text-xs font-bold gap-1">
                  <span>→</span>
                  <span className="text-2xs opacity-70">NULL</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Floating Newly Allocated Node */}
        {current.newNode && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded border border-dashed border-accent bg-accent/10"
          >
            <span className="text-2xs text-text-muted font-bold">Allocated node:</span>
            <div className="flex items-stretch border border-accent rounded bg-surface text-xs font-bold text-primary">
              <div className="px-2.5 py-1 border-r border-accent/40">{current.newNode.val}</div>
              <div className="px-2 py-1 text-2xs text-accent">next → {current.newNode.nextTarget ? `[${current.newNode.nextTarget}]` : 'null'}</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Step Description & Controls */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-text">
            Step {step + 1} of {steps.length}: <span className="font-normal text-text-muted">{current.desc}</span>
          </div>
          <div className="text-2xs font-mono text-primary bg-accent/10 px-2 py-0.5 rounded inline-block border border-accent/20">
            {current.highlight}
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="p-1.5 rounded border border-border bg-surface hover:bg-accent/15 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Previous Step"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setStep(0)}
            className="p-1.5 rounded border border-border bg-surface hover:bg-accent/15 transition-colors"
            title="Reset"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-primary text-base font-semibold hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
          >
            <span>Next Step</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
