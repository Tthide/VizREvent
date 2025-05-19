import React from 'react';
import Viz from '../Viz/Viz';
import './VPView.scss';

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


      <div className="viz-panel">

        {vizList.map((viz) => (
          <div
            key={viz.id}
            onClick={handleVizSelect(viz)}
            className="viz-item"
          >
            <div className={`viz-bg ${vizSelected?.id === viz.id ? 'selected' : ''}`} />
            <div className="viz-content">
              <Viz key={viz.id} spec={viz.vizQuery} data={data} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default React.memo(VPView);
