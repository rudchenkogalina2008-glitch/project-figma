import type { Shape, ShapePatch } from '../types/shape';

interface PropertiesPanelProps {
  selectedShape: Shape | null;
  onUpdateShape: (id: string, patch: ShapePatch) => void;
}

/**
 * Панель свойств справа. Показывает координаты/размер выделенной фигуры
 * и позволяет менять цвет заливки. Остальные свойства — в шаге 4.
 */
export default function PropertiesPanel({ selectedShape, onUpdateShape }: PropertiesPanelProps) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-[#2c2c2c]/90 p-4 shadow-xl backdrop-blur">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Properties
      </h2>
      {selectedShape ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Property label="X" value={Math.round(selectedShape.position.x)} />
          <Property label="Y" value={Math.round(selectedShape.position.y)} />
          <Property label="W" value={Math.round(selectedShape.size.width)} />
          <Property label="H" value={Math.round(selectedShape.size.height)} />
          <div className="col-span-2 flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
            <dt className="text-neutral-400">Fill</dt>
            <dd className="flex items-center gap-2">
              <span className="text-xs lowercase tabular-nums text-neutral-300">
                {selectedShape.fill}
              </span>
              <input
                type="color"
                value={selectedShape.fill}
                title="Изменить цвет заливки"
                onChange={(e) => onUpdateShape(selectedShape.id, { fill: e.target.value })}
                className="h-6 w-6 cursor-pointer rounded border border-white/20 bg-transparent p-0"
              />
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">Nothing selected</p>
      )}
    </aside>
  );
}

function Property({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="tabular-nums text-neutral-200">{value}</dd>
    </div>
  );
}