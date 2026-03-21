import { useState } from 'react';

import { useAppStore } from '../../store/useAppStore';

export default function TopNavBar(props: {
  brandLabel?: string;
  onPrimaryAction?: () => void;
}) {
  const { brandLabel = 'SVG.js Studio', onPrimaryAction } = props;
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItem = (page: 'docs' | 'showcase' | 'community', label: string) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        type="button"
        className={[
          'font-display text-sm font-bold tracking-tight pb-1 transition-colors',
          isActive
            ? 'border-b-2 border-primary text-primary'
            : 'border-b-2 border-transparent text-on-secondary-container hover:text-primary',
        ].join(' ')}
        onClick={() => setActivePage(page)}
      >
        {label}
      </button>
    );
  };

  const goPage = (page: 'docs' | 'showcase' | 'community') => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const mobileNavItem = (page: 'docs' | 'showcase' | 'community', label: string) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        type="button"
        className={[
          'w-full rounded-lg px-4 py-3 text-left font-display text-sm font-bold tracking-tight transition-colors',
          isActive
            ? 'bg-surface-container-highest text-primary'
            : 'text-on-surface hover:bg-surface-container-high',
        ].join(' ')}
        onClick={() => goPage(page)}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between px-4 opacity-80 backdrop-blur-[24px] sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
          <span className="truncate font-display text-lg font-black tracking-tight text-primary dark:text-primary-container sm:text-xl">
            {brandLabel}
          </span>

          <nav className="hidden gap-6 md:flex" aria-label="Primary">
            {navItem('showcase', 'Showcase')}
            {navItem('docs', 'Documentation')}
            {navItem('community', 'Community')}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-secondary-container transition-colors hover:bg-surface-container-high hover:text-primary md:hidden"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>

          <button
            type="button"
            className="hidden rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-on-primary transition-all hover:bg-primary-container active:scale-95 sm:inline-flex sm:px-4"
            onClick={onPrimaryAction}
          >
            Deploy
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary sm:hidden"
            aria-label="Deploy"
            onClick={onPrimaryAction}
          >
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
          </button>

          <div className="hidden gap-2 text-on-secondary-container sm:flex sm:gap-3">
            <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">
              settings
            </span>
            <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">
              account_circle
            </span>
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-16 z-[48] bg-black/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav
            className="fixed left-0 right-0 top-16 z-[49] flex max-h-[min(70vh,24rem)] flex-col gap-1 overflow-y-auto border-b border-outline-variant bg-surface/95 px-4 py-3 shadow-lg backdrop-blur-md md:hidden"
            aria-label="Primary mobile"
          >
            {mobileNavItem('showcase', 'Showcase')}
            {mobileNavItem('docs', 'Documentation')}
            {mobileNavItem('community', 'Community')}
          </nav>
        </>
      ) : null}
    </>
  );
}
