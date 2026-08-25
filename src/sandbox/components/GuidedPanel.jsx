import React, { useEffect, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { linkedListLessons } from '../lessons/linkedListLessons';
import { CheckCircle2, ChevronRight, X, Sparkles, RotateCcw } from 'lucide-react';

export const GuidedPanel = ({ onHighlightChange }) => {
  const {
    activeLessonId,
    currentStepIndex,
    setLesson,
    setStepIndex,
    setMode,
    nodes,
    freePointers,
    evaluation,
    resetCanvas,
  } = useSandboxStore();

  const [selectedLessonId, setSelectedLessonId] = useState(
    activeLessonId || linkedListLessons[0].id
  );

  const activeLesson = linkedListLessons.find((l) => l.id === selectedLessonId) || linkedListLessons[0];
  const currentStep = activeLesson.steps[currentStepIndex] || activeLesson.steps[0];
  const isLastStep = currentStepIndex >= activeLesson.steps.length - 1;

  // Real-time evaluation against live graph
  useEffect(() => {
    if (!currentStep || !currentStep.check) return;

    const isComplete = currentStep.check({ nodes, freePointers, evaluation });
    if (isComplete) {
      if (!isLastStep) {
        const timer = setTimeout(() => {
          setStepIndex(currentStepIndex + 1);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [nodes, freePointers, evaluation, currentStep, currentStepIndex, isLastStep, setStepIndex]);

  // Update primitive highlight
  useEffect(() => {
    if (currentStep?.targetPrimitive && onHighlightChange) {
      onHighlightChange(currentStep.targetPrimitive);
    }
  }, [currentStep, onHighlightChange]);

  return (
    <aside className="interactive-panel absolute top-4 right-4 bottom-4 w-84 max-w-[90vw] bg-surface border-2 border-border shadow-2xl flex flex-col font-mono text-xs z-30 overflow-hidden select-none animate-in slide-in-from-right duration-150">
      {/* Panel Header */}
      <div className="p-3 border-b-2 border-border flex items-center justify-between bg-base/50">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="font-extrabold text-primary tracking-tight uppercase">
            Guided Lessons
          </span>
        </div>
        <button
          onClick={() => setMode('free')}
          className="p-1 hover:bg-red-500 hover:text-white text-text-muted transition-colors"
          title="Close guidance (switch to free mode)"
        >
          <X size={15} />
        </button>
      </div>

      {/* Lesson Selector */}
      <div className="p-3 border-b border-border bg-base/20 space-y-1.5">
        <div className="text-3xs uppercase tracking-wider text-text-muted font-bold">
          Choose Lesson
        </div>
        <select
          value={selectedLessonId}
          onChange={(e) => {
            setSelectedLessonId(e.target.value);
            setLesson(e.target.value, 0);
          }}
          className="w-full px-2.5 py-1.5 bg-surface border-2 border-border text-xs font-mono text-text outline-none focus:border-accent"
        >
          {linkedListLessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </div>

      {/* Current Step Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step Progress Blocks */}
        <div className="flex items-center gap-1">
          {activeLesson.steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 border transition-all ${
                idx < currentStepIndex
                  ? 'bg-sage-accent border-sage-accent'
                  : idx === currentStepIndex
                  ? 'bg-accent border-accent animate-pulse'
                  : 'bg-base border-border'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-2xs text-text-muted font-bold">
          <span>STEP {currentStepIndex + 1} OF {activeLesson.steps.length}</span>
          <span>{activeLesson.title}</span>
        </div>

        {/* Instruction Card */}
        <div className="p-3.5 border-2 border-accent/60 bg-accent/10 space-y-2">
          <div className="text-2xs font-bold uppercase tracking-wider text-accent">
            Instruction
          </div>
          <p className="text-xs text-text leading-relaxed font-medium">
            {currentStep.instruction}
          </p>
        </div>

        <div className="text-2xs text-text-muted leading-normal">
          The canvas updates continuously. Manipulate the nodes and pointers directly to satisfy the step conditions.
        </div>
      </div>

      {/* Panel Bottom Controls */}
      <div className="p-3 border-t-2 border-border bg-base/30 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            resetCanvas();
            setStepIndex(0);
          }}
          className="px-2.5 py-1.5 border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text transition-colors flex items-center gap-1 text-2xs font-bold"
          title="Restart lesson"
        >
          <RotateCcw size={12} />
          <span>Restart</span>
        </button>

        <div className="flex items-center gap-2">
          {!isLastStep && (
            <button
              onClick={() => setStepIndex(currentStepIndex + 1)}
              className="px-3 py-1.5 border-2 border-border hover:border-accent hover:bg-accent/10 text-xs font-bold text-text transition-colors flex items-center gap-1"
            >
              <span>Skip</span>
              <ChevronRight size={13} />
            </button>
          )}

          {isLastStep && (
            <div className="flex items-center gap-1.5 text-sage-accent font-bold text-xs px-2 py-1 bg-sage-accent/15 border-2 border-sage-accent/40">
              <CheckCircle2 size={14} />
              <span>Completed!</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
