import { create } from 'zustand';

import type { EditorUIState, StageConfiguration } from './editorTypes';

export type EditorStore = {
  stageConfiguration: StageConfiguration;
  editorUIState: EditorUIState;

  setStageConfiguration: (update: Partial<StageConfiguration>) => void;
  setIsPlaying: (isPlaying: boolean) => void;
};

const defaultStageConfiguration: StageConfiguration = {
  durationMs: 800,
  fillColor: '#2b3896',
  strokeWidth: 2,
  easingFunction: 'easeInOutCubic',
  panEnabled: true,
  zoomEnabled: true,
  forceUseGroupColors: true,
  forceNodeColor: '#1f77b4',
  forceNodeCount: 77,
  forceNodeSize: 5,
  forceLinkDistance: 44,
  forceRepulsion: 2800,
};

const defaultEditorUIState: EditorUIState = {
  isPlaying: false,
};

export const useEditorStore = create<EditorStore>((set) => ({
  stageConfiguration: defaultStageConfiguration,
  editorUIState: defaultEditorUIState,

  setStageConfiguration: (update) =>
    set((state) => ({
      stageConfiguration: { ...state.stageConfiguration, ...update },
    })),

  setIsPlaying: (isPlaying) =>
    set((state) => ({
      editorUIState: { ...state.editorUIState, isPlaying },
    })),
}));
