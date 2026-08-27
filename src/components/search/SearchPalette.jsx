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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={closeSearch}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 font-mono">
        <Command
          shouldFilter={true}
          className="w-full flex flex-col"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#0E0E0E]">
            <Search size={16} className="text-accent mr-3 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search documentation, operations, languages..."
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder:text-text-muted/60 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
              autoFocus
            />
          </div>

          {/* Search Result List */}
          <Command.List className="max-h-80 overflow-y-auto p-2.5 space-y-1">
            <Command.Empty className="py-8 text-center text-xs text-text-muted">
              No matching documentation topics found for "{search}".
            </Command.Empty>

            <Command.Group heading="Documentation Topics" className="text-3xs font-extrabold text-text-muted uppercase tracking-wider px-2.5 py-1.5">
              {searchIndex.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.title} ${item.category} ${item.description || ''}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer select-none transition-all data-[selected=true]:bg-accent/15 data-[selected=true]:text-white text-text group border border-transparent data-[selected=true]:border-accent/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {item.type === 'Topic' ? (
                      <FileText size={14} className="text-accent shrink-0 group-data-[selected=true]:text-accent" />
                    ) : (
                      <Hash size={14} className="text-accent/70 shrink-0 group-data-[selected=true]:text-accent" />
                    )}
                    <div className="truncate">
                      <div className="font-semibold truncate text-white group-data-[selected=true]:text-accent transition-colors">{item.title}</div>
                      <div className="text-3xs text-text-muted flex items-center gap-1.5 truncate mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={13} className="opacity-0 group-data-[selected=true]:opacity-100 text-accent shrink-0 transition-opacity" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
