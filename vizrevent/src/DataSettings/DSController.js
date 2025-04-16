import React from 'react'
import DSView from './DSView'
import { useStoreSelector } from '../Store/VizreventStore';



const DSController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        dataset: state.dataset,
        selectedViz: state.selectedViz,
    }));

    //console.log("DSController useStoreSelector Output:");
    //console.log(dispatch);

    //Takes selected dataset and dispatch it to store
    const handleDatasetSelect = (dataset) => {
        dispatch.setDataset(dataset);
    };

    //Convert selected Datafields to new vizParam and recSettings value
    const handleDatafieldSelect = (datafields) => {

        // Convert selected Datafields to new vizParam and recSettings value
        //exemple value
        const newVizParam = {
            xAxis: datafields[0].name, // Example: setting the x-axis to the first datafield
            yAxis: datafields[1].name, // Example: setting the y-axis to the second datafield
            chartType: 'bar', // Example: setting the chart type to 'bar'
        };

        const newRecSettings = {
            filter: { field: datafields[0].name, value: 10 }, // Example: setting a filter on the first datafield
            sort: { field: datafields[1].name, order: 'asc' }, // Example: setting sorting on the second datafield
        };

        /* New vizParam and recSettings will be computed here */

        dispatch.setVizParam(newVizParam);
        dispatch.setRecSettings(newRecSettings);
    };

    //Convert selected Visualization Encoder to new vizParam and recSettings value
    const handleEncoderSelect = (vizEncoder) => {
        dispatch.setVizParam(vizEncoder);
        dispatch.setRecSettings(vizEncoder);
    };


    return (
        <>
            <DSView
                hasSelectedViz={state.selectedViz !== null}
                onDatasetChange={handleDatasetSelect}
                onDatafieldSelect={handleDatafieldSelect}
                onEncoderSelect={handleEncoderSelect} />
            <pre>DSControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
        </>
    )
}

export default DSController