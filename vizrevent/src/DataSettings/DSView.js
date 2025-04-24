import React, { useState } from 'react';
import DatasetSelection from './DatasetSelection/DatasetSelection.js';
import DataFieldSelection from './DataFieldSelection/DataFieldSelection.js';

const DSView = (props) => {

    const { hasSelectedViz, datasetList, onDatasetChange, onDatafieldSelect, onEncoderSelect } = props;
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

    const handleDataFieldSelect = () => {
        // List of data field selected to be passed to DSController
        // Example datafields input
        const exampleDatafields = {
            mark: "arc",
            encoding: {
                theta: { field: "b", type: "quantitative" },
                color: { field: "a", type: "nominal", title: "Category" }
            }
        };
        onDatafieldSelect(exampleDatafields);
    };

    const handleVizEncoderSelect = () => {
        // List of data field selected to be passed to DSController
        // Example encoder input
        const exampleEncoder = {
            mark: "bar",
            encoding: {
                x: { field: "a", type: "nominal", axis: { title: "Category" } },
                y: { field: "b", type: "quantitative", axis: { title: "Value" }, stack: "zero" },
                color: { field: "a", type: "nominal", title: "Category" }
            }
        };
        onEncoderSelect(exampleEncoder);
    };

    return (
        <div style={{ backgroundColor: 'red' }}>
            <h1>DSView</h1>
            <button onClick={handleDatasetSelectionOpen}>Change Dataset</button>
            {isDatasetSelectionOpen && (
                <DatasetSelection datasetList={datasetList} onDatasetSelect={handleDatasetSelect} onSelectionConfirm={handleDatasetSelectionOpen} />
            )}

            {/* only displayed when selectedViz !== null */}
            <DataFieldSelection></DataFieldSelection>

            {//we only display the settings inputs if a viz has been selected
                hasSelectedViz ?
                    <>
                        <button onClick={handleDataFieldSelect}>Change DataField</button>

                        <button onClick={handleVizEncoderSelect}>Change VizEncoder</button></> : <>
                    </>}

        </div>
    );
};

export default DSView;
