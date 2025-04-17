import React from 'react';
import Viz from '../Viz/Viz';

const VPView = (props) => {
  const { vizList, vizSelected, onVizSelect, onVizCreate, onVizDelete } = props;


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
      {vizSelected && vizSelected !== null && (
        <button onClick={handleVizDelete}>
          Delete Selected Visualization
        </button>
      )}
      {vizList && vizList.length !== 0 && (
        <button onClick={handleVPVizClear}>
          Clear all Visualization
        </button>
      )}

      <div>
        <h3>Visualizations:</h3>

        {vizList.map((viz, index) => (
          <div
            key={viz.id}
            onClick={handleVizSelect(viz)}
            style={{
              backgroundColor: vizSelected && viz.id === vizSelected.id ? 'blue' : 'white',
              color: vizSelected && viz.id === vizSelected.id ? 'white' : 'black',

            }}>
            <Viz
              vizQuery={viz.vizQuery}>

            </Viz>
          </div>
        ))}

      </div>
    </div>
  );
};

export default VPView;
