import { create } from 'zustand';

export type AppPage = 'showcase' | 'docs' | 'community';

export type AppStore = {
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
};

const defaultActiveModuleId = 'showcase-game-demo';

export const useAppStore = create<AppStore>((set) => ({
  activePage: 'showcase',
  setActivePage: (page) =>
    set(
      page === 'showcase'
        ? { activePage: page, activeModuleId: 'showcase-game-demo' }
        : { activePage: page },
    ),
  activeModuleId: defaultActiveModuleId,
  setActiveModuleId: (id) => set({ activeModuleId: id }),
}));
