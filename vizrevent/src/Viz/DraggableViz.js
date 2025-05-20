import React,{ useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

const DraggableViz = ({ viz, selected, onClick, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: viz.id,
  });

  const style = {
    position: 'absolute',
    top: viz.y,
    left: viz.x,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: selected ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`viz-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <div className="viz-content">{children}</div>
    </div>
  );
};

export default DraggableViz