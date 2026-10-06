/**
 * Centralized z-index scale to prevent magic numbers and layer collisions.
 * Canvas: 0 (background canvas, SVG lines, grid)
 * Panels: 10 (side panels, info panels, code editor)
 * Toolbar: 20 (bottom floating toolbar, HUD controls)
 * Nav: 30 (top navigation capsule header)
 * Modals: 50 (toasts, dialogs, popovers, search palette)
 */
export const Z_INDEX = {
  canvas: 0,
  panels: 10,
  toolbar: 20,
  nav: 30,
  modals: 50,
};

export const Z_CLASSES = {
  canvas: 'z-0',
  panels: 'z-10',
  toolbar: 'z-20',
  nav: 'z-30',
  modals: 'z-50',
};
