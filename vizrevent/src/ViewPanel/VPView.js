import React from 'react';

const VPView = (props) => {
  const { vizList, vizSelectedId, onVizSelect, onVizCreate, onVizDelete } = props;


  const handleVizCreateClick = () => {

    //dispatch here a null inputViz so that VPController
    // onVizCreate;
    return onVizCreate();
  }

  const handleVizSelect = (viz) => {
    return () => onVizSelect(viz);
  }

  const handleVizDelete = () => {
    if (vizSelectedId !== null) {
      onVizDelete(vizSelectedId);
    }
  }

  return (
    <div style={{ backgroundColor: 'gray', padding: '20px' }}>
      <h2>VPView</h2>
      <button onClick={onVizCreate}>Create Visualization</button>
      {vizSelectedId !== null && (
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
              backgroundColor: viz.id === vizSelectedId ? 'blue' : 'white',
              color: viz.id === vizSelectedId ? 'white' : 'black',
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
