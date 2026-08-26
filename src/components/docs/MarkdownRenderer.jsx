import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import { useLanguageStore, LANGUAGES } from '../../store/languageStore';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';

// Multi-language code tab block for Markdown code sections
const MultiLangCodeBlock = ({ codeMap }) => {
  const { preferredLanguage, setPreferredLanguage } = useLanguageStore();
  const [copied, setCopied] = useState(false);

  // Available language keys in this code map
  const availableLangs = Object.keys(codeMap);
  
  // Determine active language: preferred if available, else first available
  const activeLang = codeMap[preferredLanguage] ? preferredLanguage : availableLangs[0] || 'c';
  const currentCode = codeMap[activeLang] || '';

  useEffect(() => {
    Prism.highlightAll();
  }, [activeLang, currentCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getPrismLang = (lang) => {
    switch (lang.toLowerCase()) {
      case 'c': return 'c';
      case 'cpp': case 'c++': return 'cpp';
      case 'python': case 'py': return 'python';
      case 'java': return 'java';
      default: return 'clike';
    }
  };

  const lines = currentCode.trim().split('\n');

  return (
    <div className="my-5 border border-code-border rounded-lg overflow-hidden bg-code-bg shadow-sm">
      {/* Header with language switcher tabs */}
      <div className="flex items-center justify-between bg-code-header px-3 py-1.5 border-b border-code-border select-none">
        <div className="flex items-center gap-1">
          {LANGUAGES.map((lang) => {
            const hasCode = Boolean(codeMap[lang.id]);
            if (!hasCode && availableLangs.length > 1) return null;
            const isActive = activeLang === lang.id;

            return (
              <button
                key={lang.id}
                onClick={() => {
                  if (codeMap[lang.id]) {
                    setPreferredLanguage(lang.id);
                  }
                }}
                className={`text-2xs font-mono font-medium px-2.5 py-1 rounded transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent font-semibold border border-accent/30'
                    : codeMap[lang.id]
                    ? 'text-code-muted hover:text-code-text hover:bg-white/5'
                    : 'text-code-muted/30 cursor-not-allowed'
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
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto p-3.5 flex text-xs font-mono leading-relaxed bg-code-bg">
        <div className="select-none pr-3 text-right text-code-muted/40 font-mono border-r border-code-border/50 shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="pl-3.5 m-0 overflow-visible flex-1">
          <code className={`language-${getPrismLang(activeLang)}`}>
            {currentCode.trim()}
          </code>
        </pre>
      </div>
    </div>
  );
};

// Standalone Pseudocode Box
const PseudocodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy pseudocode', err);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-5 border border-emerald-500/20 rounded-lg overflow-hidden bg-[#0A0E14] shadow-sm">
      <div className="flex items-center justify-between bg-emerald-950/20 px-3.5 py-1.5 border-b border-emerald-500/20 select-none">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Terminal size={13} />
          <span className="text-2xs font-mono font-bold uppercase tracking-wider">
            Algorithm Pseudocode
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-2xs text-emerald-300/70 hover:text-emerald-300 px-2 py-0.5 rounded hover:bg-emerald-500/10 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="overflow-x-auto p-3.5 flex text-xs font-mono leading-relaxed bg-[#0B0F17]">
        <div className="select-none pr-3 text-right text-emerald-500/30 font-mono border-r border-emerald-500/10 shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-relaxed">{i + 1}</div>
          ))}
        </div>
        <pre className="pl-3.5 m-0 overflow-visible flex-1 text-emerald-200/90 font-mono">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

// Helper for parsing inline markdown (bold, italic, inline code)
const renderInline = (text) => {
  if (!text) return null;

  // Split by inline code `...`
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-mono text-[0.9em] font-medium"
        >
          {codeContent}
        </code>
      );
    }

    // Split bold **...**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 3) {
        return <strong key={bIdx} className="font-bold text-primary">{bPart.slice(2, -2)}</strong>;
      }

      // Split italic *...*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
          return <em key={iIdx} className="italic text-text">{iPart.slice(1, -1)}</em>;
        }
        return iPart;
      });
    });
  });
};

export const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const blocks = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Blocks (Detect single or consecutive language blocks)
    if (line.trim().startsWith('```')) {
      const codeGroup = {};
      let isFirstPseudocode = false;

      while (i < lines.length && lines[i].trim().startsWith('```')) {
        const langTag = lines[i].trim().slice(3).trim().toLowerCase() || 'c';
        const codeLines = [];
        i++; // move past opening ```
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // move past closing ```

        if (langTag === 'pseudocode' || langTag === 'text') {
          isFirstPseudocode = true;
          blocks.push({
            type: 'pseudocode',
            code: codeLines.join('\n')
          });
          break;
        } else {
          const normLang = (langTag === 'c++' || langTag === 'cpp') ? 'cpp' : (langTag === 'py' || langTag === 'python') ? 'python' : langTag;
          codeGroup[normLang] = codeLines.join('\n');
        }

        // Check if immediately followed by another code block (skip empty whitespace)
        while (i < lines.length && lines[i].trim() === '') {
          // peek ahead
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith('```')) {
            i++;
          } else {
            break;
          }
        }
      }

      if (!isFirstPseudocode && Object.keys(codeGroup).length > 0) {
        blocks.push({
          type: 'codeGroup',
          codeMap: codeGroup
        });
      }
      continue;
    }

    // 2. Blockquote: >
    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && (lines[i].trim().startsWith('>') || (lines[i].trim() !== '' && quoteLines.length > 0 && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('```')))) {
        if (lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
        } else if (lines[i].trim() === '') {
          break;
        } else {
          quoteLines.push(lines[i]);
        }
        i++;
      }
      blocks.push({
        type: 'blockquote',
        content: quoteLines.join('\n')
      });
      continue;
    }

    // 3. Table: | a | b |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      blocks.push({
        type: 'table',
        lines: tableLines
      });
      continue;
    }

    // 4. Standalone Image / GIF / Media: ![alt](url)
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        alt: imgMatch[1],
        src: imgMatch[2],
      });
      i++;
      continue;
    }

    // 5. Heading: ### or ####
    if (line.trim().startsWith('####')) {
      blocks.push({
        type: 'h4',
        content: line.trim().replace(/^####\s*/, '')
      });
      i++;
      continue;
    }
    if (line.trim().startsWith('###')) {
      blocks.push({
        type: 'h3',
        content: line.trim().replace(/^###\s*/, '')
      });
      i++;
      continue;
    }

    // 6. Divider: ---
    if (line.trim() === '---') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 7. List items: - or * or 1.
    if (line.trim().match(/^[-*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
      const listItems = [];
      const isOrdered = Boolean(line.trim().match(/^\d+\.\s+/));
      while (i < lines.length && (lines[i].trim().match(/^[-*]\s+/) || lines[i].trim().match(/^\d+\.\s+/))) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
        listItems.push(itemText);
        i++;
      }
      blocks.push({
        type: isOrdered ? 'ol' : 'ul',
        items: listItems
      });
      continue;
    }

    // 8. Regular paragraph
    if (line.trim() === '') {
      i++;
      continue;
    }

    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/) &&
      !lines[i].trim().startsWith('###') &&
      !lines[i].trim().startsWith('####') &&
      !lines[i].trim().match(/^[-*]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/) &&
      lines[i].trim() !== '---'
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: paragraphLines.join(' ')
      });
    }
  }

  return (
    <div className="space-y-4 text-xs sm:text-sm text-text leading-relaxed font-mono">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'codeGroup':
            return (
              <MultiLangCodeBlock
                key={index}
                codeMap={block.codeMap}
              />
            );

          case 'pseudocode':
            return (
              <PseudocodeBlock
                key={index}
                code={block.code}
              />
            );

          case 'blockquote':
            return (
              <blockquote
                key={index}
                className="my-4 p-4 rounded-lg bg-[#0F141C]/80 border-l-4 border-accent text-text/95 backdrop-blur-md shadow-sm space-y-2"
              >
                {block.content.split('\n').map((qLine, qIdx) => (
                  <p key={qIdx} className="leading-relaxed">
                    {renderInline(qLine)}
                  </p>
                ))}
              </blockquote>
            );

          case 'table': {
            const rows = block.lines.map((l) =>
              l.split('|').slice(1, -1).map((cell) => cell.trim())
            );
            const header = rows[0];
            const dataRows = rows.slice(2);

            return (
              <div key={index} className="my-4 overflow-x-auto border border-border rounded-lg shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface/90 border-b border-border text-primary font-bold">
                    <tr>
                      {header.map((col, cIdx) => (
                        <th key={cIdx} className="p-3">
                          {renderInline(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 bg-surface/30">
                    {dataRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-surface/60 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'image': {
            const isVideo = block.src.endsWith('.mp4') || block.src.endsWith('.webm');
            return (
              <figure key={index} className="my-6 flex flex-col items-center">
                <div className="rounded-xl overflow-hidden border border-border/80 bg-surface/40 shadow-lg backdrop-blur-xs max-w-full">
                  {isVideo ? (
                    <video
                      src={block.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-w-full h-auto rounded-xl max-h-[480px] object-contain"
                    />
                  ) : (
                    <img
                      src={block.src}
                      alt={block.alt || 'Documentation diagram'}
                      loading="lazy"
                      className="max-w-full h-auto rounded-xl max-h-[480px] object-contain"
                    />
                  )}
                </div>
                {block.alt && (
                  <figcaption className="mt-2 text-2xs text-text-muted/80 text-center font-mono">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'h3':
            return (
              <h3 key={index} className="text-sm sm:text-base font-bold text-primary pt-2">
                {renderInline(block.content)}
              </h3>
            );

          case 'h4':
            return (
              <h4 key={index} className="text-xs sm:text-sm font-semibold text-accent pt-1">
                {renderInline(block.content)}
              </h4>
            );

          case 'hr':
            return <hr key={index} className="my-4 border-border/40" />;

          case 'ul':
            return (
              <ul key={index} className="list-disc list-inside space-y-1.5 pl-2 my-2 text-text/90">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={index} className="list-decimal list-inside space-y-1.5 pl-2 my-2 text-text/90">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );

          case 'paragraph':
          default:
            return (
              <p key={index} className="leading-relaxed text-text/90">
                {renderInline(block.content)}
              </p>
            );
        }
      })}
    </div>
  );
};
