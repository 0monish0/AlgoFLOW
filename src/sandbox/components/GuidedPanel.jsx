import React, { useEffect, useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { linkedListLessons } from '../lessons/linkedListLessons';
import { ChevronRight, X, Sparkles, RotateCcw } from 'lucide-react';

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
    <aside className="interactive-panel absolute top-20 right-6 sm:right-8 z-40 w-84 max-w-[92vw] bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col font-mono text-xs select-none overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-4 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Sparkles size={12} />
          </div>
          <span className="font-extrabold text-white tracking-tight text-xs uppercase">
            Guided Lessons
          </span>
        </div>
        <button
          onClick={() => setMode('free')}
          className="p-1 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          title="Close guidance (switch to free mode)"
        >
          <X size={15} />
        </button>
      </div>

      {/* Lesson Selector */}
      <div className="space-y-1.5">
        <div className="text-3xs uppercase tracking-wider text-text-muted font-bold">
          Choose Lesson
        </div>
        <select
          value={selectedLessonId}
          onChange={(e) => {
            setSelectedLessonId(e.target.value);
            setLesson(e.target.value, 0);
          }}
          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white outline-none focus:border-accent cursor-pointer"
        >
          {linkedListLessons.map((l) => (
            <option key={l.id} value={l.id} className="bg-[#18181B] text-white">
              {l.title}
            </option>
          ))}
        </select>
      </div>

      {/* Step Progress Blocks */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          {activeLesson.steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx < currentStepIndex
                  ? 'bg-accent'
                  : idx === currentStepIndex
                  ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-3xs text-text-muted font-bold">
          <span>STEP {currentStepIndex + 1} OF {activeLesson.steps.length}</span>
          <span className="truncate max-w-[160px]">{activeLesson.title}</span>
        </div>
      </div>

      {/* Instruction Card */}
      <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/10 space-y-1.5">
        <div className="text-3xs font-bold uppercase tracking-wider text-accent">
          Instruction
        </div>
        <p className="text-xs text-white leading-relaxed font-medium">
          {currentStep.instruction}
        </p>
      </div>

      <div className="text-3xs text-text-muted leading-normal">
        The canvas updates continuously. Manipulate the nodes and pointers directly to satisfy the step conditions.
      </div>

      {/* Panel Bottom Controls */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            resetCanvas();
            setStepIndex(0);
          }}
          className="px-3 py-1.5 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 text-text-muted hover:text-white transition-colors flex items-center gap-1 text-2xs font-bold"
          title="Restart lesson"
        >
          <RotateCcw size={12} />
          <span>Restart</span>
        </button>

        {!isLastStep && (
          <button
            onClick={() => setStepIndex(currentStepIndex + 1)}
            className="px-3.5 py-1.5 rounded-full bg-accent hover:opacity-90 text-black font-extrabold text-xs transition-all shadow-md flex items-center gap-1 active:scale-95"
          >
            <span>Skip</span>
            <ChevronRight size={13} strokeWidth={3} />
          </button>
        )}
      </div>
    </aside>
  );
};
