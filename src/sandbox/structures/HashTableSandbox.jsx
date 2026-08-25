import React, { useState } from 'react';
import { SandboxShell } from '../components/SandboxShell';
import { Plus, Hash, ArrowRight, RotateCcw } from 'lucide-react';

const BUCKET_COUNT = 7;

export const HashTableSandbox = () => {
  const [buckets, setBuckets] = useState([
    [{ key: 'apple', val: 100 }],
    [],
    [{ key: 'banana', val: 200 }, { key: 'cherry', val: 350 }],
    [],
    [{ key: 'date', val: 400 }],
    [],
    [],
  ]);

  const [inputKey, setInputKey] = useState('grape');
  const [inputVal, setInputVal] = useState('500');
  const [lastHashInfo, setLastHashInfo] = useState(null);

  const computeHash = (key) => {
    let sum = 0;
    for (let i = 0; i < key.length; i++) {
      sum += key.charCodeAt(i);
    }
    return {
      sum,
      index: sum % BUCKET_COUNT,
    };
  };

  const handleInsert = () => {
    if (!inputKey.trim()) return;

    const { sum, index } = computeHash(inputKey.trim());
    setLastHashInfo({
      key: inputKey.trim(),
      sum,
      index,
    });

    const next = buckets.map((b, i) => {
      if (i === index) {
        // Check if key already exists, else chain
        const existingIdx = b.findIndex((item) => item.key === inputKey.trim());
        if (existingIdx >= 0) {
          const updated = [...b];
          updated[existingIdx] = { key: inputKey.trim(), val: inputVal };
          return updated;
        }
        return [...b, { key: inputKey.trim(), val: inputVal }];
      }
      return b;
    });

    setBuckets(next);
    setInputKey('');
    setInputVal('');
  };

  return (
    <SandboxShell title="Hash Table (Chaining)">
      <div className="w-full h-full flex flex-col p-6 bg-[#F9F7F1] dark:bg-[#070D16] font-mono select-none overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Top Controls & Hash Computation Inspector */}
          <div className="p-4 rounded-2xl border border-border bg-surface flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-bold text-accent">
                <Hash size={14} />
                <span>hash(k) = (∑ ASCII) % {BUCKET_COUNT}</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. 'melon')"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-32 px-3 py-1.5 rounded-xl bg-base/50 border border-border text-xs text-text outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-xl bg-base/50 border border-border text-xs text-text outline-none focus:border-accent"
                />
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-primary text-base dark:bg-[#F5EEDD] dark:text-[#081722] font-bold text-xs hover:opacity-90 shadow-xs"
                >
                  <Plus size={13} />
                  <span>Insert Key</span>
                </button>
              </div>
            </div>

            {lastHashInfo && (
              <div className="text-2xs text-text-muted flex items-center gap-2">
                <span>Computed:</span>
                <span className="font-bold text-primary">
                  '{lastHashInfo.key}' → {lastHashInfo.sum} % {BUCKET_COUNT} = [Bucket {lastHashInfo.index}]
                </span>
              </div>
            )}
          </div>

          {/* Bucket Array with Chained Linked Lists */}
          <div className="space-y-3">
            {buckets.map((chain, bIdx) => (
              <div
                key={bIdx}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/80 bg-surface/70 shadow-sm"
              >
                {/* Bucket Slot Array Index */}
                <div className="w-24 px-3 py-2 rounded-xl bg-base/60 border border-border text-center shrink-0">
                  <div className="text-3xs text-text-muted font-bold">Bucket</div>
                  <div className="text-sm font-extrabold text-primary">[{bIdx}]</div>
                </div>

                <div className="text-xs text-accent shrink-0">→</div>

                {/* Chained Linked List of Nodes */}
                <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
                  {chain.map((item, nodeIdx) => (
                    <React.Fragment key={item.key}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/30 dark:border-white/20 bg-surface shadow-xs shrink-0">
                        <span className="font-extrabold text-primary">{item.key}:</span>
                        <span className="text-text-muted">{item.val}</span>
                      </div>
                      <div className="text-xs text-text-muted shrink-0">→</div>
                    </React.Fragment>
                  ))}

                  <div className="px-2.5 py-1 rounded-lg border border-dashed border-border text-3xs font-bold text-text-muted shrink-0">
                    NULL
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SandboxShell>
  );
};
