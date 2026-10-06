import type { Point, Rect, Shape, Viewport } from '../types/shape';

/**
 * Экранные координаты мыши → координаты канваса.
 * Без этого пересчёта фигуры «уезжают» относительно курсора при зуме и панорамировании.
 */
export function screenToCanvas(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.x) / viewport.zoom,
    y: (screen.y - viewport.y) / viewport.zoom,
  };
}

/** Координаты канваса → экранные (обратная сторона той же формулы). */
export function canvasToScreen(canvas: Point, viewport: Viewport): Point {
  return {
    x: canvas.x * viewport.zoom + viewport.x,
    y: canvas.y * viewport.zoom + viewport.y,
  };
}

/**
 * Нормализованный прямоугольник по двум точкам перетаскивания:
 * корректно работает при протягивании мыши в любую сторону (вверх/влево).
 */
export function normalizedRect(a: Point, b: Point): Rect {
  return {
    position: {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
    },
    size: {
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y),
    },
  };
}

/** Попадает ли точка канваса в фигуру (поворот пока не учитываем — rotation = 0). */
export function hitTestShape(shape: Shape, point: Point): boolean {
  if (shape.type === 'rectangle') {
    return (
      point.x >= shape.position.x &&
      point.x <= shape.position.x + shape.size.width &&
      point.y >= shape.position.y &&
      point.y <= shape.position.y + shape.size.height
    );
  }
  const cx = shape.position.x + shape.size.width / 2;
  const cy = shape.position.y + shape.size.height / 2;
  const rx = shape.size.width / 2;
  const ry = shape.size.height / 2;
  const dx = (point.x - cx) / rx;
  const dy = (point.y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}