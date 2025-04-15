import React, { useEffect, useState } from 'react'
import VPView from './VPView'
import { useStoreSelector } from '../Store/VizreventStore';
import { v4 as uuidv4 } from 'uuid';


const VPController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        inputViz: state.inputViz,
        dataset: state.dataset,
    }));

    //Creating local state 
    const [vizList, setVizList] = useState([]);
    const [vizSelectedId,setVizSelectedId]=useState(null);

    //Takes selected viz and dispatch its properties to store
    const handleVizSelect = (vizSelected) => {
        setVizSelectedId(vizSelected.id);
        dispatch.setVizParam(vizSelected);
    };

    //createViz and automatically selects it
    const createViz = (vizQuery = "empty Viz") => {
        const newViz = {
            id: uuidv4(),
            vizQuery: vizQuery
        };
        setVizList(preVizList => [...preVizList, newViz]);
        setVizSelectedId(newViz.id);
        dispatch.setVizParam(newViz);
    };

    // Handle new Viz creation from RECController 
    useEffect(() => {
        if (state.inputViz !== null) {
            createViz(state.inputViz.vizQuery);
        }
    }, [state.inputViz]);

    // Handle empty Viz creation in VPView
    const handleEmptyVizCreate = () => {
        createViz();
    };

    //Takes selected dataset and dispatch it to store
    const handleVizDelete = (deletedVizId) => {

        // Error checking
        if (deletedVizId === null) {
            throw new Error('Id provided is null.');
        }
        if (vizList.length === 0) {
            throw new Error('Visualization list is empty.');
        }
        setVizList(preVizList => preVizList.filter(item => item.id !== deletedVizId));
        //Resetting these properties since the selected viz doesn't exist anymore
        dispatch.setInputViz(null);
        dispatch.setVizParam(null);
        setVizSelectedId(null);

    };

    return (
        <>
            <VPView
                vizList={vizList}
                vizSelectedId={vizSelectedId}
                onVizSelect={handleVizSelect}
                onVizCreate={handleEmptyVizCreate}
                onVizDelete={handleVizDelete}
            />

            <pre>VPControllerPseudoState:{JSON.stringify({ state, vizSelectedId,vizList }, null, 2)}</pre>
        </>
    )
} 

export default VPController