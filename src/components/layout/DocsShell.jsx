import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '../../store/sidebarStore';

export const DocsShell = () => {
  const { mobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <div className="min-h-screen flex flex-col bg-base text-text">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Multi-Column Layout */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar (Fixed / Sticky to Viewport) */}
        <div className="hidden md:block sticky top-16 h-[calc(100vh-4rem)] self-start shrink-0 z-20">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative w-80 max-w-[85vw] bg-surface h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
              <Sidebar isMobile={true} />
            </div>
          </div>
        )}

        {/* Center Content Column + Right TOC */}
        <main className="flex-1 min-w-0 flex justify-center py-8 px-4 sm:px-8 lg:px-12">
          <div className="w-full max-w-4xl min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
