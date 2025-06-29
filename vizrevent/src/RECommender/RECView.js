import React from 'react';
import RecViz from '../Viz/RecViz';
import { OrbitProgress } from "react-loading-indicators"
import './RECView.scss';
import { ChevronRight } from 'lucide-react';

const RECView = (props) => {

  const { isDatasetSelected, isOpened, loading, onPanelOpenerClick, recList, onRecItemSelect, hasSelectedViz, selectedVizName, selectedFields, totalCount } = props;


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

  console.log(selectedFields)


  return (
    <div className={`rec-container ${isOpened ? 'container-open' : 'container-closed'}`}>
      {isOpened && (
        <div className={'rec-panel'}>
          <div className={'rec-pannel-banner'}>
            <h1>REC Panel</h1>
            <h2>
              {selectedVizName !== "" ? (
                selectedFields.length !== 0 ? (
                  <>
                    Recommendations on viz: <i>{selectedVizName}</i> with selected fields:{" "}
                    {selectedFields.map((field, index) => (
                      <span key={index}>
                        <i>{field.name}</i>
                        {index < selectedFields.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </>
                ) : (
                  <>Recommendations on viz: <i>{selectedVizName}</i></>
                )
              ) : selectedFields.length !== 0 ? (
                <>
                  General Recommendations with selected fields:{" "}
                  {selectedFields.map((field, index) => (
                    <span key={index}>
                      <i>{field.name}</i>
                      {index < selectedFields.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </>
              ) : (
                "General Recommendations"
              )}
            </h2>

          </div>

          <div className={'recviz-list'}>
            {loading && (
              <div className={'loading-wrapper'}>
                <OrbitProgress
                  color="#FFFFFF"
                  size="medium"
                  text={totalCount !== 0 ? `${recList.length} / ${totalCount}` : "..."}
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

      {isDatasetSelected && <button onClick={handlePanelExpandClick} className={'panel-button'}>
        <ChevronRight
          className={`chevron-icon ${isOpened ? 'rotate-180' : ''}`}
        />
      </button>}
    </div>
  );
};


export default React.memo(RECView);
