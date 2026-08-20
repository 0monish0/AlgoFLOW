import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const LANGUAGES = [
  { id: 'c', label: 'C', ext: 'c' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'java', label: 'Java', ext: 'java' },
];

export const useLanguageStore = create(
  persist(
    (set) => ({
      preferredLanguage: 'c',
      setPreferredLanguage: (lang) => set({ preferredLanguage: lang }),
    }),
    {
      name: 'dsa-preferred-language',
    }
  )
);
