import { GAME_ROUND_SECONDS, useGameStore } from '../../store/useGameStore';

/**
 * HUD for the game demo: score, high score, round timer, start / end controls.
 * Tonal surfaces only — no layout borders (design system).
 */
export default function GameDashboard() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const timer = useGameStore((s) => s.timer);
  const gameActive = useGameStore((s) => s.gameActive);
  const startGame = useGameStore((s) => s.startGame);
  const endGame = useGameStore((s) => s.endGame);

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-surface-container-low px-6 py-4 shadow-[var(--shadow-ambient)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Score
            </p>
            <p className="font-display text-2xl font-black tabular-nums text-primary">
              {score}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              High score
            </p>
            <p className="font-display text-2xl font-black tabular-nums text-on-secondary-container">
              {highScore}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Time
            </p>
            <p
              className={[
                'font-display text-2xl font-black tabular-nums',
                gameActive && timer <= 5 ? 'text-error' : 'text-primary',
              ].join(' ')}
            >
              {timer}s
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {gameActive ? (
            <button
              type="button"
              className="rounded-xl bg-surface-container-highest px-5 py-2.5 text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-90"
              onClick={() => endGame()}
            >
              End game
            </button>
          ) : (
            <button
              type="button"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-[var(--shadow-ambient)] transition-opacity hover:opacity-95 active:scale-[0.98]"
              onClick={() => startGame()}
            >
              Start game
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-on-surface-variant">
        <span className="font-semibold text-on-surface">Scoring:</span> +1 each
        time you hit a mouse before its shrink timer ends. On a hit, the mouse{' '}
        <span className="font-semibold text-on-surface">pops slightly</span>,
        then fades out. Each round lasts {GAME_ROUND_SECONDS}s — beat your high
        score.
      </p>
    </div>
  );
}
