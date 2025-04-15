import React, { useEffect, useState } from 'react'
import RECView from './RECView'
import { useStoreSelector } from '../Store/VizreventStore';



const RECController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        recSettings: state.recSettings,
        dataset: state.dataset,
    }));

    //Creating local state 
    const [isOpened, setIsOpened] = useState(false);
    const [recList, setRecList] = useState([
        { id: 1, vizQuery: 'query1' },
        { id: 2, vizQuery: 'query2' },
        { id: 3, vizQuery: 'query3' }
    ]);

    //function that actually computes the recommendation
    const recCompute = (recList, vizParam, recSettings, dataset) => {
        const newRecList = recList.map(item => ({
            ...item,
            vizQuery: `${item.vizQuery}/${item.id}`
        }));
        return newRecList;
        /* recommendation provided in the past could influence futur recommendation here (be mindfull of infinite recursive loops)
        const newRecSettings="";
        dispatch.setRecSettings(newRecSettings)*/
    }

    ///////Event Handlers

    //"Opens" and display RECView on expanding button
    const handlePanelOpener = (currentIsOpened) => {
        setIsOpened(!(currentIsOpened));
    };

    /*Dispatch selected recommendation to store for creation in VP, dispatch item's vizParam for display in DS
    and dispatch new recSettings to recommend related view of current selected Viz*/
    const handleRecSelection = (recVizSelect) => {
        dispatch.setInputViz(recVizSelect);
        dispatch.setVizParam(recVizSelect);
        dispatch.setRecSettings(recVizSelect);
    }

    // We only compute the recommendation when the panel is opened to save up on some performance
    // Use useEffect to update recList when store properties change
    useEffect(() => {
        if (isOpened) {
            setRecList(prevRecList=>recCompute(prevRecList, state.vizParam, state.recSettings, state.dataset));
        }
    }, [isOpened,state.vizParam, state.recSettings, state.dataset]);

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