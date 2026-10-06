/**
 * @fileoverview Resizable, collapsible Code Editor Panel docked on the right side.
 * Uses @monaco-editor/react loaded lazily.
 *
 * Features:
 * - Language switcher (Python / C / C++ / Java)
 * - Copy button
 * - Sync mode toggle (Auto / Manual)
 * - Sync status badge
 * - Collapse/expand
 * - Draggable resizer (min 320px, max 60vw)
 * - Monaco markers for parse errors
 * - Ctrl+Enter to apply code
 * - Responsive: bottom drawer on narrow screens
 */

import React, { Suspense, lazy, useCallback, useRef, useEffect, useState } from 'react';
import {
  Copy, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
  Loader2, Play, Zap, ZapOff,
} from 'lucide-react';
import { LANGUAGE_LABELS, LANGUAGES } from '../ir/types';
import { Z_INDEX } from '../../styles/zIndex';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.default }))
);

// ─── Monaco dark theme matching AlgoFlow ─────────────────────────────────────
const ALGOFLOW_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6C96AC', fontStyle: 'italic' },
    { token: 'keyword', foreground: '89CFF0', fontStyle: 'bold' },
    { token: 'string', foreground: 'A3D9A5' },
    { token: 'number', foreground: 'E5A96D' },
    { token: 'type', foreground: 'F8D176' },
    { token: 'identifier', foreground: 'E2F1F8' },
    { token: 'delimiter', foreground: 'A5C8DB' },
  ],
  colors: {
    'editor.background': '#0A0A0A',
    'editor.foreground': '#E2F1F8',
    'editor.lineHighlightBackground': '#10B98115',
    'editor.selectionBackground': '#387093AA',
    'editor.inactiveSelectionBackground': '#38709355',
    'editorCursor.foreground': '#10B981',
    'editorLineNumber.foreground': '#3F4F58',
    'editorLineNumber.activeForeground': '#10B981',
    'editorWidget.background': '#141414',
    'editorSuggestWidget.background': '#141414',
    'editorSuggestWidget.border': '#1E3A2F',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#1E3A2F55',
    'scrollbarSlider.hoverBackground': '#10B98130',
    'editorGutter.background': '#080808',
  },
};

const MIN_WIDTH = 320;
const MAX_WIDTH_RATIO = 0.6; // 60% of viewport

/**
 * @param {{
 *   syncEngine: ReturnType<import('../sync/useSyncEngine').useSyncEngine>
 *   isOpen: boolean
 *   onClose: () => void
 * }} props
 */
export function CodeEditorPanel({ syncEngine, isOpen, onClose }) {
  const {
    language, editorCode, syncStatus, syncMode, parseErrors,
    panelWidth, monacoLanguage,
    setLanguage, setPanelWidth, setSyncMode,
    handleEditorChange, handleEditorMount,
    applyNow, copyCode,
  } = syncEngine;

  const [isCopied, setIsCopied] = useState(false);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 768);
  const resizerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const monacoRef = useRef(null);

  // ── Narrow screen detection ───────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Monaco editor setup ───────────────────────────────────────────────────
  const handleEditorWillMount = useCallback((monaco) => {
    monacoRef.current = monaco;
    monaco.editor.defineTheme('algoflow-dark', ALGOFLOW_THEME);
  }, []);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      handleEditorMount(editor);

      // Ctrl+Enter → Apply
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        applyNow();
      });

      // Prevent Ctrl+Z from bubbling to canvas when editor is focused
      editor.onKeyDown((e) => {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyZ) {
          e.stopPropagation();
        }
      });
    },
    [handleEditorMount, applyNow]
  );

  // ── Monaco error markers ──────────────────────────────────────────────────
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    const models = monaco.editor.getModels();
    if (!models.length) return;
    const model = models[0];

    const markers = parseErrors
      .filter((e) => e.severity === 'error')
      .map((e) => ({
        severity: monaco.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: e.line,
        startColumn: 1,
        endLineNumber: e.line,
        endColumn: 9999,
      }));

    const warnings = parseErrors
      .filter((e) => e.severity === 'warning')
      .map((e) => ({
        severity: monaco.MarkerSeverity.Warning,
        message: e.message,
        startLineNumber: e.line,
        startColumn: 1,
        endLineNumber: e.line,
        endColumn: 9999,
      }));

    monaco.editor.setModelMarkers(model, 'algoflow-parser', [...markers, ...warnings]);
  }, [parseErrors]);

  // ── Resizer drag ──────────────────────────────────────────────────────────
  const handleResizerMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      isDraggingRef.current = true;

      const startX = e.clientX;
      const startWidth = panelWidth;

      const onMouseMove = (moveEvent) => {
        if (!isDraggingRef.current) return;
        const maxW = Math.floor(window.innerWidth * MAX_WIDTH_RATIO);
        const newWidth = Math.min(maxW, Math.max(MIN_WIDTH, startWidth + (startX - moveEvent.clientX)));
        setPanelWidth(newWidth);
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp, { once: true });
    },
    [panelWidth, setPanelWidth]
  );

  // ── Copy handler ──────────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    copyCode();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  }, [copyCode]);

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusBadge = {
    synced: (
      <span className="flex items-center gap-1 text-emerald-400 text-2xs font-bold">
        <CheckCircle2 size={11} />
        Synced
      </span>
    ),
    parsing: (
      <span className="flex items-center gap-1 text-amber-400 text-2xs font-bold">
        <Loader2 size={11} className="animate-spin" />
        Parsing…
      </span>
    ),
    error: (
      <span className="flex items-center gap-1 text-red-400 text-2xs font-bold">
        <AlertCircle size={11} />
        Error
      </span>
    ),
  }[syncStatus];

  // ── Panel dimensions ──────────────────────────────────────────────────────
  const panelStyle = isNarrow
    ? {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: isOpen ? '40vh' : 0,
        transition: 'height 0.25s ease',
        overflow: 'hidden',
        borderTop: isOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
        zIndex: Z_INDEX.panels,
      }
    : {
        position: 'relative',
        width: isOpen ? panelWidth : 0,
        minWidth: isOpen ? MIN_WIDTH : 0,
        flexShrink: 0,
        height: '100%',
        transition: isDraggingRef.current ? 'none' : 'width 0.25s ease',
        overflow: 'hidden',
        borderLeft: isOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
        zIndex: Z_INDEX.panels,
      };

  return (
    <div
      style={panelStyle}
      className="bg-[#080808] flex flex-col font-mono select-none"
    >
      {/* ── Resizer handle (desktop only) ── */}
      {!isNarrow && isOpen && (
        <div
          ref={resizerRef}
          onMouseDown={handleResizerMouseDown}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-accent/40 transition-colors"
          title="Drag to resize"
        />
      )}

      {/* ── Panel Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/8 bg-[#0F0F0F] shrink-0">
        {/* Left: collapse button + language tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            title="Close editor"
          >
            {isNarrow ? '↓' : <ChevronRight size={14} />}
          </button>

          {/* Language switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-0.5 text-2xs rounded-full font-bold transition-all ${
                  language === lang
                    ? 'bg-accent text-black shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Right: status + sync toggle + copy */}
        <div className="flex items-center gap-2">
          {statusBadge}

          {/* Sync mode toggle */}
          <button
            onClick={() => setSyncMode(syncMode === 'auto' ? 'manual' : 'auto')}
            title={syncMode === 'auto' ? 'Auto sync — click to switch to Manual' : 'Manual sync — click to switch to Auto'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border transition-all ${
              syncMode === 'auto'
                ? 'border-accent/40 text-accent hover:bg-accent/10'
                : 'border-white/10 text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {syncMode === 'auto' ? <Zap size={10} /> : <ZapOff size={10} />}
            {syncMode === 'auto' ? 'Auto' : 'Manual'}
          </button>

          {/* Apply button (manual mode) or copy */}
          {syncMode === 'manual' && (
            <button
              onClick={applyNow}
              title="Apply code to canvas (Ctrl+Enter)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent hover:opacity-90 text-black text-2xs font-extrabold transition-all"
            >
              <Play size={10} />
              Run
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            {isCopied ? <CheckCircle2 size={13} className="text-accent" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* ── Error status bar ──────────────────────────────────────────────── */}
      {parseErrors.length > 0 && (
        <div className="px-3 py-1 bg-[#0F0F0F] border-b border-white/5 text-2xs font-mono text-amber-400 shrink-0 truncate">
          {parseErrors[0].message}
          {parseErrors.length > 1 && ` (+${parseErrors.length - 1} more)`}
        </div>
      )}

      {/* ── Monaco Editor ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-text-muted text-xs gap-2">
              <Loader2 size={16} className="animate-spin text-accent" />
              Loading editor…
            </div>
          }
        >
          <MonacoEditor
            value={editorCode}
            language={monacoLanguage}
            theme="algoflow-dark"
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontLigatures: true,
              lineHeight: 21,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              renderLineHighlight: 'line',
              tabSize: 4,
              wordWrap: 'off',
              padding: { top: 12, bottom: 12 },
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: false,
              renderWhitespace: 'none',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              contextmenu: false,
              automaticLayout: true,
            }}
          />
        </Suspense>
      </div>

      {/* ── Footer hint ───────────────────────────────────────────────────── */}
      <div className="px-3 py-1.5 border-t border-white/5 bg-[#0A0A0A] text-2xs text-text-muted shrink-0 flex items-center justify-between">
        <span>Ctrl+Enter to apply • Canvas edits auto-sync</span>
        {!isNarrow && (
          <span className="text-white/20">{panelWidth}px</span>
        )}
      </div>
    </div>
  );
}

/**
 * The floating toggle button shown in the top bar when the panel is closed.
 * @param {{ onClick: () => void }} props
 */
export function CodeEditorToggleButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#1C1C1E] border border-white/10 hover:border-white/25 text-text-muted hover:text-white font-bold text-2xs transition-all"
      title="Open Code Editor (bidirectional sync)"
    >
      <ChevronLeft size={11} />
      <span>Code</span>
    </button>
  );
}
