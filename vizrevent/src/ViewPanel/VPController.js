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
        datasetData: state.datasetData

    }));
    console.log("VP/datasetData", state.datasetData);

    //Creating local state 
    const [vizList, setVizList] = useState([]);

    const [vizCounter, setVizCounter] = useState(0);

    //the viz panel consist of grid in which we can place the viz instances, here we can change the size of each grid cells
    //the bigger the size, the less freedom in placement we have
    const GRID_SIZE = 50;

    //create a Viz and automatically selects it
    const createViz = useCallback((vizQuery = null) => {

        if (state.datasetId) {
            const newViz = {
                id: uuidv4(),
                name: `Chart n° ${vizCounter}`,
                vizQuery: vizQuery ? vizQuery.spec : null,
                x: 0,
                y: 0
            };
            setVizList(preVizList => [...preVizList, newViz]);
            setVizCounter(preVizCounter => preVizCounter + 1);
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

    //updates vizList with new order after drag&drop
    const handleVizUpdatePosition = (newVizList) => {
        setVizList(newVizList);
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

    const handleVizNameUpdate = (viz, newName) => {

        if (viz && newName) {
            // const {copyVizList,vizInList}=[...vizList,vizList.find(v =>{v.id===viz.id})];
            const copyVizList = [...vizList.filter(v => v.id !== viz.id )]
            viz.name = newName;
            setVizList([...copyVizList, viz]);
            console.log([...copyVizList, viz]);
        }

    }

    return (
        <>
            <VPView
                isDatasetSelected={state.datasetId !== null}
                vizList={vizList}
                vizSelected={state.selectedViz}
                onVizSelect={handleVizSelect}
                onVizCreate={handleEmptyVizCreate}
                onVizDelete={handleVizDelete}
                onVizUpdatePosition={handleVizUpdatePosition}
                onVizUpdateName={handleVizNameUpdate}
                GRID_SIZE={GRID_SIZE}
                data={state.datasetData}
            />

            {/* //for debug
            <pre>VPControllerPseudoState:{JSON.stringify({ state, vizList }, null, 2)}</pre>
            <pre>local state:{JSON.stringify({ vizList, data }, null, 2)}</pre>*/}

        </>
    )
}

export default VPController