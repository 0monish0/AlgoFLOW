import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dsa-theme');
    if (saved) {
      try {
        return JSON.parse(saved).state.theme;
      } catch {
        return 'dark';
      }
    }
    return 'dark';
  }
  return 'dark';
};

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          if (typeof document !== 'undefined') {
            if (next === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { theme: next };
        }),
    }),
    {
      name: 'dsa-theme',
    }
  )
);
