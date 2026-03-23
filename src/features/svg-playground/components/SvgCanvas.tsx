import { useEffect, useRef } from 'react';

/** Side-effect imports: extend `SVG` with `.draggable()` / `.panZoom()` before any SvgCanvas mount. */
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.panzoom.js';

import { SVG, type Svg } from '@svgdotjs/svg.js';
import {
  renderSvgModule,
  type SvgModuleProps,
} from '../../../components/canvas';

/**
 * Mounts svg.js on a div via `useRef`. Under React 19 Strict Mode, effects run twice in dev;
 * cleanup MUST disable pan/zoom, clear nodes, and remove the root SVG to avoid duplicate canvases.
 */
export default function SvgCanvas({
  activeModule,
  moduleProps,
}: {
  activeModule: string;
  moduleProps: SvgModuleProps;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const { duration, fill, strokeWidth, easing, panEnabled, zoomEnabled } =
    moduleProps;
  const {
    forceUseGroupColors,
    forceNodeColor,
    forceNodeCount,
    forceNodeSize,
    forceLinkDistance,
    forceRepulsion,
  } = moduleProps;

  useEffect(() => {
    const mountNode = canvasRef.current;
    if (!mountNode) return;

    const draw = SVG().addTo(mountNode).size('100%', '100%') as Svg;

    renderSvgModule(draw, activeModule, {
      duration,
      fill,
      strokeWidth,
      easing,
      panEnabled,
      zoomEnabled,
      forceUseGroupColors,
      forceNodeColor,
      forceNodeCount,
      forceNodeSize,
      forceLinkDistance,
      forceRepulsion,
    });

    return () => {
      try {
        draw.panZoom(false);
      } catch {
        /* plugin may not have attached */
      }
      draw.clear();
      draw.remove();
      mountNode.innerHTML = '';
    };
  }, [
    activeModule,
    duration,
    fill,
    strokeWidth,
    easing,
    panEnabled,
    zoomEnabled,
    forceUseGroupColors,
    forceNodeColor,
    forceNodeCount,
    forceNodeSize,
    forceLinkDistance,
    forceRepulsion,
  ]);

  return (
    <section className="relative flex-grow bg-surface flex items-center justify-center overflow-hidden p-4 md:ml-64 md:mr-80 md:p-12">
      <div
        ref={canvasRef}
        className="relative w-full max-w-4xl aspect-[4/3] max-h-[600px] bg-white custom-grid shadow-[var(--shadow-ambient)] rounded-xl"
      />
    </section>
  );
}
