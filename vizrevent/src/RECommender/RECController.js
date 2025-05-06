import React, { useEffect, useRef, useCallback, useState } from 'react'
import RECView from './RECView'
import { useStoreSelector } from '../Store/VizreventStore';
import { DracoRecRequest } from './DracoUtils';
import { v4 as uuidv4 } from 'uuid';



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
    const [loading, setLoading] = useState(false)

    // Track last recSettings and datasetId used for computation
    const lastRecSettingsRef = useRef(null)
    const lastDatasetIdRef = useRef(null)


    //function that actually computes the recommendation
    const recCompute = useCallback(async (recList, vizParam, recSettings, dataset) => {
        try {
            // Call DracoRecProcess with the dataset
            const solutionSet = await DracoRecRequest(state.datasetId)

            // Update recList based on the solutionSet
            const newRecList = solutionSet.map(item => {
                return {
                    id: uuidv4(),
                    vizQuery: item
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
    }, [state.datasetId]);

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

    /*Dispatch selected recommendation to store for creation in VP, dispatch item's vizParam for display in DS*/
    const handleRecSelection = (recVizSelect) => {
        dispatch.setInputViz(recVizSelect);
        dispatch.setVizParam(recVizSelect.vizQuery);
    }

    useEffect(() => {
        //we compute the recommendation only if the panel is opened.
        if (isOpened) {

            //checking if the recSettings (or more unlikely the dataset) changed or not from last opening or rerenders
            const recChanged = JSON.stringify(state.recSettings) !== JSON.stringify(lastRecSettingsRef.current);
            const datasetChanged = state.datasetId !== lastDatasetIdRef.current;
    
            const shouldCompute = recChanged || datasetChanged;
    
            //computing only if there was a change
            if (shouldCompute) {

                console.log("Is computing draco")
                const computeRecommendations = async () => {
                    setLoading(true);
                    try {
                        const newRecList = await recCompute(recList, state.vizParam, state.recSettings, state.datasetId);
                        setRecList(newRecList);
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setLoading(false);
                    }
    
                    lastRecSettingsRef.current = state.recSettings;
                    lastDatasetIdRef.current = state.datasetId;
                };
    
                computeRecommendations();
            }
        }
        // eslint-disable-next-line
    }, [isOpened, state.recSettings, state.datasetId]);


    return (
        <>
            <RECView isOpened={isOpened}
                loading={loading}
                onPanelOpenerClick={handlePanelOpener}
                recList={recList}
                onRecItemSelect={handleRecSelection} />
            <pre>RECControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
            <pre>local state:{JSON.stringify({ isOpened, recList }, null, 2)}</pre>
        </>
    )
}

export default RECController