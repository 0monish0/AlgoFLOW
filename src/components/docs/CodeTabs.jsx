import React, { useState, useEffect } from 'react';
import { useLanguageStore, LANGUAGES } from '../../store/languageStore';
import { Copy, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';

export const CodeTabs = ({ codeMap }) => {
  const { preferredLanguage } = useLanguageStore();
  const [activeLang, setActiveLang] = useState(preferredLanguage);
  const [copied, setCopied] = useState(false);

  // Sync with global preferred language when it changes
  useEffect(() => {
    if (codeMap[preferredLanguage]) {
      setActiveLang(preferredLanguage);
    }
  }, [preferredLanguage, codeMap]);

  // Run Prism highlight when active tab or code changes
  useEffect(() => {
    Prism.highlightAll();
  }, [activeLang, codeMap]);

  const currentCode = codeMap[activeLang] || codeMap['c'] || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const getPrismGrammar = (lang) => {
    switch (lang) {
      case 'c': return 'c';
      case 'cpp': return 'cpp';
      case 'python': return 'python';
      case 'java': return 'java';
      default: return 'clike';
    }
  };

  const lines = currentCode.trim().split('\n');

  return (
    <div className="my-6 border border-code-border rounded overflow-hidden bg-code-bg shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between bg-code-header px-3 py-1.5 border-b border-code-border select-none">
        <div className="flex items-center gap-1">
          {LANGUAGES.map((lang) => {
            const hasCode = Boolean(codeMap[lang.id]);
            if (!hasCode) return null;
            const isActive = activeLang === lang.id;

            return (
              <button
                key={lang.id}
                onClick={() => setActiveLang(lang.id)}
                className={`text-2xs font-mono font-medium px-2.5 py-1 rounded transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent font-semibold border border-accent/30'
                    : 'text-code-muted hover:text-code-text hover:bg-white/5'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-code-muted hover:text-code-text px-2 py-1 rounded hover:bg-white/5 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto p-4 flex text-xs font-mono leading-relaxed">
        {/* Line Numbers */}
        <div className="select-none pr-4 text-right text-code-muted/40 font-mono border-r border-code-border/50 select-none shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Highlighted Code */}
        <pre className="pl-4 m-0 overflow-visible flex-1">
          <code className={`language-${getPrismGrammar(activeLang)}`}>
            {currentCode.trim()}
          </code>
        </pre>
      </div>
    </div>
  );
};
