import React from 'react';

export const DiagramNode = ({ type = 'singly' }) => {
  return (
    <div className="my-6 p-4 rounded border border-border bg-surface/60 overflow-x-auto">
      <div className="text-2xs font-mono text-text-muted mb-2 uppercase tracking-wider font-semibold">
        Memory Layout Schematic
      </div>
      <div className="flex items-center justify-center min-w-[340px] py-4">
        {type === 'singly' && (
          <svg className="w-full max-w-[460px] h-[70px]" viewBox="0 0 460 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* HEAD Label */}
            <text x="10" y="38" fill="var(--color-primary)" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">HEAD</text>
            <path d="M42 34H65" stroke="var(--color-primary)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 1 */}
            <rect x="70" y="15" width="80" height="38" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-bg-surface)" />
            <line x1="120" y1="15" x2="120" y2="53" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="95" y="38" fill="var(--color-text)" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">10</text>
            <circle cx="135" cy="34" r="3" fill="var(--color-accent)" />
            <path d="M135 34H175" stroke="var(--color-accent)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 2 */}
            <rect x="180" y="15" width="80" height="38" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-bg-surface)" />
            <line x1="230" y1="15" x2="230" y2="53" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="205" y="38" fill="var(--color-text)" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">20</text>
            <circle cx="245" cy="34" r="3" fill="var(--color-accent)" />
            <path d="M245 34H285" stroke="var(--color-accent)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 3 */}
            <rect x="290" y="15" width="80" height="38" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-bg-surface)" />
            <line x1="340" y1="15" x2="340" y2="53" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="315" y="38" fill="var(--color-text)" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">30</text>
            <circle cx="355" cy="34" r="3" fill="var(--color-accent)" />
            <path d="M355 34H395" stroke="var(--color-accent)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* NULL */}
            <text x="402" y="38" fill="var(--color-text-muted)" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">NULL</text>

            <defs>
              <marker id="arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--color-primary)" />
              </marker>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
};
