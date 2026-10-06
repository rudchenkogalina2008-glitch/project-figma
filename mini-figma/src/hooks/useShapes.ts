import { useCallback, useMemo, useState } from 'react';
import { hitTestShape, normalizedRect, screenToCanvas } from '../utils/geometry';
import type { Point, Shape, ShapePatch, ShapeType, Size, Viewport } from '../types/shape';

let idCounter = 0;
const nextId = (): string => {
  idCounter += 1;
  return `shape-${Date.now().toString(36)}-${idCounter}`;
};

const DEFAULT_FILL: Record<ShapeType, string> = {
  rectangle: '#4c8dff',
  ellipse: '#e5484d',
};

function createShape(type: ShapeType, position: Point, size: Size): Shape {
  return {
    id: nextId(),
    type,
    position,
    size,
    fill: DEFAULT_FILL[type],
    stroke: '#ffffff',
    strokeWidth: 0,
    rotation: 0,
    selected: false,
  };
}

/** Промежуточное состояние перетаскивания: «растягиваем» фигуру от якоря к курсору. */
interface DraftState {
  id: string;
  type: ShapeType;
  /** Точка, где нажали мышь, в координатах канваса. */
  start: Point;
  /** Текущая позиция курсора в координатах канваса. */
  current: Point;
}

/** Состояние переноса выделенной фигуры. */
interface MoveState {
  id: string;
  /** Смещение между точкой захвата (курсор) и левым верхним углом фигуры, в канвасных координатах. */
  grabOffset: Point;
}

// Демо-фигуры — чтобы на старте было видно, что холст «живой».
const initialShapes: Shape[] = [
  { ...createShape('rectangle', { x: -140, y: -100 }, { width: 180, height: 130 }) },
  { ...createShape('ellipse', { x: 60, y: 40 }, { width: 150, height: 150 }) },
];

/**
 * Состояние фигур: список, добавление, изменение, выделение.
 * Здесь же живут жесты инструментом select — выделение, перенос фигуры — и создание
 * перетаскиванием. Все экранные координаты переводятся в канвасные через
 * src/utils/geometry.ts с учётом зума и панорамирования (viewport из Canvas).
 */
export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [move, setMove] = useState<MoveState | null>(null);

  /** Добавить готовую фигуру (остальные снимаются с выделения). */
  const addShape = useCallback((type: ShapeType, position: Point, size: Size): Shape => {
    const shape: Shape = { ...createShape(type, position, size), selected: true };
    setShapes((prev) => [...prev.map((s) => ({ ...s, selected: false })), shape]);
    setSelectedId(shape.id);
    return shape;
  }, []);

  const updateShape = useCallback((id: string, patch: ShapePatch) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id);
    setShapes((prev) => prev.map((s) => ({ ...s, selected: s.id === id })));
  }, []);

  /**
   * Клик инструментом select по канвасу: попали в фигуру — выделяем её и захватываем
   * для переноса (сохраняя отступ между курсором и углом фигуры); пусто — сброс выделения.
   */
  const onSelectPointerDown = useCallback(
    (screen: Point, viewport: Viewport) => {
      const point = screenToCanvas(screen, viewport);
      for (let i = shapes.length - 1; i >= 0; i -= 1) {
        const shape = shapes[i];
        if (hitTestShape(shape, point)) {
          selectShape(shape.id);
          setMove({
            id: shape.id,
            grabOffset: { x: point.x - shape.position.x, y: point.y - shape.position.y },
          });
          return;
        }
      }
      selectShape(null);
      setMove(null);
    },
    [shapes, selectShape],
  );

  /** Перенос захваченной фигуры: экранная точка → канвасная, минус отступ захвата. */
  const updateMove = useCallback(
    (screen: Point, viewport: Viewport) => {
      if (!move) return;
      const point = screenToCanvas(screen, viewport);
      updateShape(move.id, {
        position: { x: point.x - move.grabOffset.x, y: point.y - move.grabOffset.y },
      });
    },
    [move, updateShape],
  );

  const endMove = useCallback(() => setMove(null), []);

  /** Начало перетаскивания: экранная точка → канвасная (учёт зума и пана). */
  const startDraft = useCallback((type: ShapeType, screen: Point, viewport: Viewport) => {
    const start = screenToCanvas(screen, viewport);
    setDraft({ id: nextId(), type, start, current: start });
  }, []);

  /** Курсор двинулся — обновляем «текущую» точку перетаскивания в канвасных координатах. */
  const updateDraft = useCallback((screen: Point, viewport: Viewport) => {
    setDraft((d) => (d ? { ...d, current: screenToCanvas(screen, viewport) } : d));
  }, []);

  const cancelDraft = useCallback(() => setDraft(null), []);

  /** Отпустили мышь: фигурируем результат или отменяем (слишком маленький клик). */
  const commitDraft = useCallback(() => {
    if (!draft) return;
    const { position, size } = normalizedRect(draft.start, draft.current);
    setDraft(null);
    // Клик без протягивания (меньше 4×4 px) — фигуру не создаём.
    if (size.width < 4 && size.height < 4) return;
    addShape(draft.type, position, size);
  }, [draft, addShape]);

  /** Предпросмотр фигуры во время перетаскивания (рисуется поверх существующих). */
  const draftShape = useMemo<Shape | null>(() => {
    if (!draft) return null;
    const { position, size } = normalizedRect(draft.start, draft.current);
    return {
      id: draft.id,
      type: draft.type,
      position,
      size,
      fill: DEFAULT_FILL[draft.type],
      stroke: '#ffffff',
      strokeWidth: 0,
      rotation: 0,
      selected: false,
    };
  }, [draft]);

  return {
    shapes,
    selectedId,
    draft: draftShape,
    isMoving: move !== null,
    addShape,
    updateShape,
    selectShape,
    onSelectPointerDown,
    updateMove,
    endMove,
    startDraft,
    updateDraft,
    cancelDraft,
    commitDraft,
  };
}