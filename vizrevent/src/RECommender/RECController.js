import React, { useEffect, useState } from 'react'
import RECView from './RECView'
import { useStoreSelector } from '../Store/VizreventStore';
import DracoRecProcess from './DracoUtils';
import { v4 as uuidv4 } from 'uuid';
import { DatasetFetcher } from '../DataSettings/DatasetUtils';



const RECController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        recSettings: state.recSettings,
        datasetId: state.datasetId,
    }));

    //Creating local state 
    const [isOpened, setIsOpened] = useState(false);
    const [recList, setRecList] = useState([]); //example values
    const [recDataset, setRecDataset] = useState(null);

    //function that actually computes the recommendation
    const recCompute = async (recList, vizParam, recSettings, dataset) => {


        try {
            // Call DracoRecProcess with the dataset
            const solutionSet = await DatasetFetcher(state.datasetId)
                .then(RecData => {
                    setRecDataset(RecData)
                    console.log("RecData:", RecData);
                    DracoRecProcess(RecData);
                });

            console.log("Draco solutionSet", solutionSet);
            // Update recList based on the solutionSet
            const newRecList = solutionSet.specs.map(item => {
                //the draco spec output doesn't the contain the dataset input in the prepareData, therefore we have to update this here
                //And because Draco and Vega-Lite require different data property format, we also change it to fit Vega-Lite
                item.data = {
                    values: recDataset
                };
                
                return {
                    id: uuidv4(),
                    vizQuery: item
                    // You can use solutionSet to update the vizQuery or other properties
                }
            });

            return newRecList;

        } catch (error) {

            console.error('Error computing recommendations:', error);
            return recList; // Return the original recList in case of error
        }
        /* recommendation provided in the past could influence futur recommendation here (be mindfull of infinite recursive loops)
        const newRecSettings="";
        dispatch.setRecSettings(newRecSettings)*/
    }

    ///////Event Handlers

    //"Opens" and display RECView on expanding button
    const handlePanelOpener = (currentIsOpened) => {
        //Can only open if a dataset has been selected
        if (state.datasetId) {
            setIsOpened(!(currentIsOpened));
        } else {
            console.error("Error: No dataset selected. Cannot open the panel.");
        }
    };

    /*Dispatch selected recommendation to store for creation in VP, dispatch item's vizParam for display in DS
    and dispatch new recSettings to recommend related view of current selected Viz*/
    const handleRecSelection = (recVizSelect) => {
        dispatch.setInputViz(recVizSelect);
        dispatch.setVizParam(recVizSelect.vizQuery);
        dispatch.setRecSettings(recVizSelect);
    }

    // We only compute the recommendation when the panel is opened to save up on some performance
    // Use useEffect to update recList when store properties change
    useEffect(() => {
        if (isOpened) {
            const computeRecommendations = async () => {

                const newRecList = await recCompute(recList, state.vizParam, state.recSettings, state.datasetId);
                setRecList(newRecList);
            };

            computeRecommendations();
        }
    }, [isOpened, state.vizParam, state.recSettings, state.datasetId]);

    return (
        <>
            <RECView isOpened={isOpened}
                onPanelOpenerClick={handlePanelOpener}
                recList={recList}
                onRecItemSelect={handleRecSelection} />
            <pre>RECControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
            <pre>local state:{JSON.stringify({ isOpened, recList }, null, 2)}</pre>
        </>
    )
}

export default RECController