import { useEffect } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useViewport } from '../hooks/useViewport';
import type { Point, Shape as ShapeModel, ShapeType, Tool, Viewport } from '../types/shape';
import ShapeView from './Shape';

const GRID_SPACING = 24; // размер ячейки сетки в координатах канваса

interface CanvasProps {
  shapes: ShapeModel[];
  /** Предпросмотр фигуры, которую сейчас «растягивают» мышью. */
  draft: ShapeModel | null;
  activeTool: Tool;
  /** Идёт ли перенос выделенной фигуры (нужно для курсора и слушателей мыши). */
  isMoving: boolean;
  onDrawStart: (type: ShapeType, screen: Point, viewport: Viewport) => void;
  onDrawMove: (screen: Point, viewport: Viewport) => void;
  onDrawEnd: () => void;
  onSelectPointerDown: (screen: Point, viewport: Viewport) => void;
  onMove: (screen: Point, viewport: Viewport) => void;
  onMoveEnd: () => void;
}

/**
 * Холст на весь экран: сетка на фоне, обработка мыши.
 * Маршрутизация: пробел + мышь — пан, инструмент фигуры — перетаскивание,
 * select — выделение и перенос фигуры.
 * Координаты мыши в канвасные переводят хуки через geometry.ts;
 * сетка и фигуры двигаются/масштабируются вместе с камерой.
 */
export default function Canvas({
  shapes,
  draft,
  activeTool,
  isMoving,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  onSelectPointerDown,
  onMove,
  onMoveEnd,
}: CanvasProps) {
  const { viewport, isSpacePressed, isPanning, onPointerDown, onWheel } = useViewport();
  const isDrafting = draft !== null;

  // Рисование: следим за мышью на уровне окна, чтобы перетаскивание
  // не прерывалось за пределами холста.
  useEffect(() => {
    if (!isDrafting) return;
    const onMouseMove = (e: MouseEvent) => onDrawMove({ x: e.clientX, y: e.clientY }, viewport);
    const onMouseUp = () => onDrawEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDrafting, onDrawMove, onDrawEnd, viewport]);

  // Перенос выделенной фигуры: тоже слушаем на уровне окна.
  useEffect(() => {
    if (!isMoving) return;
    const onMouseMove = (e: MouseEvent) => onMove({ x: e.clientX, y: e.clientY }, viewport);
    const onMouseUp = () => onMoveEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isMoving, onMove, onMoveEnd, viewport]);

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (isSpacePressed) {
      onPointerDown(e); // панорамирование
      return;
    }
    if (e.button !== 0) return; // только левая кнопка
    const screen = { x: e.clientX, y: e.clientY };
    if (activeTool === 'select') {
      onSelectPointerDown(screen, viewport);
    } else {
      onDrawStart(activeTool, screen, viewport);
    }
  };

  const cursor = isPanning
    ? 'grabbing'
    : isSpacePressed
      ? 'grab'
      : isMoving
        ? 'move'
        : activeTool === 'select'
          ? 'default'
          : 'crosshair';
  const gridSize = GRID_SPACING * viewport.zoom;

  return (
    <div
      className="absolute inset-0 touch-none select-none overflow-hidden bg-[#2c2c2c]"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onWheel={onWheel}
    >
      {/* Сетка: рисуется в экранных пикселях, сдвигается вместе с камерой, линии всегда 1px */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {/* Мир: фигуры лежат в координатах канваса, камера — это трансформация.
          Вместе с камерой масштабируются и фигуры, и рамка выделения. */}
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <ShapeView key={shape.id} shape={shape} />
        ))}
        {draft && <ShapeView key={draft.id} shape={draft} />}
      </div>
    </div>
  );
}