/**
 * @fileoverview Bidirectional sync engine between universal canvas and code editor.
 *
 * Pipeline:
 *   Canvas → Code: useUniversalStore subscription → canvasToIR → generateCode → editorCode
 *   Code → Canvas: editorCode change → debounce 500ms → parseCode → executeProgram → store
 *
 * Loop prevention:
 *   A `source` flag ('canvas' | 'editor') is checked before triggering downstream updates.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useUniversalStore } from '../universal/useUniversalStore';
import { canvasToIR } from '../ir/canvasToIR';
import { executeProgram } from '../ir/execute';

import { generatePython } from '../codegen/python';
import { generateC } from '../codegen/c';
import { generateCpp } from '../codegen/cpp';
import { generateJava } from '../codegen/java';

import { parsePython } from '../parser/python';
import { parseC } from '../parser/c';
import { parseCpp } from '../parser/cpp';
import { parseJava } from '../parser/java';

const DEBOUNCE_MS = 500;
const LS_KEY_LANGUAGE = 'algoflow_editor_language';
const LS_KEY_WIDTH = 'algoflow_editor_width';
const LS_KEY_SYNC_MODE = 'algoflow_editor_sync_mode';

const GENERATORS = {
  python: generatePython,
  c: generateC,
  cpp: generateCpp,
  java: generateJava,
};

const PARSERS = {
  python: parsePython,
  c: parseC,
  cpp: parseCpp,
  java: parseJava,
};

const MONACO_LANGUAGES = {
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
};

function programsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useSyncEngine() {
  const [language, setLanguageState] = useState(
    localStorage.getItem(LS_KEY_LANGUAGE) || 'python'
  );
  const [panelWidth, setPanelWidthState] = useState(
    Number(localStorage.getItem(LS_KEY_WIDTH)) || 420
  );
  const [syncMode, setSyncModeState] = useState(
    localStorage.getItem(LS_KEY_SYNC_MODE) || 'auto'
  );

  const setLanguage = useCallback((lang) => {
    localStorage.setItem(LS_KEY_LANGUAGE, lang);
    setLanguageState(lang);
  }, []);

  const setPanelWidth = useCallback((w) => {
    localStorage.setItem(LS_KEY_WIDTH, String(w));
    setPanelWidthState(w);
  }, []);

  const setSyncMode = useCallback((mode) => {
    localStorage.setItem(LS_KEY_SYNC_MODE, mode);
    setSyncModeState(mode);
  }, []);

  const [editorCode, setEditorCode] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced');
  const [parseErrors, setParseErrors] = useState([]);

  const sourceRef = useRef('canvas');
  const debounceTimerRef = useRef(null);
  const lastAppliedProgramRef = useRef([]);
  const editorRef = useRef(null);
  const lastHighlightLineRef = useRef(null);

  // ── Highlight line in Monaco ──────────────────────────────────────────────
  const highlightLine = useCallback((lineNumber) => {
    const editor = editorRef.current;
    if (!editor || !lineNumber) return;
    lastHighlightLineRef.current = lineNumber;
    try {
      editor.revealLineInCenter(lineNumber);
      editor.deltaDecorations([], [
        {
          range: { startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 },
          options: { isWholeLine: true, className: 'monaco-line-highlight' },
        },
      ]);
    } catch {}
  }, []);

  // ── Canvas → Code pipeline ────────────────────────────────────────────────
  const regenerateCode = useCallback(
    (nodes, pointers, structures, lang = language) => {
      const program = canvasToIR(nodes, pointers, structures);
      const code = (GENERATORS[lang] || generatePython)(program);
      sourceRef.current = 'canvas';
      setEditorCode(code);
      setSyncStatus('synced');
      setParseErrors([]);
      lastAppliedProgramRef.current = program;

      // Highlight the last non-empty line
      const lines = code.split('\n');
      let lastLine = lines.length;
      while (lastLine > 1 && !lines[lastLine - 1].trim()) lastLine--;
      highlightLine(lastLine);

      return { program, code };
    },
    [language, highlightLine]
  );

  // Subscribe to universal store changes
  useEffect(() => {
    const { nodes, pointers, structures } = useUniversalStore.getState();
    regenerateCode(nodes, pointers, structures, language);

    const unsubscribe = useUniversalStore.subscribe((state, prev) => {
      if (sourceRef.current === 'editor') return;
      const nodesChanged = state.nodes !== prev.nodes;
      const ptrsChanged = state.pointers !== prev.pointers;
      const structsChanged = state.structures !== prev.structures;
      if (nodesChanged || ptrsChanged || structsChanged) {
        regenerateCode(state.nodes, state.pointers, state.structures, language);
      }
    });

    return unsubscribe;
  }, [language, regenerateCode]);

  // Language switch
  useEffect(() => {
    const { nodes, pointers, structures } = useUniversalStore.getState();
    regenerateCode(nodes, pointers, structures, language);
  }, [language, regenerateCode]);

  // ── Code → Canvas pipeline ────────────────────────────────────────────────
  const applyCodeToCanvas = useCallback(
    (code = editorCode, lang = language) => {
      if (sourceRef.current === 'canvas') return;
      const parser = PARSERS[lang];
      if (!parser) return;

      setSyncStatus('parsing');
      const { program, errors } = parser(code);

      const warningErrors = errors.filter((e) => e.severity !== 'error');
      const hardErrors = errors.filter((e) => e.severity === 'error');

      if (hardErrors.length > 0) {
        setSyncStatus('error');
        setParseErrors(errors);
        return;
      }

      if (programsEqual(program, lastAppliedProgramRef.current)) {
        setSyncStatus('synced');
        setParseErrors(warningErrors);
        return;
      }

      const currentState = useUniversalStore.getState();
      const existing = { nodes: currentState.nodes, pointers: currentState.pointers, structures: currentState.structures };
      const result = executeProgram(program, existing);

      sourceRef.current = 'editor';
      useUniversalStore.getState().saveSnapshot();

      // Convert result nodes/pointers to universal store format
      const updatedNodes = {};
      Object.values(result.nodes || {}).forEach((n) => {
        const nextId = n.sockets?.next?.targetId || n.next || null;
        const prevId = n.sockets?.prev?.targetId || n.prev || null;
        updatedNodes[n.id] = {
          id: n.id,
          varName: n.varName || n.id,
          value: n.data !== undefined ? n.data : n.value,
          nodeType: n.nodeType || (prevId ? 'doubly' : 'singly'),
          next: nextId,
          prev: prevId,
          position: n.position || { x: 200, y: 200 },
        };
      });

      const updatedPointers = {};
      Object.values(result.freePointers || result.pointers || {}).forEach((p) => {
        updatedPointers[p.id] = {
          id: p.id,
          name: p.label || p.name,
          targetId: p.targetId,
          isExplicitNull: p.isExplicitNull || false,
          position: p.position || { x: 200, y: 150 },
        };
      });

      useUniversalStore.setState({
        nodes: updatedNodes,
        pointers: updatedPointers,
      });

      lastAppliedProgramRef.current = program;
      setSyncStatus('synced');
      setParseErrors(warningErrors);

      setTimeout(() => {
        sourceRef.current = 'canvas';
      }, 50);
    },
    [editorCode, language]
  );

  const handleEditorChange = useCallback(
    (value) => {
      sourceRef.current = 'editor';
      setEditorCode(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (syncMode === 'auto') {
        debounceTimerRef.current = setTimeout(() => {
          applyCodeToCanvas(value, language);
        }, DEBOUNCE_MS);
      } else {
        setSyncStatus('parsing');
      }
    },
    [syncMode, language, applyCodeToCanvas]
  );

  const applyNow = useCallback(() => {
    sourceRef.current = 'editor';
    applyCodeToCanvas(editorCode, language);
  }, [editorCode, language, applyCodeToCanvas]);

  const copyCode = useCallback(() => {
    navigator.clipboard?.writeText(editorCode).catch(() => {});
  }, [editorCode]);

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  return {
    language,
    editorCode,
    syncStatus,
    syncMode,
    parseErrors,
    panelWidth,
    monacoLanguage: MONACO_LANGUAGES[language],
    setLanguage,
    setPanelWidth,
    setSyncMode,
    handleEditorChange,
    handleEditorMount,
    applyNow,
    copyCode,
    highlightLine,
  };
}
