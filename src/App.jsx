import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { DocsShell } from './components/layout/DocsShell';
import { DocsPage } from './pages/DocsPage';
import { NotFound } from './pages/NotFound';
import { SearchPalette } from './components/search/SearchPalette';
import { useThemeStore } from './store/themeStore';

import { UniversalSandbox } from './sandbox/universal/UniversalSandbox';

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

        {/* Universal Interactive Sandbox Route */}
        <Route path="/sandbox" element={<UniversalSandbox />} />
        <Route path="/sandbox/linked-list" element={<Navigate to="/sandbox?ds=linked-list" replace />} />
        <Route path="/sandbox/stack" element={<Navigate to="/sandbox?ds=stack" replace />} />
        <Route path="/sandbox/array" element={<Navigate to="/sandbox?ds=array" replace />} />
        <Route path="/sandbox/tree" element={<Navigate to="/sandbox?ds=tree" replace />} />
        <Route path="/sandbox/hash-table" element={<Navigate to="/sandbox?ds=array" replace />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SearchPalette />
    </>
  );
};

export default App;
