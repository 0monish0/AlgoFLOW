import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumb = ({ category, title }) => {
  return (
    <nav className="flex items-center gap-1.5 text-2xs font-mono text-text-muted mb-4 select-none">
      <Link to="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      <ChevronRight size={12} className="text-text-muted/60" />
      <Link to="/docs/is-there-even-a-need" className="hover:text-primary transition-colors">
        Docs
      </Link>
      {category && (
        <>
          <ChevronRight size={12} className="text-text-muted/60" />
          <span className="text-text-muted font-medium">{category}</span>
        </>
      )}
      <ChevronRight size={12} className="text-text-muted/60" />
      <span className="text-primary font-bold truncate max-w-[200px] sm:max-w-none">
        {title}
      </span>
    </nav>
  );
};
