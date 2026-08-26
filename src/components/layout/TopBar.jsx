import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore, LANGUAGES } from '../../store/languageStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { useSearchStore } from '../../store/searchStore';
import { Sun, Moon, Search, Menu, PanelLeftClose, PanelLeft, Code2 } from 'lucide-react';

export const TopBar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { preferredLanguage, setPreferredLanguage } = useLanguageStore();
  const { isCollapsed, toggleCollapse, toggleMobileOpen } = useSidebarStore();
  const { openSearch } = useSearchStore();

  return (
    <header className="sticky top-0 z-30 w-full pt-3 pb-2 px-3 sm:px-6 font-mono select-none">
      {/* Floating Capsule Bar matching Watermelon style */}
      <div className="w-full flex items-center justify-between gap-3 sm:gap-5 px-3.5 sm:px-5 py-2 rounded-full bg-[#FFFFFF]/90 dark:bg-[#141414]/90 backdrop-blur-md border border-border dark:border-white/10 shadow-lg shadow-black/10">
        {/* Left section: Collapse Toggle & Site Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileOpen}
            className="p-1.5 rounded-full hover:bg-white/10 md:hidden text-text transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu size={17} />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <Link to="/" className="flex items-center gap-2 text-sm sm:text-base font-extrabold tracking-tight group">
            <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 size={14} />
            </div>
            <span className="text-black dark:text-white font-extrabold tracking-tight">Algo<span className="text-accent">Flow</span></span>
          </Link>
        </div>

        {/* Middle section: Search Trigger Input */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <button
            onClick={openSearch}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/5 text-text-muted text-xs transition-all group"
          >
            <Search size={14} className="text-accent group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">Search components, algorithms, topics...</span>
          </button>
        </div>

        {/* Right section: Global Language Switcher, Theme Toggle & Sandbox CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Pill Selector */}
          <div className="hidden lg:flex items-center p-0.5 rounded-full bg-base/60 border border-border/80 dark:border-white/10">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setPreferredLanguage(lang.id)}
                className={`px-2.5 py-0.5 text-3xs rounded-full transition-all ${
                  preferredLanguage === lang.id
                    ? 'bg-accent text-black font-bold shadow-2xs'
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
            className="p-1.5 rounded-full hover:bg-white/10 text-text transition-colors flex items-center justify-center"
            title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={14} className="text-accent" /> : <Sun size={14} className="text-amber-accent" />}
          </button>

          {/* Pill CTA to Sandbox */}
          <Link
            to="/sandbox"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-black font-extrabold text-xs hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <span>Sandbox</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
