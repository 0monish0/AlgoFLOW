import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const TocRail = ({ sections = [] }) => {
  const [activeId, setActiveId] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headingElements = sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el.offsetTop - 120 <= scrollY) {
          setActiveId(el.id);
          return;
        }
      }
      if (sections.length > 0) {
        setActiveId(sections[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, location]);

  if (!sections || sections.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 font-mono select-none pl-6">
      <div className="sticky top-20">
        <div className="text-2xs font-bold uppercase tracking-wider text-text-muted mb-3">
          On This Page
        </div>
        <nav className="space-y-1.5 border-l border-border/80 pl-3">
          {sections.map((section) => {
            const isActive = activeId === section.id;

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`block text-2xs transition-colors truncate ${
                  isActive
                    ? 'text-primary font-semibold translate-x-0.5'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {section.title}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
