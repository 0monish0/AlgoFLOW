import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getTopicBySlug } from '../content';
import { Breadcrumb } from '../components/docs/Breadcrumb';
import { ComplexityTable } from '../components/docs/ComplexityTable';
import { MarkdownRenderer } from '../components/docs/MarkdownRenderer';
import { TopicMediaCard } from '../components/docs/TopicMediaCard';
import { TocRail } from '../components/layout/TocRail';
import { useSidebarStore } from '../store/sidebarStore';

export const DocsPage = () => {
  const { isCollapsed } = useSidebarStore();
  const { slug = 'is-there-even-a-need' } = useParams();
  const topic = getTopicBySlug(slug);

  // Scroll to top or anchor hash on navigation
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [slug]);

  if (!topic) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="w-full flex items-start justify-between gap-6 2xl:gap-8">
      {/* Main Document Body */}
      <article
        className={`w-full min-w-0 font-mono transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'xl:w-[65%]' : 'xl:w-[58%]'
        }`}
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb category={topic.category} title={topic.title} />

        {/* Header & Concept Lead Summary */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            {topic.title}
          </h1>

          {/* Full-Width Lead Concept Narrative */}
          {topic.lead && (
            <div className="text-sm sm:text-base text-text leading-relaxed font-normal">
              <MarkdownRenderer content={topic.lead} />
            </div>
          )}

          {/* Mobile/Tablet Fallback Visual Guide (Visible only when right rail is hidden) */}
          <div className="xl:hidden my-6">
            <TopicMediaCard slug={topic.slug} title={topic.title} customGif={topic.gif} />
          </div>
        </div>

        {/* Detailed Technical Sections */}
        {topic.sections && topic.sections.length > 0 && (
          <div className="space-y-8 my-8">
            {topic.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-primary border-b border-border pb-2 mb-3.5">
                  {section.title}
                </h2>
                <div className="text-xs sm:text-sm text-text leading-relaxed font-normal">
                  <MarkdownRenderer content={section.content} />
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Complexity Matrix Table */}
        {topic.complexity && topic.complexity.length > 0 && (
          <ComplexityTable rows={topic.complexity} />
        )}
      </article>

      {/* Right Table-Of-Contents Rail with Static Sticky Positioning and Media Card */}
      <TocRail
        sections={topic.sections || []}
        slug={topic.slug}
        title={topic.title}
        customGif={topic.gif}
        media={topic.media}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};
