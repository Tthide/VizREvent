import React, { useState } from 'react';
import DatasetSelection from './DatasetSelection/DatasetSelection.js';
import DataFieldSelection from './DataFieldSelection/DataFieldSelection.js';
import DataEncodingSelection from './DataEncodingSelection/DataEncodingSelection.js';

const DSView = (props) => {

    const { hasSelectedViz, datasetList, dataFields, selectedFields,dataEncodingState, onDatasetChange, onDatafieldSelect, onEncoderSelect } = props;
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
        <div style={{ backgroundColor: 'red' }}>
            <h1>DSView</h1>
            <button onClick={handleDatasetSelectionOpen}>Change Dataset</button>
            {isDatasetSelectionOpen && (
                <DatasetSelection datasetList={datasetList} onDatasetSelect={handleDatasetSelect} onSelectionConfirm={handleDatasetSelectionOpen} />
            )}

            {/* only displayed when selectedViz !== null */}
            <DataFieldSelection 
            dataFields={dataFields} 
            selectedFields={selectedFields} 
            handleCheckboxChange={handleDataFieldSelect} 
            hasSelectedViz={hasSelectedViz}/>
            <DataEncodingSelection 
            dataEncodingState={dataEncodingState}
            onEncodingChange={handleVizEncoderSelect} 
            hasSelectedViz={hasSelectedViz}/>
            {//we only display the settings inputs if a viz has been selected
                hasSelectedViz?
                    <>
                        < button onClick = { handleDataFieldSelect } > Change DataField</button >

        <button onClick={handleVizEncoderSelect}>Change VizEncoder</button></> : <>
        </>
}

        </div >
    );
};

export default React.memo(DSView);
