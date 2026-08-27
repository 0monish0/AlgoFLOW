import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  expandedSections: {
    '00-why-data-structures': true,
    '01-getting-started': false,
    '02-list-adt': false,
    '03-linked-list': false,
    problems: false,
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

  setActiveSectionOnly: (sectionId) =>
    set(() => ({
      expandedSections: {
        '00-why-data-structures': sectionId === '00-why-data-structures',
        '01-getting-started': sectionId === '01-getting-started',
        '02-list-adt': sectionId === '02-list-adt',
        '03-linked-list': sectionId === '03-linked-list',
        problems: sectionId === 'problems',
        [sectionId]: true,
      },
    })),

  toggleCollapse: () =>
    set((state) => ({ isCollapsed: !state.isCollapsed })),

  setMobileOpen: (open) => set({ mobileOpen: open }),
  toggleMobileOpen: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
}));
