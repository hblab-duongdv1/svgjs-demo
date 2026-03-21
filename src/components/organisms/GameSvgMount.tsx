import { memo, useEffect, useRef, type CSSProperties } from 'react';

import { SVG, type Element, type G, type Svg } from '@svgdotjs/svg.js';

import { useGameStore } from '../../store/useGameStore';

export const TARGET_CLASS = 'game-target-practice';

/** Visual size multiplier for the mouse graphic + hit area. */
const MOUSE_SCALE = 1.5;

/** Half-extent for spawn padding (base × scale). */
const MOUSE_HALF_W = Math.ceil(44 * MOUSE_SCALE);
const MOUSE_HALF_H = Math.ceil(38 * MOUSE_SCALE);

const GRID_STYLE: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, #c5c5d4 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

function tintTargetsRed(root: G): void {
  root.find('path, circle, ellipse').each(function (this: Element) {
    try {
      const node = this as { fill?: (c: string) => unknown };
      if (typeof node.fill === 'function') node.fill('#ba1a1a');
    } catch {
      /* stroke-only etc. */
    }
  });
}

/**
 * Mouse art in `g` (pointer-events: none). Transparent `hit` circle on top for reliable taps.
 */
function createCuteMouseTarget(
  draw: Svg,
  cx: number,
  cy: number,
): { root: G; hit: Element } {
  const wrapper = draw.group().addClass(TARGET_CLASS);
  wrapper.css({ cursor: 'none' });

  const g = wrapper.group();

  const outline = { width: 1.5, color: '#312e81' };
  const body = '#6366f1';
  const ear = '#818cf8';
  const earInner = '#fda4af';

  g.path('M 28 6 Q 52 -12 68 2')
    .fill('none')
    .stroke({
      width: 3.5,
      color: '#4f46e5',
      linecap: 'round',
      linejoin: 'round',
    });

  g.circle(16).center(-22, -20).fill(ear).stroke(outline);
  g.circle(16).center(22, -20).fill(ear).stroke(outline);
  g.circle(7).center(-22, -20).fill(earInner);
  g.circle(7).center(22, -20).fill(earInner);

  g.ellipse(34, 26).center(0, 4).fill(body).stroke(outline);
  g.ellipse(22, 16).center(0, 12).fill('#c7d2fe').opacity(0.92);

  g.circle(7)
    .center(-12, -2)
    .fill('#ffffff')
    .stroke({ width: 1.2, color: '#1e1b4b' });
  g.circle(7)
    .center(12, -2)
    .fill('#ffffff')
    .stroke({ width: 1.2, color: '#1e1b4b' });
  g.circle(3).center(-11, -1).fill('#0f172a');
  g.circle(3).center(13, -1).fill('#0f172a');
  g.ellipse(5, 4)
    .center(0, 8)
    .fill('#fb7185')
    .stroke({ width: 0.5, color: '#be123c' });

  g.path('M -9 16 Q 0 22 9 16')
    .fill('none')
    .stroke({ width: 1.5, color: '#312e81', linecap: 'round' });

  const whisker = { width: 1.2, color: '#64748b', linecap: 'round' as const };
  g.line(-26, 8, -48, 5).stroke(whisker);
  g.line(-26, 12, -46, 12).stroke(whisker);
  g.line(-26, 16, -48, 19).stroke(whisker);
  g.line(26, 8, 48, 5).stroke(whisker);
  g.line(26, 12, 46, 12).stroke(whisker);
  g.line(26, 16, 48, 19).stroke(whisker);

  const b = g.bbox();
  g.translate(-b.cx, -b.cy);
  g.scale(MOUSE_SCALE, MOUSE_SCALE, 0, 0);
  g.css('pointer-events', 'none');

  const hitR = Math.ceil(56 * MOUSE_SCALE);
  const hit = wrapper
    .circle(hitR)
    .center(0, Math.round(2 * MOUSE_SCALE))
    .fill('rgba(0,0,0,0.04)');
  hit.attr('pointer-events', 'all');
  hit.front();

  wrapper.center(cx, cy);

  return { root: wrapper, hit };
}

type Props = { gameActive: boolean };

/**
 * svg.js mount isolated in `memo`: only re-renders when `gameActive` changes.
 */
const GameSvgMount = memo(function GameSvgMount({ gameActive }: Props) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<Svg | null>(null);

  useEffect(() => {
    const mount = canvasRef.current;
    if (!mount) return;

    const draw = SVG().addTo(mount).size('100%', '100%') as Svg;
    draw.viewbox(0, 0, 800, 600);
    draw.css('touch-action', 'none');
    drawRef.current = draw;

    return () => {
      useGameStore.getState().endGame();
      try {
        draw.clear();
        draw.remove();
      } catch {
        /* ignore */
      }
      mount.innerHTML = '';
      drawRef.current = null;
    };
  }, []);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;

    if (!gameActive) {
      draw.clear();
      return;
    }

    let cancelled = false;
    let spawnTimeout: number | undefined;

    const tickId = window.setInterval(() => {
      useGameStore.getState().tickTimer();
    }, 1000);

    const spawnTarget = () => {
      if (cancelled || !useGameStore.getState().gameActive) return;

      const pad = 52;
      const cx =
        pad + MOUSE_HALF_W + Math.random() * (800 - 2 * (pad + MOUSE_HALF_W));
      const cy =
        pad + MOUSE_HALF_H + Math.random() * (600 - 2 * (pad + MOUSE_HALF_H));

      const { root: target, hit } = createCuteMouseTarget(draw, cx, cy);

      target.opacity(0).animate(200).opacity(1);

      let clicked = false;
      const shrinkRunner = target
        .animate(2000)
        .ease('-')
        .transform({ scale: 0.1 }, true);
      shrinkRunner.after(() => {
        if (clicked) return;
        tintTargetsRed(target);
        target
          .animate(300)
          .opacity(0)
          .after(() => {
            try {
              target.remove();
            } catch {
              /* already removed */
            }
          });
      });

      /** +1 per hit on the mouse hit-area before the shrink animation completes; pop then fade. */
      const onHit = () => {
        if (clicked || !useGameStore.getState().gameActive) return;
        clicked = true;
        try {
          target.stop(true, true);
        } catch {
          /* ignore */
        }
        useGameStore.getState().incrementScore();
        const pop = target
          .animate(160)
          .ease('-')
          .transform({ scale: 1.22 }, true);
        pop.after(() => {
          target
            .animate(140)
            .ease('-')
            .opacity(0)
            .after(() => {
              try {
                target.remove();
              } catch {
                /* ignore */
              }
            });
        });
      };

      hit.on('pointerdown', onHit);
      hit.on('click', onHit);

      const delay = 1000 + Math.random() * 1000;
      spawnTimeout = window.setTimeout(spawnTarget, delay);
    };

    spawnTarget();

    return () => {
      cancelled = true;
      window.clearInterval(tickId);
      if (spawnTimeout !== undefined) window.clearTimeout(spawnTimeout);
      draw.clear();
    };
  }, [gameActive]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={GRID_STYLE}
    />
  );
});

export default GameSvgMount;
