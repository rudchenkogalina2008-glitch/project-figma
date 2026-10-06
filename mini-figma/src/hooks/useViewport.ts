import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import type { Viewport } from '../types/shape';
import { screenToCanvas } from '../utils/geometry';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_SPEED = 0.0015;

/**
 * Камера холста: панорамирование (пробел + мышь), зум колесом 10–400%
 * с привязкой к точке под курсором, центрирование начала координат при старте.
 * Чистая логика без интерфейса — компонент только привязывает обработчики.
 */
export function useViewport() {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastScreenPoint = useRef({ x: 0, y: 0 });

  // При старте помещаем начало координат канваса в центр экрана.
  useEffect(() => {
    setViewport({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1 });
  }, []);

  // Пробел удерживается — можно панорамировать.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (isTyping) return;
      e.preventDefault(); // чтобы пробел не прокручивал страницу
      setIsSpacePressed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Пока идёт панорамирование — тянем камеру за мышью.
  useEffect(() => {
    if (!isPanning) return;
    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastScreenPoint.current.x;
      const dy = e.clientY - lastScreenPoint.current.y;
      lastScreenPoint.current = { x: e.clientX, y: e.clientY };
      setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const onMouseUp = () => setIsPanning(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanning]);

  // Зум колесом: точка, над которой стоит курсор, остаётся на месте.
  const onWheel = useCallback(
    (e: ReactWheelEvent) => {
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const factor = Math.exp(-delta * ZOOM_SPEED);
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewport.zoom * factor));
      const anchor = screenToCanvas({ x: e.clientX, y: e.clientY }, viewport);
      setViewport({
        zoom: nextZoom,
        x: e.clientX - anchor.x * nextZoom,
        y: e.clientY - anchor.y * nextZoom,
      });
    },
    [viewport],
  );

  // Пробел зажат + нажали мышь на холсте — начинаем панорамирование.
  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!isSpacePressed) return;
      setIsPanning(true);
      lastScreenPoint.current = { x: e.clientX, y: e.clientY };
    },
    [isSpacePressed],
  );

  return { viewport, isSpacePressed, isPanning, onPointerDown, onWheel };
}