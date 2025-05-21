import React from 'react';
import { useDraggable } from '@dnd-kit/core';

import { Move } from 'lucide-react';
const DraggableViz = ({ viz, selected, onClick, currentScale,children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: viz.id,
  });

  const style = {
    position: 'absolute',
    top: viz.y,
    left: viz.x,
    transform: transform
      ? `translate(${transform.x/currentScale}px, ${transform.y/currentScale}px)`
      : undefined,
    zIndex: selected ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`viz-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="viz-drag-handle" {...listeners} {...attributes}>
        <Move />
      </div>
      <div className="viz-content">{children}</div>
    </div>
  );
};

export default DraggableViz