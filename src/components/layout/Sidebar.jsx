import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationSections } from '../../content/navigation';
import { useSidebarStore } from '../../store/sidebarStore';
import { useSearchStore } from '../../store/searchStore';
import { ChevronDown, ChevronRight, Search, X, BookOpen } from 'lucide-react';

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
        <div key={item.id} className="mt-3 mb-1">
          <div className="text-3xs font-bold uppercase tracking-widest text-text-muted/80 px-2 py-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60 inline-block" />
            <span>{item.title}</span>
          </div>
          <div className="border-l-2 border-border/80 ml-2.5 pl-2 space-y-1 mt-1">
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
              ? 'text-primary font-bold shadow-xs'
              : 'text-text hover:text-primary hover:bg-accent/10'
          }`
        }
      >
        {isActive && (
          <motion.div
            layoutId="active-sidebar-pill"
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 32,
            }}
            className="absolute inset-0 rounded-md bg-accent/20 dark:bg-accent/25 border border-accent/40"
          />
        )}

        <span className="relative z-10 leading-snug break-words pr-1">
          {item.title}
        </span>

        {isActive && (
          <motion.span
            layoutId="active-sidebar-bar"
            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-accent rounded-r-full"
          />
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`h-full flex flex-col font-mono select-none bg-surface/50 border-r border-border ${
        isMobile ? 'w-full' : 'w-72 shrink-0'
      }`}
    >
      {/* Sidebar Top Header */}
      <div className="p-3.5 border-b border-border">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-text-muted">
            <BookOpen size={13} className="text-accent" />
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
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-2xs font-bold uppercase tracking-wider text-text-muted hover:text-primary hover:bg-accent/10 transition-colors"
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
