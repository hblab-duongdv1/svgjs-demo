import { useMemo, useState } from 'react';

import GameCanvas from '../components/organisms/GameCanvas';
import GameDashboard from '../components/organisms/GameDashboard';
import SidebarMenu from '../components/organisms/SidebarMenu';
import GraphEditorPanel from '../features/graph-engine/components/GraphEditorPanel';
import FloorMapPanel from '../features/floor-map/components/FloorMapPanel';
import RealtimeChartPanel from '../features/realtime-chart/components/RealtimeChartPanel';
import PropertiesPanel from '../components/organisms/PropertiesPanel';
import SvgCanvas from '../features/svg-playground/components/SvgCanvas';
import { useAppStore } from '../store/useAppStore';
import { useEditorStore } from '../store/useEditorStore';
import { snippetFromStage } from '../utils/snippetFromStage';

/**
 * SVG playground: module sidebar, canvas (svg.js), properties + live code snippet.
 * Header comes from `MainLayout` in `App.tsx`.
 */
export default function ShowcasePage() {
  const stageConfiguration = useEditorStore((s) => s.stageConfiguration);
  const setStageConfiguration = useEditorStore((s) => s.setStageConfiguration);
  const activeModuleId = useAppStore((s) => s.activeModuleId);
  const setActiveModuleId = useAppStore((s) => s.setActiveModuleId);

  const snippetText = useMemo(
    () => snippetFromStage(stageConfiguration, activeModuleId),
    [stageConfiguration, activeModuleId],
  );

  const moduleProps = useMemo(
    () => ({
      duration: stageConfiguration.durationMs,
      fill: stageConfiguration.fillColor,
      strokeWidth: stageConfiguration.strokeWidth,
      easing: stageConfiguration.easingFunction,
      panEnabled: stageConfiguration.panEnabled,
      zoomEnabled: stageConfiguration.zoomEnabled,
      forceUseGroupColors: stageConfiguration.forceUseGroupColors,
      forceNodeColor: stageConfiguration.forceNodeColor,
      forceNodeCount: stageConfiguration.forceNodeCount,
      forceNodeSize: stageConfiguration.forceNodeSize,
      forceLinkDistance: stageConfiguration.forceLinkDistance,
      forceRepulsion: stageConfiguration.forceRepulsion,
    }),
    [stageConfiguration],
  );

  const isGameDemo = activeModuleId === 'showcase-game-demo';
  const isRealtimeChart = activeModuleId === 'showcase-realtime-chart';
  const isGraphEngine = activeModuleId === 'showcase-graph-engine';
  const isFloorMap = activeModuleId === 'showcase-floor-map';

  const [modulesDrawerOpen, setModulesDrawerOpen] = useState(false);
  const [propertiesDrawerOpen, setPropertiesDrawerOpen] = useState(false);

  const closeDrawers = () => {
    setModulesDrawerOpen(false);
    setPropertiesDrawerOpen(false);
  };

  const selectModule = (id: string) => {
    setActiveModuleId(id);
    setModulesDrawerOpen(false);
  };

  const anyDrawerOpen = modulesDrawerOpen || propertiesDrawerOpen;

  return (
    <main className="relative flex h-[calc(100vh-4rem)] min-h-0">
      {anyDrawerOpen ? (
        <button
          type="button"
          aria-label="Close overlay"
          className="fixed inset-0 top-16 z-[35] bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={closeDrawers}
        />
      ) : null}

      <SidebarMenu
        mobileOpen={modulesDrawerOpen}
        selectedModuleId={activeModuleId}
        onSelectModule={selectModule}
      />
      {isGameDemo ? (
        <section className="relative flex flex-grow flex-col items-center gap-6 overflow-y-auto bg-surface p-4 md:ml-64 md:mr-80 md:p-8">
          <GameDashboard />
          <GameCanvas />
        </section>
      ) : isRealtimeChart ? (
        <section className="relative flex flex-grow flex-col items-center gap-6 overflow-y-auto bg-surface p-4 md:ml-64 md:mr-80 md:p-8">
          <RealtimeChartPanel />
        </section>
      ) : isGraphEngine ? (
        <section className="relative flex flex-grow flex-col items-center gap-6 overflow-y-auto bg-surface p-4 md:ml-64 md:mr-80 md:p-8">
          <GraphEditorPanel />
        </section>
      ) : isFloorMap ? (
        <section
          className="relative flex min-h-0 flex-grow flex-col items-center gap-6 overflow-y-auto overflow-x-hidden bg-surface p-4 [overflow-anchor:none] md:ml-64 md:mr-80 md:p-8"
          style={{ overflowAnchor: 'none' }}
        >
          <FloorMapPanel />
        </section>
      ) : (
        <SvgCanvas activeModule={activeModuleId} moduleProps={moduleProps} />
      )}
      <PropertiesPanel
        mobileOpen={propertiesDrawerOpen}
        selectedModuleId={activeModuleId}
        stageConfiguration={stageConfiguration}
        onStageConfigChange={setStageConfiguration}
        snippetText={snippetText}
      />

      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[55] flex justify-between gap-3 md:hidden">
        <button
          type="button"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-[var(--shadow-ambient)] transition-transform active:scale-95"
          aria-label="Open modules list"
          aria-expanded={modulesDrawerOpen}
          onClick={() => {
            setPropertiesDrawerOpen(false);
            setModulesDrawerOpen((o) => !o);
          }}
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <button
          type="button"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-[var(--shadow-ambient)] transition-transform active:scale-95"
          aria-label="Open properties and code"
          aria-expanded={propertiesDrawerOpen}
          onClick={() => {
            setModulesDrawerOpen(false);
            setPropertiesDrawerOpen((o) => !o);
          }}
        >
          <span className="material-symbols-outlined text-2xl">tune</span>
        </button>
      </div>
    </main>
  );
}
