import { useRef } from 'react';

import { useGraphEditorRuntime } from '../hooks/useGraphEditorRuntime';
import { useGraphUiStore } from '../store/graphUiStore';

/**
 * Example shell: toolbar + canvas mount. Graph logic lives in `useGraphEditorRuntime`;
 * document + commands in `GraphDocModel`; drawing in `GraphSvgEngine`.
 */
export default function GraphEditorPanel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    revision,
    undo,
    redo,
    addNode,
    deleteSelected,
    exportJson,
    importJson,
    spawnStressNodes,
    resetDemo,
    canUndo,
    canRedo,
  } = useGraphEditorRuntime(mountRef);

  const tool = useGraphUiStore((s) => s.tool);
  const setTool = useGraphUiStore((s) => s.setTool);
  const selectedIds = useGraphUiStore((s) => s.selectedIds);
  const pendingConnect = useGraphUiStore((s) => s.pendingConnect);

  void revision;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-2xl bg-surface-container-low px-4 py-4 shadow-[var(--shadow-ambient)] sm:px-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Graph engine
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Normalized model + command history + SVG.js viewport culling. Drag nodes
          (multi-select with Shift or marquee), wheel zoom, pan with middle mouse,
          Alt+drag, or Space+drag (click the canvas once to focus it, then hold Space).
          In Connect mode, drag empty canvas to pan. Connect: click a port on one node
          (left = input, right = output), then the opposite port on another node to
          finish the edge.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-4">
          <span className="mr-2 text-xs font-bold text-on-surface">Tool</span>
          <button
            type="button"
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-bold',
              tool === 'select'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-on-secondary-container',
            ].join(' ')}
            onClick={() => setTool('select')}
          >
            Select
          </button>
          <button
            type="button"
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-bold',
              tool === 'connect'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-on-secondary-container',
            ].join(' ')}
            onClick={() => setTool('connect')}
          >
            Connect
          </button>
          {pendingConnect ? (
            <span className="text-xs text-secondary">
              {pendingConnect.port === 'out' ? (
                <>
                  Output on{' '}
                  <code className="font-mono text-[10px]">
                    {pendingConnect.nodeId.slice(0, 8)}…
                  </code>
                  {' — click a target '}
                  <strong>input</strong> (left)
                </>
              ) : (
                <>
                  Input on{' '}
                  <code className="font-mono text-[10px]">
                    {pendingConnect.nodeId.slice(0, 8)}…
                  </code>
                  {' — click a source '}
                  <strong>output</strong> (right)
                </>
              )}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => addNode('task')}
          >
            + Task
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => addNode('decision')}
          >
            + Decision
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => addNode('event')}
          >
            + Event
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => deleteSelected()}
          >
            Delete selected
          </button>
          <button
            type="button"
            disabled={!canUndo()}
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container disabled:opacity-40"
            onClick={() => undo()}
          >
            Undo
          </button>
          <button
            type="button"
            disabled={!canRedo()}
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container disabled:opacity-40"
            onClick={() => redo()}
          >
            Redo
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => {
              const j = exportJson();
              void navigator.clipboard.writeText(j);
            }}
          >
            Copy JSON
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              const r = new FileReader();
              r.onload = () => {
                if (typeof r.result === 'string') importJson(r.result);
              };
              r.readAsText(f);
            }}
          />
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => spawnStressNodes(600)}
          >
            Stress 600 nodes
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => resetDemo()}
          >
            Reset demo
          </button>
        </div>

        <p className="mt-3 text-xs text-on-surface-variant">
          Selected: {selectedIds.length ? selectedIds.join(', ') : 'none'}
        </p>
      </div>

      <div
        ref={mountRef}
        className="h-[min(560px,60vh)] min-h-[320px] w-full touch-none overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-highest shadow-[var(--shadow-ambient)]"
        tabIndex={0}
        aria-label="Graph canvas"
      />
    </div>
  );
}
