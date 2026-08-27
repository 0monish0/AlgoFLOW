import { create } from 'zustand';

export const useThemeStore = create(() => ({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
}));
