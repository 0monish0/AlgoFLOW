import React from 'react';

const formatComplexity = (val) => {
  if (!val) return '—';
  const clean = val.trim();
  if (clean.includes('O(1)')) {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-2xs font-bold bg-sage-accent/15 text-sage-accent border border-sage-accent/30">
        {clean}
      </span>
    );
  }
  if (clean.includes('O(n') || clean.includes('O(N')) {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-2xs font-bold bg-amber-accent/15 text-amber-accent border border-amber-accent/30">
        {clean}
      </span>
    );
  }
  return <span className="text-text">{clean}</span>;
};

export const ComplexityTable = ({ rows }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-sage-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Complexity Specification
        </h3>
      </div>
      <div className="overflow-x-auto border border-border rounded bg-surface">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-border bg-base/40 text-text font-semibold">
              <th className="py-2.5 px-3">Operation</th>
              <th className="py-2.5 px-3">Best</th>
              <th className="py-2.5 px-3">Average</th>
              <th className="py-2.5 px-3">Worst</th>
              <th className="py-2.5 px-3">Space</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors">
                <td className="py-2 px-3 font-medium text-primary">{row.operation}</td>
                <td className="py-2 px-3">{formatComplexity(row.best)}</td>
                <td className="py-2 px-3">{formatComplexity(row.avg)}</td>
                <td className="py-2 px-3">{formatComplexity(row.worst)}</td>
                <td className="py-2 px-3">{formatComplexity(row.space)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
