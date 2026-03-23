/**
 * All registry module keys exposed in the sidebar (must stay in sync with `src/components/canvas/registry.ts`).
 */
export type ModuleNavItem = {
  id: string;
  label: string;
};

export type ModuleNavGroup = {
  id: string;
  label: string;
  icon: string;
  items: ModuleNavItem[];
};

export const MODULE_NAV_GROUPS: ModuleNavGroup[] = [
  {
    id: 'showcase',
    label: 'Showcase',
    icon: 'view_quilt',
    items: [
      { id: 'showcase-floor-map', label: 'Floor map' },
      { id: 'showcase-force-graph', label: 'Force graph' },
      { id: 'showcase-graph-engine', label: 'Graph engine' },
      { id: 'showcase-realtime-chart', label: 'Realtime chart' },
      { id: 'showcase-game-demo', label: 'Game demo' },
    ],
  },
  {
    id: 'basics',
    label: 'Basics',
    icon: 'extension',
    items: [
      { id: 'basics-shapes', label: 'Shapes' },
      { id: 'basics-paths', label: 'Paths' },
      { id: 'basics-text', label: 'Text' },
      { id: 'basics-gradients', label: 'Gradients' },
    ],
  },
  {
    id: 'interactions',
    label: 'Interactions',
    icon: 'touch_app',
    items: [
      { id: 'interactions-draggable', label: 'Draggable' },
      { id: 'interactions-panzoom', label: 'Pan / Zoom' },
      { id: 'interactions-hover', label: 'Hover' },
      { id: 'interactions-click', label: 'Click' },
    ],
  },
  {
    id: 'animations',
    label: 'Animations',
    icon: 'auto_awesome',
    items: [
      { id: 'animations-basic', label: 'Basic animate' },
      { id: 'animations-morph', label: 'Path morph' },
      { id: 'animations-easing', label: 'Easing gallery' },
      { id: 'animations-timeline', label: 'Timeline' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: 'architecture',
    items: [
      { id: 'advanced-masks', label: 'Masks' },
      { id: 'advanced-clippaths', label: 'Clip paths' },
      { id: 'advanced-nested', label: 'Nested SVG' },
    ],
  },
];
