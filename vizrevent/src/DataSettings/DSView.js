import React from 'react';

const DSView = (props) => {

    const { hasSelectedViz, onDatasetChange, onDatafieldSelect, onEncoderSelect } = props;



    const handleDatasetSelect = () => {
        //dataset to be passed to the DSController
        const newDataset = { dataset: 3900493 }
        onDatasetChange(newDataset);
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
            <button onClick={handleDatasetSelect}>Change Dataset</button>
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
