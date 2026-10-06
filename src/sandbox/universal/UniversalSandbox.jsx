import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SandboxShell } from '../components/SandboxShell';
import { UniversalCanvas } from './UniversalCanvas';
import { BottomDock } from './BottomDock';
import { CodeEditorPanel } from '../components/CodeEditorPanel';
import { useSyncEngine } from '../sync/useSyncEngine';
import { useUniversalStore } from './useUniversalStore';

export const UniversalSandbox = () => {
  const [searchParams] = useSearchParams();
  const { setActiveStructureType } = useUniversalStore();

  const [codeEditorOpen, setCodeEditorOpen] = useState(false);

  const syncEngine = useSyncEngine();

  // If a ?ds= query param was supplied (e.g. from redirected routes), activate that structure
  useEffect(() => {
    window.__universalStore = useUniversalStore;
    const dsParam = searchParams.get('ds');
    if (dsParam) {
      const mapping = {
        'linked-list': 'linkedlist',
        stack: 'stack',
        array: 'array',
        tree: 'tree',
        queue: 'queue',
      };
      if (mapping[dsParam]) {
        setActiveStructureType(mapping[dsParam]);
      }
    }
  }, [searchParams, setActiveStructureType]);

  return (
    <SandboxShell
      title="Sandbox"
      codeEditorOpen={codeEditorOpen}
      onToggleCodeEditor={() => setCodeEditorOpen((v) => !v)}
    >
      {/* Content Area: Canvas + Draggable Divider + Code Editor */}
      <div className="w-full h-full relative flex flex-1 min-h-0 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 min-w-0 relative h-full">
          <UniversalCanvas />
          <BottomDock />
        </div>

        {/* Code Editor Panel docked right as flex sibling */}
        <CodeEditorPanel
          syncEngine={syncEngine}
          isOpen={codeEditorOpen}
          onClose={() => setCodeEditorOpen(false)}
        />
      </div>
    </SandboxShell>
  );
};
