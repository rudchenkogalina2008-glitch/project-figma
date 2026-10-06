import { useEffect } from 'react';

/**
 * Заготовка горячих клавиш. Подключим в шаге 3:
 * выбор инструмента по R/O/V (SHORTCUT_TO_TOOL из constants/tools.ts),
 * Delete — удаление выделения, Escape — сброс.
 */
export function useHotkeys() {
  useEffect(() => {
    const onKeyDown = (_e: KeyboardEvent) => {
      // TODO(шаг 3): выбор инструмента по клавишам, удаление выделенной фигуры
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}