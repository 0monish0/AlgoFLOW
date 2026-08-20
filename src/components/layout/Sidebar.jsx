import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { navigationSections } from '../../content/navigation';
import { useSidebarStore } from '../../store/sidebarStore';
import { useSearchStore } from '../../store/searchStore';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';

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
        <div key={item.id} className="mt-2 mb-1">
          <div className="text-2xs font-semibold uppercase tracking-wider text-text-muted px-2.5 py-1">
            {item.title}
          </div>
          <div className="border-l border-border/80 ml-3.5 pl-2 space-y-0.5 mt-0.5">
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
          `group relative flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
            isActive
              ? 'bg-accent/15 text-primary font-semibold'
              : 'text-text hover:bg-accent/10 hover:text-primary'
          }`
        }
      >
        <span className="truncate">{item.title}</span>
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`h-full flex flex-col font-mono select-none bg-surface/50 border-r border-border ${
        isMobile ? 'w-full' : 'w-64 shrink-0'
      }`}
    >
      {/* Sidebar Top Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xs font-bold uppercase tracking-wider text-text-muted">
            Documentation Tree
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded hover:bg-accent/15 text-text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Search Button in Sidebar */}
        <button
          onClick={openSearch}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded border border-border bg-base/30 hover:bg-base/60 text-text-muted text-2xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search size={12} />
            <span>Search topics...</span>
          </div>
          <kbd className="px-1 py-0.5 rounded border border-border bg-surface text-3xs">⌘K</kbd>
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
                className="w-full flex items-center justify-between px-2 py-1 rounded text-2xs font-bold uppercase tracking-wider text-text-muted hover:text-primary hover:bg-accent/10 transition-colors"
              >
                <span className="truncate">{section.title}</span>
                {isExpanded ? (
                  <ChevronDown size={14} className="opacity-70" />
                ) : (
                  <ChevronRight size={14} className="opacity-70" />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="space-y-0.5 pl-1 pt-0.5">
                  {section.items.map((item) => renderItem(item))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-border bg-base/20 text-3xs font-mono text-text-muted flex items-center justify-between">
        <span>v1.0.0 Static Release</span>
        <span>No API Required</span>
      </div>
    </aside>
  );
};
