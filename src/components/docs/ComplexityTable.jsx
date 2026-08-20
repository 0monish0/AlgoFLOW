import React from 'react';

export const ComplexityTable = ({ rows }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="my-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2">
        Complexity Specification
      </h3>
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
                <td className="py-2 px-3 text-text">{row.best}</td>
                <td className="py-2 px-3 text-text">{row.avg}</td>
                <td className="py-2 px-3 text-text">{row.worst}</td>
                <td className="py-2 px-3 text-text-muted">{row.space}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
