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
        selectedViz: state.selectedViz
    }));

    //Creating local state 
    const [isOpened, setIsOpened] = useState(false);
    const [recList, setRecList] = useState([]);
    //count of recItem
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false)

    // Track last recSettings and datasetId used for computation
    const lastRecSettingsRef = useRef(null)
    const lastDatasetIdRef = useRef(null)
    //track last AbortController to enable recommendations stream to restart on abort
    const controllerRef = useRef(null);



    // Append new recommendation item to the recList
    const appendRecItem = useCallback((item) => {
        setRecList(prevList => [...prevList, item]);
    }, []);
    // Stream solutionSet one-by-one and append
    const streamRecommendations = useCallback(async (recSettings, signal) => {

        setTotalCount(0);
        try {

            for await (const item of DracoRecRequest(
                state.datasetId,
                recSettings)) {
                if (signal.aborted) {
                    console.info("Aborted recommendation processing");
                    return;
                }

                // append as soon as it arrives
                appendRecItem({
                    id: uuidv4(),
                    name: item.name,
                    vizQuery: item.spec,
                });


                console.info("Recommendations received");
                // yield to browser to avoid blocking UI, without an arbitrary timeout
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
        } catch (error) {
            if (signal.aborted) {
                console.info("DracoRecRequest aborted");
            }
            else {
                console.error('Error computing recommendations:', error);
            }
        }
    }, [state.datasetId, appendRecItem]);

    ///////Event Handlers

    //"Opens" and display RECView on expanding button
    const handlePanelOpener = (currentIsOpened) => {
        //Can only open if a dataset has been selected
        if (state.datasetId) {

            //on close we abort the recommendation process
            if (currentIsOpened) {
                if (controllerRef.current) {
                    controllerRef.current.abort();
                    controllerRef.current = null; // clear reference
                }
                setTotalCount(0);     // reset total count
                setLoading(false);    // ensure loading is false
            }

            setIsOpened(!(currentIsOpened));
        } else {
            console.error("Error: No dataset selected. Cannot open the panel.");
        }
    };

    /*Dispatch selected recommendation to store for creation or update in VP*/
    const handleRecSelection = (recVizSelect, vizUpdate = false) => {

        //on recItem selection we abort the recommendation process
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null; // clear reference
        }
        setRecList([]);       // optional: clear old recommendations
        setTotalCount(0);     // optional: reset total count
        setLoading(false);    // ensure loading is false

        if (vizUpdate && state.selectedViz!==null) {
            console.log(recVizSelect)
            dispatch.setVizParam(recVizSelect.vizQuery.spec);
            
        }
        else {
            dispatch.setInputViz(recVizSelect);
        }
    }

    useEffect(() => {
        //we compute the recommendation only if the panel is opened.
        if (isOpened) {

            //checking if the recSettings (or more unlikely the dataset) changed or not from last opening or rerenders
            const recChanged = JSON.stringify(state.recSettings) !== JSON.stringify(lastRecSettingsRef.current);
            const datasetChanged = state.datasetId !== lastDatasetIdRef.current;
            //checking if the recSettings reset to null
            const recReset = (!state.recSettings && !lastRecSettingsRef.current) || (!state.recSettings && lastRecSettingsRef.current);

            const shouldCompute = recChanged || datasetChanged || recReset;

            //computing only if there was a change
            if (shouldCompute) {

                console.log("Is computing draco");
                setLoading(true);
                setRecList([]); // Clear old recList


                if (controllerRef.current) {
                    controllerRef.current.abort();
                }

                const newController = new AbortController();
                controllerRef.current = newController;


                streamRecommendations(state.recSettings, newController.signal).finally(() => {
                    if (!newController.signal.aborted) {
                        setLoading(false);
                        lastRecSettingsRef.current = state.recSettings;
                        lastDatasetIdRef.current = state.datasetId;
                    }
                });
            }
        }
        // eslint-disable-next-line
    }, [isOpened, state.recSettings, state.datasetId, streamRecommendations]);


    return (
        <>
            <RECView isOpened={isOpened}
                loading={loading}
                onPanelOpenerClick={handlePanelOpener}
                recList={recList}
                totalCount={totalCount}
                hasSelectedViz={state.selectedViz !== null}
                onRecItemSelect={handleRecSelection} />

            {//debug   
            /* 
            <pre>RECControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
            <pre>local state:{JSON.stringify({ isOpened, recList }, null, 2)}</pre>*/}
        </>
    )
}

export default RECController