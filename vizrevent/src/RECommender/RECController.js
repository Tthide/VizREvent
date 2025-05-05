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

    //to be able to use react-vega, we need to format the chart specs given by draco
    function splitVegaLiteSpec(chartRecItem) {
        const { datasets ,...specWithoutData } = chartRecItem;

        // Rename the dynamic key to 'current-dataset'
        //this is done to uniformise the name of the data property that will later be passed to Vega-lite
        const data = {};
        for (const key in datasets) {
            if (datasets.hasOwnProperty(key)) {
                data['dataset'] = datasets[key];
                break; // Assuming there's only one dataset, exit the loop after renaming
            }
        }
        //also updating the specs pointer to the new name
        specWithoutData.data={
            "name": "dataset"
          };

        return {
            spec: { ...specWithoutData },
            data
        };
    }

    //function that actually computes the recommendation
    const recCompute = useCallback(async (recList, vizParam, recSettings, dataset) => {


        try {
            // Call DracoRecProcess with the dataset
            const solutionSet = await DracoRecRequest(state.datasetId)

            // Update recList based on the solutionSet
            const newRecList = solutionSet.map(item => {
                //the draco spec output doesn't the contain the dataset input in the prepareData, therefore we have to update this here
                //And because Draco and Vega-Lite require different data property format, we also change it to fit Vega-Lite


                return {
                    id: uuidv4(),
                    vizQuery: splitVegaLiteSpec(JSON.parse(item))
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

            const recChanged = JSON.stringify(state.recSettings) !== JSON.stringify(lastRecSettingsRef.current)
            const datasetChanged = state.datasetId !== lastDatasetIdRef.current

            const shouldShowLoading = recChanged || datasetChanged

            const computeRecommendations = async () => {
                if (shouldShowLoading) setLoading(true)
                const newRecList = await recCompute(recList, state.vizParam, state.recSettings, state.datasetId)
                setRecList(newRecList)
                if (shouldShowLoading) setLoading(false)

                lastRecSettingsRef.current = state.recSettings
                lastDatasetIdRef.current = state.datasetId

            };


            computeRecommendations().catch(err => {
                console.error(err)
            })
        }
        // eslint-disable-next-line
    }, [isOpened, state.vizParam]);


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