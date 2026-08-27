import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TopicMediaCard, TOPIC_MEDIA_MAP } from '../docs/TopicMediaCard';

export const TocRail = ({ sections = [], slug, title, customGif, media, isCollapsed = false }) => {
  const [activeId, setActiveId] = useState('');
  const location = useLocation();

  const hasMedia = Boolean(
    (media && media.length > 0) ||
    customGif ||
    (slug && TOPIC_MEDIA_MAP[slug])
  );

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

  return (
    <aside
      className={`hidden xl:block shrink-0 font-mono select-none sticky top-16 h-[calc(100vh-4rem)] self-start overflow-y-auto pl-4 2xl:pl-8 pr-6 xl:pr-10 2xl:pr-14 py-2 z-20 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isCollapsed ? 'w-full xl:w-[30%]' : 'w-full xl:w-[37.5%]'
      }`}
    >
      {/* On This Page TOC Section */}
      {sections && sections.length > 0 && (
        <div>
          <div className="text-2xs font-extrabold uppercase tracking-wider text-primary mb-3.5">
            On This Page
          </div>
          <nav className="space-y-2 border-l border-border/80 pl-3">
            {sections.map((section) => {
              const isActive = activeId === section.id;

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block text-2xs transition-colors truncate ${
                    isActive
                      ? 'text-accent font-bold translate-x-0.5'
                      : 'text-text-muted hover:text-primary font-medium'
                  }`}
                >
                  {section.title}
                </a>
              );
            })}
          </nav>
        </div>
      )}

      {/* Visual Media Section (Only rendered if media exists for this topic) */}
      {hasMedia && (
        <div className={sections && sections.length > 0 ? 'mt-[68px]' : 'mt-0'}>
          <TopicMediaCard slug={slug} title={title} customGif={customGif} media={media} />
        </div>
      )}
    </aside>
  );
};


