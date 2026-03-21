import { MODULE_NAV_GROUPS, type ModuleNavGroup } from '../nav/moduleNav';

type SidebarItem = {
  id: string;
  label: string;
  icon?: string;
};

export default function SidebarMenu(props: {
  items?: SidebarItem[];
  groups?: ModuleNavGroup[];
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
  /** When false on small screens, sidebar is off-canvas; desktop (`md+`) always visible. Omit = always shown. */
  mobileOpen?: boolean;
}) {
  const {
    items,
    groups = MODULE_NAV_GROUPS,
    selectedModuleId = 'showcase-game-demo',
    onSelectModule,
    mobileOpen = true,
  } = props;

  const asideShell =
    'fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-surface-container-low pt-20 pb-6 px-6 shadow-[var(--shadow-ambient)] transition-transform duration-200 ease-out md:shadow-none ' +
    (mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0');

  if (items) {
    return (
      <aside className={asideShell}>
        <div className="mb-8">
          <h2 className="text-lg font-bold text-primary">Modules</h2>
          <p className="text-xs text-on-surface-variant opacity-70">
            SVG.js v3.2.0
          </p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Modules">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = item.id === selectedModuleId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={[
                      'flex w-full items-center gap-3 rounded-r-full px-6 py-3 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-surface-container-lowest text-primary'
                        : 'bg-transparent text-on-secondary-container opacity-70 hover:bg-surface-container-high',
                    ].join(' ')}
                    onClick={() => onSelectModule?.(item.id)}
                  >
                    {item.icon ? (
                      <span
                        className="material-symbols-outlined text-base"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    ) : null}
                    <span
                      className={
                        active ? 'text-primary' : 'text-on-secondary-container'
                      }
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto shrink-0 space-y-4">
          <ul className="space-y-2">
            <li>
              <a
                className="flex items-center gap-3 rounded px-1 py-0.5 text-sm font-medium text-on-surface-variant opacity-70 hover:text-primary transition-colors"
                href="#"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  aria-hidden="true"
                >
                  help
                </span>
                <span>Help</span>
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 rounded px-1 py-0.5 text-sm font-medium text-on-surface-variant opacity-70 hover:text-primary transition-colors"
                href="#"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  aria-hidden="true"
                >
                  chat_bubble
                </span>
                <span>Feedback</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <aside className={asideShell}>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary">Modules</h2>
        <p className="text-xs text-on-surface-variant opacity-70">
          SVG.js v3.2.0
        </p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Modules">
        <ul className="space-y-1">
          {groups.map((group) => (
            <li key={group.id} className="pt-2 first:pt-0">
              <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                <span
                  className="material-symbols-outlined text-sm"
                  aria-hidden="true"
                >
                  {group.icon}
                </span>
                <span>{group.label}</span>
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.id === selectedModuleId;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={[
                          'flex w-full items-center gap-3 rounded-r-full px-5 py-2 text-sm font-semibold transition-colors',
                          active
                            ? 'bg-surface-container-lowest text-primary'
                            : 'bg-transparent text-on-secondary-container opacity-70 hover:bg-surface-container-high',
                        ].join(' ')}
                        onClick={() => onSelectModule?.(item.id)}
                      >
                        <span
                          className={
                            active
                              ? 'text-primary'
                              : 'text-on-secondary-container'
                          }
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto shrink-0">
        <ul className="mt-4 space-y-2">
          <li>
            <a
              className="flex items-center gap-3 rounded px-1 py-0.5 text-sm font-medium text-on-surface-variant opacity-70 hover:text-primary transition-colors"
              href="#"
            >
              <span
                className="material-symbols-outlined text-lg"
                aria-hidden="true"
              >
                help
              </span>
              <span>Help</span>
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-3 rounded px-1 py-0.5 text-sm font-medium text-on-surface-variant opacity-70 hover:text-primary transition-colors"
              href="#"
            >
              <span
                className="material-symbols-outlined text-lg"
                aria-hidden="true"
              >
                chat_bubble
              </span>
              <span>Feedback</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
