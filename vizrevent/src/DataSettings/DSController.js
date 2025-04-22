import React from 'react'
import DSView from './DSView'
import { useStoreSelector } from '../Store/VizreventStore';
import { DatasetFetcher } from './DatasetUtils';



const DSController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        dataset: state.dataset,
        selectedViz: state.selectedViz,
    }));

    //console.log("DSController useStoreSelector Output:");
    //console.log(dispatch);

    // Takes selected dataset and dispatch it to store
    const handleDatasetSelect = async (dataset) => {
        try {
            const data = await DatasetFetcher(dataset);
            console.log(data); // This will log the resolved value
            dispatch.setDataset(data);
        } catch (error) {
            console.error('Error fetching dataset:', error);
        }
    };
    //Convert selected Datafields to new vizParam and recSettings value
    const handleDatafieldSelect = (datafields) => {

        //Selected Datafields needs to be converted to new vizParam and recSettings value
        //Placeholder exemple value
        const newVizParam = datafields;

        const newRecSettings = datafields;

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
                hasSelectedViz={state.selectedViz && state.selectedViz !== null}
                onDatasetChange={handleDatasetSelect}
                onDatafieldSelect={handleDatafieldSelect}
                onEncoderSelect={handleEncoderSelect} />
            <pre>DSControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
        </>
    )
}

export default DSController