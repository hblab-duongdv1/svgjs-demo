/**
 * Which Properties sections apply to each `selectedModuleId` (see `registry.ts` + `moduleNav.ts`).
 * Hide controls that the active renderer does not read from `moduleProps`.
 */
export type ModulePropertyFlags = {
  fillColor: boolean;
  strokeWidth: boolean;
  duration: boolean;
  easing: boolean;
  panZoom: boolean;
};

const NONE: ModulePropertyFlags = {
  fillColor: false,
  strokeWidth: false,
  duration: false,
  easing: false,
  panZoom: false,
};

/** Fallback when id is unknown — matches `drawFallbackModule` (fill + stroke only). */
const FALLBACK: ModulePropertyFlags = {
  fillColor: true,
  strokeWidth: true,
  duration: false,
  easing: false,
  panZoom: false,
};

const FLAGS: Record<string, ModulePropertyFlags> = {
  'showcase-game-demo': NONE,
  'showcase-realtime-chart': NONE,
  'showcase-graph-engine': NONE,
  'showcase-floor-map': NONE,

  'showcase-plugins': {
    fillColor: true,
    strokeWidth: true,
    duration: true,
    easing: true,
    panZoom: true,
  },

  // Basics — fill/stroke only (no timeline / pan-zoom)
  basics: {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'basics-shapes': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'basics-paths': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'basics-text': {
    fillColor: true,
    strokeWidth: false,
    duration: false,
    easing: true,
    panZoom: false,
  },
  'basics-gradients': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },

  // Interactions
  interactions: {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'interactions-draggable': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'interactions-panzoom': {
    fillColor: true,
    strokeWidth: false,
    duration: false,
    easing: false,
    panZoom: true,
  },
  'interactions-hover': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'interactions-click': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },

  // Animations
  animations: {
    fillColor: true,
    strokeWidth: true,
    duration: true,
    easing: false,
    panZoom: false,
  },
  'animations-basic': {
    fillColor: true,
    strokeWidth: true,
    duration: true,
    easing: false,
    panZoom: false,
  },
  'animations-morph': {
    fillColor: true,
    strokeWidth: true,
    duration: true,
    easing: false,
    panZoom: false,
  },
  'animations-easing': {
    fillColor: true,
    strokeWidth: false,
    duration: true,
    easing: true,
    panZoom: false,
  },
  'animations-timeline': {
    fillColor: true,
    strokeWidth: false,
    duration: true,
    easing: false,
    panZoom: false,
  },

  // Advanced
  advanced: {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'advanced-masks': {
    fillColor: true,
    strokeWidth: true,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'advanced-clippaths': {
    fillColor: true,
    strokeWidth: false,
    duration: false,
    easing: false,
    panZoom: false,
  },
  'advanced-nested': {
    fillColor: true,
    strokeWidth: false,
    duration: false,
    easing: false,
    panZoom: false,
  },
};

export function getModulePropertyFlags(moduleId: string): ModulePropertyFlags {
  return FLAGS[moduleId] ?? FALLBACK;
}
