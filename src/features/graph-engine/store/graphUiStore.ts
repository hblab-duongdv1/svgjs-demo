import { create } from 'zustand';

export type GraphTool = 'select' | 'connect';

/** First click in connect mode: which port was anchored (left=in, right=out). */
export type ConnectAnchor = { nodeId: string; port: 'in' | 'out' };

export type GraphUiState = {
  tool: GraphTool;
  selectedIds: string[];
  pendingConnect: ConnectAnchor | null;
  setTool: (t: GraphTool) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  /** Shift = additive multi-select (nodes and marquee). */
  selectNode: (nodeId: string, additive: boolean) => void;
  setPendingConnect: (v: ConnectAnchor | null) => void;
  addToSelection: (ids: string[]) => void;
};

export const useGraphUiStore = create<GraphUiState>((set, get) => ({
  tool: 'select',
  selectedIds: [],
  pendingConnect: null,
  setTool: (t) =>
    set({
      tool: t,
      pendingConnect: t === 'select' ? null : get().pendingConnect,
    }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  selectNode: (nodeId, additive) =>
    set((s) => {
      if (additive) {
        const has = s.selectedIds.includes(nodeId);
        return {
          selectedIds: has
            ? s.selectedIds.filter((id) => id !== nodeId)
            : [...s.selectedIds, nodeId],
        };
      }
      return { selectedIds: [nodeId] };
    }),
  setPendingConnect: (v) => set({ pendingConnect: v }),
  addToSelection: (ids) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      for (const id of ids) next.add(id);
      return { selectedIds: [...next] };
    }),
}));
