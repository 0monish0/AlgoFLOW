import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationSections } from '../../content/navigation';
import { useSidebarStore } from '../../store/sidebarStore';
import { useSearchStore } from '../../store/searchStore';
import { ChevronDown, ChevronRight, Search, X, FolderTree } from 'lucide-react';

export const Sidebar = ({ isMobile = false }) => {
  const { expandedSections, toggleSection, isCollapsed, setMobileOpen } = useSidebarStore();
  const { openSearch } = useSearchStore();
  const location = useLocation();

  if (isCollapsed && !isMobile) {
    return null;
  }

  const renderItem = (item, isNested = false) => {
    if (item.isSubGroup) {
      return (
        <div key={item.id} className="mt-3 mb-1.5">
          {/* Level 2 Sub-Group Header */}
          <div className="text-3xs font-semibold uppercase tracking-widest text-text-muted/65 px-2.5 py-1 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-accent/50 inline-block shrink-0" />
            <span className="truncate">{item.title}</span>
          </div>
          {/* Nested Level 3 Items */}
          <div className="border-l border-border ml-3 pl-2 space-y-0.5 mt-0.5">
            {item.children.map((child) => renderItem(child, true))}
          </div>
        </div>
      );
    }

    const path = `/docs/${item.slug}`;
    const isActive = location.pathname === path;

    return (
      <NavLink
        key={item.slug}
        to={path}
        onClick={() => {
          if (isMobile) setMobileOpen(false);
        }}
        className={({ isActive }) =>
          `group relative flex items-center px-3 py-2 rounded-md text-xs font-mono transition-colors select-none ${
            isActive
              ? 'text-[#F5EEDD] dark:text-[#081722] font-bold z-10'
              : 'text-text-muted hover:text-text hover:bg-accent/10'
          }`
        }
      >
        {/* Animated full-box background fill */}
        {isActive && (
          <motion.div
            layoutId="active-sidebar-pill"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="absolute inset-0 rounded-md bg-[#0B253A] dark:bg-[#F5EEDD] shadow-xs"
          />
        )}

        <span className="relative z-10 leading-snug break-words pr-1">
          {item.title}
        </span>
      </NavLink>
    );
  };

  return (
    <aside
      className={`h-full flex flex-col font-mono select-none bg-surface/40 border-r border-border ${
        isMobile ? 'w-full' : 'w-72 shrink-0'
      }`}
    >
      {/* Sidebar Top Header */}
      <div className="p-3.5 border-b border-border">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-text-muted">
            <FolderTree size={13} className="text-accent" />
            <span>Topics Tree</span>
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded hover:bg-accent/15 text-text-muted hover:text-text"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Search Button in Sidebar */}
        <button
          onClick={openSearch}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-base/30 hover:bg-base/70 text-text-muted text-xs transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="group-hover:text-primary transition-colors" />
            <span>Search topics...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-3xs font-semibold">⌘K</kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {navigationSections.map((section) => {
          const isExpanded = expandedSections[section.id] ?? true;

          return (
            <div key={section.id} className="space-y-1">
              {/* Level 1 Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-text hover:text-primary hover:bg-accent/10 transition-colors"
              >
                <span className="truncate">{section.title}</span>
                <span className="text-text-muted/70">
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </span>
              </button>

              {/* Section Items with Animation */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-0.5 pl-1 pt-0.5"
                  >
                    {section.items.map((item) => renderItem(item))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-border bg-base/20 text-3xs font-mono text-text-muted flex items-center justify-between">
        <span>AgroFlow v1.0</span>
        <span>Static Doc Engine</span>
      </div>
    </aside>
  );
};
