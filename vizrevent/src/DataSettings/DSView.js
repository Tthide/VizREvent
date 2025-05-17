import React, { useState } from 'react';
import DatasetSelection from './DatasetSelection/DatasetSelection.js';
import DataFieldSelection from './DataFieldSelection/DataFieldSelection.js';
import DataEncodingSelection from './DataEncodingSelection/DataEncodingSelection.js';
import './DSView.scss'; // Import the DSView SASS file
import MatchInfo from './DatasetSelection/DatasetMatchInfo.js';
const DSView = (props) => {

    const { hasSelectedViz, datasetList, datasetMetaData,dataFields, selectedFields, dataEncodingState, onDatasetChange, onDatafieldSelect, onEncoderSelect } = props;
    // State to manage the visibility of the DatasetSelection component
    const [isDatasetSelectionOpen, setIsDatasetSelectionOpen] = useState(false);

    //when Change dataset button is pressed, this make isDatasetSelectionOpen true
    //when a dataset is selected in DatasetSelection, this make it false and closes DatasetSelection
    const handleDatasetSelectionOpen = () => {
        setIsDatasetSelectionOpen(prevState => !prevState);
    };


    const handleDatasetSelect = (datasetId) => {
        onDatasetChange(datasetId);
    };

    const handleDataFieldSelect = (dataField) => {
        onDatafieldSelect(dataField);
    };

    const handleVizEncoderSelect = (category, payload) => {
        onEncoderSelect(category, payload);
    };
    return (
        <div className="ds-view-container">
            <h1>DSView</h1>

            <button className="change-dataset-button" onClick={handleDatasetSelectionOpen}>
                
                {datasetMetaData && datasetMetaData!==null? 
                 <MatchInfo dataset={datasetMetaData}/>
                :  'Change Dataset' //id :${datasetMetaData.match_id} | da `
            
                }

            </button>

            {isDatasetSelectionOpen && (
                <div className="dataset-selection">
                    <DatasetSelection datasetList={datasetList} onDatasetSelect={handleDatasetSelect} onSelectionConfirm={handleDatasetSelectionOpen} />
                </div>
            )}

            {/* only displayed when selectedViz !== null */}
            <div className="data-field-selection">
                <DataFieldSelection
                    dataFields={dataFields}
                    selectedFields={selectedFields}
                    handleCheckboxChange={handleDataFieldSelect}
                />
            </div>
            <div className="data-encoding-selection">
                <DataEncodingSelection
                    dataEncodingState={dataEncodingState}
                    onEncodingChange={handleVizEncoderSelect}
                    hasSelectedViz={hasSelectedViz}
                />
            </div>
        </div>
    );
};
export default React.memo(DSView);
