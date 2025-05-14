import React, { useEffect, useRef, useCallback, useState } from 'react'
import RECView from './RECView'
import { useStoreSelector } from '../Store/VizreventStore';
import { DracoRecRequest } from './DracoUtils';
import { v4 as uuidv4 } from 'uuid';



const RECController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
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


    // Append new recommendation item to the recList
    const appendRecItem = useCallback((item) => {
        setRecList(prevList => [...prevList, item]);
    }, []);
    // Stream solutionSet one-by-one and append
    const streamRecommendations = useCallback(async (recSettings) => {
        try {
            const solutionSet = await DracoRecRequest(state.datasetId, recSettings);
            if (solutionSet.length === 0) console.warn("No recommendation output");
            else console.info("Recommendation compute done");

            for (const item of solutionSet) {
                const newItem = {
                    id: uuidv4(),
                    name: item[0],
                    vizQuery: item[1],
                };
                appendRecItem(newItem);
                await new Promise(resolve => setTimeout(resolve, 10)); // slight delay to yield rendering
            }
        } catch (error) {
            console.error('Error computing recommendations:', error);
        }
    }, [state.datasetId, appendRecItem]);

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

    /*Dispatch selected recommendation to store for creation in VP*/
    const handleRecSelection = (recVizSelect) => {
        dispatch.setInputViz(recVizSelect);
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

                console.log("Is computing draco");
                setLoading(true);
                setRecList([]); // Clear old recList

                streamRecommendations(state.recSettings).finally(() => {
                    setLoading(false);
                    lastRecSettingsRef.current = state.recSettings;
                    lastDatasetIdRef.current = state.datasetId;
                });
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