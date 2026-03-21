import type { StageConfiguration } from '../../store/editorTypes';

import LiveCodeViewer from '../../features/svg-playground/components/LiveCodeViewer';
import { getModulePropertyFlags } from '../properties/moduleControls';

export default function PropertiesPanel(props: {
  selectedModuleId: string;
  stageConfiguration: StageConfiguration;
  onStageConfigChange: (update: Partial<StageConfiguration>) => void;
  snippetText: string;
  /** When false on small screens, panel is off-canvas from the right; `md+` always visible. Omit = always shown. */
  mobileOpen?: boolean;
}) {
  const {
    selectedModuleId,
    stageConfiguration,
    onStageConfigChange,
    snippetText,
    mobileOpen = true,
  } = props;

  const isGameDemo = selectedModuleId === 'showcase-game-demo';
  const flags = getModulePropertyFlags(selectedModuleId);

  return (
    <aside
      className={
        'fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col bg-surface-container-low pt-16 shadow-[var(--shadow-ambient)] transition-transform duration-200 ease-out md:z-30 md:max-w-none md:w-80 md:shadow-none ' +
        (mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0')
      }
    >
      <div className="flex-grow overflow-y-auto p-6">
        <div className="mb-6">
          <h3 className="mb-1 text-xs font-black uppercase tracking-widest text-on-surface-variant">
            Properties
          </h3>
          <p
            className="text-[10px] font-mono text-on-surface-variant opacity-70 truncate"
            title={selectedModuleId}
          >
            Module: {selectedModuleId}
          </p>
        </div>

        {isGameDemo ? (
          <section className="space-y-3 rounded-2xl bg-surface-container-highest p-4 shadow-[var(--shadow-ambient)]">
            <p className="text-xs font-bold text-primary">Game demo</p>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Demonstrates svg.js{' '}
              <strong className="text-on-surface">element creation</strong>,{' '}
              <strong className="text-on-surface">runner animations</strong>{' '}
              (opacity, transform scale),{' '}
              <strong className="text-on-surface">click handlers</strong>, and a
              Strict Mode–safe mount/teardown inside{' '}
              <code className="font-mono text-[10px] text-on-surface">
                useEffect
              </code>
              . Score and timer use{' '}
              <code className="font-mono text-[10px] text-on-surface">
                useGameStore
              </code>
              .
            </p>
          </section>
        ) : null}

        <div className="space-y-6">
          {!isGameDemo && flags.duration ? (
            <section className="space-y-3 rounded-lg bg-surface-container-highest p-4">
              <label className="block text-xs font-bold text-secondary">
                Duration (ms)
              </label>
              <div className="flex items-center gap-4">
                <input
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg accent-primary"
                  type="range"
                  min={0}
                  max={2000}
                  step={10}
                  value={stageConfiguration.durationMs}
                  aria-label="Duration (ms)"
                  onChange={(e) =>
                    onStageConfigChange({ durationMs: Number(e.target.value) })
                  }
                />
                <span className="w-10 text-right font-mono text-xs font-bold text-primary tabular-nums">
                  {stageConfiguration.durationMs}
                </span>
              </div>
            </section>
          ) : null}

          {!isGameDemo && flags.fillColor ? (
            <section className="space-y-3 rounded-lg bg-surface-container-highest p-4">
              <label className="block text-xs font-bold text-secondary">
                Fill Color
              </label>
              <div className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-2">
                <div className="relative">
                  <div
                    className="h-8 w-8 rounded bg-primary"
                    style={{ backgroundColor: stageConfiguration.fillColor }}
                  />
                  <input
                    aria-label="Fill Color"
                    type="color"
                    value={stageConfiguration.fillColor}
                    onChange={(e) =>
                      onStageConfigChange({ fillColor: e.target.value })
                    }
                    className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
                  />
                </div>
                <span className="font-mono text-xs text-on-surface tabular-nums">
                  {stageConfiguration.fillColor}
                </span>
                <span className="ml-auto material-symbols-outlined text-outline text-lg">
                  colorize
                </span>
              </div>
            </section>
          ) : null}

          {!isGameDemo && flags.strokeWidth ? (
            <section className="space-y-3 rounded-lg bg-surface-container-highest p-4">
              <label className="block text-xs font-bold text-secondary">
                Stroke Width
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 4, 8] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={[
                      'rounded-md py-2 text-xs font-bold',
                      stageConfiguration.strokeWidth === w
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-colors',
                    ].join(' ')}
                    onClick={() => onStageConfigChange({ strokeWidth: w })}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {!isGameDemo && flags.easing ? (
            <section className="space-y-3 rounded-lg bg-surface-container-highest p-4">
              <label className="block text-xs font-bold text-secondary">
                Easing Function
              </label>
              <select
                className="w-full rounded-lg bg-surface-container-highest py-2 px-3 text-xs font-medium text-on-surface focus:outline-none"
                aria-label="Easing Function"
                value={stageConfiguration.easingFunction}
                onChange={(e) =>
                  onStageConfigChange({ easingFunction: e.target.value })
                }
              >
                <option value="easeInOutCubic">easeInOutCubic</option>
                <option value="easeInExpo">easeInExpo</option>
                <option value="easeOutElastic">easeOutElastic</option>
                <option value="linear">linear</option>
              </select>
            </section>
          ) : null}

          {!isGameDemo && flags.panZoom ? (
            <section className="space-y-4 rounded-lg bg-surface-container-highest p-4">
              <p className="text-xs font-bold text-secondary">Pan / Zoom</p>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface-container-lowest px-3 py-2">
                <span className="text-xs font-semibold text-on-surface">
                  Enable pan
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={stageConfiguration.panEnabled}
                  onChange={(e) =>
                    onStageConfigChange({ panEnabled: e.target.checked })
                  }
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface-container-lowest px-3 py-2">
                <span className="text-xs font-semibold text-on-surface">
                  Enable zoom
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={stageConfiguration.zoomEnabled}
                  onChange={(e) =>
                    onStageConfigChange({ zoomEnabled: e.target.checked })
                  }
                />
              </label>
            </section>
          ) : null}
        </div>
      </div>

      <div className="h-1/3 p-6">
        <LiveCodeViewer snippetText={snippetText} />
      </div>
    </aside>
  );
}
