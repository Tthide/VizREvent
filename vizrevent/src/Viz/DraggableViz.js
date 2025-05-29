import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

import { Move } from 'lucide-react';
const DraggableViz = ({ viz, selected, onClick, currentScale, onVizUpdateName,onHoverChange, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: viz.id,
  });

  const [tempName, setTempName] = useState(viz.name);

  const style = {
    position: 'absolute',
    top: viz.y,
    left: viz.x,
    transform: transform
      ? `translate(${transform.x / currentScale}px, ${transform.y / currentScale}px)`
      : undefined,
    zIndex: selected ? 1 : 0,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`viz-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <div className='viz-banner'>
        <div className="viz-drag-handle" {...listeners} {...attributes}>
          <Move size={32} />
        </div>
        <input
          type="text"
          value={tempName}
          className='viz-name-input'
          onChange={(e) => setTempName(e.target.value)}
          onBlur={() => {
            if (tempName.trim() !== "") {
              onVizUpdateName(viz, tempName.trim());
            } else {
              setTempName(viz.name); // reset to original if empty
            }
          }}
          onKeyDown={(e) => { // adding enter as an input validator
            if (e.key === 'Enter') {
              e.target.blur(); 
            }
          }}
          title={viz.name}
        />
      </div>
      <div className="viz-content">{children}</div>
    </div>
  );
};

export default React.memo(DraggableViz)