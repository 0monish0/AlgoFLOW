import React, { useState } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { SandboxShell } from '../components/SandboxShell';
import { SandboxCanvas } from '../components/SandboxCanvas';
import { GuidedPanel } from '../components/GuidedPanel';
import { CodeEditorPanel } from '../components/CodeEditorPanel';
import { useSyncEngine } from '../sync/useSyncEngine';

export const LinkedListSandbox = () => {
  const { mode } = useSandboxStore();
  const [highlightedPrimitive, setHighlightedPrimitive] = useState(null);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);

  const syncEngine = useSyncEngine();

  return (
    <SandboxShell
      title="Linked List"
      codeEditorOpen={codeEditorOpen}
      onToggleCodeEditor={() => setCodeEditorOpen((v) => !v)}
    >
      {/* Canvas + Editor side-by-side container */}
      <div className="w-full h-full relative flex">
        {/* Canvas fills remaining width */}
        <div className="flex-1 min-w-0 relative h-full">
          <SandboxCanvas highlightedNodeId={highlightedPrimitive} />
        </div>

        {/* Code Editor Panel — docked right */}
        <CodeEditorPanel
          syncEngine={syncEngine}
          isOpen={codeEditorOpen}
          onClose={() => setCodeEditorOpen(false)}
        />
      </div>

      {/* Guided lessons panel */}
      {mode === 'guided' && (
        <GuidedPanel onHighlightChange={setHighlightedPrimitive} />
      )}
    </SandboxShell>
  );
};
