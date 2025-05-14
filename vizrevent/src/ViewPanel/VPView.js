import React from 'react';
import Viz from '../Viz/Viz';

const VPView = (props) => {
  const { vizList, vizSelected, onVizSelect, onVizCreate, onVizDelete, data } = props;


  const handleVizCreateClick = () => {

    //dispatch here a null inputViz so that VPController
    // onVizCreate;
    return onVizCreate();
  }

  const handleVizSelect = (viz) => {
    return () => onVizSelect(viz);
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

  return (
    <div style={{ backgroundColor: 'gray', padding: '20px' }}>
      <h2>VPView</h2>
      <button onClick={handleVizCreateClick}>Create Visualization</button>
      {vizSelected && (
        <button onClick={handleVizDelete}>
          Delete Selected Visualization
        </button>
      )}
      {vizList && vizList.length !== 0 && (
        <button onClick={handleVPVizClear}>
          Clear all Visualization
        </button>
      )}

      <div style={{height: '90vh', overflowY: 'auto'}}>
        <h3>Visualizations:</h3>


        {vizList.map((viz) => (
          <div
            key={viz.id}
            onClick={handleVizSelect(viz)}
            style={{ position: 'relative', border: '1px solid black', cursor: 'pointer' }}
          >
            <div
              style={{
                backgroundColor: vizSelected && vizSelected.id === viz.id ? 'blue' : 'white',
                position: 'absolute',
                color: vizSelected && vizSelected.id === viz.id ? 'white' : 'black',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 0, // Ensure it stays behind the content
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Viz
                key={viz.id}
                spec={viz.vizQuery}
                data={data}
              />
            </div>

          </div>
        ))}


      </div>
    </div>
  );
};

export default React.memo(VPView);
