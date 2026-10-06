import type { Tool } from '../types/shape';

export interface ToolDefinition {
  id: Tool;
  label: string;
  /** Буква на кнопке и горячая клавиша. */
  shortcut: string;
}

/**
 * Список инструментов и соответствие клавишам R/O/V.
 * Хотим поменять клавиши или добавить инструмент — правим один этот файл,
 * а не ищем по всему проекту.
 */
export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O' },
];

/** Клавиша → инструмент (регистр не важен). */
export const SHORTCUT_TO_TOOL: Record<string, Tool> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
};