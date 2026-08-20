import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

export const DllVisualizer = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      desc: 'Initial state: Existing Doubly Linked List [A: 10] <==> [B: 30]. Target: Insert [N: 20] between A and B.',
      highlight: 'Node* A = head; Node* B = A->next;',
      stage: 'init',
    },
    {
      desc: 'Step 1: Allocate new node N (20) and connect its next pointer to B: N->next = B.',
      highlight: 'N->next = A->next; // N points forward to B',
      stage: 'step1',
    },
    {
      desc: 'Step 2: Connect N’s prev pointer to A: N->prev = A.',
      highlight: 'N->prev = A; // N points backward to A',
      stage: 'step2',
    },
    {
      desc: 'Step 3: Connect B’s prev pointer backward to N: B->prev = N.',
      highlight: 'B->prev = N; // B points backward to N',
      stage: 'step3',
    },
    {
      desc: 'Step 4: Connect A’s next pointer forward to N: A->next = N. 4-way splicing complete!',
      highlight: 'A->next = N; list->size++;',
      stage: 'step4',
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
          <span className="text-xs text-text-muted">Doubly Linked List 4-Way Pointer Splicing</span>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="min-h-[160px] flex flex-col justify-center items-center py-6 bg-code-bg/5 dark:bg-black/20 rounded border border-border/60 overflow-x-auto">
        <div className="flex items-center gap-4 px-4">
          <div className="text-2xs font-bold text-accent">HEAD →</div>

          {/* Node A */}
          <div className="flex flex-col items-center">
            <div className="text-2xs font-mono text-text-muted mb-1">Node A</div>
            <div className="flex items-stretch border border-border bg-surface rounded text-xs font-mono overflow-hidden shadow-sm">
              <div className="px-2 py-1.5 bg-black/5 dark:bg-white/5 text-2xs text-text-muted">NULL</div>
              <div className="px-3 py-1.5 font-bold border-x border-border">10</div>
              <div className="px-2 py-1.5 bg-black/5 dark:bg-white/5 text-2xs text-text-muted">next</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-xs font-bold text-text-muted">
            <span className="text-2xs text-accent">{step >= 4 ? '→ N' : '→ B'}</span>
            <span>⇄</span>
            <span className="text-2xs text-accent">{step >= 3 ? 'N ←' : 'A ←'}</span>
          </div>

          {/* Node N (Floating or spliced) */}
          {(step >= 1 || step === 0) && (
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: step === 0 ? 0.35 : 1,
                y: step >= 4 ? 0 : -8,
              }}
              className="flex flex-col items-center"
            >
              <div className="text-2xs font-mono text-primary font-bold mb-1">New Node N</div>
              <div className="flex items-stretch border-2 border-accent bg-accent/20 rounded text-xs font-mono overflow-hidden shadow-sm font-bold text-primary">
                <div className="px-2 py-1.5 bg-accent/30 text-2xs">
                  {step >= 2 ? 'prev(A)' : '•'}
                </div>
                <div className="px-3 py-1.5 border-x border-accent/40 font-bold">20</div>
                <div className="px-2 py-1.5 bg-accent/30 text-2xs">
                  {step >= 1 ? 'next(B)' : '•'}
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col items-center justify-center text-xs font-bold text-text-muted">
            <span className="text-2xs text-accent">→</span>
            <span>⇄</span>
            <span className="text-2xs text-accent">←</span>
          </div>

          {/* Node B */}
          <div className="flex flex-col items-center">
            <div className="text-2xs font-mono text-text-muted mb-1">Node B</div>
            <div className="flex items-stretch border border-border bg-surface rounded text-xs font-mono overflow-hidden shadow-sm">
              <div className="px-2 py-1.5 bg-black/5 dark:bg-white/5 text-2xs text-text-muted">prev</div>
              <div className="px-3 py-1.5 font-bold border-x border-border">30</div>
              <div className="px-2 py-1.5 bg-black/5 dark:bg-white/5 text-2xs text-text-muted">NULL</div>
            </div>
          </div>

          <div className="text-2xs font-bold text-accent">→ TAIL</div>
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
