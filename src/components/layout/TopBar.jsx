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
    <header className="sticky top-0 z-30 w-full h-16 bg-surface/90 backdrop-blur-md border-b border-border font-mono select-none px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: Collapse Toggle & Site Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileOpen}
          className="p-2 rounded-lg hover:bg-accent/15 md:hidden text-text transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu size={19} />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-2 rounded-lg text-text-muted hover:text-text hover:bg-accent/15 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}
        </button>

        <Link to="/" className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-primary">
          <span>AgroFlow</span>
          <span className="hidden sm:inline text-xs font-normal text-text-muted border-l border-border pl-2.5">
            DSA Topics
          </span>
        </Link>
      </div>

      {/* Middle section: Stretched Search Trigger Input */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6">
        <button
          onClick={openSearch}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/80 bg-base/35 hover:bg-base/60 hover:border-accent/50 text-text-muted text-xs transition-all shadow-2xs group"
        >
          <Search size={14} className="text-accent group-hover:text-primary transition-colors shrink-0 opacity-80 group-hover:opacity-100" />
          <span className="truncate">Search reference or jump to topic...</span>
        </button>
      </div>

      {/* Right section: Global Language Switcher & Theme Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language Pill Selector */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-base/60 border border-border/80">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setPreferredLanguage(lang.id)}
              className={`px-2.5 py-1 text-2xs rounded-lg transition-all ${
                preferredLanguage === lang.id
                  ? 'bg-primary text-[#F5EEDD] dark:text-[#081722] font-bold shadow-2xs'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border bg-surface hover:bg-accent/15 text-text transition-colors flex items-center justify-center shadow-2xs"
          title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={16} className="text-accent" /> : <Sun size={16} className="text-amber-accent" />}
        </button>
      </div>
    </header>
  );
};
