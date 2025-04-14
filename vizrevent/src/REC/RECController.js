import React, { useState } from 'react'
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
        { id: 1 },
        { id: 2 },
        { id: 3 }
    ]);

    //console.log("RECController useStoreSelector Output:");
    //console.log(dispatch);



    //function that actually computes the recommendation
    const recCompute = (vizParam,recSettings,dataset) => {
        const recList = [
            { id: 1 },
            { id: 2 },
            { id: 3 }
        ];

        setRecList(recList);
    }

    ///////Event Handlers

    //"Opens" and display RECView on expanding button
    const handlePanelOpener = (currentIsOpened) => {
        setIsOpened(!(currentIsOpened));
    };


    return (
        <>
            <RECView isOpened={isOpened}
                onPanelOpenerClick={handlePanelOpener}
                recList={recList} />
            <h1>RECControllerPseudoState:{JSON.stringify(state, null, 2)}</h1>
            <h1>local state:{JSON.stringify(isOpened, null, 2)}</h1>
        </>
    )
}

export default RECController