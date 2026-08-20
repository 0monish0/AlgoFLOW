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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={closeSearch}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-surface border border-border rounded-lg shadow-command overflow-hidden z-10 font-mono">
        <Command
          shouldFilter={true}
          className="w-full flex flex-col"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-3.5 border-b border-border bg-base/30">
            <Search size={16} className="text-text-muted mr-2.5 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search documentation, operations, languages... (e.g. 'deletion', 'reverse', 'C++')"
              className="w-full py-3.5 bg-transparent text-xs font-mono text-text outline-none placeholder:text-text-muted/60"
              autoFocus
            />
            <kbd className="text-2xs font-mono px-1.5 py-0.5 rounded border border-border bg-surface text-text-muted">
              ESC
            </kbd>
          </div>

          {/* Search Result List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
            <Command.Empty className="py-8 text-center text-xs text-text-muted">
              No matching documentation topics found for "{search}".
            </Command.Empty>

            <Command.Group heading="Documentation Topics" className="text-2xs font-semibold text-text-muted uppercase px-2 py-1.5">
              {searchIndex.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.title} ${item.category} ${item.description || ''}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center justify-between px-2.5 py-2 rounded text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-accent/15 data-[selected=true]:text-primary text-text my-0.5 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {item.type === 'Topic' ? (
                      <FileText size={14} className="text-accent shrink-0" />
                    ) : (
                      <Hash size={14} className="text-text-muted shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-2xs text-text-muted truncate">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight size={12} className="opacity-0 group-data-[selected=true]:opacity-100 text-accent shrink-0 transition-opacity" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="px-3.5 py-2 border-t border-border bg-base/20 flex items-center justify-between text-2xs text-text-muted">
            <div className="flex items-center gap-2">
              <span>Navigation:</span>
              <kbd className="px-1 py-0.5 rounded bg-surface border border-border">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-surface border border-border">↓</kbd>
              <span>Select:</span>
              <kbd className="px-1 py-0.5 rounded bg-surface border border-border">↵</kbd>
            </div>
            <span>DSA Technical Reference</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
