import React, { useEffect, useRef } from 'react';
import Viz from '../Viz/Viz';
import './VPView.scss';
import { DndContext, closestCorners } from '@dnd-kit/core';
import DraggableViz from '../Viz/DraggableViz';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CirclePlus, OctagonX, Trash2 } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const VPView = (props) => {
  const { isDatasetSelected, vizList, vizSelected, onVizSelect, onVizCreate, onVizDelete, onVizUpdatePosition, GRID_SIZE, data } = props;
  const transformRef = useRef(null);

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

  //zooming to selectedViz
  const zoomToElement = () => {
    if (!vizSelected || !transformRef.current) return;


    const el = document.getElementById(`viz-${vizSelected.id}`);

    transformRef.current.zoomToElement(el, 1, 400, "easeOut");
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
  /*
    //on Mount, we set the initial view position to the center of the canva
    useEffect(() => {
      transformRef.current?.centerView();
    }, []);*/

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
        <TransformWrapper
          ref={transformRef}
          wheel={{ step: 50 , smoothStep:0.001}}
          panning={{ allowLeftClickPan: false }}
          doubleClick={{disabled:true}}
          initialScale={1}
          minScale={0.2}
          maxScale={1.2}
          limitToBounds={false}
          pan={{ velocityDisabled: true }}
        >
          {({ zoomIn, zoomOut, centerView, ...rest }) => (
            <>
              {isDatasetSelected &&
                (<div className="zoom-tools">
                  <p>{transformRef.current.state}</p>
                  <button onClick={() => zoomIn()}>Zoom in +</button>
                  <button onClick={() => zoomOut()}>Zoom out -</button>
                  <button onClick={() => centerView()}>Center x</button>
                  {vizSelected &&
                    <button onClick={zoomToElement}>See Selected Viz</button>}
                </div>)}
              <TransformComponent wrapperClass="zoom-wrapper">
                <div
                  className="viz-canva"
                  style={{
                    backgroundImage: `
        linear-gradient(to right, rgba(0,0,0,0.15) 2px, transparent 2px),
        linear-gradient(to bottom, rgba(0,0,0,0.15) 2px, transparent 2px)
      `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                  }}
                >
                  {vizList.map((viz) => (
                    <DraggableViz
                      key={viz.id}
                      viz={viz}
                      selected={vizSelected?.id === viz.id}
                      onClick={() => onVizSelect(viz)}
                      onMove={() => { }}
                    >
                      <div id={`viz-${viz.id}`} className="Viz-chart-container">
                        <Viz spec={viz.vizQuery} data={data} />
                      </div>
                    </DraggableViz>
                  ))}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </DndContext>
    </div>
  );
};


export default React.memo(VPView);
