import type { CSSProperties } from 'react';
import type { Shape as ShapeModel } from '../types/shape';

const SELECTION_COLOR = '#4c8dff';
const HANDLE_SIZE = 8;
const FRAME_INSET = 2;

interface ShapeViewProps {
  shape: ShapeModel;
}

/**
 * Рендер одной фигуры. Выделенная фигура получает рамку с маркерами-ручками по углам
 * (пока визуальная — ресайз за ручки подключим в шаге 4).
 */
export default function ShapeView({ shape }: ShapeViewProps) {
  const { type, position, size, fill, stroke, strokeWidth, rotation, selected } = shape;

  const style: CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    backgroundColor: fill,
    border: `${strokeWidth}px solid ${stroke}`,
    borderRadius: type === 'ellipse' ? '50%' : '2px',
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'center',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
  };

  return (
    <div style={style}>
      {selected && <SelectionFrame />}
    </div>
  );
}

/** Рамка выделения с четырьмя маркерами по углам. */
function SelectionFrame() {
  const offset = -HANDLE_SIZE / 2 - FRAME_INSET;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: -FRAME_INSET,
          border: `1.5px solid ${SELECTION_COLOR}`,
          pointerEvents: 'none',
        }}
      />
      <Handle style={{ left: offset, top: offset }} />
      <Handle style={{ right: offset, top: offset }} />
      <Handle style={{ left: offset, bottom: offset }} />
      <Handle style={{ right: offset, bottom: offset }} />
    </>
  );
}

function Handle({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        backgroundColor: '#ffffff',
        border: `1px solid ${SELECTION_COLOR}`,
        borderRadius: 2,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}