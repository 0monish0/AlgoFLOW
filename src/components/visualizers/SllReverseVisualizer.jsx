import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

export const SllReverseVisualizer = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      desc: 'Initial state: prev = NULL, curr = [10], next = NULL.',
      highlight: 'prev = NULL; curr = head;',
      prev: 'NULL',
      curr: '10',
      next: 'NULL',
      links: [
        { from: 10, to: 20 },
        { from: 20, to: 30 },
        { from: 30, to: 40 },
        { from: 40, to: 'NULL' },
      ],
    },
    // Iteration 1
    {
      desc: 'Iteration 1 (Step 1): next = curr->next. Next stores pointer to [20].',
      highlight: 'next = curr->next; // next points to [20]',
      prev: 'NULL',
      curr: '10',
      next: '20',
      links: [
        { from: 10, to: 20 },
        { from: 20, to: 30 },
        { from: 30, to: 40 },
        { from: 40, to: 'NULL' },
      ],
    },
    {
      desc: 'Iteration 1 (Step 2): curr->next = prev. Link from [10] now points to NULL.',
      highlight: 'curr->next = prev; // [10] -> NULL',
      prev: 'NULL',
      curr: '10',
      next: '20',
      links: [
        { from: 10, to: 'NULL' },
        { from: 20, to: 30 },
        { from: 30, to: 40 },
        { from: 40, to: 'NULL' },
      ],
    },
    {
      desc: 'Iteration 1 (Step 3): Advance pointers: prev = curr ([10]), curr = next ([20]).',
      highlight: 'prev = curr; curr = next;',
      prev: '10',
      curr: '20',
      next: '20',
      links: [
        { from: 10, to: 'NULL' },
        { from: 20, to: 30 },
        { from: 30, to: 40 },
        { from: 40, to: 'NULL' },
      ],
    },
    // Iteration 2
    {
      desc: 'Iteration 2: Reverse [20]. next = [30], curr->next = prev ([10]), advance pointers.',
      highlight: 'curr->next = prev; // [20] -> [10]',
      prev: '20',
      curr: '30',
      next: '30',
      links: [
        { from: 10, to: 'NULL' },
        { from: 20, to: 10 },
        { from: 30, to: 40 },
        { from: 40, to: 'NULL' },
      ],
    },
    // Iteration 3
    {
      desc: 'Iteration 3: Reverse [30]. next = [40], curr->next = prev ([20]), advance pointers.',
      highlight: 'curr->next = prev; // [30] -> [20]',
      prev: '30',
      curr: '40',
      next: '40',
      links: [
        { from: 10, to: 'NULL' },
        { from: 20, to: 10 },
        { from: 30, to: 20 },
        { from: 40, to: 'NULL' },
      ],
    },
    // Iteration 4
    {
      desc: 'Iteration 4: Reverse [40]. next = NULL, curr->next = prev ([30]), curr becomes NULL.',
      highlight: 'curr->next = prev; prev = [40]; curr = NULL;',
      prev: '40',
      curr: 'NULL',
      next: 'NULL',
      links: [
        { from: 10, to: 'NULL' },
        { from: 20, to: 10 },
        { from: 30, to: 20 },
        { from: 40, to: 30 },
      ],
    },
    // Completion
    {
      desc: 'Termination: curr is NULL. Update head pointer to prev: head = prev ([40]). List is reversed!',
      highlight: 'list->head = prev; // New head is [40]',
      prev: '40',
      curr: 'NULL',
      next: 'NULL',
      isComplete: true,
      links: [
        { from: 40, to: 30 },
        { from: 30, to: 20 },
        { from: 20, to: 10 },
        { from: 10, to: 'NULL' },
      ],
    },
  ];

  const current = steps[step];

  return (
    <div className="border border-border rounded bg-surface/50 p-4 my-6 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/20 text-primary">
            Interactive Visualizer
          </span>
          <span className="text-xs text-text-muted">In-Place 3-Pointer Reversal</span>
        </div>
        <div className="flex items-center gap-3 text-2xs font-mono">
          <span className="px-2 py-1 rounded bg-surface border border-border">
            prev: <strong className="text-primary">{current.prev}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-surface border border-border">
            curr: <strong className="text-primary">{current.curr}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-surface border border-border">
            next: <strong className="text-primary">{current.next}</strong>
          </span>
        </div>
      </div>

      {/* Visual representation */}
      <div className="min-h-[140px] flex flex-col justify-center items-center py-6 bg-code-bg/5 dark:bg-black/20 rounded border border-border/60 overflow-x-auto">
        <div className="flex items-center gap-3 px-4">
          <div className="text-2xs font-bold text-accent">
            {current.isComplete ? 'NEW HEAD →' : 'HEAD →'}
          </div>

          {[40, 30, 20, 10].map((val) => {
            const isPrev = current.prev === String(val);
            const isCurr = current.curr === String(val);

            return (
              <div key={val} className="flex items-center gap-2">
                <motion.div
                  layout
                  className={`flex flex-col items-center border rounded font-mono text-xs shadow-sm ${
                    isCurr
                      ? 'border-accent bg-accent/25 text-primary font-bold ring-2 ring-accent'
                      : isPrev
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-surface text-text'
                  }`}
                >
                  <div className="px-3 py-1.5 font-bold">{val}</div>
                  <div className="text-2xs px-2 py-0.5 border-t border-border/60 bg-black/5 dark:bg-white/5 text-text-muted">
                    {isCurr ? 'curr' : isPrev ? 'prev' : 'node'}
                  </div>
                </motion.div>
                <span className="text-xs font-bold text-text-muted">↔</span>
              </div>
            );
          })}

          <div className="text-2xs font-mono text-text-muted opacity-70">NULL</div>
        </div>
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
