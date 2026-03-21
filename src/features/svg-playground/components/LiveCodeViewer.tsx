import { useMemo, useState } from 'react';

export default function LiveCodeViewer(props: {
  snippetText: string;
  onCopy?: () => void;
}) {
  const { snippetText, onCopy } = props;

  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  );

  const copyLabel = useMemo(() => {
    if (copyState === 'copied') return 'Copied';
    if (copyState === 'error') return 'Copy failed';
    return 'Copy';
  }, [copyState]);

  const handleCopy = async () => {
    try {
      onCopy?.();
      await navigator.clipboard.writeText(snippetText);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1200);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-[#282c34] p-6"
      style={{ margin: '0 1.5rem 1.5rem 1.5rem' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#5c6370' }}
        >
          Live Code
        </span>
        <button
          type="button"
          className="text-white/40 hover:text-white transition-colors"
          onClick={handleCopy}
          aria-label="Copy live code"
        >
          <span
            className="material-symbols-outlined text-sm"
            aria-hidden="true"
          >
            content_copy
          </span>
        </button>
      </div>

      <div className="flex-grow overflow-auto font-mono text-xs">
        <pre
          className="whitespace-pre-wrap text-[#abb2bf]"
          style={{ margin: 0 }}
        >
          {snippetText}
        </pre>
      </div>

      <div
        className="mt-3 text-[10px] font-mono uppercase tracking-tighter"
        style={{ color: '#5c6370' }}
      >
        {copyLabel}
      </div>
    </div>
  );
}
