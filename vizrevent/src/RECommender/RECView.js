import React from 'react';
import RecViz from '../Viz/RecViz';
import { OrbitProgress } from "react-loading-indicators"

const RECView = (props) => {

  const { isOpened, loading, onPanelOpenerClick, recList, onRecItemSelect } = props;


  const handlePanelExpandClick = () => {
    // List of data field selected to be passed to RECController
    onPanelOpenerClick(isOpened);
  };

  const handleRecItemSelect = (recVizSettings) => {
    onRecItemSelect(recVizSettings);
  }

  //display one recommendation item
  const displayRECItem = (recItem) => {
    //button to be replaced by RecViz component
    return <RecViz
      key={recItem.id}
      recItem={recItem}
      onRecItemSelect={() => handleRecItemSelect(recItem)}>
      recommendation n°{recItem.id}</RecViz>;


  }

  return (
    <div style={{ backgroundColor: 'blue' }}>
      <h1>RECView</h1>
      {isOpened && (
        <div className='RECPanel' style={{ backgroundColor: 'blue' }}>
          <div className='RECVizList'>
            {!loading && recList.length === 0 && <h3>No recommendation possible</h3>}
            {loading && (
              <OrbitProgress color="#FFFFFF" size="medium" text="" textColor="#ffffff" />
            )}
            {!loading && recList.map(recItem => displayRECItem(recItem))}
          </div>
        </div>
      )}
      {/* Expanding panel button, this could also be but in RECController but to respect MVC we put it here*/}
      <button onClick={handlePanelExpandClick}>
        {isOpened ? "Close Panel" : " Open panel"}
      </button>
    </div>
  );
};
export default React.memo(RECView);
