import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
  persist(
    (set) => ({
      expandedSections: {
        'getting-started': true,
        'adt-list': true,
        'linked-list': true,
        'reference': true,
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
