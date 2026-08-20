import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

const DELETION_MODES = [
  { id: 'head', label: 'Delete Head Node (10)' },
  { id: 'middle', label: 'Delete Middle Node (20)' },
  { id: 'tail', label: 'Delete Tail Node (30)' },
];

export const SllDeletionVisualizer = () => {
  const [mode, setMode] = useState('head');
  const [step, setStep] = useState(0);

  const getStepInfo = () => {
    if (mode === 'head') {
      const steps = [
        {
          desc: 'Initial state: List [10] -> [20] -> [30] -> NULL. Head points to [10].',
          highlight: 'head = [10]',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          bypassing: null,
          freeing: null,
        },
        {
          desc: 'Step 1: Save target node pointer: Node* target = head.',
          highlight: 'Node* target = list->head;',
          nodes: [{ id: 1, val: 10, isTarget: true }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          bypassing: null,
          freeing: null,
        },
        {
          desc: 'Step 2: Advance head pointer to successor node: head = target->next.',
          highlight: 'list->head = target->next;',
          nodes: [{ id: 1, val: 10, isTarget: true, detached: true }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          bypassing: null,
          freeing: null,
        },
        {
          desc: 'Step 3: Deallocate memory of unlinked node: free(target).',
          highlight: 'free(target); list->size--;',
          nodes: [{ id: 2, val: 20 }, { id: 3, val: 30 }],
          bypassing: null,
          freeing: 10,
        },
      ];
      return { steps, current: steps[Math.min(step, steps.length - 1)] };
    } else if (mode === 'middle') {
      const steps = [
        {
          desc: 'Initial state: List [10] -> [20] -> [30] -> NULL. Target deletion index = 1 (value=20).',
          highlight: 'curr = head',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
          currId: 1,
        },
        {
          desc: 'Step 1: Traverse curr to predecessor (index 0) and target = curr->next.',
          highlight: 'Node* target = curr->next; // target is [20]',
          nodes: [{ id: 1, val: 10, isCurr: true }, { id: 2, val: 20, isTarget: true }, { id: 3, val: 30 }],
        },
        {
          desc: 'Step 2: Bypass target node by rewiring predecessor next pointer: curr->next = target->next.',
          highlight: 'curr->next = target->next; // [10] points directly to [30]',
          nodes: [{ id: 1, val: 10, isCurr: true }, { id: 2, val: 20, isTarget: true, detached: true }, { id: 3, val: 30 }],
        },
        {
          desc: 'Step 3: Reclaim target node memory: free(target).',
          highlight: 'free(target);',
          nodes: [{ id: 1, val: 10 }, { id: 3, val: 30 }],
          freeing: 20,
        },
      ];
      return { steps, current: steps[Math.min(step, steps.length - 1)] };
    } else {
      // Tail
      const steps = [
        {
          desc: 'Initial state: List [10] -> [20] -> [30] -> NULL. Traverse to second-to-last node.',
          highlight: 'while (curr->next->next != NULL) curr = curr->next;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30 }],
        },
        {
          desc: 'Step 1: Save tail pointer: target = curr->next and unlink: curr->next = NULL.',
          highlight: 'Node* target = curr->next; curr->next = NULL;',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }, { id: 3, val: 30, isTarget: true, detached: true }],
        },
        {
          desc: 'Step 2: Deallocate memory: free(target).',
          highlight: 'free(target);',
          nodes: [{ id: 1, val: 10 }, { id: 2, val: 20 }],
          freeing: 30,
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
          <span className="text-xs text-text-muted">Deletion & Pointer Bypassing</span>
        </div>
        <div className="flex items-center gap-1.5">
          {DELETION_MODES.map((m) => (
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

          <AnimatePresence mode="popLayout">
            {current.nodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <motion.div
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: node.detached ? -16 : 0,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-stretch border rounded font-mono text-xs shadow-sm overflow-hidden ${
                    node.isTarget
                      ? 'border-red-400 bg-red-500/10 text-red-700 dark:text-red-300 ring-1 ring-red-400'
                      : node.isCurr
                      ? 'border-accent bg-accent/20 text-primary font-bold'
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
          </AnimatePresence>
        </div>

        {current.freeing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-2xs font-mono text-text-muted flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            <span>Memory for node [{current.freeing}] released to heap.</span>
          </motion.div>
        )}
      </div>

      {/* Controls */}
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
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setStep(0)}
            className="p-1.5 rounded border border-border bg-surface hover:bg-accent/15 transition-colors"
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
