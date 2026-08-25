import React, { useState } from 'react';
import { SandboxShell } from '../components/SandboxShell';
import { Plus, ArrowDown, ArrowUp, AlertCircle, RotateCcw } from 'lucide-react';

export const StackSandbox = () => {
  const [stack, setStack] = useState([10, 20, 30]);
  const [inputValue, setInputValue] = useState('');
  const [violation, setViolation] = useState(null);
  const [shaking, setShaking] = useState(false);

  const triggerViolation = (msg) => {
    setViolation(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    setTimeout(() => setViolation(null), 3000);
  };

  const handlePush = () => {
    const val = inputValue.trim() ? parseInt(inputValue, 10) : Math.floor(Math.random() * 90 + 10);
    if (stack.length >= 8) {
      triggerViolation('Stack Overflow: Capacity limit (8) reached.');
      return;
    }
    setStack([...stack, val]);
    setInputValue('');
  };

  const handlePop = () => {
    if (stack.length === 0) {
      triggerViolation('Stack Underflow: Cannot pop from an empty stack.');
      return;
    }
    setStack(stack.slice(0, -1));
  };

  const handleIllegalAccess = (index) => {
    if (index !== stack.length - 1) {
      triggerViolation(
        `LIFO Violation: Cannot access element at index [${index}]. Only TOP element [index ${stack.length - 1}] is accessible.`
      );
    }
  };

  return (
    <SandboxShell title="Stack">
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#F9F7F1] dark:bg-[#070D16] font-mono select-none overflow-y-auto">
        {/* Violation Toast */}
        {violation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-accent/20 border border-amber-accent/50 text-amber-accent text-xs font-bold shadow-lg backdrop-blur-md animate-in fade-in duration-150">
            <AlertCircle size={15} />
            <span>{violation}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-10 max-w-4xl w-full justify-center">
          {/* Stack Physical Chamber */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-extrabold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Stack Chamber (LIFO)</span>
              <span className="text-3xs text-text-muted font-normal">Capacity: 8</span>
            </div>

            <div
              className={`relative w-48 min-h-[340px] border-b-4 border-x-4 border-primary dark:border-border rounded-b-2xl bg-surface/60 p-2 flex flex-col-reverse items-center gap-1.5 transition-transform ${
                shaking ? 'animate-shake' : ''
              }`}
            >
              {stack.map((val, idx) => {
                const isTop = idx === stack.length - 1;
                return (
                  <div
                    key={idx}
                    onClick={() => handleIllegalAccess(idx)}
                    className={`relative w-full py-2.5 px-3 rounded-lg border-2 flex items-center justify-between text-xs font-bold transition-all ${
                      isTop
                        ? 'border-accent bg-accent/15 text-primary shadow-sm ring-1 ring-accent/30'
                        : 'border-border bg-surface text-text hover:border-amber-accent/60 cursor-not-allowed opacity-85'
                    }`}
                  >
                    <span>[{idx}]</span>
                    <span className="text-sm font-mono font-extrabold">{val}</span>
                    {isTop ? (
                      <span className="px-1.5 py-0.5 rounded text-3xs font-extrabold bg-accent text-white">
                        TOP
                      </span>
                    ) : (
                      <span className="text-3xs text-text-muted">locked</span>
                    )}
                  </div>
                );
              })}

              {stack.length === 0 && (
                <div className="m-auto text-xs text-text-muted text-center py-12">
                  Stack is empty
                </div>
              )}
            </div>
          </div>

          {/* Operation Controls */}
          <div className="p-6 rounded-2xl border border-border bg-surface/80 backdrop-blur-md shadow-xl w-full max-w-xs space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-accent">
              Stack Operations
            </div>

            {/* Push Input & Action */}
            <div className="space-y-2">
              <label className="text-2xs text-text-muted font-medium">Push Value</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePush()}
                  className="w-full px-3 py-2 rounded-xl bg-base/60 border border-border text-xs font-mono text-text outline-none focus:border-accent"
                />
                <button
                  onClick={handlePush}
                  className="px-3.5 py-2 rounded-xl bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Push</span>
                </button>
              </div>
            </div>

            {/* Pop Action */}
            <button
              onClick={handlePop}
              disabled={stack.length === 0}
              className="w-full py-2.5 rounded-xl border border-border hover:border-amber-accent hover:bg-amber-accent/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-text transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowUp size={14} className="text-amber-accent" />
              <span>Pop Top Element</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => setStack([10, 20, 30])}
              className="w-full py-2 rounded-xl border border-border/60 hover:bg-black/5 dark:hover:bg-white/5 text-2xs text-text-muted hover:text-text transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset to [10, 20, 30]</span>
            </button>

            {/* Principle Note */}
            <p className="text-3xs text-text-muted leading-relaxed border-t border-border/60 pt-3">
              Last-In, First-Out: Elements can only enter and leave through the top of the container in O(1) time.
            </p>
          </div>
        </div>
      </div>
    </SandboxShell>
  );
};
