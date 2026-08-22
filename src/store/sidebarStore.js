import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
  persist(
    (set) => ({
      expandedSections: {
        '00-why-data-structures': true,
        '01-getting-started': true,
        '02-list-adt': true,
        '03-linked-list': true,
        'problems': true,
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
      name: 'dsa-sidebar-state',
      partialize: (state) => ({
        expandedSections: state.expandedSections,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
