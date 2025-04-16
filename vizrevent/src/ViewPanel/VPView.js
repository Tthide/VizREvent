import React from 'react';

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

  return (
    <div style={{ backgroundColor: 'gray', padding: '20px' }}>
      <h2>VPView</h2>
      <button onClick={handleVizCreateClick}>Create Visualization</button>
      {vizSelected !== null && (
        <button onClick={handleVizDelete}>
          Delete Selected Visualization
        </button>
      )}
      <div>
        <h3>Visualizations:</h3>

        {vizList.map((viz, index) => (
          //here button will need to be replaced by a viz inta
          <button
            key={viz.id}
            onClick={handleVizSelect(viz)}
            style={{
              backgroundColor: vizSelected &&  viz.id === vizSelected.id ? 'blue' : 'white',
              color:vizSelected && viz.id === vizSelected.id ? 'white' : 'black',
            }}
          >
            Visualization {index + 1}: {viz.vizQuery}
          </button>
        ))}

      </div>
    </div>
  );
};

export default VPView;
