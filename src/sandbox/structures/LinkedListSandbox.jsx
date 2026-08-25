import React, { useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { SandboxShell } from '../components/SandboxShell';
import { SandboxCanvas } from '../components/SandboxCanvas';
import { GuidedPanel } from '../components/GuidedPanel';

export const LinkedListSandbox = () => {
  const { mode } = useSandboxStore();
  const [highlightedPrimitive, setHighlightedPrimitive] = useState(null);

  return (
    <SandboxShell title="Linked List">
      <SandboxCanvas highlightedNodeId={highlightedPrimitive} />
      {mode === 'guided' && (
        <GuidedPanel onHighlightChange={setHighlightedPrimitive} />
      )}
    </SandboxShell>
  );
};
