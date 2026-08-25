import React, { useState } from 'react';
import { SandboxShell } from '../components/SandboxShell';
import { Plus, ArrowRight, ArrowLeft, Trash2, RotateCcw, AlertCircle } from 'lucide-react';

export const ArraySandbox = () => {
  const [array, setArray] = useState([10, 20, 30, 40, null, null, null, null]);
  const [capacity, setCapacity] = useState(8);
  const [targetIndex, setTargetIndex] = useState(1);
  const [insertValue, setInsertValue] = useState(99);
  const [message, setMessage] = useState(null);

  const size = array.filter((v) => v !== null).length;

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  // Shift right from index
  const shiftRight = (fromIdx) => {
    if (size >= capacity) {
      showMsg('Capacity Full: Triggering dynamic 2x array resize and copy!');
      const newCap = capacity * 2;
      setCapacity(newCap);
      const newArr = [...array, ...Array(capacity).fill(null)];
      for (let i = newArr.length - 1; i > fromIdx; i--) {
        newArr[i] = newArr[i - 1];
      }
      newArr[fromIdx] = null;
      setArray(newArr);
      return;
    }

    const next = [...array];
    for (let i = next.length - 1; i > fromIdx; i--) {
      next[i] = next[i - 1];
    }
    next[fromIdx] = null;
    setArray(next);
    showMsg(`Shifted elements from index [${fromIdx}] rightwards by 1 slot (O(n) work).`);
  };

  // Shift left towards index
  const shiftLeft = (toIdx) => {
    const next = [...array];
    for (let i = toIdx; i < next.length - 1; i++) {
      next[i] = next[i + 1];
    }
    next[next.length - 1] = null;
    setArray(next);
    showMsg(`Shifted elements from index [${toIdx + 1}] leftwards to fill gap.`);
  };

  const handleInsertAt = (idx) => {
    const next = [...array];
    next[idx] = insertValue;
    setArray(next);
    setInsertValue(insertValue + 5);
    showMsg(`Inserted [${insertValue}] directly into slot [${idx}].`);
  };

  const handleDeleteAt = (idx) => {
    const next = [...array];
    next[idx] = null;
    setArray(next);
    showMsg(`Deleted element at slot [${idx}]. Remember to shift successors to maintain contiguity!`);
  };

  return (
    <SandboxShell title="Array / ADT List">
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#F9F7F1] dark:bg-[#070D16] font-mono select-none overflow-y-auto">
        {/* Status Toast */}
        {message && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 border border-accent/50 text-primary dark:text-[#E2E8F0] text-xs font-bold shadow-lg backdrop-blur-md animate-in fade-in duration-150">
            <AlertCircle size={15} className="text-accent" />
            <span>{message}</span>
          </div>
        )}

        <div className="max-w-4xl w-full flex flex-col items-center gap-8">
          {/* Header Stats */}
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <div>
              Size: <span className="font-extrabold text-primary">{size}</span>
            </div>
            <div>
              Capacity: <span className="font-extrabold text-primary">{capacity}</span>
            </div>
            <div className="hidden sm:inline">
              Memory: <span className="font-bold text-accent">Contiguous 0x7ffd..</span>
            </div>
          </div>

          {/* Contiguous Indexed Memory Slots */}
          <div className="w-full overflow-x-auto p-4 flex justify-center">
            <div className="flex items-stretch border-2 border-border rounded-2xl bg-surface/80 p-2 shadow-xl">
              {array.slice(0, capacity).map((val, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center px-1"
                >
                  <div className="text-3xs text-text-muted font-bold mb-1">
                    [{idx}]
                  </div>
                  <div
                    className={`w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      val !== null
                        ? 'border-primary/40 dark:border-white/20 bg-base/50 text-primary font-bold shadow-xs'
                        : 'border-dashed border-border/80 bg-transparent text-text-muted/40 font-normal'
                    }`}
                  >
                    <span className="text-sm font-extrabold font-mono">
                      {val !== null ? val : '—'}
                    </span>
                    {val !== null && (
                      <button
                        onClick={() => handleDeleteAt(idx)}
                        className="opacity-0 hover:opacity-100 text-red-400 p-0.5 mt-1 rounded transition-opacity"
                        title="Delete slot item"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operations & Shift Simulator */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xl max-w-xl w-full space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-accent">
              Manual Shift &amp; Insertion Simulator
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => shiftRight(targetIndex)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border hover:border-accent hover:bg-accent/10 font-bold text-text transition-colors"
              >
                <ArrowRight size={14} className="text-accent" />
                <span>Shift Right from [{targetIndex}]</span>
              </button>

              <button
                onClick={() => shiftLeft(targetIndex)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border hover:border-accent hover:bg-accent/10 font-bold text-text transition-colors"
              >
                <ArrowLeft size={14} className="text-accent" />
                <span>Shift Left towards [{targetIndex}]</span>
              </button>

              <button
                onClick={() => handleInsertAt(targetIndex)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] font-bold shadow-xs transition-opacity hover:opacity-90"
              >
                <Plus size={14} />
                <span>Place [{insertValue}] into [{targetIndex}]</span>
              </button>

              <button
                onClick={() => {
                  setArray([10, 20, 30, 40, null, null, null, null]);
                  setCapacity(8);
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border/60 hover:bg-black/5 dark:hover:bg-white/5 text-text-muted transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset Array</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </SandboxShell>
  );
};
