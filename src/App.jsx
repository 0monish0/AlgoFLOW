import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { DocsShell } from './components/layout/DocsShell';
import { DocsPage } from './pages/DocsPage';
import { NotFound } from './pages/NotFound';
import { SearchPalette } from './components/search/SearchPalette';
import { useThemeStore } from './store/themeStore';

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
        <Route path="/docs" element={<DocsShell />}>
          <Route index element={<Navigate to="/docs/intro-to-adts" replace />} />
          <Route path=":slug" element={<DocsPage />} />
        </Route>
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SearchPalette />
    </>
  );
};

export default App;
