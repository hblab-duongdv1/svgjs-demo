import { useCallback, useEffect, useRef } from 'react';

import CuteHammer from '../molecules/CuteHammer';
import GameSvgMount from './GameSvgMount';
import { useGameStore } from '../../store/useGameStore';

/**
 * Align hammer “nose” (bottom-center of metal head in CuteHammer viewBox 0–76×92)
 * with the pointer: same coords as `transformOrigin` on the rotator.
 */
const HAMMER_HOTSPOT_X = 38;
const HAMMER_HOTSPOT_Y = 42;

/**
 * Game demo playfield: hammer + FX overlays (DOM/refs only) + isolated svg.js layer (`GameSvgMount`).
 */
export default function GameCanvas() {
  const playfieldRef = useRef<HTMLDivElement | null>(null);
  const hammerLayerRef = useRef<HTMLDivElement | null>(null);
  const hammerRotatorRef = useRef<HTMLDivElement | null>(null);
  const impactHostRef = useRef<HTMLDivElement | null>(null);
  const smashTimerRef = useRef<number | undefined>(undefined);

  const gameActive = useGameStore((s) => s.gameActive);

  const moveHammer = useCallback((clientX: number, clientY: number) => {
    const field = playfieldRef.current;
    const layer = hammerLayerRef.current;
    if (!field || !layer) return;
    const r = field.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    layer.style.transform = `translate3d(${x - HAMMER_HOTSPOT_X}px, ${y - HAMMER_HOTSPOT_Y}px, 0)`;
  }, []);

  useEffect(() => {
    return () => {
      if (smashTimerRef.current !== undefined)
        window.clearTimeout(smashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!gameActive) return;
    const field = playfieldRef.current;
    if (!field) return;
    const r = field.getBoundingClientRect();
    moveHammer(r.left + r.width / 2, r.top + r.height / 2);
  }, [gameActive, moveHammer]);

  const triggerHammerSmash = useCallback(() => {
    const rot = hammerRotatorRef.current;
    if (rot) rot.classList.add('game-hammer-smash');
    if (smashTimerRef.current !== undefined)
      window.clearTimeout(smashTimerRef.current);
    smashTimerRef.current = window.setTimeout(() => {
      rot?.classList.remove('game-hammer-smash');
      smashTimerRef.current = undefined;
    }, 120);
  }, []);

  const spawnImpactBurst = useCallback((x: number, y: number) => {
    const host = impactHostRef.current;
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'game-impact-burst';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    host.appendChild(el);
    window.setTimeout(() => {
      el.remove();
    }, 400);
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gameActive) return;
    moveHammer(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!gameActive) return;
    triggerHammerSmash();
    const field = playfieldRef.current;
    if (field) {
      const r = field.getBoundingClientRect();
      spawnImpactBurst(e.clientX - r.left, e.clientY - r.top);
    }
  };

  return (
    <div className="relative flex w-full max-w-4xl flex-1 flex-col justify-center">
      <div
        ref={playfieldRef}
        className={[
          'relative aspect-[4/3] max-h-[min(600px,70vh)] w-full overflow-hidden rounded-xl shadow-[0_24px_48px_-12px_rgba(26,27,34,0.08)]',
          gameActive ? 'cursor-none' : '',
        ].join(' ')}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        aria-label="SVG game demo playfield"
      >
        <GameSvgMount gameActive={gameActive} />

        {gameActive ? (
          <>
            <div
              ref={impactHostRef}
              className="pointer-events-none absolute inset-0 z-[24] overflow-hidden rounded-xl"
              aria-hidden
            />

            <div
              ref={hammerLayerRef}
              className="pointer-events-none absolute left-0 top-0 z-[30] will-change-transform"
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              <div
                ref={hammerRotatorRef}
                className="game-hammer-rot"
                style={{
                  width: 76,
                  height: 92,
                  transformOrigin: `${HAMMER_HOTSPOT_X}px ${HAMMER_HOTSPOT_Y}px`,
                }}
              >
                <CuteHammer className="drop-shadow-[0_6px_12px_rgba(26,27,34,0.2)]" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
