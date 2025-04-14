import React from 'react';

const RECView = (props) => {

  const { isOpened, onPanelOpenerClick, recList } = props;


  const handlePanelExpandClick = () => {
    // List of data field selected to be passed to RECController
    onPanelOpenerClick(isOpened);
  };


  //display one recommendation item
  const displayRECItem = (recItem) => {


    return <button key={recItem.id}>recommendation n°{recItem.id}</button>;


  }

  return (
    <div style={{ backgroundColor: 'blue' }}>
      {isOpened && (
        <div className='RECPanel' style={{ backgroundColor: 'blue' }}>
          <div className='RECVizList'>
            {recList.map(recItem => displayRECItem(recItem))}
          </div>
        </div>
      )}
      <h1>RECView</h1>

      <button onClick={handlePanelExpandClick}>
        {isOpened ? "Close Panel" : " Open panel"}
      </button>

    </div>
  );
};
export default RECView;
