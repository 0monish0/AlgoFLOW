import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-base text-text font-mono flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="text-4xl font-bold text-primary">404</div>
        <div className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Dereferenced NULL Pointer — Page Not Found
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          The requested documentation route does not exist in this catalog or was moved to an alternate namespace.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/docs/intro-to-adts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-base font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            <BookOpen size={14} />
            <span>Open Documentation</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border bg-surface text-xs text-text hover:bg-accent/15 transition-colors"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
