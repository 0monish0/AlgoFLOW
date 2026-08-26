import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getTopicBySlug } from '../content';
import { Breadcrumb } from '../components/docs/Breadcrumb';
import { ComplexityTable } from '../components/docs/ComplexityTable';
import { MarkdownRenderer } from '../components/docs/MarkdownRenderer';
import { TocRail } from '../components/layout/TocRail';

export const DocsPage = () => {
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
    <div className="flex items-start">
      {/* Main Document Body */}
      <article className="flex-1 min-w-0 font-mono">
        {/* Breadcrumb Navigation */}
        <Breadcrumb category={topic.category} title={topic.title} />

        {/* Header & Concept Lead Summary */}
        <div className="space-y-3 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            {topic.title}
          </h1>
          {topic.lead && (
            <div className="text-sm sm:text-base text-text leading-relaxed font-normal">
              <MarkdownRenderer content={topic.lead} />
            </div>
          )}
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

      {/* Right Table-Of-Contents Rail */}
      <TocRail sections={topic.sections || []} />
    </div>
  );
};
