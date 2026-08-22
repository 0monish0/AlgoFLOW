import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationSections } from '../../content/navigation';
import { useSidebarStore } from '../../store/sidebarStore';
import { useSearchStore } from '../../store/searchStore';
import { Search, X, FolderGit2, ChevronDown, ChevronRight } from 'lucide-react';

export const Sidebar = ({ isMobile = false }) => {
  const { expandedSections, toggleSection, isCollapsed, setMobileOpen } = useSidebarStore();
  const { openSearch } = useSearchStore();
  const location = useLocation();

  if (isCollapsed && !isMobile) {
    return null;
  }

  const renderLeaf = (item, depth = 1) => {
    const path = `/docs/${item.slug}`;
    const isActive = location.pathname === path;
    const paddingLeft = depth === 2 ? 'pl-7' : 'pl-3.5';

    return (
      <NavLink
        key={item.slug}
        to={path}
        onClick={() => {
          if (isMobile) setMobileOpen(false);
        }}
        className={({ isActive }) =>
          `group relative flex items-center pr-2 py-1.5 rounded text-xs sm:text-[13px] font-mono select-none transition-all ${paddingLeft} ${
            isActive
              ? 'text-[#F5EEDD] dark:text-[#081722] font-bold z-10'
              : 'text-text/90 font-medium sm:font-semibold hover:text-primary hover:bg-accent/15'
          }`
        }
      >
        {/* Animated active background pill */}
        {isActive && (
          <motion.div
            layoutId="active-sidebar-pill"
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 32,
            }}
            className="absolute inset-0 rounded bg-primary text-white dark:bg-[#F5EEDD] shadow-xs"
          />
        )}

        <span className="relative z-10 truncate">{item.title}</span>
      </NavLink>
    );
  };

  const renderSubGroup = (group) => {
    const isExpanded = expandedSections[group.id] ?? true;

    return (
      <div key={group.id} className="mt-1">
        <button
          onClick={() => toggleSection(group.id)}
          className="w-full flex items-center justify-between pl-3.5 pr-2 py-1.5 rounded text-xs sm:text-[13px] font-mono font-extrabold text-primary hover:bg-accent/15 transition-colors group select-none text-left"
        >
          <span className="truncate">{group.title}</span>
          <span className="text-text-muted/60 ml-1">
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="overflow-hidden space-y-0.5"
            >
              {group.children.map((child) => renderLeaf(child, 2))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside
      className={`h-full flex flex-col font-mono select-none bg-surface/40 border-r border-border ${
        isMobile ? 'w-full' : 'w-72 shrink-0'
      }`}
    >
      {/* Sidebar Top Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-wider text-text-muted">
            <FolderGit2 size={14} className="text-accent" />
            <span>DSA Reference</span>
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
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 dark:border-transparent bg-base/30 hover:bg-base/60 hover:border-accent/50 dark:hover:border-transparent text-text-muted text-xs transition-all shadow-2xs group"
        >
          <Search size={13} className="group-hover:text-primary transition-colors opacity-70 group-hover:opacity-100" />
          <span>Search topics...</span>
        </button>
      </div>

      {/* Topics Hierarchy with Clean Indentation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {navigationSections.map((section) => {
          const isExpanded = expandedSections[section.id] ?? true;

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs sm:text-[13px] font-extrabold text-primary hover:bg-accent/15 transition-colors group select-none text-left"
              >
                <span className="truncate">{section.title}</span>
                <span className="text-text-muted/60 ml-1">
                  {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
              </button>

              {/* Section Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {section.items.map((item) => {
                      if (item.isSubGroup) {
                        return renderSubGroup(item);
                      }
                      return renderLeaf(item, 1);
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
