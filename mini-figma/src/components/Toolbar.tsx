import { TOOLS } from '../constants/tools';
import type { Tool } from '../types/shape';

interface ToolbarProps {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
}

/**
 * Панель инструментов слева. Кнопки рендерятся из constants/tools.ts,
 * клик переключает активный инструмент (выбор, прямоугольник, эллипс).
 */
export default function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  return (
    <div className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-2xl border border-white/10 bg-[#2c2c2c]/90 p-1.5 shadow-xl backdrop-blur">
      {TOOLS.map((tool) => {
        const isActive = tool.id === activeTool;
        return (
          <button
            key={tool.id}
            type="button"
            title={`${tool.label} — ${tool.shortcut}`}
            aria-pressed={isActive}
            onClick={() => onSelectTool(tool.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-[#4c8dff] text-white'
                : 'text-neutral-400 hover:bg-white/10 hover:text-neutral-100'
            }`}
          >
            <span aria-hidden="true">{tool.shortcut}</span>
            <span className="sr-only">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}