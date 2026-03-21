import { create } from 'zustand';

/** Round length (seconds) for Target Practice. */
export const GAME_ROUND_SECONDS = 30;

export type GameStore = {
  score: number;
  highScore: number;
  timer: number;
  gameActive: boolean;
  startGame: () => void;
  endGame: () => void;
  incrementScore: () => void;
  resetScore: () => void;
  tickTimer: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  score: 0,
  highScore: 0,
  timer: GAME_ROUND_SECONDS,
  gameActive: false,

  startGame: () =>
    set({
      gameActive: true,
      score: 0,
      timer: GAME_ROUND_SECONDS,
    }),

  endGame: () =>
    set((s) => ({
      gameActive: false,
      highScore: Math.max(s.highScore, s.score),
      timer: GAME_ROUND_SECONDS,
    })),

  incrementScore: () => set((s) => ({ score: s.score + 1 })),

  resetScore: () => set({ score: 0 }),

  tickTimer: () => {
    const { gameActive, timer } = get();
    if (!gameActive) return;
    if (timer <= 1) {
      get().endGame();
      return;
    }
    set({ timer: timer - 1 });
  },
}));
