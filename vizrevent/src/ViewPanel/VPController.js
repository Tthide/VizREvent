import React, { useEffect, useState } from 'react'
import VPView from './VPView'
import { useStoreSelector } from '../Store/VizreventStore';
import { v4 as uuidv4 } from 'uuid';


const VPController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        inputViz: state.inputViz,
        selectedViz: state.selectedViz,
        dataset: state.dataset,
    }));

    //Creating local state 
    const [vizList, setVizList] = useState([]);

    //createViz and automatically selects it
    const createViz = (vizQuery = "empty Viz") => {
        const newViz = {
            id: uuidv4(),
            vizQuery: vizQuery
        };
        setVizList(preVizList => [...preVizList, newViz]);
        dispatch.setVizParam(newViz.vizQuery);
        dispatch.setSelectedViz(newViz);
        dispatch.setInputViz(null);

    };

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
        if (vizToDelete === null || vizToDelete.id === null) {
            throw new Error('VPController/handleVizDelete: the Viz provided is null or has a null id.');
        }
        if (vizList.length === 0) {
            throw new Error('VPController/handleVizDelete: Visualization list is empty.');
        }

        setVizList(preVizList => preVizList.filter(item => item.id !== vizToDelete.id));
        //Resetting these properties since the selected viz doesn't exist anymore
        dispatch.setSelectedViz(null);
        dispatch.setInputViz(null);
        dispatch.setVizParam(null);
    };

    //Takes selected viz and dispatch its properties to store
    const handleVizSelect = (vizSelected) => {


        // Error checking
        if (vizSelected === null || vizSelected.id === null) {
            throw new Error('VPController/handleVizSelect: the Viz provided is null or has a null id.');
        }

        //deselecting current selectedViz by clicking on it again
        if (state.selectedViz && vizSelected === state.selectedViz) {
            dispatch.setVizParam(null);
            dispatch.setSelectedViz(null);
        }
        else {
            dispatch.setVizParam(vizSelected.vizQuery);
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
                        dispatch.setSelectedViz(updatedViz);
                        return updatedViz;
                    } else {
                        return viz;
                    }
                })
            );
        }
    }, [state.vizParam]);

    return (
        <>
            <VPView
                vizList={vizList}
                vizSelected={state.selectedViz}
                onVizSelect={handleVizSelect}
                onVizCreate={handleEmptyVizCreate}
                onVizDelete={handleVizDelete}
            />

            <pre>VPControllerPseudoState:{JSON.stringify({ state, vizList }, null, 2)}</pre>
        </>
    )
}

export default VPController