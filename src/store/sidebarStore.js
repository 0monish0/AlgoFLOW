import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
  persist(
    (set) => ({
      expandedSections: {
        '00-why-data-structures': true,
        '01-getting-started': false,
        '02-list-adt': false,
        '03-linked-list': false,
        'problems': false,
      },
      isCollapsed: false,
      mobileOpen: false,

      toggleSection: (sectionId) =>
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [sectionId]: !state.expandedSections[sectionId],
          },
        })),

      expandSection: (sectionId) =>
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [sectionId]: true,
          },
        })),

      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      setMobileOpen: (open) => set({ mobileOpen: open }),
      toggleMobileOpen: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
    }),
    {
      name: 'dsa-sidebar-state-v2',
      partialize: (state) => ({
        expandedSections: state.expandedSections,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
