import React from 'react'
import DSView from './DSView'
import { useStoreSelector } from '../Store/VizreventStore';



const DSController = () => {
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        dataset: state.dataset,
    }));

  console.log("DSController useStoreSelector Output:");
  console.log(dispatch);


  const handleDatasetSelect=(dataset)=>{


    dispatch.setDataset(dataset);

  };

    return (
        <>
            <DSView onDatasetChange={handleDatasetSelect} />
            <h1>DSControllerPseudoState:{JSON.stringify(state, null, 2)}</h1>
        </>
    )
}

export default DSController