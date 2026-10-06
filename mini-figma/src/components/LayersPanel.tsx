import type { Shape } from '../types/shape';

const TYPE_ICON: Record<Shape['type'], string> = {
  rectangle: '▭',
  ellipse: '●',
};

interface LayersPanelProps {
  shapes: Shape[];
  /** Клик по слою → выделить фигуру на канвасе. */
  onSelectShape: (id: string) => void;
}

/**
 * Панель слоёв справа: список всех фигур в порядке наложения (сверху — последняя).
 * Клик по слою выделяет фигуру на канвасе (та показывает рамку с маркерами).
 */
export default function LayersPanel({ shapes, onSelectShape }: LayersPanelProps) {
  return (
    <aside className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#2c2c2c]/90 p-4 shadow-xl backdrop-blur">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Layers
      </h2>
      {shapes.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">No layers yet</p>
      ) : (
        <ul className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {shapes.map((shape, index) => (
            <li key={shape.id}>
              <button
                type="button"
                aria-pressed={shape.selected}
                onClick={() => onSelectShape(shape.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  shape.selected
                    ? 'bg-[#4c8dff]/25 text-neutral-100'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`}
              >
                <span aria-hidden="true" className="text-xs">
                  {TYPE_ICON[shape.type]}
                </span>
                <span className="capitalize">{shape.type}</span>
                <span className="ml-auto tabular-nums text-neutral-500">{index + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}