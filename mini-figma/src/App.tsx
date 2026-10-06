import { useState } from 'react';
import Canvas from './components/Canvas';
import LayersPanel from './components/LayersPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import { useHotkeys } from './hooks/useHotkeys';
import { useShapes } from './hooks/useShapes';
import type { Tool } from './types/shape';

export default function App() {
  const {
    shapes,
    selectedId,
    draft,
    isMoving,
    updateShape,
    selectShape,
    onSelectPointerDown,
    updateMove,
    endMove,
    startDraft,
    updateDraft,
    commitDraft,
  } = useShapes();
  const [activeTool, setActiveTool] = useState<Tool>('select');

  useHotkeys();

  const selectedShape = shapes.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#2c2c2c] text-neutral-200">
      <Canvas
        shapes={shapes}
        draft={draft}
        activeTool={activeTool}
        isMoving={isMoving}
        onDrawStart={startDraft}
        onDrawMove={updateDraft}
        onDrawEnd={commitDraft}
        onSelectPointerDown={onSelectPointerDown}
        onMove={updateMove}
        onMoveEnd={endMove}
      />

      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Правая колонка: свойства сверху, слои под ними */}
      <div className="absolute bottom-4 right-4 top-4 flex w-64 flex-col gap-4">
        <PropertiesPanel selectedShape={selectedShape} onUpdateShape={updateShape} />
        <LayersPanel shapes={shapes} onSelectShape={selectShape} />
      </div>
    </div>
  );
}