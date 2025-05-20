import React, { useEffect } from 'react';
import Viz from '../Viz/Viz';
import './VPView.scss';
import { DndContext, closestCorners } from '@dnd-kit/core';
import DraggableViz from '../Viz/DraggableViz';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CirclePlus, OctagonX, Trash2 } from 'lucide-react';

const VPView = (props) => {
  const { isDatasetSelected, vizList, vizSelected, onVizSelect, onVizCreate, onVizDelete, onVizUpdatePosition, GRID_SIZE, data } = props;


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

  //updating the coordinate of viz item
  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const movedViz = vizList.find((v) => v.id === active.id);

    if (movedViz) {
      const newX = movedViz.x + delta.x;
      const newY = movedViz.y + delta.y;
      // Snap to nearest grid point
      const snappedX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

      const updatedViz = {
        ...movedViz,
        x: snappedX,
        y: snappedY,
      };
      const newList = vizList.map((v) =>
        v.id === movedViz.id ? updatedViz : v
      );

      onVizUpdatePosition(newList);
    }
  };

  //enables use of Delete key to delete viz
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && vizSelected) {
        handleVizDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [vizSelected]);

  return (
    <div className="vp-container">
      <div className='vp-banner'>
        <h1>Visualization Panel</h1>

        <div className='vp-banner-controller'>
          {isDatasetSelected &&
            (<button onClick={handleVizCreateClick}>
              <CirclePlus />Create Visualization
            </button>)}

          {vizSelected && (
            <button onClick={handleVizDelete}>
              <OctagonX />
              Delete Selected Visualization
            </button>
          )}

          {vizList?.length > 0 && (
            <button onClick={handleVPVizClear}>
              <Trash2 />
              Clear all Visualization
            </button>
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
