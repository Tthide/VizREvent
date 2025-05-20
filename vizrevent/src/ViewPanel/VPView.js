import React from 'react';
import Viz from '../Viz/Viz';
import './VPView.scss';
import { DndContext, closestCorners } from '@dnd-kit/core';
import DraggableViz from '../Viz/DraggableViz';
import { restrictToParentElement } from '@dnd-kit/modifiers';

const VPView = (props) => {
  const { vizList, vizSelected, onVizSelect, onVizCreate, onVizDelete, onVizUpdatePosition, data } = props;


  const handleVizCreateClick = () => {

    //dispatch here a null inputViz so that VPController
    // onVizCreate;
    return onVizCreate();
  }

  const handleVizDelete = () => {
    if (vizSelected !== null) {
      onVizDelete(vizSelected);
    }
  }
  const handleVPVizClear = () => {
    vizList.forEach(viz => {
      onVizDelete(viz);
    });

  }
  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const movedViz = vizList.find((v) => v.id === active.id);

    if (movedViz) {
      const updatedViz = {
        ...movedViz,
        x: movedViz.x + delta.x,
        y: movedViz.y + delta.y,
      };

      const newList = vizList.map((v) =>
        v.id === movedViz.id ? updatedViz : v
      );

      onVizUpdatePosition(newList); // You can rename this to onVizUpdatePosition or similar
    }
  };

  return (
    <div className="vp-container">
      <div className='vp-banner'>
        <h1>Visualization Panel</h1>

        <div className='vp-banner-controller'>
          <button onClick={handleVizCreateClick}>Create Visualization</button>

          {vizSelected && (
            <button onClick={handleVizDelete}>Delete Selected Visualization</button>
          )}

          {vizList?.length > 0 && (
            <button onClick={handleVPVizClear}>Clear all Visualization</button>
          )}

        </div>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <div className="viz-panel">
          {vizList.map((viz) => (
            <DraggableViz
              key={viz.id}
              viz={viz}
              selected={vizSelected?.id === viz.id}
              onClick={() => onVizSelect(viz)}
              onMove={() => { }}
            >
              <Viz spec={viz.vizQuery} data={data} />
            </DraggableViz>
          ))}
        </div>
      </DndContext>
    </div>
  );
};


export default React.memo(VPView);
