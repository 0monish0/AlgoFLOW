import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getTopicBySlug } from '../content';
import { Breadcrumb } from '../components/docs/Breadcrumb';
import { CodeTabs } from '../components/docs/CodeTabs';
import { ComplexityTable } from '../components/docs/ComplexityTable';
import { DiagramNode } from '../components/docs/DiagramNode';
import { TocRail } from '../components/layout/TocRail';
import { SllInsertionVisualizer } from '../components/visualizers/SllInsertionVisualizer';
import { SllDeletionVisualizer } from '../components/visualizers/SllDeletionVisualizer';
import { SllReverseVisualizer } from '../components/visualizers/SllReverseVisualizer';
import { DllVisualizer } from '../components/visualizers/DllVisualizer';

export const DocsPage = () => {
  const { slug = 'intro-to-adts' } = useParams();
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

  const renderVisualizer = (type) => {
    switch (type) {
      case 'sll-insertion':
        return <SllInsertionVisualizer />;
      case 'sll-deletion':
        return <SllDeletionVisualizer />;
      case 'sll-reverse':
        return <SllReverseVisualizer />;
      case 'dll-insertion':
        return <DllVisualizer />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start">
      {/* Main Document Body */}
      <article className="flex-1 min-w-0 font-mono">
        {/* Breadcrumb Navigation */}
        <Breadcrumb category={topic.category} title={topic.title} />

        {/* Header & Concept Lead Summary */}
        <div className="space-y-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            {topic.title}
          </h1>
          {topic.lead && (
            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-normal">
              {topic.lead}
            </p>
          )}
        </div>

        {/* Interactive Pointer Step-Through Visualizer (if applicable) */}
        {topic.interactiveVisualizer && (
          <div className="my-6">
            {renderVisualizer(topic.interactiveVisualizer)}
          </div>
        )}

        {/* Schematic Diagram (where applicable) */}
        {slug.includes('singly-linked-list-structure') && <DiagramNode type="singly" />}

        {/* Code Tabs Implementation */}
        {topic.code && Object.keys(topic.code).length > 0 && (
          <div className="my-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Implementation in C, C++, Python & Java
            </h2>
            <CodeTabs codeMap={topic.code} />
          </div>
        )}

        {/* Detailed Technical Sections */}
        {topic.sections && topic.sections.length > 0 && (
          <div className="space-y-8 my-8">
            {topic.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-base sm:text-lg font-bold text-primary border-b border-border pb-1.5 mb-3">
                  {section.title}
                </h2>
                <div className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-line">
                  {section.content}
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
