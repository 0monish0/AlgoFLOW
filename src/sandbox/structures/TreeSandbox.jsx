import React, { useEffect } from 'react';
import { useSandboxStore } from '../core/useSandboxStore';
import { SandboxShell } from '../components/SandboxShell';
import { SandboxCanvas } from '../components/SandboxCanvas';

export const TreeSandbox = () => {
  const { setStructure } = useSandboxStore();

  useEffect(() => {
    setStructure('tree', 'singly');
  }, [setStructure]);

  return (
    <SandboxShell title="Binary Search Tree">
      <SandboxCanvas />
    </SandboxShell>
  );
};
