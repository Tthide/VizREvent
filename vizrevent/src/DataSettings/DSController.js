import React, { useEffect, useState } from 'react'
import DSView from './DSView'
import { useStoreSelector } from '../Store/VizreventStore';
import { DatasetListFetcher } from './DatasetUtils';



const DSController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        datasetId: state.datasetId,
        selectedViz: state.selectedViz,
    }));

    const [datasetList, setDatasetList] = useState([]);

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const data = await DatasetListFetcher();
                setDatasetList(data);
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchDatasets();
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    // Takes selected dataset and dispatch it to store
    const handleDatasetSelect =  (datasetId) => {

        dispatch.setDatasetId(datasetId);
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
                datasetList={datasetList}
                onDatasetChange={handleDatasetSelect}
                onDatafieldSelect={handleDatafieldSelect}
                onEncoderSelect={handleEncoderSelect} />
            <pre>DSControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
        </>
    )
}

export default DSController