import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../store/searchStore';
import { searchIndex } from '../../content';
import { Search, FileText, Hash, ArrowRight } from 'lucide-react';

export const SearchPalette = () => {
  const { isOpen, closeSearch, toggleSearch } = useSearchStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      } else if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleSearch, closeSearch]);

  const handleSelect = (item) => {
    closeSearch();
    setSearch('');
    if (item.hash) {
      navigate(`/docs/${item.slug}#${item.hash}`);
    } else {
      navigate(`/docs/${item.slug}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={closeSearch}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-surface dark:bg-[#0A1E2D] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-10 font-mono">
        <Command
          shouldFilter={true}
          className="w-full flex flex-col"
        >
          {/* Search Input Bar without browser focus outline */}
          <div className="flex items-center px-4 py-3 border-b border-border/40 dark:border-white/5 bg-base/25">
            <Search size={16} className="text-accent mr-3 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search documentation, operations, languages..."
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-text placeholder:text-text-muted/50 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
              autoFocus
            />
          </div>

          {/* Search Result List without dividing lines */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-0.5">
            <Command.Empty className="py-8 text-center text-xs text-text-muted">
              No matching documentation topics found for "{search}".
            </Command.Empty>

            <Command.Group heading="Documentation Topics" className="text-3xs font-semibold text-text-muted/80 uppercase tracking-wider px-2.5 py-1.5">
              {searchIndex.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.title} ${item.category} ${item.description || ''}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer select-none transition-all data-[selected=true]:bg-accent/20 data-[selected=true]:text-primary text-text group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {item.type === 'Topic' ? (
                      <FileText size={14} className="text-sage-accent shrink-0" />
                    ) : (
                      <Hash size={14} className="text-amber-accent shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="font-medium truncate text-text group-data-[selected=true]:text-primary">{item.title}</div>
                      <div className="text-3xs text-text-muted flex items-center gap-1.5 truncate">
                        <span className={`w-1 h-1 rounded-full ${item.type === 'Topic' ? 'bg-sage-accent' : 'bg-amber-accent'}`} />
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={12} className="opacity-0 group-data-[selected=true]:opacity-100 text-primary shrink-0 transition-opacity" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
