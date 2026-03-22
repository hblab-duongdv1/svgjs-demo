import { useGraphUiStore } from '../store/graphUiStore';

/** Narrow subscription helpers for selection-centric UI. */
export function useSelectedNodeIds(): string[] {
  return useGraphUiStore((s) => s.selectedIds);
}

export function useGraphTool() {
  return useGraphUiStore((s) => s.tool);
}
