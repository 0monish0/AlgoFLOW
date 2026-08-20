import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore, LANGUAGES } from '../../store/languageStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { useSearchStore } from '../../store/searchStore';
import { Sun, Moon, Search, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';

export const TopBar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { preferredLanguage, setPreferredLanguage } = useLanguageStore();
  const { isCollapsed, toggleCollapse, toggleMobileOpen } = useSidebarStore();
  const { openSearch } = useSearchStore();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-surface/90 backdrop-blur-md border-b border-border font-mono select-none px-4 flex items-center justify-between gap-3">
      {/* Left section: Collapse Toggle & Site Wordmark */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileOpen}
          className="p-1.5 rounded hover:bg-accent/15 md:hidden text-text transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 rounded text-text-muted hover:text-text hover:bg-accent/15 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <Link to="/" className="flex items-center gap-2 text-xs font-bold tracking-tight text-primary">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
          <span>AgroFlow</span>
          <span className="hidden sm:inline text-2xs font-normal text-text-muted border-l border-border pl-2">
            DSA Topics
          </span>
        </Link>
      </div>

      {/* Middle section: Real Search Trigger Input */}
      <div className="flex-1 max-w-md mx-2">
        <button
          onClick={openSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded border border-border bg-base/40 hover:bg-base/70 hover:border-accent/40 text-text-muted text-xs transition-all shadow-subtle group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={14} className="group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">Search reference or jump to topic...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-2xs px-1.5 py-0.5 rounded border border-border bg-surface text-text-muted font-mono font-medium shrink-0">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>

      {/* Right section: Global Language Switcher & Theme Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Preferred Language Switcher */}
        <div className="hidden lg:flex items-center p-0.5 bg-base/50 border border-border rounded text-2xs">
          <span className="px-2 text-text-muted text-2xs font-semibold">Lang:</span>
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => setPreferredLanguage(l.id)}
              className={`px-2 py-0.5 rounded transition-colors ${
                preferredLanguage === l.id
                  ? 'bg-primary text-base font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded border border-border bg-surface hover:bg-accent/15 text-text transition-colors flex items-center justify-center"
          title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode (click to toggle)`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={15} className="text-accent" /> : <Sun size={15} className="text-amber-700 dark:text-amber-500" />}
        </button>
      </div>
    </header>
  );
};
