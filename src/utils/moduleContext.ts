import type { SvgModuleProps } from '../components/canvas/types';

/**
 * Bridge for svg.js plugins (draggable, panzoom, etc.): register teardown callbacks
 * so Strict Mode double-mount does not leak handlers.
 */
export type SvgModuleContext = {
  readonly panEnabled: boolean;
  readonly zoomEnabled: boolean;
  /** Register a function to run when the module is torn down or replaced. */
  onCleanup: (fn: () => void) => void;
  /** Run all registered cleanups (idempotent). */
  dispose: () => void;
};

export function createSvgModuleContext(
  props: SvgModuleProps,
): SvgModuleContext {
  const stack: Array<() => void> = [];

  const dispose = () => {
    while (stack.length > 0) {
      const fn = stack.pop();
      try {
        fn?.();
      } catch {
        // Ignore plugin teardown errors.
      }
    }
  };

  return {
    panEnabled: props.panEnabled ?? true,
    zoomEnabled: props.zoomEnabled ?? true,
    onCleanup: (fn) => {
      stack.push(fn);
    },
    dispose,
  };
}
