/**
 * @fileoverview Primitive-first Bottom Dock:
 * Row 1: Contextual tools for ACTIVE structure type + Inline Value Input + Select (V) + Delete + Undo + Redo + Speed + RESET.
 * Row 2: Segmented data structure selector (Array | Linked List | Stack | Queue | Binary Tree) with single-line whitespace-nowrap labels.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useUniversalStore } from './useUniversalStore';
import {
  List, Link2, Layers, ArrowRightLeft, GitFork,
  Undo2, Redo2, RotateCcw, Plus, MousePointer, Trash2,
  Check, X, CircleDot, ArrowRight, Gauge,
} from 'lucide-react';

export function BottomDock() {
  const {
    activeStructureType,
    setActiveStructureType,
    activeTool,
    setActiveTool,
    sharedValueInput,
    setSharedValueInput,
    getNextValue,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    deleteSelected,
    playbackSpeed,
    setPlaybackSpeed,
    dispatch,
    pan,
    zoom,
    setElementPosition,
    memoryMode,
    setMemoryMode,
    nodeTypeToggle,
    setNodeTypeToggle,
    treeModeToggle,
    setTreeModeToggle,
    placePrimitive,
  } = useUniversalStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPointerMenu, setShowPointerMenu] = useState(false);
  const [customPointerName, setCustomPointerName] = useState('');

  // Ref to track consecutive clicks on a create tool button (for viewport-center placement)
  const lastToolClickRef = useRef({ tool: null, time: 0 });

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.monaco-editor')) {
        return;
      }

      // Structure selector shortcuts 1-5
      if (e.key === '1') setActiveStructureType('array');
      else if (e.key === '2') setActiveStructureType('linkedlist');
      else if (e.key === '3') setActiveStructureType('stack');
      else if (e.key === '4') setActiveStructureType('queue');
      else if (e.key === '5') setActiveStructureType('tree');

      // Tool shortcuts
      else if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
      else if (e.key === 'Escape') setActiveTool('select');
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveStructureType, setActiveTool, deleteSelected, undo, redo]);

  // Viewport center placement helper
  const placeAtCenter = (type, config = {}) => {
    const centerX = (window.innerWidth / 2 - pan.x) / zoom - 60;
    const centerY = (window.innerHeight / 2 - pan.y) / zoom - 40;
    placePrimitive(type, { x: centerX, y: centerY }, { config });
  };

  const handleToolButtonClick = (toolName, createType, config = {}) => {
    const now = Date.now();
    if (lastToolClickRef.current.tool === toolName && now - lastToolClickRef.current.time < 500) {
      // Double click -> Place immediately at center
      placeAtCenter(createType, config);
      setActiveTool('select');
      lastToolClickRef.current = { tool: null, time: 0 };
    } else {
      // Single click -> Make tool active for click-to-place
      setActiveTool(activeTool === toolName ? 'select' : toolName);
      lastToolClickRef.current = { tool: toolName, time: now };
    }
  };

  const renderContextualTools = () => {
    switch (activeStructureType) {
      case 'linkedlist':
        return (
          <>
            {/* Create Node with Singly / Doubly toggle */}
            <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10">
              <button
                onClick={() => handleToolButtonClick('create_node', 'linkedlist')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-2xs transition-all ${
                  activeTool === 'create_node'
                    ? 'bg-accent text-black font-extrabold shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
                title="Create Node: click canvas or double-click to place"
              >
                <Plus size={11} strokeWidth={3} />
                <span>Node</span>
              </button>
              <button
                onClick={() => setNodeTypeToggle(nodeTypeToggle === 'singly' ? 'doubly' : 'singly')}
                className="px-2 py-0.5 text-3xs font-bold text-text-muted hover:text-white capitalize transition-colors"
                title="Toggle Singly or Doubly node"
              >
                {nodeTypeToggle}
              </button>
            </div>

            {/* Pointer Tool with Quick-Pick Popover */}
            <div className="relative">
              <button
                onClick={() => setShowPointerMenu(!showPointerMenu)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-2xs font-bold transition-all ${
                  showPointerMenu || activeTool.startsWith('pointer')
                    ? 'bg-white text-black border-white'
                    : 'bg-[#1C1C1E] border-white/10 text-white hover:bg-[#2C2C2E]'
                }`}
                title="Create pointer tag: click to pick head, tail, curr, prev, next or custom"
              >
                <Plus size={11} strokeWidth={3} />
                <span>Pointer</span>
              </button>

              {showPointerMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-64 p-2.5 rounded-2xl bg-[#1A1A1E] border border-white/15 shadow-2xl z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95 font-mono">
                  <div className="text-3xs text-text-muted font-bold flex items-center justify-between">
                    <span>CREATE POINTER TAG</span>
                    <button
                      onClick={() => setShowPointerMenu(false)}
                      className="text-text-muted hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>

                  {/* Quick-Pick Chips */}
                  <div className="flex flex-wrap gap-1">
                    {['head', 'tail', 'curr', 'prev', 'next'].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => {
                          placeAtCenter('pointer', { label: chip });
                          setShowPointerMenu(false);
                        }}
                        className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-2xs font-bold text-white hover:border-[#10b981] transition-all"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Custom Name Input */}
                  <div className="flex items-center gap-1 pt-1 border-t border-white/10">
                    <input
                      type="text"
                      placeholder="custom name..."
                      value={customPointerName}
                      onChange={(e) => setCustomPointerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customPointerName.trim()) {
                          placeAtCenter('pointer', { label: customPointerName.trim() });
                          setCustomPointerName('');
                          setShowPointerMenu(false);
                        }
                      }}
                      className="flex-1 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-xs text-white outline-none font-bold"
                    />
                    <button
                      onClick={() => {
                        if (customPointerName.trim()) {
                          placeAtCenter('pointer', { label: customPointerName.trim() });
                          setCustomPointerName('');
                          setShowPointerMenu(false);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#10b981] text-black font-extrabold text-2xs hover:bg-[#10b981]/90"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick-Access Head, Curr, NULL Buttons */}
            <button
              onClick={() => handleToolButtonClick('pointer_head', 'pointer', { label: 'head' })}
              className={`px-2 py-1 rounded-full border text-2xs font-bold transition-all ${
                activeTool === 'pointer_head'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#1C1C1E] border-white/10 text-white hover:bg-[#2C2C2E]'
              }`}
            >
              Head
            </button>
            <button
              onClick={() => handleToolButtonClick('pointer_curr', 'pointer', { label: 'curr' })}
              className={`px-2 py-1 rounded-full border text-2xs font-bold transition-all ${
                activeTool === 'pointer_curr'
                  ? 'bg-emerald-400 text-black border-emerald-400'
                  : 'bg-[#1C1C1E] border-white/10 text-text-muted hover:text-white hover:bg-[#2C2C2E]'
              }`}
            >
              Curr
            </button>
            <button
              onClick={() => handleToolButtonClick('pointer_null', 'pointer', { label: 'NULL' })}
              className="px-2 py-1 rounded-full border border-dashed border-white/20 hover:border-white/40 text-text-muted hover:text-white text-2xs font-bold transition-all"
            >
              NULL
            </button>
          </>
        );

      case 'array':
        return (
          <>
            <button
              onClick={() => handleToolButtonClick('create_array', 'array', { capacity: 8, dynamic: false })}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-2xs transition-all ${
                activeTool === 'create_array'
                  ? 'bg-accent text-black font-extrabold shadow-sm'
                  : 'bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#2C2C2E]'
              }`}
              title="Create Array: click canvas or double-click to place"
            >
              <Plus size={11} strokeWidth={3} />
              <span>Create Array</span>
            </button>
            <button
              onClick={() => handleToolButtonClick('pointer_i', 'pointer', { label: 'i' })}
              className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-white/10 text-text-muted hover:text-white text-2xs font-bold transition-all"
            >
              Pointer (i)
            </button>
          </>
        );

      case 'stack':
        return (
          <>
            <button
              onClick={() => handleToolButtonClick('create_stack', 'stack', { capacity: 6, backing: 'array' })}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-2xs transition-all ${
                activeTool === 'create_stack'
                  ? 'bg-accent text-black font-extrabold shadow-sm'
                  : 'bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#2C2C2E]'
              }`}
              title="Create Stack: click canvas or double-click to place"
            >
              <Plus size={11} strokeWidth={3} />
              <span>Create Stack</span>
            </button>
          </>
        );

      case 'queue':
        return (
          <>
            <button
              onClick={() => handleToolButtonClick('create_queue', 'queue', { capacity: 6, queueType: 'simple' })}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-2xs transition-all ${
                activeTool === 'create_queue'
                  ? 'bg-accent text-black font-extrabold shadow-sm'
                  : 'bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#2C2C2E]'
              }`}
              title="Create Queue: click canvas or double-click to place"
            >
              <Plus size={11} strokeWidth={3} />
              <span>Create Queue</span>
            </button>
          </>
        );

      case 'tree':
        return (
          <>
            <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10">
              <button
                onClick={() => handleToolButtonClick('create_tree', 'tree')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-2xs transition-all ${
                  activeTool === 'create_tree'
                    ? 'bg-accent text-black font-extrabold shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
                title="Create Tree Node: click canvas or double-click to place"
              >
                <Plus size={11} strokeWidth={3} />
                <span>Node</span>
              </button>
              <button
                onClick={() => setTreeModeToggle(treeModeToggle === 'bst' ? 'generic' : 'bst')}
                className="px-2 py-0.5 text-3xs font-bold text-text-muted hover:text-white uppercase transition-colors"
                title="Toggle BST or Generic Tree mode"
              >
                {treeModeToggle}
              </button>
            </div>
            <button
              onClick={() => handleToolButtonClick('pointer_root', 'pointer', { label: 'root' })}
              className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-white/10 text-text-muted hover:text-white text-2xs font-bold transition-all"
            >
              Root
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 font-mono select-none pointer-events-auto">
      {/* ── ROW 1: Contextual Tools Bar + Value Input + Global Actions ── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414]/90 backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Select Mode (V) */}
        <button
          onClick={() => setActiveTool('select')}
          className={`p-1.5 rounded-full transition-all ${
            activeTool === 'select'
              ? 'bg-accent text-black shadow-sm'
              : 'text-text-muted hover:text-white hover:bg-white/10'
          }`}
          title="Select Mode (V) - Click and drag elements"
        >
          <MousePointer size={12} strokeWidth={activeTool === 'select' ? 2.5 : 2} />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Shared Inline Value Input */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/15">
          <span className="text-3xs text-text-muted font-bold">Val:</span>
          <input
            type="text"
            value={sharedValueInput}
            onChange={(e) => setSharedValueInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                placeAtCenter(activeStructureType);
              }
            }}
            placeholder="10"
            className="w-12 bg-transparent text-white text-xs font-bold outline-none text-center"
            title="Shared value for Create / Insert / Push ops (Press Enter to place at center)"
          />
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Dynamic Contextual Tools for Active Type */}
        {renderContextualTools()}

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Delete Selected */}
        <button
          onClick={deleteSelected}
          className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-red-400 transition-all"
          title="Delete selected element (Delete key)"
        >
          <Trash2 size={12} />
        </button>

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={12} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={12} />
        </button>

        {/* Speed Slider Button */}
        <button
          onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 0.5 : 1)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white text-3xs font-bold transition-all"
          title="Animation speed toggle"
        >
          <Gauge size={10} />
          <span>{playbackSpeed}x</span>
        </button>

        {/* RESET Button with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-red-500/10 text-text-muted hover:text-red-400 font-bold text-3xs transition-all"
            title="Reset canvas"
          >
            <RotateCcw size={11} />
            <span>RESET</span>
          </button>

          {showResetConfirm && (
            <div className="absolute bottom-full mb-2 right-0 w-52 p-3 rounded-2xl bg-[#1A1A1E] border border-red-500/30 shadow-2xl z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95">
              <span className="text-3xs text-white font-bold leading-tight">
                Reset canvas? This clears all structures. (Undoable)
              </span>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 rounded-full hover:bg-white/10 text-3xs text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    reset();
                    setShowResetConfirm(false);
                  }}
                  className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-3xs transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: Segmented Data Structure Selector (Single-Line Fixed) ── */}
      <div className="flex items-center p-1 rounded-full bg-[#121214]/90 backdrop-blur-md border border-white/10 shadow-xl overflow-x-auto max-w-full">
        {[
          { type: 'array', label: 'Array', icon: List, num: '1' },
          { type: 'linkedlist', label: 'Linked List', icon: Link2, num: '2' },
          { type: 'stack', label: 'Stack', icon: Layers, num: '3' },
          { type: 'queue', label: 'Queue', icon: ArrowRightLeft, num: '4' },
          { type: 'tree', label: 'Binary Tree', icon: GitFork, num: '5' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeStructureType === item.type;

          return (
            <button
              key={item.type}
              onClick={() => setActiveStructureType(item.type)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-2xs transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-accent text-black font-extrabold shadow-sm'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
              title={`${item.label} (Press ${item.num})`}
            >
              <Icon size={12} strokeWidth={isSelected ? 2.5 : 2} />
              <span className="whitespace-nowrap">{item.label}</span>
              <span className={`text-3xs opacity-60 ${isSelected ? 'text-black' : 'text-text-muted'}`}>
                {item.num}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
