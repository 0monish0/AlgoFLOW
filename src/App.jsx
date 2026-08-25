import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { DocsShell } from './components/layout/DocsShell';
import { DocsPage } from './pages/DocsPage';
import { NotFound } from './pages/NotFound';
import { SearchPalette } from './components/search/SearchPalette';
import { useThemeStore } from './store/themeStore';

import { SandboxPicker } from './pages/SandboxPicker';
import { LinkedListSandbox } from './sandbox/structures/LinkedListSandbox';
import { StackSandbox } from './sandbox/structures/StackSandbox';
import { ArraySandbox } from './sandbox/structures/ArraySandbox';
import { TreeSandbox } from './sandbox/structures/TreeSandbox';
import { HashTableSandbox } from './sandbox/structures/HashTableSandbox';

export const App = () => {
  const { theme } = useThemeStore();

  // Apply theme class to <html> root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Documentation Route Group */}
        <Route path="/docs" element={<DocsShell />}>
          <Route index element={<Navigate to="/docs/is-there-even-a-need" replace />} />
          <Route path=":slug" element={<DocsPage />} />
        </Route>

        {/* Full-Page Interactive Sandbox Route Group */}
        <Route path="/sandbox" element={<SandboxPicker />} />
        <Route path="/sandbox/linked-list" element={<LinkedListSandbox />} />
        <Route path="/sandbox/stack" element={<StackSandbox />} />
        <Route path="/sandbox/array" element={<ArraySandbox />} />
        <Route path="/sandbox/tree" element={<TreeSandbox />} />
        <Route path="/sandbox/hash-table" element={<HashTableSandbox />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SearchPalette />
    </>
  );
};

export default App;
