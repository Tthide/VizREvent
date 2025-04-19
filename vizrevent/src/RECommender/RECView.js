import React from 'react';
import DracoComponent from './Draco';
import RecViz from '../Viz/RecViz';
const RECView = (props) => {

  const { isOpened, onPanelOpenerClick, recList, onRecItemSelect } = props;


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
    return <RecViz recItem={recItem} onRecItemSelect={() => handleRecItemSelect(recItem)}>recommendation n°{recItem.id}</RecViz>;


  }

  return (
    <div style={{ backgroundColor: 'blue' }}>
      <h1>RECView</h1>

      {isOpened && (
        <div className='RECPanel' style={{ backgroundColor: 'blue' }}>
          <div className='RECVizList'>
            {recList.map(recItem =>displayRECItem(recItem))}
          </div>
        </div>
      )}

      {/* Expanding panel button, this could also be but in RECController but to respect MVC we put it here*/}
      <button onClick={handlePanelExpandClick}>
        {isOpened ? "Close Panel" : " Open panel"}
      </button>

      <DracoComponent></DracoComponent>
    </div>
  );
};
export default RECView;
