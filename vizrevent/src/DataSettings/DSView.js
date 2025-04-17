import React from 'react';

const DSView = (props) => {

    const { hasSelectedViz, onDatasetChange, onDatafieldSelect, onEncoderSelect } = props;



    const handleDatasetSelect = () => {
        //dataset to be passed to the DSController
        const newDataset = {
            name: "table",
            values: [
                {a: 'A', b: 28},
                {a: 'B', b: 55},
                {a: 'C', b: 43},
                {a: 'D', b: 91},
                {a: 'E', b: 81},
                {a: 'F', b: 53},
                {a: 'G', b: 19},
                {a: 'H', b: 87},
                {a: 'I', b: 52},
              ],
        };
        onDatasetChange(newDataset);
    };

    const handleDataFieldSelect = () => {
        // List of data field selected to be passed to DSController
        // Example datafields input
        const exampleDatafields = [
            { id: 1, name: 'Field1', type: 'numeric' },
            { id: 2, name: 'Field2', type: 'categorical' },
        ];
        onDatafieldSelect(exampleDatafields);
    };

    const handleVizEncoderSelect = () => {
        // List of data field selected to be passed to DSController
        // Example encoder input
        const exampleEncoder = [
            { id: 1, name: 'Field1', type: 'color' },
            { id: 2, name: 'Field2', type: 'size' },
        ];
        onEncoderSelect(exampleEncoder);
    };

    return (
        <div style={{ backgroundColor: 'red' }}>
            <h1>DSView</h1>
            <button onClick={handleDatasetSelect}>Change Dataset</button>
            {//we only display the settings inputs if a viz has been selected
                hasSelectedViz ?
                    <><button onClick={handleDataFieldSelect}>Change DataField</button>

                        <button onClick={handleVizEncoderSelect}>Change VizEncoder</button>)</> : <></>}

        </div>
    );
};

export default DSView;
