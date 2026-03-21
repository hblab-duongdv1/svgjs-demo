import BackToShowcaseButton from '../components/atoms/BackToShowcaseButton';

const DISCUSSIONS = [
  {
    id: '1',
    title: 'Best way to batch svg.js updates with React state?',
    author: '@dev_mai',
    excerpt:
      'Looking for patterns to avoid full redraw when only fill changes…',
    time: '2h ago',
  },
  {
    id: '2',
    title: 'Pan/zoom + draggable: event order tips',
    author: '@svg_fan',
    excerpt:
      'Sometimes drag steals the gesture from panZoom — anyone solved layering?',
    time: 'Yesterday',
  },
  {
    id: '3',
    title: 'Showcase: plugin demo feedback',
    author: '@studio_team',
    excerpt: 'Love the combined draggable + panZoom example. Docs PR welcome!',
    time: '3d ago',
  },
] as const;

const EXTERNAL_LINK_CLASS =
  'inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-primary shadow-[var(--shadow-ambient)] transition-opacity hover:opacity-90';

/**
 * Community landing (US4). External links open in a new tab; no 1px layout borders (tonal cards only).
 */
export default function CommunityPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface font-body text-on-surface">
      <section
        className="relative overflow-hidden px-6 pb-12 pt-8 sm:px-10"
        style={{
          background:
            'linear-gradient(135deg, #2b3896 0%, #4551af 55%, #2b3896 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-3xl">
          <BackToShowcaseButton variant="hero" />

          <p className="text-xs font-black uppercase tracking-widest text-white/70">
            Community
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.02em] text-white">
            Build & share with SVG.js Studio
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85">
            Connect with others working on vector UIs, svg.js recipes, and this
            demo. Links below open in a new tab.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://github.com/svgdotjs/svg.js"
              target="_blank"
              rel="noopener noreferrer"
              className={EXTERNAL_LINK_CLASS}
            >
              <span
                className="material-symbols-outlined text-lg"
                aria-hidden="true"
              >
                code
              </span>
              GitHub
            </a>
            <a
              href="https://discord.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={EXTERNAL_LINK_CLASS}
            >
              <span
                className="material-symbols-outlined text-lg"
                aria-hidden="true"
              >
                forum
              </span>
              Discord
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <h2 className="font-display text-xl font-black tracking-tight text-primary">
          Recent Discussions
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Sample threads for the demo — replace with a real feed or API later.
        </p>

        <ul className="mt-8 space-y-4" aria-label="Recent discussions">
          {DISCUSSIONS.map((d) => (
            <li key={d.id}>
              <article className="rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
                <h3 className="font-display text-lg font-bold text-on-surface">
                  {d.title}
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {d.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    {d.author}
                  </span>
                  <span className="font-mono tabular-nums opacity-70">
                    {d.time}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
