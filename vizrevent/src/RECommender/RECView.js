import React from 'react';
import RecViz from '../Viz/RecViz';
import { OrbitProgress } from "react-loading-indicators"
import './RECView.scss'; 
import { ChevronRight } from 'lucide-react';

const RECView = (props) => {

  const { isOpened, loading, onPanelOpenerClick, recList, onRecItemSelect, hasSelectedViz, totalCount } = props;


  const handlePanelExpandClick = () => {
    // List of data field selected to be passed to RECController
    onPanelOpenerClick(isOpened);
  };

  const handleRecItemSelect = (recVizSettings, vizUpdate = false) => {
    onRecItemSelect(recVizSettings, vizUpdate);
  }

  //display one recommendation item
  const displayRECItem = (recItem) => {
    //button to be replaced by RecViz component
    return <RecViz
      key={recItem.id}
      recItem={recItem}
      hasSelectedViz={hasSelectedViz}
      onRecItemAdd={() => handleRecItemSelect(recItem)}
      onRecItemUpdate={() => handleRecItemSelect(recItem, true)}>
    </RecViz>;


  }



  return (
    <div className={`rec-container ${isOpened ? 'container-open' : 'container-closed'}`}>
      {isOpened && (
        <div className={'rec-panel'}>
          <h1>Recommendations</h1>
          <div className={'recviz-list'}>
            {loading && (
              <div className={'loading-wrapper'}>
                <OrbitProgress
                  color="#FFFFFF"
                  size="medium"
                  text={`${recList.length} / ${totalCount}`}
                  textColor="#ffffff"
                />
                <h2>Recommendations loading...</h2>
              </div>
            )}

            {!loading && recList.length === 0 && (
              <div className={'fallback-message'}>
                No recommendation possible
              </div>
            )}

            {/* Render all available recommendation items */}
            {recList.map(recItem => displayRECItem(recItem))}
          </div>
        </div>
      )}

      <button onClick={handlePanelExpandClick} className={'panel-button'}>
        <ChevronRight
          className={`chevron-icon ${isOpened ? 'rotate-180' : ''}`}

    
        />
      </button>
    </div>
  );
};


export default React.memo(RECView);
