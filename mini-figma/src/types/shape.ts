/**
 * Единый язык проекта: все модули говорят об одних и тех же сущностях одинаково.
 * TypeScript по этим типам ловит ошибки ещё до запуска приложения.
 */

export type Tool = 'select' | 'rectangle' | 'ellipse';

export type ShapeType = 'rectangle' | 'ellipse';

/** Координаты в пикселях. Могут быть экранными или канвасными — зависит от контекста. */
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Прямоугольник: позиция левого верхнего угла + размер. Возвращается нормализованным. */
export interface Rect {
  position: Point;
  size: Size;
}

/** Камера холста: сдвиг начала координат канваса в экранных пикселях + масштаб. */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Shape {
  id: string;
  type: ShapeType;
  /** Левый верхний угол фигуры в координатах канваса. */
  position: Point;
  size: Size;
  fill: string;
  stroke: string;
  strokeWidth: number;
  /** Угол поворота в градусах. */
  rotation: number;
  selected: boolean;
}

/** Частичное изменение фигуры (id менять нельзя). */
export type ShapePatch = Partial<Omit<Shape, 'id'>>;