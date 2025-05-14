import React, { useCallback, useEffect, useState } from 'react'
import VPView from './VPView'
import { useStoreSelector } from '../Store/VizreventStore';
import { v4 as uuidv4 } from 'uuid';
import { DatasetFetcher } from '../DataSettings/DatasetUtils';



const VPController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        inputViz: state.inputViz,
        selectedViz: state.selectedViz,
        datasetId: state.datasetId,
    }));

    //Creating local state 
    const [vizList, setVizList] = useState([]);
    const [data, setData] = useState([]);

    //create a Viz and automatically selects it
    const createViz = useCallback((vizQuery = null) => {
        if (state.datasetId) {
            const newViz = {
                id: uuidv4(),
                vizQuery: vizQuery? vizQuery.spec : null
            };
            setVizList(preVizList => [...preVizList, newViz]);
            dispatch.setRecSettings(newViz.vizQuery);
            dispatch.setSelectedViz(newViz);
            dispatch.setInputViz(null);
        } else {
            console.warn("Error//VPController: No dataset selected. Cannot create visualizations.");
        }
    }, [state.datasetId, dispatch]);

    // Handle new Viz creation from RECController 
    useEffect(() => {
        if (state.inputViz && state.inputViz !== null) {
            createViz(state.inputViz.vizQuery);
        }

    }, [state.inputViz]);

    // Handle empty Viz creation in VPView
    const handleEmptyVizCreate = () => {
        createViz();
    };

    //Takes selected dataset and dispatch it to store
    const handleVizDelete = (vizToDelete) => {

        // Error checking
        if (!vizToDelete || vizToDelete.id === null) {
            throw new Error('VPController/handleVizDelete: the Viz provided is null or has a null id.');
        }
        if (vizList.length === 0) {
            throw new Error('VPController/handleVizDelete: Visualization list is empty.');
        }

        setVizList(preVizList => preVizList.filter(item => item.id !== vizToDelete.id));
        //Resetting these properties since the selected viz doesn't exist anymore
        dispatch.setSelectedViz(null);
        dispatch.setInputViz(null);
        dispatch.setRecSettings(null);
    };

    //Takes selected viz and dispatch its properties to store
    const handleVizSelect = (vizSelected) => {


        // Error checking
        if (vizSelected === null || vizSelected.id === null) {
            throw new Error('VPController/handleVizSelect: the Viz provided is null or has a null id.');
        }

        //deselecting current selectedViz by clicking on it again
        if (state.selectedViz && vizSelected === state.selectedViz) {
            dispatch.setRecSettings(null);
            dispatch.setSelectedViz(null);
        }
        else {
            dispatch.setRecSettings(vizSelected.vizQuery);
            dispatch.setSelectedViz(vizSelected);
        }
    };


    // Handle updating the vizQuery of the selected visualization
    useEffect(() => {
        //vizParam is updated when a new viz is added from REC, we put this additional condition to not 
        // update the selectedView from REC(without that, the selected view becomes like the selected REC viz)
        if (state.selectedViz && state.vizParam && !state.inputViz) {
            setVizList(preVizList =>
                preVizList.map(viz => {
                    if (viz.id === state.selectedViz.id) {
                        const updatedViz = { ...viz, vizQuery: state.vizParam };
                        // Updates store
                        dispatch.setRecSettings(updatedViz.vizQuery);
                        dispatch.setSelectedViz(updatedViz);
                        return updatedViz;
                    } else {
                        return viz;
                    }
                })
            );
        }

    }, [state.vizParam]);


    //fetching the data on creation (if not already passed by parent component)
    //only for non RecViz
    useEffect(() => {


        if (state.datasetId) {
            const fetchData = async () => {
                try {
                    const result = await DatasetFetcher(state.datasetId);
                    console.log("Viz/Data Fetched");

                    setData({ "dataset": [ ...result ] });
                } catch (err) {
                    console.error('Error fetching dataset:', err);
                }
            };


            fetchData();
        }

    }, [state.datasetId]);

    return (
        <>
            <VPView
                vizList={vizList}
                vizSelected={state.selectedViz}
                onVizSelect={handleVizSelect}
                onVizCreate={handleEmptyVizCreate}
                onVizDelete={handleVizDelete}
                data={data}
            />

            <pre>VPControllerPseudoState:{JSON.stringify({ state, vizList }, null, 2)}</pre>
            <pre>local state:{JSON.stringify({ vizList, data }, null, 2)}</pre>

        </>
    )
}

export default VPController