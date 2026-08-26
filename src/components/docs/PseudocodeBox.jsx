import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export const PseudocodeBox = ({ pseudocode, title = 'Algorithm Pseudocode' }) => {
  const [copied, setCopied] = useState(false);

  if (!pseudocode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pseudocode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy pseudocode', err);
    }
  };

  const lines = pseudocode.trim().split('\n');

  return (
    <div className="my-6 border border-emerald-500/20 rounded overflow-hidden bg-[#0A0E14] shadow-sm">
      {/* Pseudocode Header Bar */}
      <div className="flex items-center justify-between bg-emerald-950/20 px-3.5 py-2 border-b border-emerald-500/20 select-none">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal size={14} className="text-emerald-400" />
          <span className="text-2xs font-mono font-bold uppercase tracking-wider">
            {title}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-emerald-300/70 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors"
          title="Copy pseudocode"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Pseudocode Body with Line Numbers */}
      <div className="overflow-x-auto p-4 flex text-xs font-mono leading-relaxed bg-[#0B0F17]">
        {/* Line Numbers */}
        <div className="select-none pr-4 text-right text-emerald-500/30 font-mono border-r border-emerald-500/10 select-none shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Pseudocode Content */}
        <pre className="pl-4 m-0 overflow-visible flex-1 text-emerald-200/90 font-mono">
          <code>{pseudocode.trim()}</code>
        </pre>
      </div>
    </div>
  );
};
