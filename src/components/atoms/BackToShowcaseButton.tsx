import { useAppStore } from '../../store/useAppStore';

const variantClass = {
  docs: 'mb-6 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90',
  hero: 'mb-6 rounded-lg bg-surface-container-lowest/90 px-4 py-2 text-sm font-bold text-primary backdrop-blur-sm transition-opacity hover:opacity-90',
} as const;

export default function BackToShowcaseButton(props: {
  variant: keyof typeof variantClass;
}) {
  const setActivePage = useAppStore((s) => s.setActivePage);

  return (
    <button
      type="button"
      className={variantClass[props.variant]}
      onClick={() => setActivePage('showcase')}
    >
      ← Back to Showcase
    </button>
  );
}
