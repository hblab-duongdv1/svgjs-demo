import type { ReactNode } from 'react';

import BackToShowcaseButton from '../components/atoms/BackToShowcaseButton';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'capabilities', title: 'SVG.js capabilities' },
  { id: 'feature-showcases', title: 'Feature showcases' },
  { id: 'game-demo', title: 'Game demo' },
  { id: 'showcase-code', title: 'Code walkthrough' },
  { id: 'registry', title: 'Module registry' },
  { id: 'state', title: 'State & UI' },
  { id: 'setup', title: 'Run locally' },
] as const;

function SectionCard(props: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const { id, title, children } = props;
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]"
      aria-labelledby={`${id}-heading`}
    >
      <h2
        id={`${id}-heading`}
        className="font-display text-2xl font-black tracking-tight text-primary"
      >
        {title}
      </h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-on-surface">
        {children}
      </div>
    </section>
  );
}

function CodeBlock(props: { title?: string; children: string }) {
  return (
    <figure className="space-y-2">
      {props.title ? (
        <figcaption className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {props.title}
        </figcaption>
      ) : null}
      <pre
        className="overflow-x-auto rounded-xl bg-surface-container p-4 font-mono text-xs leading-relaxed text-on-surface tabular-nums"
        tabIndex={0}
      >
        <code>{props.children}</code>
      </pre>
    </figure>
  );
}

function PillList(props: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {props.items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-semibold text-on-secondary-container"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Technical documentation for SVG.js Studio: implemented features, architecture, and short code excerpts.
 */
export default function DocumentationPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface px-6 pb-24 pt-8 font-body text-on-surface sm:px-10">
      <div className="mx-auto max-w-3xl">
        <BackToShowcaseButton variant="docs" />

        <header className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-80">
            Documentation
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.02em] text-primary">
            SVG.js Studio
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-surface-variant">
            Interactive{' '}
            <strong className="font-semibold text-on-surface">
              SVG.js v3.2
            </strong>{' '}
            playground built with{' '}
            <strong className="font-semibold text-on-surface">React 19</strong>,{' '}
            <strong className="font-semibold text-on-surface">
              TypeScript
            </strong>
            , and{' '}
            <strong className="font-semibold text-on-surface">Zustand</strong>.
            This page summarizes what is implemented in the codebase and how it
            maps to official{' '}
            <code className="font-mono text-[13px]">@svgdotjs/*</code> packages.
          </p>
        </header>

        <nav className="mb-12 flex flex-wrap gap-2" aria-label="On this page">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold text-on-secondary-container transition-colors hover:bg-surface-container-highest hover:text-primary"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          <SectionCard id="overview" title="Overview">
            <p>
              <strong className="text-on-surface">SVG.js Studio</strong> is a
              single-page app with a{' '}
              <strong className="text-on-surface">Showcase</strong> workspace: a
              module sidebar, live SVG canvas, property controls, and a
              generated code snippet. Rendering is delegated to <em>pure</em>{' '}
              TypeScript functions keyed by module id—React only mounts the SVG
              root and passes props.
            </p>
            <p className="text-on-surface-variant">
              Open{' '}
              <strong className="font-semibold text-on-surface">
                Showcase
              </strong>{' '}
              in the top nav:{' '}
              <code className="font-mono text-[11px]">showcase-realtime-chart</code>
              ,{' '}
              <code className="font-mono text-[11px]">showcase-graph-engine</code>
              ,{' '}
              <code className="font-mono text-[11px]">showcase-floor-map</code>,{' '}
              <code className="font-mono text-[11px]">showcase-game-demo</code>,{' '}
              <code className="font-mono text-[11px]">showcase-plugins</code>, plus
              basics, interactions, animations, and advanced SVG topics. Heavy demos
              swap <code className="font-mono text-[11px]">SvgCanvas</code> for a
              dedicated React panel; the registry still holds a placeholder key per
              module id.
            </p>
          </SectionCard>

          <SectionCard id="architecture" title="Architecture">
            <p className="font-semibold text-on-surface">Layers</p>
            <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  features/svg-playground/
                </code>{' '}
                — <code className="font-mono text-[11px]">SvgCanvas</code>,{' '}
                <code className="font-mono text-[11px]">LiveCodeViewer</code>
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  components/canvas/
                </code>{' '}
                — registry,{' '}
                <code className="font-mono text-[11px]">SvgModuleRenderer</code>
                , per-topic draw functions
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  components/organisms/
                </code>{' '}
                — sidebar, properties panel, top navigation,{' '}
                <code className="font-mono text-[11px]">GameCanvas</code>,{' '}
                <code className="font-mono text-[11px]">GameSvgMount</code>,{' '}
                <code className="font-mono text-[11px]">GameDashboard</code>
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  components/molecules/
                </code>{' '}
                — <code className="font-mono text-[11px]">CuteHammer</code>{' '}
                (React SVG cursor overlay)
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  store/
                </code>{' '}
                — <code className="font-mono text-[11px]">useAppStore</code>{' '}
                (page + active module),{' '}
                <code className="font-mono text-[11px]">useEditorStore</code>{' '}
                (stage / timeline props),{' '}
                <code className="font-mono text-[11px]">useGameStore</code>{' '}
                (game demo score / timer / round state)
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  features/realtime-chart/
                </code>{' '}
                — streaming line chart engine + Zustand (
                <code className="font-mono text-[11px]">RealtimeChartPanel</code>)
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  features/graph-engine/
                </code>{' '}
                — graph model, commands,{' '}
                <code className="font-mono text-[11px]">GraphSvgEngine</code>,{' '}
                <code className="font-mono text-[11px]">GraphEditorPanel</code>
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  features/floor-map/
                </code>{' '}
                — warehouse floor map,{' '}
                <code className="font-mono text-[11px]">FloorMapSvgEngine</code>,{' '}
                <code className="font-mono text-[11px]">useFloorMapStore</code>
              </li>
            </ul>
            <p className="text-on-surface-variant">
              Plugins extend the SVG.js prototype at runtime. They are imported
              once in{' '}
              <code className="font-mono text-[11px] text-on-surface">
                main.tsx
              </code>{' '}
              (and again in{' '}
              <code className="font-mono text-[11px]">SvgCanvas</code> for
              clarity) so{' '}
              <code className="font-mono text-[11px]">.draggable()</code> and{' '}
              <code className="font-mono text-[11px]">.panZoom()</code> exist
              before any module runs.
            </p>
          </SectionCard>

          <SectionCard
            id="capabilities"
            title="SVG.js capabilities implemented"
          >
            <p>
              Each sidebar entry maps to a renderer registered in
              MODULE_RENDERERS. Implemented groups:
            </p>
            <div className="space-y-4 rounded-xl bg-surface-container-low p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Basics
                </p>
                <PillList
                  items={[
                    'basics-shapes',
                    'basics-paths',
                    'basics-text',
                    'basics-gradients',
                  ]}
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Interactions
                </p>
                <PillList
                  items={[
                    'interactions-draggable',
                    'interactions-panzoom',
                    'interactions-hover',
                    'interactions-click',
                  ]}
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Animations
                </p>
                <PillList
                  items={[
                    'animations-basic',
                    'animations-morph',
                    'animations-easing',
                    'animations-timeline',
                  ]}
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Advanced
                </p>
                <PillList
                  items={[
                    'advanced-masks',
                    'advanced-clippaths',
                    'advanced-nested',
                  ]}
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Showcase
                </p>
                <PillList
                  items={[
                    'showcase-realtime-chart',
                    'showcase-graph-engine',
                    'showcase-floor-map',
                    'showcase-game-demo',
                    'showcase-plugins',
                  ]}
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  <strong className="text-on-surface">Realtime chart</strong>: high-rate
                  mock stream, decimated paths (
                  <code className="font-mono">RealtimeLineChartEngine</code>).{' '}
                  <strong className="text-on-surface">Graph engine</strong>: workflow
                  graph, undo/redo, virtualization.{' '}
                  <strong className="text-on-surface">Floor map</strong>: zones,
                  pan/zoom, spatial hit grid.{' '}
                  <strong className="text-on-surface">Game demo</strong>: svg.js +
                  hammer (
                  <code className="font-mono">useGameStore</code>).{' '}
                  <strong className="text-on-surface">Plugin demo</strong>:{' '}
                  <code className="font-mono">draggable()</code>,{' '}
                  <code className="font-mono">panZoom()</code>,{' '}
                  <code className="font-mono">.animate()</code> + Zustand.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="feature-showcases" title="Feature showcases (Showcase)">
            <p>
              These modules render outside the shared{' '}
              <code className="font-mono text-[11px]">SvgCanvas</code> pipeline but
              stay registered in{' '}
              <code className="font-mono text-[11px]">registry.ts</code> with a
              no-op placeholder so ids stay valid. Entry:{' '}
              <code className="font-mono text-[11px]">ShowcasePage.tsx</code>.
            </p>

            <h3 className="text-base font-bold text-on-surface">
              Realtime chart —{' '}
              <code className="font-mono text-sm">showcase-realtime-chart</code>
            </h3>
            <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
              <li>
                Path:{' '}
                <code className="font-mono text-[11px] text-on-surface">
                  features/realtime-chart/
                </code>
              </li>
              <li>
                <code className="font-mono text-[11px]">ChartDataModel</code>, ring
                buffer, min–max decimation;{' '}
                <code className="font-mono text-[11px]">RealtimeLineChartEngine</code>{' '}
                syncs on <code className="font-mono text-[11px]">requestAnimationFrame</code>
              </li>
              <li>
                UI: <code className="font-mono text-[11px]">RealtimeChartPanel</code>,{' '}
                <code className="font-mono text-[11px]">useRealtimeChartStore</code>
              </li>
            </ul>

            <h3 className="mt-8 text-base font-bold text-on-surface">
              Graph engine —{' '}
              <code className="font-mono text-sm">showcase-graph-engine</code>
            </h3>
            <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
              <li>
                Path:{' '}
                <code className="font-mono text-[11px] text-on-surface">
                  features/graph-engine/
                </code>
              </li>
              <li>
                <code className="font-mono text-[11px]">GraphDocModel</code>, command
                history, JSON import/export;{' '}
                <code className="font-mono text-[11px]">GraphSvgEngine</code> applies{' '}
                <code className="font-mono text-[11px]">matrix(scale, pan)</code> on the
                world group
              </li>
              <li>
                Zoom: wheel toward cursor. Pan: middle mouse;{' '}
                <strong className="text-on-surface">Alt + drag</strong>;{' '}
                <strong className="text-on-surface">Space + drag</strong> (Space tracked
                via <code className="font-mono text-[11px]">keydown</code>/
                <code className="font-mono text-[11px]">keyup</code>, not{' '}
                <code className="font-mono text-[11px]">PointerEvent.getModifierState('Space')</code>
                ). Connect tool: drag empty canvas to pan
              </li>
              <li>
                Hook:{' '}
                <code className="font-mono text-[11px]">useGraphEditorRuntime</code>; UI:{' '}
                <code className="font-mono text-[11px]">GraphEditorPanel</code>
              </li>
            </ul>

            <h3 className="mt-8 text-base font-bold text-on-surface">
              Floor map —{' '}
              <code className="font-mono text-sm">showcase-floor-map</code>
            </h3>
            <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
              <li>
                Path:{' '}
                <code className="font-mono text-[11px] text-on-surface">
                  features/floor-map/
                </code>{' '}
                — custom SVG map (no Leaflet / Mapbox)
              </li>
              <li>
                Data: <code className="font-mono text-[11px]">useFloorMapStore</code>;
                hit tests: <code className="font-mono text-[11px]">ZoneSpatialGrid</code>{' '}
                in world space
              </li>
              <li>
                Render: <code className="font-mono text-[11px]">FloorMapSvgEngine</code>{' '}
                — zone groups use{' '}
                <code className="font-mono text-[11px]">
                  {`transform({ translateX, translateY })`}
                </code>{' '}
                (avoid <code className="font-mono text-[11px]">Group.move</code>, which
                accumulates drift). Grid extent unions content bbox with the visible
                viewport using{' '}
                <code className="font-mono text-[11px]">viewportPxToWorld</code>
              </li>
              <li>
                Mock layout defaults to <strong className="text-on-surface">14×8</strong>{' '}
                bays (<code className="font-mono text-[11px]">buildMockWarehouseFloor</code>
                ). Pan/zoom: wheel, middle mouse, Alt or Space + drag; multi-select with
                Cmd/Ctrl + click
              </li>
              <li>
                UI:{' '}
                <code className="font-mono text-[11px]">FloorMapPanel</code>, hook{' '}
                <code className="font-mono text-[11px]">useFloorMapRuntime</code>
              </li>
            </ul>

            <CodeBlock title="Public re-exports (examples)">{`// features/realtime-chart/index.ts
// features/graph-engine/index.ts
// features/floor-map/index.ts`}</CodeBlock>
          </SectionCard>

          <SectionCard id="game-demo" title="Game demo — mice &amp; hammer">
            <p>
              Module id{' '}
              <code className="font-mono text-[11px]">showcase-game-demo</code>{' '}
              swaps the usual{' '}
              <code className="font-mono text-[11px]">SvgCanvas</code> layout
              for a small reflex game: cartoon mice built with SVG.js spawn on
              an 800×600 viewBox, shrink over two seconds, and award{' '}
              <strong className="text-on-surface">+1</strong> when you hit the
              transparent hit-circle before the shrink finishes. A React SVG
              hammer follows the pointer; smash feedback uses CSS on refs (no
              click-state in React on the playfield) so the svg.js mount node is
              never reconciled away.
            </p>

            <p className="font-semibold text-on-surface">Files</p>
            <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  GameCanvas.tsx
                </code>{' '}
                — playfield, pointer move / down, hammer + impact burst (DOM +{' '}
                <code className="font-mono text-[11px]">editor.css</code>{' '}
                classes)
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  GameSvgMount.tsx
                </code>{' '}
                — <code className="font-mono text-[11px]">React.memo</code>;
                mounts one <code className="font-mono text-[11px]">SVG()</code>{' '}
                root; spawn loop, timers, hit handlers on the hit layer
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  GameDashboard.tsx
                </code>{' '}
                — score, high score, round timer (30s), start / end
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  useGameStore.ts
                </code>{' '}
                — <code className="font-mono text-[11px]">score</code>,{' '}
                <code className="font-mono text-[11px]">highScore</code>,{' '}
                <code className="font-mono text-[11px]">timer</code>,{' '}
                <code className="font-mono text-[11px]">gameActive</code>,{' '}
                <code className="font-mono text-[11px]">incrementScore</code>,{' '}
                <code className="font-mono text-[11px]">tickTimer</code>, …
              </li>
              <li>
                <code className="font-mono text-[11px] text-on-surface">
                  CuteHammer.tsx
                </code>{' '}
                — hammer art; hotspot in{' '}
                <code className="font-mono text-[11px]">GameCanvas</code> aligns
                viewBox point{' '}
                <code className="font-mono text-[11px]">(38, 42)</code> with the
                cursor
              </li>
            </ul>

            <p className="font-semibold text-on-surface">
              SVG.js — where it runs
            </p>
            <p className="text-on-surface-variant">
              All SVG.js calls live in{' '}
              <code className="font-mono text-[11px] text-on-surface">
                GameSvgMount.tsx
              </code>{' '}
              (import <code className="font-mono text-[11px]">SVG</code>, types{' '}
              <code className="font-mono text-[11px]">Element</code>,{' '}
              <code className="font-mono text-[11px]">G</code>,{' '}
              <code className="font-mono text-[11px]">Svg</code> from{' '}
              <code className="font-mono text-[11px]">@svgdotjs/svg.js</code>).
              The hammer / impact layer in{' '}
              <code className="font-mono text-[11px]">GameCanvas</code> is plain
              React + DOM/CSS — no SVG.js plugins (
              <code className="font-mono text-[11px]">draggable</code> /{' '}
              <code className="font-mono text-[11px]">panZoom</code>) are used
              for this module.
            </p>

            <p className="font-semibold text-on-surface">
              SVG.js API surface used in the game
            </p>
            <ul className="list-inside list-disc space-y-2 text-on-surface-variant">
              <li>
                <strong className="text-on-surface">Root document</strong> —{' '}
                <code className="font-mono text-[11px]">SVG()</code>,{' '}
                <code className="font-mono text-[11px]">.addTo()</code>,{' '}
                <code className="font-mono text-[11px]">.size()</code>,{' '}
                <code className="font-mono text-[11px]">.viewbox()</code>,{' '}
                <code className="font-mono text-[11px]">.css()</code>; teardown{' '}
                <code className="font-mono text-[11px]">.clear()</code>,{' '}
                <code className="font-mono text-[11px]">.remove()</code>.
              </li>
              <li>
                <strong className="text-on-surface">Shapes &amp; groups</strong>{' '}
                — <code className="font-mono text-[11px]">.group()</code>,{' '}
                <code className="font-mono text-[11px]">.path()</code>,{' '}
                <code className="font-mono text-[11px]">.circle()</code>,{' '}
                <code className="font-mono text-[11px]">.ellipse()</code>,{' '}
                <code className="font-mono text-[11px]">.line()</code>; wrapper{' '}
                <code className="font-mono text-[11px]">.addClass()</code>.
              </li>
              <li>
                <strong className="text-on-surface">Paint &amp; layout</strong>{' '}
                — <code className="font-mono text-[11px]">.fill()</code>,{' '}
                <code className="font-mono text-[11px]">.stroke()</code> (object
                or shorthand),{' '}
                <code className="font-mono text-[11px]">.opacity()</code>;{' '}
                <code className="font-mono text-[11px]">.center()</code>,{' '}
                <code className="font-mono text-[11px]">.translate()</code>,{' '}
                <code className="font-mono text-[11px]">.scale()</code>;{' '}
                <code className="font-mono text-[11px]">.bbox()</code> to center
                art before scaling.
              </li>
              <li>
                <strong className="text-on-surface">
                  Hit layer &amp; stacking
                </strong>{' '}
                — nearly invisible{' '}
                <code className="font-mono text-[11px]">circle</code> with{' '}
                <code className="font-mono text-[11px]">
                  .attr('pointer-events', 'all')
                </code>
                ; <code className="font-mono text-[11px]">.front()</code> so it
                sits above art; inner art{' '}
                <code className="font-mono text-[11px]">
                  .css('pointer-events', 'none')
                </code>
                .
              </li>
              <li>
                <strong className="text-on-surface">Animation runners</strong> —{' '}
                <code className="font-mono text-[11px]">.animate(ms)</code>{' '}
                chains for fade-in, shrink, miss tint/fade, hit pop/fade;{' '}
                <code className="font-mono text-[11px]">.ease('-')</code>{' '}
                (linear);{' '}
                <code className="font-mono text-[11px]">
                  {'.transform({ scale: 0.1 }, true)'}
                </code>{' '}
                (shrink) /{' '}
                <code className="font-mono text-[11px]">
                  {'.transform({ scale: 1.22 }, true)'}
                </code>{' '}
                (hit pop);{' '}
                <code className="font-mono text-[11px]">
                  runner.after(() =&gt; …)
                </code>{' '}
                for sequencing;{' '}
                <code className="font-mono text-[11px]">.stop(true, true)</code>{' '}
                on successful hit to cancel the shrink runner.
              </li>
              <li>
                <strong className="text-on-surface">Events</strong> —{' '}
                <code className="font-mono text-[11px]">
                  hit.on('pointerdown', …)
                </code>{' '}
                and{' '}
                <code className="font-mono text-[11px]">
                  hit.on('click', …)
                </code>{' '}
                (both call the same handler).
              </li>
              <li>
                <strong className="text-on-surface">
                  Query &amp; “miss” tint
                </strong>{' '}
                —{' '}
                <code className="font-mono text-[11px]">
                  root.find('path, circle, ellipse').each(…)
                </code>{' '}
                then per-node{' '}
                <code className="font-mono text-[11px]">.fill('#ba1a1a')</code>{' '}
                where applicable.
              </li>
            </ul>

            <CodeBlock title="SVG.js import (game mount)">{`import { SVG, type Element, type G, type Svg } from '@svgdotjs/svg.js';`}</CodeBlock>

            <CodeBlock title="Registry stub (canvas still has a key for the module id)">{`// registry.ts — real game lives in GameSvgMount, not renderSvgModule
'showcase-game-demo': drawTargetPracticePlaceholder,`}</CodeBlock>

            <CodeBlock title="Isolated svg.js mount (memo)">{`// GameSvgMount.tsx — only re-renders when gameActive changes
const GameSvgMount = memo(function GameSvgMount({ gameActive }: { gameActive: boolean }) {
  // SVG().addTo(canvasRef) once; spawnTarget + hit.on('pointerdown' | 'click', …)
});`}</CodeBlock>

            <CodeBlock title="Game store (excerpt)">{`// useGameStore.ts
export const GAME_ROUND_SECONDS = 30;

incrementScore: () => set((s) => ({ score: s.score + 1 })),
tickTimer: () => { /* decrements timer; ends round at 0 */ },`}</CodeBlock>
          </SectionCard>

          <SectionCard id="showcase-code" title="Code walkthrough">
            <p>
              Short excerpts from this repository illustrating the integration
              pattern.
            </p>

            <CodeBlock title="1 · Register official plugins (entry)">{`// src/main.tsx
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.panzoom.js';`}</CodeBlock>

            <CodeBlock title="2 · Mount svg.js in React + Strict Mode–safe cleanup">{`// SvgCanvas — effect body (simplified)
const draw = SVG().addTo(mountNode).size('100%', '100%');
renderSvgModule(draw, activeModule, moduleProps);

return () => {
  try { draw.panZoom(false); } catch { /* plugin optional */ }
  draw.clear();
  draw.remove();
  mountNode.innerHTML = '';
};`}</CodeBlock>

            <CodeBlock title="3 · Dispatch render by module id">{`import { renderSvgModule } from '../components/canvas';

renderSvgModule(draw, 'basics-shapes', {
  duration: 800,
  fill: '#2b3896',
  strokeWidth: 2,
  easing: 'easeInOutCubic',
  panEnabled: true,
  zoomEnabled: true,
});`}</CodeBlock>

            <CodeBlock title="4 · Shared stage setup inside a renderer">{`import { prepareStage } from './core/canvasHelpers';

export function drawExample(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw); // clear, viewBox, content group
  content.rect(120, 80).fill(props.fill ?? '#2b3896').move(100, 100);
}`}</CodeBlock>

            <CodeBlock title="5 · Showcase module: plugins + animation (pattern)">{`// drawPluginShowcase — illustrative fragment
const { content } = prepareStage(draw);
draw.panZoom({ panning: true, wheelZoom: true, pinchZoom: true });

const node = content.circle(52).fill(fill).stroke(stroke).move(348, 248);
node.draggable(true);
node.animate(duration).ease(ease).move(348, 200).loop(0, true);`}</CodeBlock>

            <CodeBlock title="6 · Generated snippet for the live code panel">{`import { snippetFromStage } from '../utils/snippetFromStage';

const text = snippetFromStage(stageConfiguration, activeModuleId);`}</CodeBlock>
          </SectionCard>

          <SectionCard id="registry" title="Module registry">
            <p>
              All ids exposed in{' '}
              <code className="font-mono text-[11px]">moduleNav.ts</code> must
              exist in{' '}
              <code className="font-mono text-[11px]">MODULE_RENDERERS</code> (
              <code className="font-mono text-[11px]">registry.ts</code>).
              Unknown keys fall back to a safe default renderer; in development
              a console warning is emitted.
            </p>
            <CodeBlock title="Registry pattern">{`export const MODULE_RENDERERS: Record<string, SvgModuleRenderer> = {
  'showcase-plugins': drawPluginShowcase,
  'basics-shapes': drawShapes,
  'interactions-draggable': drawDraggable,
  // …animations, advanced, aliases (e.g. basics → drawShapes)
};

export function renderSvgModule(draw: Svg, activeModule: string, moduleProps: SvgModuleProps) {
  resolveRenderer(activeModule)(draw, moduleProps);
}`}</CodeBlock>
            <p className="text-xs text-on-surface-variant">
              Types: <code className="font-mono">SvgModuleProps</code>{' '}
              (duration, fill, strokeWidth, easing, pan/zoom flags) and{' '}
              <code className="font-mono">
                SvgModuleRenderer = (draw, props) =&gt; void
              </code>
              .
            </p>
          </SectionCard>

          <SectionCard id="state" title="State & UI wiring">
            <p>
              <code className="font-mono text-[11px]">useAppStore</code> holds{' '}
              <strong className="text-on-surface">activePage</strong> (
              <code className="font-mono text-[11px]">
                showcase | docs
              </code>
              ) and <strong className="text-on-surface">activeModuleId</strong>.{' '}
              <code className="font-mono text-[11px]">useEditorStore</code>{' '}
              holds stage configuration consumed by{' '}
              <code className="font-mono text-[11px]">PropertiesPanel</code> and
              mirrored into{' '}
              <code className="font-mono text-[11px]">SvgCanvas</code> as{' '}
              <code className="font-mono text-[11px]">moduleProps</code>.
              Feature panels add their own Zustand slices (e.g.{' '}
              <code className="font-mono text-[11px]">useGraphUiStore</code>,{' '}
              <code className="font-mono text-[11px]">useFloorMapStore</code>,{' '}
              <code className="font-mono text-[11px]">useRealtimeChartStore</code>
              ).
            </p>
            <CodeBlock title="Navigation store">{`import { useAppStore } from '../store/useAppStore';

const activePage = useAppStore((s) => s.activePage);
const setActivePage = useAppStore((s) => s.setActivePage);
const activeModuleId = useAppStore((s) => s.activeModuleId);
const setActiveModuleId = useAppStore((s) => s.setActiveModuleId);`}</CodeBlock>
          </SectionCard>

          <SectionCard id="setup" title="Run locally">
            <p>Clone, install, and start the Vite dev server:</p>
            <CodeBlock>{`git clone <your-repo>
cd SVGJS
npm install
npm run dev`}</CodeBlock>
            <p className="text-on-surface-variant">
              Production:{' '}
              <code className="font-mono text-xs">npm run build</code> then{' '}
              <code className="font-mono text-xs">npm run preview</code>.
            </p>
            <p>
              <span className="font-semibold text-on-surface">
                Dependencies:
              </span>{' '}
              <code className="font-mono text-[11px]">react</code>,{' '}
              <code className="font-mono text-[11px]">react-dom</code>,{' '}
              <code className="font-mono text-[11px]">@svgdotjs/svg.js</code>,{' '}
              <code className="font-mono text-[11px]">
                @svgdotjs/svg.draggable.js
              </code>
              ,{' '}
              <code className="font-mono text-[11px]">
                @svgdotjs/svg.panzoom.js
              </code>
              , <code className="font-mono text-[11px]">zustand</code>.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
