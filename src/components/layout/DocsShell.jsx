import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '../../store/sidebarStore';

export const DocsShell = () => {
  const { mobileOpen, setMobileOpen, isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen flex flex-col bg-base text-text">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Multi-Column Layout */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar (Smooth Animated Expansion/Collapse without content deformation) */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.aside
              key="desktop-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: window.innerWidth >= 1280 ? '20%' : '16rem',
                opacity: 1,
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block sticky top-16 h-[calc(100vh-4rem)] self-start shrink-0 z-20 overflow-hidden"
            >
              <div className="w-full h-full min-w-[220px]">
                <Sidebar />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

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

        {/* Center + Right Content Area */}
        <main className="flex-1 min-w-0 py-8 pl-4 sm:pl-6 lg:pl-8 pr-3 sm:pr-4 lg:pr-6 2xl:pr-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
