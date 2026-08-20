import React from 'react';
import { Link } from 'react-router-dom';
import { getTopicBySlug } from '../../content';
import { ArrowRight } from 'lucide-react';

export const RelatedLinks = ({ relatedSlugs }) => {
  if (!relatedSlugs || relatedSlugs.length === 0) return null;

  const validTopics = relatedSlugs
    .map((slug) => getTopicBySlug(slug))
    .filter(Boolean);

  if (validTopics.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
        Related Topics & Next Steps
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {validTopics.map((topic) => (
          <Link
            key={topic.slug}
            to={`/docs/${topic.slug}`}
            className="group block p-3.5 rounded border border-border bg-surface hover:border-accent hover:bg-accent/5 transition-all"
          >
            <div className="text-2xs font-mono text-text-muted mb-1 flex items-center justify-between">
              <span>{topic.category}</span>
              <ArrowRight
                size={12}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent"
              />
            </div>
            <div className="text-xs font-semibold text-primary group-hover:text-accent transition-colors">
              {topic.title}
            </div>
            <div className="text-2xs text-text-muted mt-1 line-clamp-2 leading-normal">
              {topic.summary}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
